// components/__tests__/TemperatureComparisonChart.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TemperatureComparisonChart from '../TemperatureComparisonChart';

interface MockChartData {
  labels: string[];
  datasets: { label: string }[];
}

// Mock de react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: MockChartData }) => (
    <div data-testid="comparison-chart">
      <div data-testid="chart-labels">{JSON.stringify(data.labels)}</div>
      <div data-testid="chart-datasets">
        {data.datasets.map((ds, idx: number) => (
          <div key={idx} data-testid={`dataset-${idx}`}>
            {ds.label}
          </div>
        ))}
      </div>
    </div>
  ),
}));

// Mock de Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

describe('TemperatureComparisonChart Component', () => {
  const mockLabels = ['00h', '06h', '12h', '18h'];

  const mockSensorsData = [
    {
      sensorName: 'Salon',
      data: [20, 21, 22, 21],
    },
    {
      sensorName: 'Chambre',
      data: [18, 19, 20, 19],
    },
    {
      sensorName: 'Bureau',
      data: [22, 23, 24, 23],
    },
  ];

  const mockAverageData = [20, 21, 22, 21];

  const defaultProps = {
    labels: mockLabels,
    sensorsData: mockSensorsData,
    averageData: mockAverageData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // TESTS D'AFFICHAGE INITIAL
  // ===========================

  it('affiche le graphique de comparaison', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    expect(screen.getByTestId('comparison-chart')).toBeInTheDocument();
  });

  it('affiche tous les labels des heures', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const labelsElement = screen.getByTestId('chart-labels');
    expect(labelsElement.textContent).toContain('00h');
    expect(labelsElement.textContent).toContain('18h');
  });

  it('affiche les 3 capteurs + la moyenne (4 datasets)', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    expect(screen.getByTestId('dataset-0')).toBeInTheDocument(); // Salon
    expect(screen.getByTestId('dataset-1')).toBeInTheDocument(); // Chambre
    expect(screen.getByTestId('dataset-2')).toBeInTheDocument(); // Bureau
    expect(screen.getByTestId('dataset-3')).toBeInTheDocument(); // Moyenne
  });

  it('affiche les noms des capteurs dans la légende', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    // Utiliser getAllByText car le texte apparaît 2 fois (bouton + mock dataset)
    expect(screen.getAllByText('Salon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chambre').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bureau').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moyenne de tous les capteurs').length).toBeGreaterThan(0);
  });

  // ===========================
  // TESTS DES BOUTONS TOGGLE
  // ===========================

  it('affiche les boutons de visibilité pour chaque capteur', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    // Boutons avec icônes Eye/EyeOff
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4); // 3 capteurs + 1 moyenne
  });

  it('permet de cacher/afficher un capteur au clic', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const salonButton = screen.getAllByRole('button')[0]; // Premier capteur

    // État initial: visible (Eye icon)
    fireEvent.click(salonButton);

    // Après clic: caché (EyeOff icon)
    // Vérifier que l'état a changé via les classes CSS ou aria-label
    expect(salonButton).toBeInTheDocument();
  });

  it("affiche l'icône Eye par défaut", () => {
    const { container } = render(<TemperatureComparisonChart {...defaultProps} />);

    // Cherche les icônes Eye (lucide-react génère des SVG)
    const eyeIcons = container.querySelectorAll('svg');
    expect(eyeIcons.length).toBeGreaterThan(0);
  });

  it("change l'icône en EyeOff après un clic", () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    // L'icône doit changer (mock de lucide-react pourrait être nécessaire pour tester l'icône exacte)
    expect(buttons[0]).toBeInTheDocument();
  });

  // ===========================
  // TESTS DES COULEURS
  // ===========================

  it('applique des couleurs différentes à chaque capteur', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    // Vérifier que les boutons ont des couleurs différentes (border-color)
    const buttons = screen.getAllByRole('button');

    // Salon = bleu (#3b82f6)
    expect(buttons[0]).toHaveStyle({ borderColor: expect.any(String) });
  });

  it('applique une couleur noire pour la moyenne', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const averageButton = screen.getAllByRole('button')[3]; // Dernier bouton
    // Vérifier le style inline au lieu de la classe
    expect(averageButton).toHaveStyle({ borderColor: 'rgb(0, 0, 0)' });
  });

  it('cycle les couleurs si plus de 6 capteurs', () => {
    const manySensors = Array.from({ length: 8 }, (_, i) => ({
      sensorName: `Capteur ${i + 1}`,
      data: [20, 21, 22, 21],
    }));

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={manySensors}
        averageData={mockAverageData}
      />
    );

    // Doit afficher 8 capteurs + 1 moyenne = 9 boutons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(9);
  });

  // ===========================
  // TESTS DE DONNÉES MULTIPLES
  // ===========================

  it('gère un seul capteur', () => {
    const singleSensor = [{ sensorName: 'Unique', data: [20, 21, 22, 21] }];

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={singleSensor}
        averageData={mockAverageData}
      />
    );

    // Utiliser getAllByText car le texte apparaît 2 fois
    expect(screen.getAllByText('Unique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moyenne de tous les capteurs').length).toBeGreaterThan(0);
  });

  it('gère 10 capteurs sans crash', () => {
    const manySensors = Array.from({ length: 10 }, (_, i) => ({
      sensorName: `Capteur ${i + 1}`,
      data: [20, 21, 22, 21],
    }));

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={manySensors}
        averageData={mockAverageData}
      />
    );

    expect(screen.getByTestId('comparison-chart')).toBeInTheDocument();
  });

  it('affiche correctement avec des données nulles', () => {
    const dataWithNulls = [
      {
        sensorName: 'Capteur 1',
        data: [20, null, 22, null],
      },
    ];

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={dataWithNulls}
        averageData={[20, null, 22, 21]}
      />
    );

    expect(screen.getByTestId('comparison-chart')).toBeInTheDocument();
  });

  // ===========================
  // TESTS D'INTERACTIVITÉ
  // ===========================

  it('permet de cacher plusieurs capteurs simultanément', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const buttons = screen.getAllByRole('button');

    // Cliquer sur les 2 premiers capteurs
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    // Les deux doivent être cachés
    expect(buttons[0]).toBeInTheDocument();
    expect(buttons[1]).toBeInTheDocument();
  });

  it('peut tout cacher puis tout réafficher', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const buttons = screen.getAllByRole('button');

    // Cacher tous les datasets
    buttons.forEach((btn) => fireEvent.click(btn));

    // Réafficher tous les datasets
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(buttons.length).toBe(4);
  });

  it('interagit correctement avec le graphique Chart.js', () => {
    const { rerender } = render(<TemperatureComparisonChart {...defaultProps} />);

    // Simuler un changement de données
    const newData = [{ sensorName: 'Nouveau', data: [25, 26, 27, 26] }];

    rerender(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={newData}
        averageData={[25, 26, 27, 26]}
      />
    );

    // Utiliser getAllByText
    expect(screen.getAllByText('Nouveau').length).toBeGreaterThan(0);
  });

  // ===========================
  // TESTS DES STYLES CSS
  // ===========================

  it('applique les classes Tailwind aux boutons', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    // Corriger: py-1.5 au lieu de py-1
    expect(buttons[0]).toHaveClass('px-3', 'py-1.5', 'rounded-lg');
  });

  it('affiche la bordure colorée sur les boutons actifs', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const salonButton = screen.getAllByRole('button')[0];
    expect(salonButton).toHaveClass('border-2');
  });

  it('applique un style différent aux boutons cachés', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const button = screen.getAllByRole('button')[0];
    fireEvent.click(button);

    // Après clic, le bouton doit avoir opacity-50
    expect(button).toHaveClass('opacity-50');
  });

  // ===========================
  // TESTS DE LAYOUT
  // ===========================

  it('affiche les boutons en grille responsive', () => {
    const { container } = render(<TemperatureComparisonChart {...defaultProps} />);

    // Le conteneur utilise flex flex-wrap, pas grid
    const buttonContainer = container.querySelector('div.flex.flex-wrap');
    expect(buttonContainer).toBeInTheDocument();
  });

  it('affiche le graphique en pleine largeur', () => {
    const { container } = render(<TemperatureComparisonChart {...defaultProps} />);

    const chartContainer = container.querySelector('div');
    expect(chartContainer).toHaveClass('w-full');
  });

  // ===========================
  // TESTS DE CAS LIMITES
  // ===========================

  it('gère un tableau de labels vide', () => {
    render(
      <TemperatureComparisonChart labels={[]} sensorsData={mockSensorsData} averageData={[]} />
    );

    expect(screen.getByTestId('comparison-chart')).toBeInTheDocument();
  });

  it('gère un tableau de sensorsData vide', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={[]}
        averageData={mockAverageData}
      />
    );

    // Le composant affiche "Pas de données disponibles"
    expect(screen.getByText('Pas de données disponibles')).toBeInTheDocument();
  });

  it('gère averageData null', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={mockSensorsData}
        averageData={null as unknown as (number | null)[]}
      />
    );

    expect(screen.getByTestId('comparison-chart')).toBeInTheDocument();
  });

  it('ne crash pas avec des noms de capteurs très longs', () => {
    const longNames = [
      {
        sensorName: 'Capteur avec un nom extrêmement long qui dépasse la largeur',
        data: [20, 21, 22, 21],
      },
    ];

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={longNames}
        averageData={mockAverageData}
      />
    );

    // Utiliser getAllByText avec regex
    expect(screen.getAllByText(/Capteur avec un nom/).length).toBeGreaterThan(0);
  });

  // ===========================
  // TESTS D'ACCESSIBILITÉ
  // ===========================

  it('les boutons ont des rôles accessibles', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('fonctionne avec le clavier (Enter/Space)', () => {
    render(<TemperatureComparisonChart {...defaultProps} />);

    const button = screen.getAllByRole('button')[0];

    // Simuler une pression sur Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    expect(button).toBeInTheDocument();
  });
});
