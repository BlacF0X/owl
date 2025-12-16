import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EvolutionChart } from '../Co2EvolutionChart';

// 1. Mock de Recharts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
    // CORRECTION MAJEURE ICI : Utiliser <svg> au lieu de <div>
    // Cela permet aux enfants (<defs>, <linearGradient>, etc.) d'être valides.
    AreaChart: ({ children }: any) => <svg data-testid="recharts-area-chart">{children}</svg>,
    // On remplace les composants internes par des groupes SVG (<g>) pour éviter les erreurs de nesting
    Area: () => <g data-testid="recharts-area" />,
    XAxis: () => <g data-testid="recharts-xaxis" />,
    YAxis: () => <g data-testid="recharts-yaxis" />,
    CartesianGrid: () => <g data-testid="recharts-grid" />,
    Tooltip: () => <g data-testid="recharts-tooltip" />,
    // Note : On ne mocke PAS 'defs', 'linearGradient' ou 'stop' car ce sont des balises natives, pas des composants Recharts.
  };
});

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

    // On vérifie la présence du graphique (notre mock svg)
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();

    // On vérifie les textes des statistiques
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();

    // On vérifie que la valeur 500 est affichée (getAllByText car elle apparaît dans Max ET Moyenne)
    expect(screen.getAllByText('500')[0]).toBeInTheDocument();
  });

  it('affiche le suffixe du titre si fourni', () => {
    render(<EvolutionChart data={[]} loading={false} titleSuffix="Capteur Salon" />);
    expect(screen.getByText('Capteur Salon')).toBeInTheDocument();
  });
});
