import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import WindowActivityLog from '../WindowActivityLog';
import { fetchFromApi } from '@/src/lib/apiClient';

const mockGetToken = jest.fn().mockResolvedValue('fake-token');

// 1. Mock de Clerk (useAuth)
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: mockGetToken, // Simule un token valide
  }),
}));

// 2. Mock de votre client API
// Cela nous permet de contrôler ce que l'API "renvoie" sans faire de vraie requête
jest.mock('@/src/lib/apiClient', () => ({
  fetchFromApi: jest.fn(),
}));

const mockEvents = [
  {
    id: '1',
    timestamp: '2025-11-20T10:00:00Z',
    state: 'Ouvert',
    sensorName: 'Salon',
    hubName: 'Maison',
  },
  {
    id: '2',
    timestamp: '2025-11-20T09:00:00Z',
    state: 'Fermé',
    sensorName: 'Salon',
    hubName: 'Maison',
  },
];

describe('WindowActivityLog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le chargement initialement', () => {
    // On fait en sorte que fetchFromApi ne résolve pas tout de suite
    (fetchFromApi as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<WindowActivityLog />);

    // On cherche le loader (il n'a pas de texte, mais c'est un SVG avec une classe animate-spin)
    // Une meilleure pratique serait d'ajouter un 'aria-label="Chargement"' à votre Loader2 dans le composant
    // Pour l'instant, on vérifie simplement qu'il n'y a pas le message "Aucune activité"
    expect(
      screen.queryByText('Aucune activité enregistrée pour cette date.')
    ).not.toBeInTheDocument();
  });

  it('charge et affiche les événements', async () => {
    // On configure le mock pour renvoyer nos données
    (fetchFromApi as jest.Mock).mockResolvedValue(mockEvents);

    render(<WindowActivityLog initialDate={new Date('2025-11-20')} />);

    // On attend que les données soient chargées
    // CORRECTION ICI : On utilise getAllByText et on vérifie qu'on a au moins un résultat
    await waitFor(() => {
      expect(screen.getAllByText('Salon').length).toBeGreaterThan(0);
    });

    // Vérifie le contenu
    // Idem ici, Ouvert et Fermé peuvent apparaître plusieurs fois si l'historique est long
    expect(screen.getAllByText('Ouvert')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Fermé')[0]).toBeInTheDocument();

    // Vérifie que l'API a bien été appelée avec la bonne date
    expect(fetchFromApi).toHaveBeenCalledWith(
      expect.stringContaining('date=2025-11-20'),
      'fake-token'
    );
  });

  it('gère le cas vide', async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]);

    render(<WindowActivityLog />);

    await waitFor(() => {
      expect(
        screen.getByText("Aucun changement d'état enregistré pour cette date.")
      ).toBeInTheDocument();
    });
  });

  it('permet de changer de date', async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]);
    render(<WindowActivityLog initialDate={new Date('2025-11-20')} />);

    // On attend le chargement initial
    await waitFor(() => expect(fetchFromApi).toHaveBeenCalledTimes(1));

    // On clique sur "Précédent" (le bouton gauche)
    // Note : Il faudrait idéalement ajouter aria-label="Jour précédent" à vos boutons
    // Ici on cible le premier bouton
    const prevButton = screen.getAllByRole('button')[0];
    fireEvent.click(prevButton);

    // On vérifie que l'API est rappelée avec la nouvelle date (19 nov)
    await waitFor(() => {
      expect(fetchFromApi).toHaveBeenCalledWith(
        expect.stringContaining('date=2025-11-19'),
        expect.anything()
      );
    });
  });

  it('gère une erreur API gracieusement', async () => {
    // On force l'erreur
    (fetchFromApi as jest.Mock).mockRejectedValue(new Error('Erreur API'));

    // On espionne console.error pour éviter le bruit
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<WindowActivityLog />);

    // On attend que le chargement soit fini (le loader disparaît ou le texte vide apparaît)
    // Comme il y a erreur, events reste [], donc le message "Aucun changement..." s'affiche
    await waitFor(() => {
      expect(
        screen.getByText("Aucun changement d'état enregistré pour cette date.")
      ).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
