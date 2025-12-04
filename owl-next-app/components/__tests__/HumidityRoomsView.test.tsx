import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomsView from '../HumidityRoomsView';
import { HumidityRoom } from '../HumidityRoomCard';

// 1. Mock de HumidityRoomCard avec un type correct
jest.mock('../HumidityRoomCard', () => {
  // On type les props proprement
  return function DummyCard({ room, onClick }: { room: HumidityRoom; onClick?: () => void }) {
    return (
      <div data-testid="humidity-card" onClick={onClick}>
        {room.name}
      </div>
    );
  };
});

// 2. Mock de la modale avec un type correct
jest.mock('../HumidityRoomDetailsModal', () => {
  // On définit l'interface minimale pour les props dont on a besoin
  return function DummyModal({ room, onClose }: { room: HumidityRoom; onClose: () => void }) {
    return (
      <div data-testid="details-modal">
        <h2>Détails de {room.name}</h2>
        <button onClick={onClose}>Fermer</button>
      </div>
    );
  };
});

// Données de test
const mockSensorsByHub: Record<string, HumidityRoom[]> = {
  Maison: [
    {
      id: '1',
      name: 'Salon',
      humidity: 55,
      status: 'optimal',
      lastUpdate: new Date().toISOString(),
      hubName: 'Maison',
    },
    {
      id: '2',
      name: 'Chambre',
      humidity: 65,
      status: 'warning',
      lastUpdate: new Date().toISOString(),
      hubName: 'Maison',
    },
  ],
  Garage: [
    {
      id: '3',
      name: 'Atelier',
      humidity: 75,
      status: 'danger',
      lastUpdate: new Date().toISOString(),
      hubName: 'Garage',
    },
  ],
};

describe('HumidityRoomsView Component', () => {
  // Test 1: Affichage des sections par Hub
  it('affiche les sections par Hub', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    // Vérifie que les titres de section sont là
    expect(screen.getByText('Maison')).toBeInTheDocument();
    expect(screen.getByText('Garage')).toBeInTheDocument();
  });

  // Test 2: Affichage de toutes les cartes
  it('affiche toutes les cartes de capteurs', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    // Grâce à notre mock, on cherche le texte
    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
    expect(screen.getByText('Atelier')).toBeInTheDocument();
  });

  // Test 3: Ouverture de la modale
  it('ouvre la modale au clic sur un capteur', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    // La modale ne doit pas être là au début
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();

    // On clique sur le capteur "Salon"
    fireEvent.click(screen.getByText('Salon'));

    // La modale doit apparaître
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('Détails de Salon')).toBeInTheDocument();
  });

  // Test 4: Fermeture de la modale
  it('ferme la modale au clic sur le bouton fermer', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    // Ouvrir
    fireEvent.click(screen.getByText('Salon'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();

    // Fermer
    fireEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });

  // Test 5: Plusieurs clics successifs sur différents capteurs
  it('peut sélectionner plusieurs capteurs successivement', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    // Clic sur premier capteur
    fireEvent.click(screen.getByText('Salon'));
    expect(screen.getByText('Détails de Salon')).toBeInTheDocument();

    // Fermer
    fireEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();

    // Clic sur deuxième capteur
    fireEvent.click(screen.getByText('Chambre'));
    expect(screen.getByText('Détails de Chambre')).toBeInTheDocument();
  });

  // Test 6: Objet vide
  it('gère un objet vide sans erreur', () => {
    render(<HumidityRoomsView roomsByHub={{}} />);

    expect(screen.queryByText('Maison')).not.toBeInTheDocument();
    expect(screen.queryByTestId('humidity-card')).not.toBeInTheDocument();
  });

  // Test 7: Hub avec aucun capteur
  it('gère un hub avec aucun capteur', () => {
    const emptyHub: Record<string, HumidityRoom[]> = {
      Vide: [],
    };

    render(<HumidityRoomsView roomsByHub={emptyHub} />);

    expect(screen.getByText('Vide')).toBeInTheDocument();
    expect(screen.queryByTestId('humidity-card')).not.toBeInTheDocument();
  });

  // Test 8: Un seul hub avec un seul capteur
  it('gère un hub avec un seul capteur', () => {
    const singleHub: Record<string, HumidityRoom[]> = {
      Bureau: [
        {
          id: '1',
          name: 'Bureau 1',
          humidity: 50,
          status: 'optimal',
          lastUpdate: new Date().toISOString(),
          hubName: 'Bureau',
        },
      ],
    };

    render(<HumidityRoomsView roomsByHub={singleHub} />);

    expect(screen.getByText('Bureau')).toBeInTheDocument();
    expect(screen.getByText('Bureau 1')).toBeInTheDocument();
  });

  // Test 9: Plusieurs hubs
  it('affiche plusieurs hubs correctement', () => {
    const multiHub: Record<string, HumidityRoom[]> = {
      Hub1: [
        {
          id: '1',
          name: 'Salle 1',
          humidity: 50,
          status: 'optimal',
          lastUpdate: new Date().toISOString(),
          hubName: 'Hub1',
        },
      ],
      Hub2: [
        {
          id: '2',
          name: 'Salle 2',
          humidity: 60,
          status: 'warning',
          lastUpdate: new Date().toISOString(),
          hubName: 'Hub2',
        },
      ],
      Hub3: [
        {
          id: '3',
          name: 'Salle 3',
          humidity: 75,
          status: 'danger',
          lastUpdate: new Date().toISOString(),
          hubName: 'Hub3',
        },
      ],
    };

    render(<HumidityRoomsView roomsByHub={multiHub} />);

    expect(screen.getByText('Hub1')).toBeInTheDocument();
    expect(screen.getByText('Hub2')).toBeInTheDocument();
    expect(screen.getByText('Hub3')).toBeInTheDocument();
  });

  // Test 10: Classes CSS de la grille
  it('applique les classes de grille responsive', () => {
    const { container } = render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toHaveClass('gap-6');
  });

  // Test 11: Sections présentes
  it('affiche les sections avec un espacement correct', () => {
    const { container } = render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(2); // Maison et Garage
  });

  // Test 12: Nombre total de cartes
  it('affiche le bon nombre de cartes', () => {
    render(<HumidityRoomsView roomsByHub={mockSensorsByHub} />);

    const cards = screen.getAllByTestId('humidity-card');
    expect(cards.length).toBe(3); // 2 dans Maison + 1 dans Garage
  });
});