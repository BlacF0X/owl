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
    { sensorid: '1', name: 'Salon' },
    { sensorid: '2', name: 'Chambre' },
  ] as any;

  const mockToken = 'mockToken';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Affichage du titre
  it('affiche le titre du journal', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);
    
    expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
  });

  // Test 2: Filtres présents
  it('affiche les boutons de filtrage', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Trop hautes')).toBeInTheDocument();
    expect(screen.getByText('Trop basses')).toBeInTheDocument();
  });

  // Test 3: Aucune alerte
  it('affiche un message quand aucune alerte', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune alerte pour cette journée/i)).toBeInTheDocument();
    });
  });

  // Test 4: Changement de filtre (simplifié)
  it('permet de cliquer sur les filtres sans crash', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Toutes')).toBeInTheDocument();
    });

    // Cliquer sur les filtres ne doit pas crasher
    fireEvent.click(screen.getByText('Trop hautes'));
    fireEvent.click(screen.getByText('Trop basses'));
    fireEvent.click(screen.getByText('Toutes'));

    expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
  });

  // Test 5: Navigation entre les dates
  it('permet de naviguer entre les dates', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
    });

    // Vérifier que les boutons de navigation sont présents
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
  });

  // Test 6: Gestion sans token
  it('gère l\'absence de token', async () => {
    render(<TemperatureAlertLog sensors={mockSensors} token={null} />);

    await waitFor(() => {
      expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
    });
  });

  // Test 7: Gestion des capteurs vides
  it('gère un tableau de capteurs vide', async () => {
    render(<TemperatureAlertLog sensors={[]} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
    });
  });

  // Test 8: Les filtres sont interactifs
  it('met en évidence le filtre actif', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Toutes')).toBeInTheDocument();
    });

    const toutesButton = screen.getByText('Toutes');
    
    // Le bouton "Toutes" devrait avoir les classes "active"
    expect(toutesButton).toHaveClass('bg-white', 'text-slate-800', 'shadow-sm');
  });

  // Test 9: Affichage de la date du jour
  it('affiche la date courante', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} token={mockToken} />);

    await waitFor(() => {
      // La date devrait contenir au moins "décembre" ou un jour de la semaine
      const dateElements = screen.getAllByText(/décembre|janvier|février/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  // Test 10: Le composant se rend sans erreur
  it('se rend correctement avec les props minimales', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { container } = render(
      <TemperatureAlertLog sensors={mockSensors} token={mockToken} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
