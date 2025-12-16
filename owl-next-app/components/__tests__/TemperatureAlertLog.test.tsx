import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TemperatureAlertLog from '@/components/TemperatureAlertLog';
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
];

describe('TemperatureAlertLog', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('devrait afficher le titre', () => {
    render(<TemperatureAlertLog sensors={mockSensors} />);
    expect(screen.getByText('Journal des Alertes')).toBeInTheDocument();
  });

  it('devrait afficher la date formatée', () => {
    render(<TemperatureAlertLog sensors={mockSensors} />);
    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const formatted = today.charAt(0).toUpperCase() + today.slice(1);
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('devrait afficher les 3 boutons de filtre', () => {
    render(<TemperatureAlertLog sensors={mockSensors} />);
    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText(/Trop hautes/i)).toBeInTheDocument();
    expect(screen.getByText(/Trop basses/i)).toBeInTheDocument();
  });

  it('devrait afficher les boutons de navigation', () => {
    render(<TemperatureAlertLog sensors={mockSensors} />);
    expect(screen.getByLabelText('Jour précédent')).toBeInTheDocument();
    expect(screen.getByLabelText('Jour suivant')).toBeInTheDocument();
  });

  it('devrait afficher un loader pendant le chargement', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TemperatureAlertLog sensors={mockSensors} />);
    expect(screen.getByText('Chargement des alertes...')).toBeInTheDocument();
  });

  it('devrait afficher "Aucune alerte" si pas de données', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher les alertes trop chaudes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          value: 25.5,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/25\.5/)).toBeInTheDocument();
    });
  });

  it('devrait afficher les alertes trop froides', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          value: 15.0,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/15\.0/)).toBeInTheDocument();
    });
  });

  it('devrait changer de jour avec le bouton précédent', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    const prevButton = screen.getByLabelText('Jour précédent');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('devrait filtrer par "Trop hautes"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { value: 25.5, timestamp: new Date().toISOString() },
        { value: 15.0, timestamp: new Date().toISOString() },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/25\.5/)).toBeInTheDocument();
      expect(screen.getByText(/15\.0/)).toBeInTheDocument();
    });

    const highButton = screen.getByText(/Trop hautes/i);
    fireEvent.click(highButton);

    await waitFor(() => {
      expect(screen.getByText(/25\.5/)).toBeInTheDocument();
    });
  });

  it('devrait filtrer par "Trop basses"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { value: 25.5, timestamp: new Date().toISOString() },
        { value: 15.0, timestamp: new Date().toISOString() },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/15\.0/)).toBeInTheDocument();
      expect(screen.getByText(/25\.5/)).toBeInTheDocument();
    });

    const lowButton = screen.getByText(/Trop basses/i);
    fireEvent.click(lowButton);

    await waitFor(() => {
      expect(screen.getByText(/15\.0/)).toBeInTheDocument();
    });
  });

  it("devrait désactiver le bouton suivant si aujourd'hui", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      const nextButton = screen.getByLabelText('Jour suivant');
      expect(nextButton).toBeDisabled();
    });
  });

  it('devrait gérer les erreurs API', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
    });
  });
});
