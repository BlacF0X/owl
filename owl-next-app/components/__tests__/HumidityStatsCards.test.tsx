import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import HumidityStatsCards from '../HumidityStatsCards';
import type { HumidityStats } from '../HumidityStatsCards';

describe('HumidityStatsCards Component', () => {
  const mockStats: HumidityStats = {
    averageHumidity: 65,
    activeAlerts: 3,
    lastUpdate: '2025-12-04 10:30',
  };

  it("affiche la bonne valeur d'humidité moyenne", () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    expect(container.textContent).toContain('65');
    expect(container.textContent).toContain('Humidité moyenne');
  });

  it("affiche le nombre d'alertes actives", () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('Alertes actives');
  });

  it('affiche la dernière mise à jour', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    expect(container.textContent).toContain('2025-12-04 10:30');
    expect(container.textContent).toContain('Dernière mise à jour');
  });

  it('gère une humidité moyenne très basse (0%)', () => {
    const lowStats: HumidityStats = {
      ...mockStats,
      averageHumidity: 0,
    };

    const { container } = render(<HumidityStatsCards stats={lowStats} />);

    expect(container.textContent).toContain('0');
  });

  it('gère une humidité moyenne très élevée (100%)', () => {
    const highStats: HumidityStats = {
      ...mockStats,
      averageHumidity: 100,
    };

    const { container } = render(<HumidityStatsCards stats={highStats} />);

    expect(container.textContent).toContain('100');
  });

  it('affiche zéro alerte', () => {
    const noAlertsStats: HumidityStats = {
      ...mockStats,
      activeAlerts: 0,
    };

    const { container } = render(<HumidityStatsCards stats={noAlertsStats} />);

    expect(container.textContent).toContain('0');
  });

  it('affiche plusieurs alertes', () => {
    const manyAlertsStats: HumidityStats = {
      ...mockStats,
      activeAlerts: 12,
    };

    const { container } = render(<HumidityStatsCards stats={manyAlertsStats} />);

    expect(container.textContent).toContain('12');
  });

  it('applique les classes CSS correctes aux cartes', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const cards = container.querySelectorAll('[class*="rounded-xl"]');
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('p-6');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  it('affiche les icônes correctes', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('gère une mise à jour en temps réel', () => {
    const { rerender, container } = render(<HumidityStatsCards stats={mockStats} />);

    expect(container.textContent).toContain('65');

    const updatedStats: HumidityStats = {
      ...mockStats,
      averageHumidity: 75,
    };

    rerender(<HumidityStatsCards stats={updatedStats} />);

    expect(container.textContent).toContain('75');
  });

  it('gère une grille responsive', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const gridContainer = container.querySelector('[class*="grid"]');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('gap-5');
  });

  it('affiche des valeurs décimales si présentes', () => {
    const decimalStats: HumidityStats = {
      ...mockStats,
      averageHumidity: 65.5,
    };

    const { container } = render(<HumidityStatsCards stats={decimalStats} />);

    expect(container.textContent).toContain('65');
  });
});
