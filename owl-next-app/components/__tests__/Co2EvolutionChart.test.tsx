import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EvolutionChart } from '../Co2EvolutionChart';

// Mock de Chart.js et react-chartjs-2 pour éviter les erreurs de canvas
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

describe('Co2EvolutionChart Component', () => {
  it('affiche le chargement', () => {
    render(<EvolutionChart data={[]} loading={true} />);
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('affiche un message si aucune donnée', () => {
    render(<EvolutionChart data={[]} loading={false} />);
    expect(screen.getByText('Aucune donnée récente')).toBeInTheDocument();
  });

  it('affiche le graphique quand il y a des données', () => {
    const mockData = [{ hour: '10:00', height: 100, ppm: 500 }];
    render(<EvolutionChart data={mockData} loading={false} />);
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('affiche le suffixe du titre si fourni', () => {
    render(<EvolutionChart data={[]} loading={false} titleSuffix="Capteur : Salon" />);
    expect(screen.getByText('Capteur : Salon')).toBeInTheDocument();
  });
});
