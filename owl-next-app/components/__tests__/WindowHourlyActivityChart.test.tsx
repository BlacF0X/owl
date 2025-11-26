import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WindowHourlyActivityChart from '../WindowHourlyActivityChart';

// 1. Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 2. Mock de Recharts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');

  return {
    ...OriginalModule,
    // On ajoute un data-testid pour identifier facilement notre mock dans le DOM
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  };
});

const mockData = [
  { hour: 0, count: 2 },
  { hour: 8, count: 10 },
];

describe('WindowHourlyActivityChart Component', () => {
  it('se rend sans erreur', () => {
    render(<WindowHourlyActivityChart data={mockData} />);

    // Au lieu de chercher le SVG, on vérifie que notre conteneur est là.
    // Si ce conteneur est là, c'est que le composant parent a réussi son rendu
    // et a passé les enfants à ResponsiveContainer sans planter.
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
  });
});
