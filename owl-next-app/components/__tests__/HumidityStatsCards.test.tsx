import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HumidityStatsCards from '../HumidityStatsCards';

// Données de test
const mockStats = {
  averageHumidity: 65,
  activeAlerts: 3,
  lastUpdate: '2025-12-04 10:30',
};

describe('HumidityStatsCards Component', () => {
  // Test 1: Affiche les trois cartes
  it('affiche les trois cartes de statistiques', () => {
    render(<HumidityStatsCards stats={mockStats} />);

    expect(screen.getByText(/Humidité moyenne/i)).toBeInTheDocument();
    expect(screen.getByText(/Alertes actives/i)).toBeInTheDocument();
    expect(screen.getByText(/Dernière mise à jour/i)).toBeInTheDocument();
  });

  // Test 2: Humidité moyenne
  it('affiche la bonne valeur d\'humidité moyenne', () => {
    render(<HumidityStatsCards stats={mockStats} />);

    expect(screen.getByText('65')).toBeInTheDocument();
  });

  // Test 3: Nombre d'alertes
  it('affiche le bon nombre d\'alertes', () => {
    render(<HumidityStatsCards stats={mockStats} />);

    // Cherche le nombre d'alertes (3)
    const alertValues = screen.getAllByText('3');
    expect(alertValues.length).toBeGreaterThan(0);
  });

  // Test 4: Date de dernière mise à jour
  it('affiche la date/heure de la dernière mise à jour', () => {
    render(<HumidityStatsCards stats={mockStats} />);

    expect(screen.getByText('2025-12-04 10:30')).toBeInTheDocument();
  });

  // Test 5: Icônes présentes
  it('affiche les icônes correctement', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    // Vérifier la présence d'icônes SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  // Test 6: Couleurs des icônes
  it('applique les couleurs correctes aux cartes', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    // Cherche les cartes avec les bonnes classes de couleur
    const tealIcon = container.querySelector('[class*="teal"]');
    const orangeIcon = container.querySelector('[class*="orange"]');
    const blueIcon = container.querySelector('[class*="blue"]');

    // Au moins une des couleurs devrait être présente
    expect(tealIcon || orangeIcon || blueIcon).toBeInTheDocument();
  });

  // Test 7: Grille responsive
  it('applique la grille responsive correctement', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toHaveClass('gap-5');
    expect(grid).toHaveClass('grid-cols-1');
  });

  // Test 8: Styles de carte
  it('applique les styles de carte', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const cards = container.querySelectorAll('[class*="rounded-xl"]');
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('p-6');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  // Test 9: Effets hover
  it('applique les effets hover', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const cards = container.querySelectorAll('[class*="hover:shadow"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  // Test 10: Humidité moyenne à 0%
  it('gère une humidité moyenne très basse (0%)', () => {
    const lowStats = {
      averageHumidity: 0,
      activeAlerts: 0,
      lastUpdate: '2025-12-04 10:30',
    };

    render(<HumidityStatsCards stats={lowStats} />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  // Test 11: Humidité moyenne à 100%
  it('gère une humidité moyenne très élevée (100%)', () => {
    const highStats = {
      averageHumidity: 100,
      activeAlerts: 10,
      lastUpdate: '2025-12-04 10:30',
    };

    render(<HumidityStatsCards stats={highStats} />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  // Test 12: Zéro alerte
  it('gère zéro alerte', () => {
    const noAlerts = {
      averageHumidity: 50,
      activeAlerts: 0,
      lastUpdate: '2025-12-04 10:30',
    };

    render(<HumidityStatsCards stats={noAlerts} />);

    const alertValues = screen.getAllByText('0');
    expect(alertValues.length).toBeGreaterThan(0);
  });

  // Test 13: Beaucoup d'alertes
  it('gère beaucoup d\'alertes', () => {
    const manyAlerts = {
      averageHumidity: 50,
      activeAlerts: 99,
      lastUpdate: '2025-12-04 10:30',
    };

    render(<HumidityStatsCards stats={manyAlerts} />);

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  // Test 14: Date ISO
  it('gère une date ISO standard', () => {
    const isoStats = {
      averageHumidity: 50,
      activeAlerts: 2,
      lastUpdate: '2025-12-04T10:30:00Z',
    };

    render(<HumidityStatsCards stats={isoStats} />);

    expect(screen.getByText('2025-12-04T10:30:00Z')).toBeInTheDocument();
  });

  // Test 15: Format de date personnalisé
  it('gère un format de date personnalisé', () => {
    const customStats = {
      averageHumidity: 50,
      activeAlerts: 2,
      lastUpdate: '04/12/2025 - 10h30',
    };

    render(<HumidityStatsCards stats={customStats} />);

    expect(screen.getByText('04/12/2025 - 10h30')).toBeInTheDocument();
  });

  // Test 16: Labels lisibles
  it('affiche les labels de manière lisible', () => {
    render(<HumidityStatsCards stats={mockStats} />);

    const labels = [
      /Humidité moyenne/i,
      /Alertes actives/i,
      /Dernière mise à jour/i,
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  // Test 17: Contrastes suffisants
  it('applique des contrastes suffisants', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const titles = container.querySelectorAll('[class*="text-3xl"], [class*="text-2xl"]');
    titles.forEach((title) => {
      expect(
        title.classList.contains('text-slate-900') ||
          title.classList.contains('font-semibold')
      ).toBe(true);
    });
  });

  // Test 18: Trois cartes rendues
  it('rend exactement trois cartes', () => {
    const { container } = render(<HumidityStatsCards stats={mockStats} />);

    const cards = container.querySelectorAll('[class*="rounded-xl"][class*="border"]');
    expect(cards.length).toBe(3);
  });
});