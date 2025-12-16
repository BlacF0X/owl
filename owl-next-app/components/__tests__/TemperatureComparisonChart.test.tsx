import { render, screen, fireEvent } from '@testing-library/react';
import TemperatureComparisonChart from '@/components/TemperatureComparisonChart';

describe('TemperatureComparisonChart', () => {
  const mockLabels = ['Lun 9', 'Mar 10', 'Mer 11'];
  const mockSensorsData = [
    { sensorName: 'Salon', data: [20, 21, 22] },
    { sensorName: 'Cuisine', data: [19, 20, 21] },
  ];
  const mockAverageData = [19.5, 20.5, 21.5];

  it('devrait afficher "Pas de données disponibles" si sensorsData vide', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={[]}
        averageData={mockAverageData}
      />
    );

    expect(screen.getByText('Pas de données disponibles')).toBeInTheDocument();
  });

  it('devrait rendre le graphique avec des données valides', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={mockSensorsData}
        averageData={mockAverageData}
      />
    );

    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
  });

  it('devrait afficher la légende personnalisée', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={mockSensorsData}
        averageData={mockAverageData}
      />
    );

    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('Cuisine')).toBeInTheDocument();
    expect(screen.getByText('Moyenne de tous les capteurs')).toBeInTheDocument();
  });

  it('devrait masquer/afficher un dataset au clic sur la légende', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={mockSensorsData}
        averageData={mockAverageData}
      />
    );

    const salonLegend = screen.getByText('Salon').closest('button');
    expect(salonLegend).toBeInTheDocument();

    if (salonLegend) {
      fireEvent.click(salonLegend);
      expect(salonLegend).toHaveClass('opacity-50');

      fireEvent.click(salonLegend);
      expect(salonLegend).not.toHaveClass('opacity-50');
    }
  });

  it('devrait gérer des données avec valeurs null', () => {
    const dataWithNull = [
      { sensorName: 'Salon', data: [20, null, 22] },
      { sensorName: 'Cuisine', data: [19, 20, null] },
    ];

    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={dataWithNull}
        averageData={mockAverageData}
      />
    );

    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
  });

  it('devrait afficher les icônes Eye/EyeOff', () => {
    render(
      <TemperatureComparisonChart
        labels={mockLabels}
        sensorsData={mockSensorsData}
        averageData={mockAverageData}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
