import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TemperatureAlertLog from '@/components/TemperatureAlertLog';
import type { TemperatureSensor } from '@/components/TemperatureSensorCard';

const mockGetToken = jest.fn().mockResolvedValue('fake-token');

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
  }),
}));

const mockSensors: TemperatureSensor[] = [
  {
    sensor_id: 'sensor-1',
    name: 'Salon - Température',
    displayValue: '21.5',
    state_changed_at: new Date().toISOString(),
    hub: { hub_id: 'hub-1', name: 'Hub Principal' },
    type: { typekey: 'temperature', name: 'Température', unit: '°C' },
  },
];

describe('TemperatureAlertLog', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    mockGetToken.mockClear();
  });

  it('devrait afficher le titre', async () => {
    // On doit toujours attendre la fin des effets pour éviter les warnings "act"
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Journal des Alertes')).toBeInTheDocument();
  });

  it('devrait afficher la date formatée', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );

    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const formatted = today.charAt(0).toUpperCase() + today.slice(1);
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('devrait afficher les boutons de filtre et navigation', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
    render(<TemperatureAlertLog sensors={mockSensors} />);

    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );

    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Jour précédent')).toBeInTheDocument();
  });

  it('devrait afficher un loader pendant le chargement', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<TemperatureAlertLog sensors={mockSensors} />);
    expect(screen.getByText('Chargement des alertes...')).toBeInTheDocument();
  });

  it('devrait changer de jour avec le bouton précédent', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });

    render(<TemperatureAlertLog sensors={mockSensors} />);

    // 1. Attendre chargement initial
    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // 2. Clic précédent
    const prevButton = screen.getByLabelText('Jour précédent');
    fireEvent.click(prevButton);

    // 3. Attendre le 2ème appel fetch (déclenché par useEffect [selectedDate])
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('devrait filtrer par "Trop hautes"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { value: 25.5, timestamp: '2025-12-16T10:00:00Z' },
        { value: 15.0, timestamp: '2025-12-16T11:00:00Z' },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);
    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );

    const highButton = screen.getByText(/Trop hautes/i);
    fireEvent.click(highButton);

    expect(screen.getByText(/25\.5/)).toBeInTheDocument();
    expect(screen.queryByText(/15\.0/)).not.toBeInTheDocument();
  });

  it('devrait filtrer par "Trop basses"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { value: 25.5, timestamp: '2025-12-16T10:00:00Z' },
        { value: 15.0, timestamp: '2025-12-16T11:00:00Z' },
      ],
    });

    render(<TemperatureAlertLog sensors={mockSensors} />);
    await waitFor(() =>
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument()
    );

    const lowButton = screen.getByText(/Trop basses/i);
    fireEvent.click(lowButton);

    expect(screen.getByText(/15\.0/)).toBeInTheDocument();
    expect(screen.queryByText(/25\.5/)).not.toBeInTheDocument();
  });

  it('devrait gérer les erreurs API', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<TemperatureAlertLog sensors={mockSensors} />);

    // Le loader doit disparaitre même en cas d'erreur (le finally du useEffect)
    await waitFor(() => {
      expect(screen.queryByText('Chargement des alertes...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
  });
});
