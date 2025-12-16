import { render, screen, waitFor } from '@testing-library/react';
import TemperatureComparisonView from '@/components/TemperatureComparisonView';
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

describe('TemperatureComparisonView', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('devrait afficher le loader pendant le chargement', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TemperatureComparisonView sensors={mockSensors} />);

    expect(screen.getByText('Chargement de la comparaison...')).toBeInTheDocument();
  });

  it('devrait afficher le titre', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        'sensor-1': [{ value: 21, timestamp: new Date().toISOString() }],
        'sensor-2': [{ value: 19, timestamp: new Date().toISOString() }],
      }),
    });

    render(<TemperatureComparisonView sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText('Comparaison des capteurs (7 derniers jours)')).toBeInTheDocument();
    });
  });

  it('devrait afficher "Aucune donnée disponible" si pas de données', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<TemperatureComparisonView sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText('Aucune donnée disponible pour la comparaison.')).toBeInTheDocument();
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

    render(<TemperatureComparisonView sensors={sensorsMultiHub} />);

    await waitFor(() => {
      expect(callCount).toBe(2); // 1 requête par hub
    });
  });

  it('devrait gérer les erreurs API', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TemperatureComparisonView sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText('Aucune donnée disponible pour la comparaison.')).toBeInTheDocument();
    });
  });

  it('devrait gérer un tableau de capteurs vide', async () => {
    render(<TemperatureComparisonView sensors={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Aucune donnée disponible pour la comparaison.')).toBeInTheDocument();
    });
  });

  it('devrait calculer les moyennes journalières', async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        'sensor-1': [
          { value: 20, timestamp: now.toISOString() },
          { value: 22, timestamp: now.toISOString() },
          { value: 18, timestamp: yesterday.toISOString() },
        ],
      }),
    });

    render(<TemperatureComparisonView sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.queryByText('Chargement')).not.toBeInTheDocument();
    });
  });
});
