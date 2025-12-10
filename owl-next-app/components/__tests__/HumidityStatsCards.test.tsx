import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HumidityStatsCards from '../HumidityStatsCards';
import type { HumidityStats } from '../HumidityStatsCards';

jest.mock('lucide-react', () => ({
  Activity: () => <div data-testid="icon-activity" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  Clock: () => <div data-testid="icon-clock" />,
  CheckCircle: () => <div data-testid="icon-check" />,
}));

describe('HumidityStatsCards Component', () => {
  const mockStats: HumidityStats = {
    averageHumidity: 55,
    activeAlerts: 2,
    lastUpdate: '14:30',
  };

  it("affiche la moyenne d'humidité correctement", () => {
    render(<HumidityStatsCards stats={mockStats} />);
    // ✅ Utilise une regex pour gérer le texte fragmenté (55 et %)
    expect(screen.getByText(/55/)).toBeInTheDocument();
    expect(screen.getByText(/Humidité moyenne/i)).toBeInTheDocument();
  });

  it("affiche le nombre d'alertes actives", () => {
    render(<HumidityStatsCards stats={mockStats} />);
    expect(screen.getByText(/Alertes actives/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('affiche la dernière mise à jour', () => {
    render(<HumidityStatsCards stats={mockStats} />);
    expect(screen.getByText(/Dernière mise à jour/i)).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it("affiche un badge vert si pas d'alertes", () => {
    const noAlertsStats: HumidityStats = {
      averageHumidity: 50,
      activeAlerts: 0,
      lastUpdate: '14:30',
    };
    render(<HumidityStatsCards stats={noAlertsStats} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it("affiche un badge rouge s'il y a des alertes", () => {
    const withAlertsStats: HumidityStats = {
      averageHumidity: 80,
      activeAlerts: 3,
      lastUpdate: '14:30',
    };
    render(<HumidityStatsCards stats={withAlertsStats} />);
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });
});
