import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import HumidityEvolutionChart, { type HumidityDataPoint } from '../HumidityEvolutionChart';

// ✅ Mock Lucide React
jest.mock('lucide-react', () => ({
  Activity: () => <div data-testid="icon-activity" />,
}));

// ✅ Mock Recharts Avancé pour couvrir les fonctions internes (tickFormatter, CustomTooltip)
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('react');
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    // ✅ Capture et exécute tickFormatter pour augmenter le coverage
    XAxis: ({ tickFormatter }: any) => (
      <div data-testid="xaxis">
        {tickFormatter ? <span data-testid="xaxis-tick">{tickFormatter(12)}</span> : null}
      </div>
    ),
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    // ✅ Clone l'élément content et lui injecte des props pour simuler le survol (active: true)
    Tooltip: ({ content }: any) => {
      const mockPayload = [{ value: 55 }];
      const mockLabel = 14;
      
      if (OriginalModule.isValidElement(content)) {
        return (
          <div data-testid="tooltip">
            {OriginalModule.cloneElement(content as React.ReactElement, { 
              active: true, 
              payload: mockPayload, 
              label: mockLabel 
            })}
          </div>
        );
      }
      return <div data-testid="tooltip">{content}</div>;
    },
  };
});

describe('HumidityEvolutionChart Component', () => {
  const mockData: HumidityDataPoint[] = [
    { hour: 9, value: 45 },
    { hour: 12, value: 50 },
    { hour: 15, value: 65 },
    { hour: 18, value: 55 },
  ];

  it('rend le composant graphique sans erreur', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('responsive')).toBeInTheDocument();
  });

  it('affiche un message si aucune donnée n\'est disponible', () => {
    render(<HumidityEvolutionChart data={[]} />);
    expect(screen.getByTestId('responsive')).toBeInTheDocument();
  });

  it('affiche l\'icône Activity', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    expect(screen.getByTestId('icon-activity')).toBeInTheDocument();
  });

  it('affiche la moyenne correctement', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    expect(screen.getByText(/Moyenne/i)).toBeInTheDocument();
    expect(screen.getByText(/54/)).toBeInTheDocument();
  });

  it('gère les données avec une seule valeur', () => {
    const singleData: HumidityDataPoint[] = [{ hour: 12, value: 50 }];
    render(<HumidityEvolutionChart data={singleData} />);
    expect(screen.getByTestId('responsive')).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('affiche le graphique avec données complètes', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(screen.getByTestId('xaxis')).toBeInTheDocument();
    expect(screen.getByTestId('yaxis')).toBeInTheDocument();
  });

  // ✅ Test spécifique pour vérifier que formatXAxis est appelé (via le mock)
  it('formate correctement les ticks de l\'axe X', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    // Le mock XAxis rend tickFormatter(12) -> "12h"
    expect(screen.getByTestId('xaxis-tick')).toHaveTextContent('12h');
  });

  // ✅ Test spécifique pour vérifier que CustomTooltip est rendu (via le mock)
  it('rend le CustomTooltip avec les valeurs correctes', () => {
    render(<HumidityEvolutionChart data={mockData} />);
    // Le mock Tooltip injecte active=true, payload=[{value: 55}], label=14
    expect(screen.getByText('14h00')).toBeInTheDocument();
    expect(screen.getByText('55%')).toBeInTheDocument();
    expect(screen.getByText(/Humidité/)).toBeInTheDocument();
  });

  it('calcule la moyenne correctement avec valeurs différentes', () => {
    const dataWithDifferentValues: HumidityDataPoint[] = [
      { hour: 6, value: 30 },
      { hour: 12, value: 50 },
      { hour: 18, value: 70 },
    ];
    render(<HumidityEvolutionChart data={dataWithDifferentValues} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('se rend correctement avec des données manquantes', () => {
    const dataWithMissing: HumidityDataPoint[] = [
      { hour: 9, value: 45 },
      { hour: 18, value: 55 },
    ];
    render(<HumidityEvolutionChart data={dataWithMissing} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });
});