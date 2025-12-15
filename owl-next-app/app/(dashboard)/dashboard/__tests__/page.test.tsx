import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../page';
import { fetchFromApi } from '@/src/lib/apiClient';
import { redirect } from 'next/navigation';

// --- 1. MOCKS ---

// Mock Next Navigation qui STOPPE l'exécution comme le vrai redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
  auth: jest.fn(),
}));

// Mock API Client
jest.mock('@/src/lib/apiClient', () => ({
  fetchFromApi: jest.fn(),
}));

// Mock Composants Enfants
jest.mock('@/components/ApiStatusIndicator', () => ({
  __esModule: true,
  default: () => <div data-testid="api-status">API OK</div>,
}));

jest.mock('@/components/CategorySummaryCards', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="category-summary-cards">
      <span data-testid="prop-windows">{props.openWindowsCount}</span>
      <span data-testid="prop-avg-temp">{props.avgTemp}</span>
      <span data-testid="prop-avg-hum">{props.avgHumidity}</span>
      <span data-testid="prop-avg-co2">{props.avgCo2}</span>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Router: () => <svg data-testid="icon-router" />,
  Database: () => <svg data-testid="icon-database" />,
  Clock: () => <svg data-testid="icon-clock" />,
}));

// --- 2. DONNÉES DE TEST ---

const mockUser = {
  id: 'user_123',
  firstName: 'Thomas',
};

const mockSensors = [
  // Hub 1
  {
    sensor_id: '1',
    name: 'Salon Temp',
    displayValue: '20',
    state_changed_at: '2023-12-10T10:00:00Z',
    type: { type_key: 'temperature', unit: '°C' },
    hub: { hub_id: 'hub1', name: 'Maison' },
  },
  {
    sensor_id: '2',
    name: 'Salon Hum',
    displayValue: '50',
    state_changed_at: '2023-12-10T10:00:00Z',
    type: { type_key: 'humidity', unit: '%' },
    hub: { hub_id: 'hub1', name: 'Maison' },
  },
  // Hub 2
  {
    sensor_id: '3',
    name: 'Bureau Temp',
    displayValue: '22',
    state_changed_at: '2023-12-10T12:00:00Z',
    type: { type_key: 'temperature', unit: '°C' },
    hub: { hub_id: 'hub2', name: 'Bureau' },
  },
  {
    sensor_id: '4',
    name: 'Fenêtre Cuisine',
    displayValue: 'Ouvert',
    state_changed_at: '2023-12-10T09:00:00Z',
    type: { type_key: 'window', unit: '' },
    hub: { hub_id: 'hub1', name: 'Maison' },
  },
  {
    sensor_id: '5',
    name: 'CO2 Salon',
    displayValue: '800',
    state_changed_at: '2023-12-10T10:00:00Z',
    type: { type_key: 'air_quality', unit: 'ppm' },
    hub: { hub_id: 'hub1', name: 'Maison' },
  },
];

// NOUVEAU : Mock des Hubs (2 hubs correspondant aux sensors)
const mockHubs = [
  { hub_id: 'hub1', name: 'Maison', status: 'online' },
  { hub_id: 'hub2', name: 'Bureau', status: 'online' },
];

describe('DashboardPage (Server Component)', () => {
  const { currentUser, auth } = require('@clerk/nextjs/server');

  beforeEach(() => {
    jest.clearAllMocks();
    currentUser.mockResolvedValue(mockUser);
    auth.mockResolvedValue({ getToken: jest.fn().mockResolvedValue('fake-token') });
  });

  it("redirige vers /connexion si aucun utilisateur n'est connecté", async () => {
    currentUser.mockResolvedValue(null);

    // On s'attend à ce que l'appel lance l'erreur NEXT_REDIRECT définie dans le mock
    try {
      await DashboardPage();
    } catch (e: any) {
      expect(e.message).toBe('NEXT_REDIRECT');
    }

    expect(redirect).toHaveBeenCalledWith('/connexion');
  });

  it("affiche le header avec le prénom de l'utilisateur", async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.getByText('Thomas')).toBeInTheDocument();
  });

  it('calcule et affiche correctement les statistiques globales (Top Cards)', async () => {
    // CORRECTION ICI : On mocke différemment selon l'URL appelée
    (fetchFromApi as jest.Mock).mockImplementation((url) => {
      if (url === '/api/sensors') return Promise.resolve(mockSensors);
      if (url === '/api/hubs') return Promise.resolve(mockHubs); // Retourne 2 hubs
      return Promise.resolve([]);
    });

    const jsx = await DashboardPage();
    render(jsx);

    // 1. Hubs Connectés : 2 (Longueur de mockHubs)
    const hubCount = screen.getByText('2');
    expect(hubCount).toBeInTheDocument();
    expect(screen.getByText('Hubs Connectés')).toBeInTheDocument();

    // 2. Capteurs Totaux : 5 (Longueur de mockSensors)
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Capteurs Totaux')).toBeInTheDocument();

    // 3. Dernière Mise à Jour
    expect(screen.getByText('Dernière mise à jour')).toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('passe les bonnes données calculées au composant CategorySummaryCards', async () => {
    // CORRECTION ICI AUSSI
    (fetchFromApi as jest.Mock).mockImplementation((url) => {
      if (url === '/api/sensors') return Promise.resolve(mockSensors);
      if (url === '/api/hubs') return Promise.resolve(mockHubs);
      return Promise.resolve([]);
    });

    const jsx = await DashboardPage();
    render(jsx);

    // Fenêtres ouvertes : 1
    expect(screen.getByTestId('prop-windows')).toHaveTextContent('1');

    // Température moyenne : (20 + 22) / 2 = 21
    expect(screen.getByTestId('prop-avg-temp')).toHaveTextContent('21');

    // Humidité moyenne : 50 / 1 = 50
    expect(screen.getByTestId('prop-avg-hum')).toHaveTextContent('50');

    // CO2 moyen : 800 / 1 = 800
    expect(screen.getByTestId('prop-avg-co2')).toHaveTextContent('800');
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    (fetchFromApi as jest.Mock).mockRejectedValue(new Error('Serveur indisponible'));

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText(/Erreur de communication/i)).toBeInTheDocument();
    expect(screen.getByText('Serveur indisponible')).toBeInTheDocument();
  });

  it("gère le cas où aucune donnée n'est renvoyée (liste vide)", async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText('Hubs Connectés')).toBeInTheDocument();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });
});
