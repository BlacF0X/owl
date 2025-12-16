import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EvolutionChart } from '../Co2EvolutionChart';

// 1. Mock de Recharts (INDISPENSABLE car Recharts ne s'affiche pas dans les tests JSDOM)
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="recharts-area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  defs: () => <div />,
  linearGradient: () => <div />,
  stop: () => <div />,
}));

// 2. Mock des icônes pour éviter les erreurs de rendu SVG
jest.mock('lucide-react', () => ({
  Wind: () => <div data-testid="icon-wind" />,
  Activity: () => <div data-testid="icon-activity" />,
}));

describe('Co2EvolutionChart Component', () => {
  // TEST 1 : Chargement
  it('affiche le chargement', () => {
    render(<EvolutionChart data={[]} loading={true} />);
    // Correction ici : on cherche "Chargement..." tout court
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  // TEST 2 : Liste vide
  it('affiche un message si aucune donnée', () => {
    render(<EvolutionChart data={[]} loading={false} />);
    expect(screen.getByText('Aucune donnée récente')).toBeInTheDocument();
  });

  // TEST 3 : Affichage des données (Graphique + Stats)
  it('affiche le graphique et les stats quand il y a des données', () => {
    const mockData = [{ hour: '10:00', ppm: 500 }];
    render(<EvolutionChart data={mockData} loading={false} />);
    
    // Vérifie que le graphique est là (via le mock)
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();
    
    // Vérifie que les stats "Max" et "Moyenne" sont affichées
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();
    
    // Vérifie la valeur (500 ppm)
    // Note: getAllByText car le chiffre 500 apparaît deux fois (Moyenne et Max sont identiques ici)
    expect(screen.getAllByText('500')[0]).toBeInTheDocument();
  });

  // TEST 4 : Titre personnalisé
  it('affiche le suffixe du titre si fourni', () => {
    render(<EvolutionChart data={[]} loading={false} titleSuffix="Capteur Salon" />);
    expect(screen.getByText('Capteur Salon')).toBeInTheDocument();
  });
});
