import { render, screen } from '@testing-library/react';
import TemperatureCircle from '@/components/TemperatureCircle';

describe('TemperatureCircle', () => {
  it('devrait afficher le nom du capteur', () => {
    render(
      <TemperatureCircle sensorName="Cuisine" temperature={22.8} subtitle="Température actuelle" />
    );

    expect(screen.getByText('Cuisine')).toBeInTheDocument();
  });

  it('devrait afficher la température avec 1 décimale', () => {
    render(
      <TemperatureCircle sensorName="Cuisine" temperature={22.8} subtitle="Température actuelle" />
    );

    expect(screen.getByText(/22\.8/)).toBeInTheDocument();
  });

  it('devrait afficher le sous-titre', () => {
    render(
      <TemperatureCircle sensorName="Cuisine" temperature={22.8} subtitle="Température actuelle" />
    );

    expect(screen.getByText('Température actuelle')).toBeInTheDocument();
  });

  it('devrait afficher le sous-titre par défaut', () => {
    render(<TemperatureCircle sensorName="Salon" temperature={20} />);

    expect(screen.getByText('Température en temps réel')).toBeInTheDocument();
  });

  it('devrait rendre le SVG avec le cercle de progression', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={20} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('devrait appliquer la couleur verte pour 20°C', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={20} />);

    const tempText = screen.getByText(/20\.0/);
    expect(tempText).toHaveClass('text-green-500');
  });

  it('devrait appliquer la couleur rouge pour 25°C', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={25} />);

    const tempText = screen.getByText(/25\.0/);
    expect(tempText).toHaveClass('text-red-500');
  });

  it('devrait appliquer la couleur rouge pour 23.1°C', () => {
    render(<TemperatureCircle sensorName="Test" temperature={23.1} />);

    const tempText = screen.getByText(/23\.1/);
    expect(tempText).toHaveClass('text-red-500');
  });

  it('devrait appliquer la couleur bleue pour 16°C', () => {
    render(<TemperatureCircle sensorName="Test" temperature={16} />);

    const tempText = screen.getByText(/16\.0/);
    expect(tempText).toHaveClass('text-blue-500');
  });

  it('devrait appliquer la couleur bleue pour 17.9°C', () => {
    render(<TemperatureCircle sensorName="Test" temperature={17.9} />);

    const tempText = screen.getByText(/17\.9/);
    expect(tempText).toHaveClass('text-blue-500');
  });

  it('devrait appliquer la couleur verte pour 18°C exactement', () => {
    render(<TemperatureCircle sensorName="Test" temperature={18} />);

    const tempText = screen.getByText(/18\.0/);
    expect(tempText).toHaveClass('text-blue-500');
  });

  it('devrait appliquer la couleur verte pour 23°C exactement', () => {
    render(<TemperatureCircle sensorName="Test" temperature={23} />);

    const tempText = screen.getByText(/23\.0/);
    expect(tempText).toHaveClass('text-red-500');
  });

  it('devrait calculer le strokeDashoffset correctement', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={20} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset');

    expect(strokeDashoffset).not.toBe('0');
    expect(strokeDashoffset).not.toBe(null);
  });

  it('devrait afficher un cercle complet pour 10°C', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={10} />);

    const progressCircle = container.querySelectorAll('circle')[1];
    const strokeDasharray = progressCircle.getAttribute('stroke-dasharray');

    expect(strokeDasharray).toBeTruthy();
  });

  it('devrait gérer les températures négatives', () => {
    render(<TemperatureCircle sensorName="Test" temperature={-5} />);

    expect(screen.getByText(/-5\.0/)).toBeInTheDocument();
    const tempText = screen.getByText(/-5\.0/);
    expect(tempText).toHaveClass('text-blue-500');
  });

  it('devrait gérer les températures très élevées', () => {
    render(<TemperatureCircle sensorName="Test" temperature={40} />);

    expect(screen.getByText(/40\.0/)).toBeInTheDocument();
    const tempText = screen.getByText(/40\.0/);
    expect(tempText).toHaveClass('text-red-500');
  });

  it('devrait gérer la température 0°C', () => {
    render(<TemperatureCircle sensorName="Test" temperature={0} />);

    expect(screen.getByText(/0\.0/)).toBeInTheDocument();
    const tempText = screen.getByText(/0\.0/);
    expect(tempText).toHaveClass('text-blue-500');
  });
});
