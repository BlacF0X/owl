import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WindowPage from '../page';
import { fetchFromApi } from '@/src/lib/apiClient';
import { redirect } from 'next/navigation';

// --- MOCKS ---

// 1. Mock de la navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// 2. Mock de Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
  auth: jest.fn(),
}));

// 3. Mock de l'API Client
jest.mock('@/src/lib/apiClient', () => ({
  fetchFromApi: jest.fn(),
}));

// 4. Mock des composants enfants (pour isoler le test de la page)
jest.mock('@/components/WindowSensorsView', () => ({
  __esModule: true,
  default: () => <div data-testid="window-sensors-view">Mocked View</div>,
}));

jest.mock('@/components/WindowActivityLog', () => ({
  __esModule: true,
  default: () => <div data-testid="window-activity-log">Mocked Log</div>,
}));

jest.mock('@/components/WindowLazyChart', () => ({
  __esModule: true,
  default: () => <div data-testid="window-lazy-chart">Mocked Chart</div>,
}));

// --- DONNÉES DE TEST ---

const mockUser = { id: 'user_123', firstName: 'Test' };

// Un capteur fermé
const sensorClosed = {
  sensor_id: '1',
  name: 'Fenêtre Salon',
  displayValue: 'Fermé',
  state_changed_at: new Date().toISOString(),
  hub: { hub_id: 'h1', name: 'Maison' },
  type: { type_key: 'window' },
};

// Un capteur ouvert récemment (< 1h)
const sensorOpenRecent = {
  sensor_id: '2',
  name: 'Fenêtre Cuisine',
  displayValue: 'Ouvert',
  // Ouvert il y a 10 min
  state_changed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  hub: { hub_id: 'h1', name: 'Maison' },
  type: { type_key: 'window' },
};

// Un capteur ouvert depuis longtemps (> 1h) -> Doit déclencher l'alerte
const sensorOpenLong = {
  sensor_id: '3',
  name: 'Fenêtre Chambre',
  displayValue: 'Ouvert',
  // Ouvert il y a 2 heures
  state_changed_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  hub: { hub_id: 'h2', name: 'Étage' },
  type: { type_key: 'window' },
};

describe('WindowSensorsPage (Server Component)', () => {
  const { currentUser, auth } = require('@clerk/nextjs/server');

  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut, user connecté et token dispo
    currentUser.mockResolvedValue(mockUser);
    auth.mockResolvedValue({ getToken: jest.fn().mockResolvedValue('fake-token') });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redirige vers /connexion si l'utilisateur n'est pas connecté", async () => {
    currentUser.mockResolvedValue(null);

    // On doit attraper l'erreur car redirect() lance une erreur dans Next.js
    try {
      await WindowPage();
    } catch (e) {
      // ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/connexion');
  });

  it('affiche la page correctement avec des données standards', async () => {
    // Mock des réponses API
    (fetchFromApi as jest.Mock).mockImplementation((url) => {
      if (url.includes('/stats')) return Promise.resolve([{ hour: 12, count: 5 }]);
      return Promise.resolve([sensorClosed, sensorOpenRecent]);
    });

    const jsx = await WindowPage();
    render(jsx);

    // Titres
    expect(screen.getByText('Fenêtres')).toBeInTheDocument();

    // Résumé : 1 ouvert sur 2 total
    expect(screen.getByText('1')).toBeInTheDocument(); // Count open
    expect(screen.getByText(/ouverts/i)).toBeInTheDocument();
    expect(screen.getByText(/sur 2 capteurs totaux/i)).toBeInTheDocument();

    // Vérifie que les composants enfants sont rendus
    expect(screen.getByTestId('window-sensors-view')).toBeInTheDocument();
    expect(screen.getByTestId('window-activity-log')).toBeInTheDocument();
    expect(screen.getByTestId('window-lazy-chart')).toBeInTheDocument();

    // S'assure qu'aucune alerte critique n'est affichée (car < 1h)
    expect(screen.queryByText(/Attention requise/i)).not.toBeInTheDocument();
  });

  it("affiche une alerte orange si une fenêtre est ouverte depuis plus d'1h", async () => {
    (fetchFromApi as jest.Mock).mockImplementation((url) => {
      if (url.includes('/stats')) return Promise.resolve([]);
      // On retourne le capteur ouvert depuis 2h
      return Promise.resolve([sensorOpenLong]);
    });

    const jsx = await WindowPage();
    render(jsx);

    // Vérifie la présence de la boîte d'alerte
    expect(screen.getByText('Attention requise')).toBeInTheDocument();
    expect(screen.getByText(/fenêtre ouverte depuis plus d'1h/i)).toBeInTheDocument();
    expect(screen.getByText('Fenêtre Chambre')).toBeInTheDocument(); // Le nom du capteur coupable
  });

  it("gère les erreurs de l'API gracieusement", async () => {
    (fetchFromApi as jest.Mock).mockRejectedValue(new Error('API Down'));

    const jsx = await WindowPage();
    render(jsx);

    expect(screen.getByText(/Erreur de chargement des données/i)).toBeInTheDocument();
    expect(screen.getByText('API Down')).toBeInTheDocument();

    // Les composants dépendant des données ne doivent pas s'afficher
    expect(screen.queryByTestId('window-sensors-view')).not.toBeInTheDocument();
  });

  it("affiche un message si aucun capteur n'est trouvé", async () => {
    (fetchFromApi as jest.Mock).mockResolvedValue([]); // Liste vide

    const jsx = await WindowPage();
    render(jsx);

    expect(screen.getByText(/Aucun capteur de fenêtre n'a été trouvé/i)).toBeInTheDocument();
  });

  // Test pour lines 25-31 (Erreur auth Clerk)
  it("gère une erreur inattendue lors de l'authentification", async () => {
    const { auth } = require('@clerk/nextjs/server');
    auth.mockRejectedValue(new Error('Clerk Error'));

    const jsx = await WindowPage();
    render(jsx);

    expect(screen.getByText(/Session expirée/i)).toBeInTheDocument();

    // Le console.error a été appelé (mocké)
    expect(console.error).toHaveBeenCalled();
  });

  it('affiche la page même si les stats échouent (tableau vide)', async () => {
    (fetchFromApi as jest.Mock).mockImplementation((url) => {
      if (url.includes('/stats')) return Promise.reject(new Error('Stats Failed'));
      return Promise.resolve([sensorClosed]);
    });

    const jsx = await WindowPage();
    render(jsx);

    expect(screen.getByText('Fenêtres')).toBeInTheDocument();

    expect(screen.getByTestId('window-sensors-view')).toBeInTheDocument();

    // On vérifie que l'erreur a été loggée
    expect(console.error).toHaveBeenCalledWith('Erreur stats:', expect.any(Error));
  });
});
