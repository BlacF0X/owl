import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomDetailsModal from '../HumidityRoomDetailsModal';
import { HumidityRoom } from '../HumidityRoomCard';

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

  it('affiche le titre et le nom de la piece', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  it('affiche la valeur d humidite actuelle', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('55');
    expect(container.textContent).toContain('actuelle');
  });

  it('affiche le statut Optimal pour le statut optimal', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Optimal')).toBeInTheDocument();
  });

  it('affiche le statut Alerte pour le statut warning', () => {
    const warningRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 65,
      status: 'warning',
    };

    render(<HumidityRoomDetailsModal room={warningRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Alerte')).toBeInTheDocument();
  });

  it('affiche le statut Critique pour le statut danger', () => {
    const dangerRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 80,
      status: 'danger',
    };

    render(<HumidityRoomDetailsModal room={dangerRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Critique')).toBeInTheDocument();
  });

  it('affiche le message de confort pour statut optimal', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('confort');
    expect(container.textContent).toContain('santé');
  });

  it('affiche le message d aeration pour statut warning', () => {
    const warningRoom: HumidityRoom = {
      ...mockRoom,
      status: 'warning',
    };

    const { container } = render(
      <HumidityRoomDetailsModal room={warningRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('aérez');
  });

  it('affiche le message d alerte pour statut danger', () => {
    const dangerRoom: HumidityRoom = {
      ...mockRoom,
      status: 'danger',
    };

    const { container } = render(
      <HumidityRoomDetailsModal room={dangerRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('moisissures');
  });

  it('affiche le boitier (hubName)', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('Boîtier');
    expect(screen.getByText('Maison')).toBeInTheDocument();
  });

  it('affiche le dernier releve', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('Dernier');
  });

  it('appelle onClose quand on clique sur Fermer', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose quand on clique sur la croix', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find((btn) => btn.classList.contains('rounded-full'));

    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('n affiche pas le boitier si hubName est absent', () => {
    const noHubRoom: HumidityRoom = {
      ...mockRoom,
      hubName: undefined,
    };

    const { container } = render(
      <HumidityRoomDetailsModal room={noHubRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).not.toContain('Boîtier');
  });

  it('gere les humidites tres basses', () => {
    const lowRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 10,
    };

    const { container } = render(<HumidityRoomDetailsModal room={lowRoom} onClose={mockOnClose} />);

    expect(container.textContent).toContain('10');
  });

  it('gere les humidites tres elevees', () => {
    const highRoom: HumidityRoom = {
      ...mockRoom,
      humidity: 95,
    };

    const { container } = render(
      <HumidityRoomDetailsModal room={highRoom} onClose={mockOnClose} />
    );

    expect(container.textContent).toContain('95');
  });

  it('gere les noms de piece tres longs', () => {
    const longNameRoom: HumidityRoom = {
      ...mockRoom,
      name: 'Salle d eau du sous-sol avec sauna integre',
    };

    render(<HumidityRoomDetailsModal room={longNameRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Salle d eau du sous-sol avec sauna integre')).toBeInTheDocument();
  });

  it('applique les classes CSS du modal correctement', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const modal = container.querySelector('[class*="fixed"]');
    expect(modal).toHaveClass('inset-0');
    expect(modal).toHaveClass('z-50');
  });

  it('applique les classes CSS de la grille 2 colonnes', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toHaveClass('grid-cols-2');
  });

  it('affiche un arriere-plan semi-transparent', () => {
    const { container } = render(
      <HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />
    );

    const backdrop = container.querySelector('[class*="bg-black"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('affiche le label Statut', () => {
    render(<HumidityRoomDetailsModal room={mockRoom} onClose={mockOnClose} />);

    expect(screen.getByText('Statut')).toBeInTheDocument();
  });
});
