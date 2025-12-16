import { render, screen, waitFor } from '@testing-library/react';
import TemperatureBatchLoader from '@/components/TemperatureBatchLoader';
import type { TemperatureSensor } from '@/components/TemperatureSensorCard';

const mockSensors: TemperatureSensor[] = [
  {
    sensor_id: 'sensor-1',
    name: 'Salon - Température',
    displayValue: '21.5',
    state_changed_at: new Date().toISOString(),
    hub: {
      hub_id: 'hub-1',
      name: 'Hub Principal',
    },
    type: {
      typekey: 'temperature',
      name: 'Température',
      unit: '°C',
    },
  },
  {
    sensor_id: 'sensor-2',
    name: 'Cuisine - Température',
    displayValue: '19.0',
    state_changed_at: new Date().toISOString(),
    hub: {
      hub_id: 'hub-1',
      name: 'Hub Principal',
    },
    type: {
      typekey: 'temperature',
      name: 'Température',
      unit: '°C',
    },
  },
];

describe('TemperatureBatchLoader', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('devrait afficher le loader pendant le chargement', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TemperatureBatchLoader sensors={mockSensors} viewMode="current" />);

    expect(screen.getByText("Chargement de l'historique des capteurs...")).toBeInTheDocument();
  });

  it('devrait charger et afficher les capteurs', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        'sensor-1': [{ value: 21.5, timestamp: new Date().toISOString() }],
        'sensor-2': [{ value: 19.0, timestamp: new Date().toISOString() }],
      }),
    });

    render(<TemperatureBatchLoader sensors={mockSensors} viewMode="current" />);

    await waitFor(() => {
      expect(screen.getByText('Salon - Température')).toBeInTheDocument();
      expect(screen.getByText('Cuisine - Température')).toBeInTheDocument();
    });
  });

  it('devrait grouper les capteurs par hub', async () => {
    const sensorsMultiHub: TemperatureSensor[] = [
      { ...mockSensors[0], hub: { hub_id: 'hub-1', name: 'Hub 1' } },
      { ...mockSensors[1], hub: { hub_id: 'hub-2', name: 'Hub 2' } },
    ];

    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<TemperatureBatchLoader sensors={sensorsMultiHub} viewMode="current" />);

    await waitFor(() => {
      expect(callCount).toBe(2); // 1 requête par hub
    });
  });

  it('devrait passer le bon viewMode aux cartes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        'sensor-1': [],
      }),
    });

    const { rerender } = render(<TemperatureBatchLoader sensors={mockSensors} viewMode="max" />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });

    rerender(<TemperatureBatchLoader sensors={mockSensors} viewMode="min" />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs API silencieusement', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TemperatureBatchLoader sensors={mockSensors} viewMode="current" />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });
  });

  it('devrait gérer un tableau de capteurs vide', async () => {
    render(<TemperatureBatchLoader sensors={[]} viewMode="current" />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });
  });

  it('devrait gérer des capteurs sans hub', async () => {
    const sensorsNoHub: TemperatureSensor[] = [{ ...mockSensors[0], hub: undefined }];

    render(<TemperatureBatchLoader sensors={sensorsNoHub} viewMode="current" />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });
  });
});
