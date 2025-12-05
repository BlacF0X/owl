import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TemperatureDashboard from '../TemperatureDashboard';

// Mocks
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: jest.fn().mockResolvedValue('fake-token') }),
}));

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
}));

jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

jest.mock('chartjs-plugin-annotation', () => ({ __esModule: true, default: jest.fn() }));

global.fetch = jest.fn();

describe('TemperatureDashboard Component', () => {
  const mockSensors = [
    {
      sensorid: '1',
      name: 'Salon',
      displayValue: '22',
      type: { unit: '°C' },
    },
    {
      sensorid: '2',
      name: 'Chambre',
      displayValue: '19',
      type: { unit: '°C' },
    },
  ] as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Affichage vide
  it('affiche un message quand aucun capteur', () => {
    render(<TemperatureDashboard initialSensors={[]} token="token" />);
    
    expect(screen.getByText('Aucun capteur de température détecté.')).toBeInTheDocument();
  });

  // Test 2: Affichage des capteurs
  it('affiche tous les capteurs fournis', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { valuenum: 22, timestamp: '2025-12-05T12:00:00Z' },
      ],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText('Salon')).toBeInTheDocument();
      expect(screen.getByText('Chambre')).toBeInTheDocument();
    });
  });

  // Test 3: Boutons de vue présents
  it('affiche les boutons de changement de vue', () => {
    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    expect(screen.getByText('Temps Réel (24h)')).toBeInTheDocument();
    expect(screen.getByText('Moyenne (7j)')).toBeInTheDocument();
    expect(screen.getByText('Max (7j)')).toBeInTheDocument();
    expect(screen.getByText('Min (7j)')).toBeInTheDocument();
  });

  // Test 4: Changement de vue (SIMPLIFIÉ)
  it('permet de cliquer sur les boutons de vue', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ valuenum: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText('Salon')).toBeInTheDocument();
    });

    // Vérifier que les boutons sont cliquables sans crash
    const maxButton = screen.getByText('Max (7j)');
    const minButton = screen.getByText('Min (7j)');
    const avgButton = screen.getByText('Moyenne (7j)');

    fireEvent.click(maxButton);
    fireEvent.click(minButton);
    fireEvent.click(avgButton);

    // Le composant ne doit pas crasher après les clics
    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  // Test 5: Chargement des données
  it('affiche un loader pendant le chargement', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => [],
      }), 100))
    );

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    expect(screen.getAllByText('Chargement...').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  // Test 6: Gestion d'erreur API
  it('fait un fallback de 30j à 7j en cas d\'erreur', async () => {
    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      callCount++;
      if (callCount === 1 && url.includes('30d')) {
        return Promise.resolve({ ok: false, status: 400 });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ valuenum: 22, timestamp: '2025-12-05T12:00:00Z' }],
      });
    });

    render(<TemperatureDashboard initialSensors={[mockSensors[0]]} token="token" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, { timeout: 5000 });
  });

  // Test 7: Journal d'alertes présent
  it('affiche le journal d\'alertes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
    });
  });

  // Test 8: Pas de crash sans token
  it('gère l\'absence de token', () => {
    render(<TemperatureDashboard initialSensors={mockSensors} token={null} />);
    
    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
  });

  // Test 9: Affichage des cercles de température
  it('affiche les cercles de température', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ valuenum: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    const { container } = render(
      <TemperatureDashboard initialSensors={mockSensors} token="token" />
    );

    await waitFor(() => {
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  // Test 10: Affichage des graphiques
  it('affiche les graphiques', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ valuenum: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('mock-chart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });
});
