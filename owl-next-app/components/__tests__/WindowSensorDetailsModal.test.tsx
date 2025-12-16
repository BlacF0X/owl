import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import WindowSensorDetailsModal from '../WindowSensorDetailsModal';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('fake-token'),
  }),
}));

jest.mock('@/src/lib/apiClient', () => ({
  fetchFromApi: jest.fn(),
}));

const mockSensor: Sensor = {
  sensor_id: '123',
  name: 'Fenêtre Salon',
  displayValue: 'Ouvert',
  state_changed_at: null,
  hub: { hub_id: 'h1', name: 'Maison' },
  type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
};

const mockReadings = [
  { reading_id: 'r1', timestamp: '2025-11-20T10:00:00Z', value_bool: true, value_num: null },
  { reading_id: 'r2', timestamp: '2025-11-20T09:00:00Z', value_bool: false, value_num: null },
  { reading_id: 'r3', timestamp: '2025-11-20T08:00:00Z', value_bool: true, value_num: null },
];

describe('WindowSensorDetailsModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1 (inchangé car il mocke une promesse qui ne résout jamais, donc pas d'update d'état)
  it('affiche le titre et le chargement initialement', async () => {
    // On retourne une promesse qui ne se résout jamais pour simuler le "pending"
    (fetchFromApi as jest.Mock).mockImplementation(() => new Promise(() => {}));

    // Pour éviter le warning ici aussi, on peut wrapper le render,
    // mais comme l'état ne change pas après le premier rendu, c'est souvent inutile.
    render(<WindowSensorDetailsModal sensor={mockSensor} onClose={mockOnClose} />);

    expect(screen.getByText('Fenêtre Salon')).toBeInTheDocument();
    // On vérifie qu'on ne voit pas encore les stats (donc qu'on est en loading)
    expect(screen.queryByText('Ouvertures (24h)')).not.toBeInTheDocument();
  });

  // Test 2 : C'est ici que la correction est importante
  it("charge et affiche les statistiques et l'historique", async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue(mockReadings);

    render(<WindowSensorDetailsModal sensor={mockSensor} onClose={mockOnClose} />);

    // CORRECTION : On attend que l'état de chargement disparaisse.
    // Cela garantit que 'setReadings' ET 'setLoading(false)' ont tous deux été exécutés.
    // C'est souvent plus fiable que d'attendre l'apparition d'un texte.
    await waitFor(() => {
      // On suppose que vous n'affichez plus le loader quand c'est fini.
      // Si vous n'avez pas de role="status" ou autre sur le loader,
      // attendre l'apparition du contenu est la bonne méthode,
      // mais il faut s'assurer que c'est la DERNIÈRE mise à jour.
      expect(screen.getByText('Ouvertures (24h)')).toBeInTheDocument();
    });

    // Le reste des assertions est maintenant sûr car l'état est stable
    expect(screen.getByText('2')).toBeInTheDocument();

    const timeElements = screen.getAllByText(/:00/);
    expect(timeElements.length).toBeGreaterThan(0);

    expect(screen.getAllByText('Ouverte')).toHaveLength(2);
    expect(screen.getAllByText('Fermée')).toHaveLength(1);

    expect(fetchFromApi).toHaveBeenCalledWith(
      expect.stringContaining('/api/sensors/123/readings?period=24h'),
      'fake-token'
    );
  });

  // Test 3 (DEV Mode)
  it('gère le paramètre de date de référence (Mode DEV)', async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]);
    const refDate = new Date('2025-12-25T12:00:00Z');
    const originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: 'development' };

    render(
      <WindowSensorDetailsModal sensor={mockSensor} onClose={mockOnClose} referenceDate={refDate} />
    );

    // On attend la résolution pour éviter le warning act()
    await waitFor(() => {
      expect(fetchFromApi).toHaveBeenCalled();
    });

    expect(fetchFromApi).toHaveBeenCalledWith(
      expect.stringContaining(`refDate=${refDate.toISOString()}`),
      expect.anything()
    );

    process.env = originalEnv;
  });

  // Test 4 (Fermeture)
  it('appelle onClose quand on clique sur la croix', async () => {
    // On utilise une promesse non résolue pour éviter que l'état ne change pendant qu'on clique
    // Cela simplifie le test car on ne teste que l'interaction du bouton, pas le chargement
    (fetchFromApi as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<WindowSensorDetailsModal sensor={mockSensor} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    (fetchFromApi as jest.Mock).mockRejectedValue(new Error('Erreur chargement historique'));

    render(<WindowSensorDetailsModal sensor={mockSensor} onClose={jest.fn()} />);

    // On attend l'apparition du message d'erreur rouge
    await waitFor(() => {
      expect(screen.getByText('Erreur : Erreur chargement historique')).toBeInTheDocument();
    });
  });
});
