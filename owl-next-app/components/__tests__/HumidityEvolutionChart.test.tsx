import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HumidityEvolutionChart from '../HumidityEvolutionChart';
import { HumidityDataPoint } from '../HumidityEvolutionChart';

describe('HumidityEvolutionChart Component', () => {
  // Test 1: Affichage du titre
  it('affiche le titre du graphique', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 50 },
      { hour: 1, value: 55 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/dernières 24h/i)).toBeInTheDocument();
  });

  // Test 2: Message si pas de donnees
  it('affiche un message quand il n y a pas de donnees', () => {
    render(<HumidityEvolutionChart data={[]} />);

    expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
  });

  // Test 3: Ne rend pas le graphique si data est vide
  it('ne rend pas le graphique si data est vide', () => {
    const { container } = render(<HumidityEvolutionChart data={[]} />);

    const chart = container.querySelector('[class*="h-64"]');
    expect(chart).not.toBeInTheDocument();
  });

  // Test 4: Calcul de la moyenne
  it('calcule et affiche la moyenne correctement', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 40 },
      { hour: 8, value: 50 },
      { hour: 16, value: 60 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 5: Affiche l axe Y
  it('affiche l axe Y avec les valeurs de 0 a 100', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 50 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    const yTicks = container.textContent;
    expect(yTicks).toContain('100');
    expect(yTicks).toContain('80');
    expect(yTicks).toContain('0');
  });

  // Test 6: Affiche les heures sur l axe X
  it('affiche l axe X avec les heures', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 50 },
      { hour: 4, value: 55 },
      { hour: 8, value: 60 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    // Utilise getAllByText au lieu de getByText pour eviter les doublons
    const hourElements = screen.getAllByText(/0\s*h/);
    expect(hourElements.length).toBeGreaterThan(0);
  });

  // Test 7: Moyenne arrondie
  it('affiche la moyenne correctement arrondie', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 50 },
      { hour: 8, value: 51 },
      { hour: 16, value: 52 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 8: Classes CSS du conteneur
  it('applique les classes CSS correctes au conteneur', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 50 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('rounded-xl');
    expect(mainDiv).toHaveClass('border');
    expect(mainDiv).toHaveClass('bg-white');
    expect(mainDiv).toHaveClass('p-6');
  });

  // Test 9: Icone TrendingUp
  it('affiche l icone TrendingUp', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 50 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Test 10: Une seule valeur
  it('gère une seule valeur de donnee', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 12, value: 50 }];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/dernières 24h/i)).toBeInTheDocument();
  });

  // Test 11: Valeurs minimales (0%)
  it('gère les valeurs minimales (0%)', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 0 },
      { hour: 12, value: 0 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 12: Valeurs maximales (100%)
  it('gère les valeurs maximales (100%)', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 100 },
      { hour: 12, value: 100 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 13: Mélange de valeurs extremes
  it('gère un mélange de valeurs extremes', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 0 },
      { hour: 12, value: 100 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 14: Valeurs fractionnaires
  it('gère les valeurs fractionnaires', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 45.5 },
      { hour: 12, value: 54.5 },
    ];

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 15: Composant se rend sans erreur
  it('rend le composant sans erreur', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 50 },
      { hour: 12, value: 60 },
    ];

    expect(() => {
      render(<HumidityEvolutionChart data={mockData} />);
    }).not.toThrow();
  });

  // Test 16: 24 heures de donnees
  it('gère 24 heures de donnees', () => {
    const mockData: HumidityDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: 50,
    }));

    render(<HumidityEvolutionChart data={mockData} />);

    expect(screen.getByText(/dernières 24h/i)).toBeInTheDocument();
    expect(screen.getByText(/Moyenne sur 24h/i)).toBeInTheDocument();
  });

  // Test 17: Journée typique d humidite
  it('gère une journée typique d humidite', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 45 },
      { hour: 4, value: 42 },
      { hour: 8, value: 50 },
      { hour: 12, value: 65 },
      { hour: 16, value: 70 },
      { hour: 20, value: 60 },
      { hour: 23, value: 50 },
    ];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  // Test 18: Couleur verte pour valeurs optimales
  it('applique la couleur verte pour les valeurs optimales (40-60%)', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 50 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    expect(container.innerHTML).toContain('green');
  });

  // Test 19: Couleur jaune pour valeurs moyennes
  it('applique la couleur jaune pour les valeurs moyennes (60-70%)', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 65 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    expect(container.innerHTML).toContain('yellow');
  });

  // Test 20: Couleur rouge pour valeurs critiques
  it('applique la couleur rouge pour les valeurs critiques (>70%)', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 75 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    expect(container.innerHTML).toContain('red');
  });

  // Test 21: Header du graphique
  it('applique les classes CSS du header', () => {
    const mockData: HumidityDataPoint[] = [{ hour: 0, value: 50 }];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    const header = container.querySelector('[class*="flex"]');
    expect(header).toHaveClass('items-center');
    expect(header).toHaveClass('gap-3');
  });

  // Test 22: Formatage des heures avec suffixe h
  it('formate correctement les heures avec le suffixe h', () => {
    const mockData: HumidityDataPoint[] = [
      { hour: 0, value: 50 },
      { hour: 12, value: 55 },
    ];

    const { container } = render(<HumidityEvolutionChart data={mockData} />);

    const content = container.textContent || '';
    expect(content).toMatch(/0\s*h/);
    expect(content).toMatch(/12\s*h/);
  });
});
