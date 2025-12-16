import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EvolutionChart } from '../Co2EvolutionChart';

// 1. Mock de Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: any) => (
    <div data-testid="recharts-area-chart">{children}</div>
  ),
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  defs: () => <div />,
  linearGradient: () => <div />,
  stop: () => <div />,
}));

// 2. Mock des icônes
jest.mock('lucide-react', () => ({
  Wind: () => <div data-testid="icon-wind" />,
  Activity: () => <div data-testid="icon-activity" />,
}));

describe('Co2EvolutionChart Component', () => {
  it('affiche le chargement', () => {
    render(<EvolutionChart data={[]} loading={true} />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('affiche un message si aucune donnée', () => {
    render(<EvolutionChart data={[]} loading={false} />);
    expect(screen.getByText('Aucune donnée récente')).toBeInTheDocument();
  });

  it('affiche le graphique et les stats quand il y a des données', () => {
    const mockData = [{ hour: '10:00', ppm: 500 }];
    render(<EvolutionChart data={mockData} loading={false} />);

    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();
    expect(screen.getAllByText('500')[0]).toBeInTheDocument();
  });

  it('affiche le suffixe du titre si fourni', () => {
    render(
      <EvolutionChart
        data={[]}
        loading={false}
        titleSuffix="Capteur Salon"
      />,
    );
    expect(screen.getByText('Capteur Salon')).toBeInTheDocument();
  });
});
