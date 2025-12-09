import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WindowSensorCard from '../WindowSensorCard';
import { Sensor } from '@/src/types';

jest.mock('@/src/hooks/useRealtimeSensor', () => ({
  useRealtimeSensor: jest.fn().mockImplementation((id, initialValue, initialDate) => ({
    value: initialValue, // Le test passera "Ouvert" ou "Fermé" ici
    lastUpdate: initialDate,
    isLive: false,
  })),
}));

// Fonction utilitaire pour créer un capteur mocké rapidement
const createMockSensor = (overrides?: Partial<Sensor>): Sensor => ({
  sensor_id: '1',
  name: 'Fenêtre Test',
  displayValue: 'Fermé',
  state_changed_at: new Date().toISOString(),
  hub: { hub_id: 'h1', name: 'Hub Principal' },
  type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  ...overrides,
});

describe('WindowSensorCard Component', () => {
  // Test 1 : État Fermé (Cas de base)
  it('affiche correctement une fenêtre fermée', () => {
    const sensor = createMockSensor({ displayValue: 'Fermé' });

    render(<WindowSensorCard sensor={sensor} />);

    // Vérifie le nom et l'état
    expect(screen.getByText('Fenêtre Test')).toBeInTheDocument();
    expect(screen.getByText('Fermé')).toBeInTheDocument();

    // Vérifie que le message "Confort préservé" est présent (spécifique à l'état fermé)
    expect(screen.getByText(/Confort préservé/i)).toBeInTheDocument();

    // Vérifie qu'on N'affiche PAS "depuis"
    expect(screen.queryByText(/depuis/i)).not.toBeInTheDocument();
  });

  // Test 2 : État Ouvert Récent (< 1h)
  it('affiche une fenêtre ouverte récemment (Info)', () => {
    // On simule une ouverture il y a 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const sensor = createMockSensor({
      displayValue: 'Ouvert',
      state_changed_at: thirtyMinutesAgo,
    });

    render(<WindowSensorCard sensor={sensor} />);

    expect(screen.getByText('Ouvert')).toBeInTheDocument();
    // Vérifie que la durée est affichée (le calcul exact dépend de l'implémentation de calculateDuration, on cherche juste le texte)
    expect(screen.getByText(/30min/i)).toBeInTheDocument();

    // Vérifie la présence visuelle de la couleur "text-amber-600" (jaune/orange)
    // Note: Tester les classes CSS est fragile, mais utile pour vérifier la logique conditionnelle
    const statusText = screen.getByText('Ouvert');
    expect(statusText).toHaveClass('text-amber-600');
  });

  // Test 3 : État Ouvert Longtemps (> 1h) -> ALERTE
  it('affiche une fenêtre ouverte depuis longtemps (Alerte)', () => {
    // On simule une ouverture il y a 2 heures
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString();
    const sensor = createMockSensor({
      displayValue: 'Ouvert',
      state_changed_at: twoHoursAgo,
    });

    render(<WindowSensorCard sensor={sensor} />);

    expect(screen.getByText(/2h/i)).toBeInTheDocument();

    // Vérifie que la couleur est passée au ROUGE (alerte)
    const statusText = screen.getByText('Ouvert');
    expect(statusText).toHaveClass('text-red-600');
  });
});
