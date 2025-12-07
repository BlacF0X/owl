import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import TemperatureDashboard from '../TemperatureDashboard';
import { useSearchParams } from 'next/navigation';

// 1. Mock de next/navigation pour contrôler le hubId
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// 2. Mock de Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: jest.fn().mockResolvedValue('fake-token') }),
}));

// 3. Mocks graphiques
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
      sensor_id: '1',
      name: 'Salon',
      displayValue: '22',
      type: { unit: '°C' },
      hub: { hub_id: 'h1', name: 'Maison' },
    },
    {
      sensor_id: '2',
      name: 'Chambre',
      displayValue: '19',
      type: { unit: '°C' },
      hub: { hub_id: 'h1', name: 'Maison' },
    },
  ] as any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Masquer les console.warn pour garder la sortie propre pendant les tests d'erreur
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Optionnel, si act warning persiste

    // Par défaut : Vue Globale (pas de hubId)
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });

    // Par défaut : fetch retourne un tableau vide pour éviter les promesses non résolues
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    (console.warn as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  // Test 1: Affichage vide (Liste vide dès le départ)
  it('affiche un message quand aucun capteur (Liste Initiale Vide)', () => {
    render(<TemperatureDashboard initialSensors={[]} token="token" />);

    // CORRECTION : Le message correspond au "early return" du composant
    expect(screen.getByText('Aucun capteur de température détecté.')).toBeInTheDocument();
  });

  // Test 2: Vue Hub Spécifique
  it('affiche tous les capteurs fournis (Vue Hub Spécifique)', async () => {
    // Vue Hub : Pas de fetch global, donc pas de Act warning lié au chargement global
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ value_num: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText('Salon')).toBeInTheDocument();
      expect(screen.getByText('Chambre')).toBeInTheDocument();
    });
  });

  // Test 3: Boutons de vue
  it('affiche les boutons de changement de vue avec les bons libellés', async () => {
    // CORRECTION Act Warning :
    // Même si on teste juste les boutons, le composant lance un fetch en background (Vue Globale).
    // On doit attendre que ce fetch se termine pour que Jest ne râle pas.
    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    expect(screen.getByText('Temps Réel')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();
    expect(screen.getByText('Maximale')).toBeInTheDocument();
    expect(screen.getByText('Minimale')).toBeInTheDocument();

    // Attente de la fin du cycle de vie du composant (chargement global)
    await waitFor(() => {
      expect(screen.queryByText('Chargement des données des hubs...')).not.toBeInTheDocument();
    });
  });

  // Test 4: Interaction Boutons
  it('permet de cliquer sur les boutons de vue (Vue Hub Spécifique)', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ value_num: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText('Salon')).toBeInTheDocument();
    });

    const maxButton = screen.getByText('Maximale');
    fireEvent.click(maxButton);
    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  // Test 5: Loader Vue Globale
  it('affiche un loader pendant le chargement des hubs (Vue Globale)', async () => {
    // On ralentit artificiellement le fetch pour voir le loader
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => [],
              }),
            100
          )
        )
    );

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    expect(screen.getByText('Chargement des données des hubs...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Chargement des données des hubs...')).not.toBeInTheDocument();
    });
  });

  // Test 6: Fallback API
  it("fait un fallback de 30j à 7j en cas d'erreur (Vue Hub Spécifique)", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });

    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      callCount++;
      if (callCount === 1 && url.includes('30d')) {
        return Promise.resolve({ ok: false, status: 400 });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ value_num: 22, timestamp: '2025-12-05T12:00:00Z' }],
      });
    });

    render(<TemperatureDashboard initialSensors={[mockSensors[0]]} token="token" />);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      },
      { timeout: 5000 }
    );
  });

  // Test 7: Journal d'alertes
  it("affiche le journal d'alertes (uniquement en vue Hub)", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      expect(screen.getByText(/Journal des Alertes/i)).toBeInTheDocument();
    });
  });

  // Test 8: Absence de token
  it("gère l'absence de token en affichant quand même les cartes statiques", () => {
    // Si pas de token, pas de fetch, donc pas de Act warning à gérer spécifiquement
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });

    render(<TemperatureDashboard initialSensors={mockSensors} token={null} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
  });

  // Test 9: Cercles SVG
  it('affiche les cercles de température', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ value_num: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    const { container } = render(
      <TemperatureDashboard initialSensors={mockSensors} token="token" />
    );

    await waitFor(() => {
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  // Test 10: Graphiques
  it('affiche les graphiques', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'h1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ value_num: 22, timestamp: '2025-12-05T12:00:00Z' }],
    });

    render(<TemperatureDashboard initialSensors={mockSensors} token="token" />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('mock-chart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });
});
