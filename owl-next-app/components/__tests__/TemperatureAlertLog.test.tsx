import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TemperatureAlertLog from '../TemperatureAlertLog';

// Mocks
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: jest.fn().mockResolvedValue('fake-token') }),
}));

global.fetch = jest.fn();

describe('TemperatureAlertLog Component', () => {
  const mockSensors = [
    { sensor_id: '1', name: 'Salon' },
    { sensor_id: '2', name: 'Chambre' },
  ] as any;

  const mockToken = 'mockToken';

  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut, on retourne un tableau vide pour éviter les erreurs de map sur undefined
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  // Helper pour attendre la fin du chargement
  const waitForLoadingToFinish = async () => {
    await waitFor(() => {
      expect(screen.queryByText(/Chargement des alertes/i)).not.toBeInTheDocument();
    });
  };

  // Test 1: Affichage du titre
  it('affiche le titre du journal', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();

    // CORRECTION : On attend que le fetch se termine pour éviter l'erreur "act"
    await waitForLoadingToFinish();
  });

  // Test 2: Filtres présents
  it('affiche les boutons de filtrage', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Trop hautes')).toBeInTheDocument();
    expect(screen.getByText('Trop basses')).toBeInTheDocument();

    // CORRECTION : On attend la fin du cycle
    await waitForLoadingToFinish();
  });

  // Test 3: Aucune alerte
  it('affiche un message quand aucune alerte', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune alerte pour cette journée/i)).toBeInTheDocument();
    });
  });

  // Test 4: Changement de filtre
  it('permet de cliquer sur les filtres sans crash', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitForLoadingToFinish();

    // Cliquer sur les filtres
    fireEvent.click(screen.getByText('Trop hautes'));
    fireEvent.click(screen.getByText('Trop basses'));
    fireEvent.click(screen.getByText('Toutes'));

    expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
  });

  // Test 5: Navigation entre les dates
  it('permet de naviguer entre les dates', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitForLoadingToFinish();

    const buttons = screen.getAllByRole('button');
    // On clique sur précédent
    fireEvent.click(buttons[buttons.length - 2]); // Hypothèse: les flèches sont les derniers boutons si les filtres sont premiers

    // Le fetch est relancé au changement de date, on attend qu'il finisse
    // Note: waitForLoadingToFinish attend que le loader disparaisse.
    // S'il réapparaît très vite, waitFor le gère.
    await waitForLoadingToFinish();
  });

  // Test 6: Gestion sans token
  it("gère l'absence de token", async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={null} />);

    // Même sans token, le useEffect se lance et met setLoading(false)
    // Il faut attendre cette mise à jour d'état
    await waitForLoadingToFinish();

    expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
  });

  // Test 7: Gestion des capteurs vides
  it('gère un tableau de capteurs vide', async () => {
    render(<TemperatureAlertLog sensors={[]} token={mockToken} />);

    // Même logique : le useEffect met à jour l'état loading
    await waitForLoadingToFinish();

    expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
  });

  // Test 8: Les filtres sont interactifs
  it('met en évidence le filtre actif', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitForLoadingToFinish();

    const toutesButton = screen.getByText('Toutes');
    expect(toutesButton).toHaveClass('bg-white', 'text-slate-800', 'shadow-sm');
  });

  // Test 9: Affichage de la date du jour
  it('affiche la date courante', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    const dateElements = screen.getAllByText(
      /décembre|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre/i
    );
    expect(dateElements.length).toBeGreaterThan(0);

    // CORRECTION
    await waitForLoadingToFinish();
  });

  // Test 10: Le composant se rend sans erreur
  it('se rend correctement avec les props minimales', async () => {
    const { container } = render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    expect(container.firstChild).toBeInTheDocument();

    // CORRECTION
    await waitForLoadingToFinish();
  });
});
