import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomDetailsModal from '../HumidityRoomDetailsModal';

// ✅ Interface correcte
interface HumidityRoom {
  id: string;
  name: string;
  humidity: number;
  status: 'optimal' | 'warning' | 'danger';
  hubName: string;
  lastUpdate: string;
}

describe('HumidityRoomDetailsModal Component', () => {
  const mockRoom: HumidityRoom = {
    id: '1',
    name: 'Salon',
    humidity: 55,
    status: 'optimal',
    hubName: 'Maison',
    lastUpdate: '2025-12-09T15:30:00Z',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('affiche la modale avec les informations de la pièce', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Salon/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i)).toBeInTheDocument();
    // ✅ Chercher l'élément parent contenant "55" ET "%"
    const humidityContainer = screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement;
    expect(humidityContainer?.textContent).toContain('55');
    expect(humidityContainer?.textContent).toContain('%');
  });

  it('affiche le statut correct (optimal)', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Optimal/i)).toBeInTheDocument();
  });

  it('affiche le statut correct (danger)', () => {
    const dangerRoom = { ...mockRoom, humidity: 75, status: 'danger' as const };
    render(
      <HumidityRoomDetailsModal
        room={dangerRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Critique/i)).toBeInTheDocument();
    // ✅ Vérifier la valeur 75
    const statusContainer = screen.getByText(/Critique/i).closest('div')?.parentElement?.parentElement;
    expect(statusContainer?.textContent).toContain('75');
  });

  it('appelle onClose quand on clique sur le bouton Fermer', async () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /Fermer/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('affiche le hub correctement', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Maison/i)).toBeInTheDocument();
  });

  it('affiche la date de mise à jour', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/09\/12\/2025/i)).toBeInTheDocument();
  });

  it('affiche le statut "Alerte" pour warning', () => {
    const warningRoom = { ...mockRoom, humidity: 65, status: 'warning' as const };
    render(
      <HumidityRoomDetailsModal
        room={warningRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Alerte/i)).toBeInTheDocument();
  });

  it('rend correctement avec plusieurs pièces successives', () => {
    const { rerender } = render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement?.textContent).toContain('55');

    const chambreRoom = {
      id: '2',
      name: 'Chambre',
      humidity: 48,
      status: 'optimal' as const,
      hubName: 'Maison',
      lastUpdate: '2025-12-09T15:35:00Z',
    };

    rerender(
      <HumidityRoomDetailsModal
        room={chambreRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Chambre/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement?.textContent).toContain('48');
  });

  it('affiche l\'interface complète de la modale', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /Fermer/i })).toBeInTheDocument();
    expect(screen.getByText(/Salon/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i)).toBeInTheDocument();
  });

  it('appelle onClose quand on clique sur le bouton de fermeture (X)', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Le bouton X est le premier
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('gère correctement les valeurs d\'humidité extrêmes (très sec)', () => {
    const veryDryRoom = {
      ...mockRoom,
      humidity: 20,
      status: 'danger' as const,
    };
    render(
      <HumidityRoomDetailsModal
        room={veryDryRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Critique/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement?.textContent).toContain('20');
  });

  it('gère correctement les valeurs d\'humidité extrêmes (très humide)', () => {
    const veryWetRoom = {
      ...mockRoom,
      humidity: 85,
      status: 'danger' as const,
    };
    render(
      <HumidityRoomDetailsModal
        room={veryWetRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Critique/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement?.textContent).toContain('85');
  });

  it('affiche correctement les informations d\'une pièce du bureau', () => {
    const bureauRoom = {
      id: '3',
      name: 'Bureau',
      humidity: 42,
      status: 'optimal' as const,
      hubName: 'Bureau-Hub',
      lastUpdate: '2025-12-09T16:00:00Z',
    };
    render(
      <HumidityRoomDetailsModal
        room={bureauRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Bureau');
    expect(screen.getByText(/Bureau-Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité actuelle/i).closest('div')?.parentElement?.textContent).toContain('42');
  });

  it('rend le composant sans crash avec un long nom de pièce', () => {
    const longNameRoom = {
      ...mockRoom,
      name: 'Très long nom de pièce avec beaucoup de caractères',
    };
    render(
      <HumidityRoomDetailsModal
        room={longNameRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Très long nom de pièce/i)).toBeInTheDocument();
  });

  it('affiche les messages appropriés selon le statut', () => {
    const { rerender } = render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    // ✅ Optimal : "✓ Humidité idéale..."
    expect(screen.getByText(/Humidité idéale/i)).toBeInTheDocument();

    // ✅ Warning : "⚠️ L'humidité est élevée..."
    const warningRoom = { ...mockRoom, humidity: 65, status: 'warning' as const };
    rerender(
      <HumidityRoomDetailsModal
        room={warningRoom}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/L'humidité est élevée/i)).toBeInTheDocument();

    // ✅ Danger : "⚠️ Humidité hors zone..."
    const dangerRoom = { ...mockRoom, humidity: 20, status: 'danger' as const };
    rerender(
      <HumidityRoomDetailsModal
        room={dangerRoom}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/Humidité hors zone/i)).toBeInTheDocument();
  });

  it('rend le modal avec le layout correct', () => {
    const { container } = render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    // ✅ Vérifier que le modal a la classe backdrop
    const backdrop = container.querySelector('.bg-black\\/60');
    expect(backdrop).toBeInTheDocument();
  });

  it('affiche tous les éléments requis du modal', () => {
    render(
      <HumidityRoomDetailsModal
        room={mockRoom}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Salon');
    expect(screen.getByText(/Humidité actuelle/i)).toBeInTheDocument();
    expect(screen.getByText(/Statut/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidité idéale/i)).toBeInTheDocument();
    expect(screen.getByText(/Dernier relevé/i)).toBeInTheDocument();
    expect(screen.getByText(/Boîtier/i)).toBeInTheDocument();
  });
});