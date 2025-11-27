import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WindowSensorsView from '../WindowSensorsView';
import { Sensor } from '@/src/types';

// 1. Mock de WindowSensorCard avec un type correct
jest.mock('../WindowSensorCard', () => {
  // On type les props proprement
  return function DummyCard({ sensor }: { sensor: Sensor }) {
    return <div data-testid="sensor-card">{sensor.name}</div>;
  };
});

// 2. Mock de la modale avec un type correct
jest.mock('../WindowSensorDetailsModal', () => {
  // On définit l'interface minimale pour les props dont on a besoin
  return function DummyModal({ sensor, onClose }: { sensor: Sensor; onClose: () => void }) {
    return (
      <div data-testid="details-modal">
        <h2>Détails de {sensor.name}</h2>
        <button onClick={onClose}>Fermer</button>
      </div>
    );
  };
});

const mockSensorsByHub: Record<string, Sensor[]> = {
  Maison: [
    {
      sensor_id: '1',
      name: 'Salon',
      displayValue: 'Ouvert',
      state_changed_at: null,
      hub: { hub_id: 'h1', name: 'Maison' },
      type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
    },
  ],
  Garage: [
    {
      sensor_id: '2',
      name: 'Porte',
      displayValue: 'Fermé',
      state_changed_at: null,
      hub: { hub_id: 'h2', name: 'Garage' },
      type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
    },
  ],
};

describe('WindowSensorsView Component', () => {
  it('affiche les sections par Hub', () => {
    render(<WindowSensorsView sensorsByHub={mockSensorsByHub} />);

    // Vérifie que les titres de section sont là
    expect(screen.getByText('Maison')).toBeInTheDocument();
    expect(screen.getByText('Garage')).toBeInTheDocument();
  });

  it('affiche toutes les cartes de capteurs', () => {
    render(<WindowSensorsView sensorsByHub={mockSensorsByHub} />);

    // Grâce à notre mock, on cherche le texte
    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('Porte')).toBeInTheDocument();
  });

  it('ouvre la modale au clic sur un capteur', () => {
    render(<WindowSensorsView sensorsByHub={mockSensorsByHub} />);

    // La modale ne doit pas être là au début
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();

    // On clique sur le capteur "Salon"
    fireEvent.click(screen.getByText('Salon'));

    // La modale doit apparaître
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('Détails de Salon')).toBeInTheDocument();
  });

  it('ferme la modale au clic sur le bouton fermer', () => {
    render(<WindowSensorsView sensorsByHub={mockSensorsByHub} />);

    // Ouvrir
    fireEvent.click(screen.getByText('Salon'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();

    // Fermer
    fireEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });
});
