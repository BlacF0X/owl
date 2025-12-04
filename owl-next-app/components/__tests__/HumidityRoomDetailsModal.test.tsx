import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HumidityRoomDetailsModal from '../HumidityRoomDetailsModal';
import { HumidityRoom } from '../HumidityRoomCard';

// Mock du capteur de base
const mockRoom: HumidityRoom = {
  id: '1',
  name: 'Salon',
  humidity: 55,
  status: 'optimal',
  lastUpdate: new Date().toISOString(),
  hubName: 'Maison',
};

describe('HumidityRoomDetailsModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Affichage du titre
  it('affiche le titre et le nom de la pièce', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  // Test 2: Affichage de l'humidité actuelle
  it('affiche la valeur d\'humidité actuelle', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i)).toBeInTheDocument();
  });

  // Test 3: Statut Optimal
  it('affiche le statut "Optimal" pour le statut optimal', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Optimal')).toBeInTheDocument();
  });

  // Test 4: Statut Alerte (warning)
  it('affiche le statut "Alerte" pour le statut warning', () => {
    const warningRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 65,
      status: 'warning',
    };

    render(<HumidityRoomDetailsModal room={warningRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Alerte')).toBeInTheDocument();
  });

  // Test 5: Statut Critique (danger)
  it('affiche le statut "Critique" pour le statut danger', () => {
    const dangerRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 80,
      status: 'danger',
    };

    render(<HumidityRoomDetailsModal room={dangerRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Critique')).toBeInTheDocument();
  });

  // Test 6: Message de confort pour optimal
  it('affiche le message de confort pour statut optimal', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText(/Humidité idéale pour le confort et la santé/i)).toBeInTheDocument();
  });

  // Test 7: Message d'aération pour warning
  it('affiche le message d\'aération pour statut warning', () => {
    const warningRoom: HumidityRoom = {
      ...mockRoom,
      status: 'warning',
    };

    render(<HumidityRoomDetailsModal room={warningRoom} onClose={mockOnClose} />);

    expect(screen.getByText(/L'humidité est élevée, aérez la pièce/i)).toBeInTheDocument();
  });

  // Test 8: Message d'alerte pour danger
  it('affiche le message d\'alerte pour statut danger', () => {
    const dangerRoom: HumidityRoom = {
      ...mockRoom,
      status: 'danger',
    };

    render(<HumidityRoomDetailsModal room={dangerRoom} onClose={mockOnClose} />);

    expect(screen.getByText(/Humidité trop élevée, risque de moisissures/i)).toBeInTheDocument();
  });

  // Test 9: Affichage du boîtier (hubName)
  it('affiche le boîtier (hubName)', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Boîtier')).toBeInTheDocument();
    expect(screen.getByText('Maison')).toBeInTheDocument();
  });

  // Test 10: Dernier relevé
  it('affiche le dernier relevé', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText(/Dernier relevé/i)).toBeInTheDocument();
  });

  // Test 11: Fermeture au clic sur le bouton Fermer
  it('appelle onClose quand on clique sur Fermer', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test 12: Fermeture au clic sur la croix (X)
  it('appelle onClose quand on clique sur la croix', async () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    // Cherche tous les boutons et trouve celui avec la croix
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find((btn) => btn.classList.contains('rounded-full'));

    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  // Test 13: Sans hubName
  it('n\'affiche pas le boîtier si hubName est absent', () => {
    const noHubRoom: HumidityRoom = {
      ...mockRoom,
      hubName: undefined,
    };

    render(<HumidityRoomDetailsModal room={noHubRoom} onClose={mockOnClose} />);

    // Le label "Boîtier" ne doit pas être affiché
    expect(screen.queryByText('Boîtier')).not.toBeInTheDocument();
  });

  // Test 14: Humidité très basse
  it('gère les humidités très basses', () => {
    const lowRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 10,
    };

    render(<HumidityRoomDetailsModal room={lowRoom} onClose={mockOnClose} />);

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // Test 15: Humidité très élevée
  it('gère les humidités très élevées', () => {
    const highRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 95,
    };

    render(<HumidityRoomDetailsModal room={highRoom} onClose={mockOnClose} />);

    expect(screen.getByText('95')).toBeInTheDocument();
  });

  // Test 16: Nom de pièce long
  it('gère les noms de pièce très longs', () => {
    const longNameRoom: HumidityRoom = {
      ...mockRoom,
      name: 'Salle d\'eau du sous-sol avec sauna intégré',
    };

    render(<HumidityRoomDetailsModal room={longNameRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Salle d\'eau du sous-sol avec sauna intégré')).toBeInTheDocument();
  });

  // Test 17: Classes CSS du modal
  it('applique les classes CSS du modal correctement', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const modal = container.querySelector('[class*="fixed"]');
    expect(modal).toHaveClass('inset-0');
    expect(modal).toHaveClass('z-50');
  });

  // Test 18: Grille 2 colonnes
  it('applique les classes CSS de la grille 2 colonnes', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toHaveClass('grid-cols-2');
  });

  // Test 19: Background semi-transparent
  it('affiche un arrière-plan semi-transparent', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const backdrop = container.querySelector('[class*="bg-black"]');
    expect(backdrop).toBeInTheDocument();
  });

  // Test 20: Label "Statut" présent
  it('affiche le label "Statut"', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Statut')).toBeInTheDocument();
  });
});