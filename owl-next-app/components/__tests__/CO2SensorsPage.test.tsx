import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// Assurez-vous que ce chemin correspond bien à votre structure
import CO2SensorsPage from '@/app/(dashboard)/dashboard/co2-sensors/page';

// 1. Mocks Clerk (Double sécurité)
jest.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('fake-token'),
  }),
}));

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('fake-token'),
  }),
}));

// 2. Mocks des composants enfants
jest.mock('../Co2EvolutionChart', () => ({
  EvolutionChart: ({ loading }: { loading: boolean }) => (
    <div data-testid="evolution-chart">{loading ? 'Loading Graph' : 'Graph Loaded'}</div>
  ),
}));

jest.mock('../Co2HistoryModal', () => ({
  HistoryModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="history-modal">
        Modal Open <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// 3. Mock global de fetch
global.fetch = jest.fn();

// Données de test
const mockSensorsResponse = [
  {
    sensor_id: 's1',
    name: 'Salon',
    displayValue: '450',
    state_changed_at: new Date().toISOString(),
    type: { type_key: 'co2', name: 'CO2', unit: 'ppm' },
    hub: { name: 'Maison' },
  },
  {
    sensor_id: 's2',
    name: 'Bureau 1',
    displayValue: '1300',
    state_changed_at: new Date().toISOString(),
    type: { type_key: 'co2', name: 'CO2', unit: 'ppm' },
    hub: { name: 'Bureau' },
  },
];

const mockHistoryResponse = {
  sensor: mockSensorsResponse[0],
  history: [{ timestamp: new Date().toISOString(), value: 450 }],
};

describe('CO2SensorsPage Integration', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // On masque les console.error pour garder la sortie des tests propre
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('charge et affiche les capteurs répartis par zone', async () => {
    // Mock intelligent qui répond selon l'URL
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sensors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSensorsResponse,
        });
      }
      if (url.includes('/api/co2/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHistoryResponse,
        });
      }
      // Fallback pour éviter les crashs si d'autres appels surviennent
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    render(<CO2SensorsPage />);

    // On attend qu'une section apparaisse (indique la fin du chargement)
    await waitFor(() => {
      expect(screen.getByText('Résidence')).toBeInTheDocument();
    }, { timeout: 10000 });

    // On utilise getAllByText car le nom peut apparaître dans la carte ET dans les alertes
    expect(screen.getAllByText('Salon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bureau 1').length).toBeGreaterThan(0);
    
    // Moyenne: (450 + 1300) / 2 = 875
    expect(screen.getByText('875 ppm')).toBeInTheDocument();
  }, 15000);

  it('gère les erreurs de chargement API', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sensors')) {
        return Promise.reject(new Error('API Error'));
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<CO2SensorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur: API Error/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);

  it("affiche une bannière d'alerte critique si un capteur dépasse 1500 ppm", async () => {
    const criticalSensors = [
      ...mockSensorsResponse,
      { ...mockSensorsResponse[0], sensor_id: 's3', name: 'DangerZone', displayValue: '1600' },
    ];

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sensors')) {
        return Promise.resolve({
          ok: true,
          json: async () => criticalSensors,
        });
      }
      if (url.includes('/api/co2/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHistoryResponse,
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<CO2SensorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Alerte Critique/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Le nom apparaît dans la carte, les alertes, et la bannière rouge => getAllByText
    expect(screen.getAllByText(/DangerZone/i).length).toBeGreaterThan(0);
  }, 15000);

  it("ouvre la modale d'historique au clic sur le bouton d'analyse", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sensors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSensorsResponse,
        });
      }
      if (url.includes('/api/co2/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHistoryResponse,
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<CO2SensorsPage />);

    await waitFor(() => {
      expect(screen.getByText('Salon')).toBeInTheDocument();
    }, { timeout: 10000 });

    const historyButtons = screen.getAllByText(/Voir l'analyse détaillée/i);
    fireEvent.click(historyButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('history-modal')).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);
});
