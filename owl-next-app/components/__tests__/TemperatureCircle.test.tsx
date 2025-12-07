import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TemperatureCircle from '../TemperatureCircle';

describe('TemperatureCircle Component', () => {
  // Test 1: Affichage de base
  it('affiche correctement le nom du capteur et la température', () => {
    render(<TemperatureCircle sensorName="Salon" temperature={22.5} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
    // Utilise une regex pour matcher "22.5" suivi de "°"
    expect(screen.getByText(/22\.5/)).toBeInTheDocument();
    expect(screen.getByText('Température en temps réel')).toBeInTheDocument();
  });

  // Test 2: Température froide (< 19°C) - Couleur bleue
  it('applique la couleur bleue pour une température froide', () => {
    const { container } = render(<TemperatureCircle sensorName="Cave" temperature={16} />);

    // Vérifie que 16.0 est présent
    expect(screen.getByText(/16\.0/)).toBeInTheDocument();

    // Vérification de la classe CSS de couleur
    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan).toHaveClass('text-blue-500');

    // Vérification du cercle SVG (stroke-blue-500)
    const circle = container.querySelector('circle.stroke-blue-500');
    expect(circle).toBeInTheDocument();
  });

  // Test 3: Température normale (19-25°C) - Couleur verte
  it('applique la couleur verte pour une température normale', () => {
    const { container } = render(<TemperatureCircle sensorName="Chambre" temperature={21} />);

    expect(screen.getByText(/21\.0/)).toBeInTheDocument();

    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan).toHaveClass('text-green-500');

    const circle = container.querySelector('circle.stroke-green-500');
    expect(circle).toBeInTheDocument();
  });

  // Test 4: Température chaude (> 25°C) - Couleur rouge
  it('applique la couleur rouge pour une température chaude', () => {
    const { container } = render(<TemperatureCircle sensorName="Grenier" temperature={28} />);

    expect(screen.getByText(/28\.0/)).toBeInTheDocument();

    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan).toHaveClass('text-red-500');

    const circle = container.querySelector('circle.stroke-red-500');
    expect(circle).toBeInTheDocument();
  });

  // Test 5: Cas limites (températures extrêmes)
  it('gère les températures négatives', () => {
    const { container } = render(<TemperatureCircle sensorName="Congélateur" temperature={-5} />);

    expect(screen.getByText(/-5\.0/)).toBeInTheDocument();

    // Vérifie la couleur bleue
    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan).toHaveClass('text-blue-500');
  });

  it('gère les températures très élevées', () => {
    const { container } = render(<TemperatureCircle sensorName="Four" temperature={45} />);

    expect(screen.getByText(/45\.0/)).toBeInTheDocument();

    // Vérifie la couleur rouge
    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan).toHaveClass('text-red-500');
  });

  // Test 6: Props optionnelles
  it('accepte un sous-titre personnalisé', () => {
    render(
      <TemperatureCircle sensorName="Bureau" temperature={23} subtitle="Température maximale" />
    );

    expect(screen.getByText('Température maximale')).toBeInTheDocument();
  });

  it('accepte des valeurs min et max personnalisées', () => {
    // Juste pour vérifier qu'elles ne font pas crasher
    render(<TemperatureCircle sensorName="Test" temperature={20} min={10} max={40} />);

    expect(screen.getByText(/20\.0/)).toBeInTheDocument();
  });

  // Test 7: Arrondi de la température
  it('arrondit la température à 1 décimale', () => {
    const { container } = render(<TemperatureCircle sensorName="Capteur" temperature={22.567} />);

    // Vérifie que 22.6 est affiché (arrondi)
    expect(screen.getByText(/22\.6/)).toBeInTheDocument();

    // Alternative : vérifier le textContent du span
    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan?.textContent).toContain('22.6');
  });

  // Test 8: SVG présent
  it('rend le cercle SVG', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={20} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Deux cercles : fond + progression
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  // Test 9 bonus: Vérifier le symbole degré
  it('affiche le symbole degré', () => {
    const { container } = render(<TemperatureCircle sensorName="Test" temperature={20} />);

    const tempSpan = container.querySelector('span.text-3xl');
    expect(tempSpan?.textContent).toContain('°');
  });
});
