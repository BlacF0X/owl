import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomCard from '../HumidityRoomCard';

jest.mock('@/src/hooks/useRealtimeSensor', () => ({
  useRealtimeSensor: jest.fn().mockImplementation((id, initialValue, initialDate) => ({
    value: initialValue,
    lastUpdate: initialDate, // On retourne la date passée en prop
    isLive: false,
  })),
}));

jest.mock('lucide-react', () => ({
  Droplets: () => <div data-testid="icon-droplets" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  CheckCircle: () => <div data-testid="icon-check" />,
  CircleCheckBig: () => <div data-testid="icon-check" />,
}));

describe('HumidityRoomCard Component', () => {
  const mockRoom = {
    id: '1',
    name: 'Chambre Bébé',
    humidity: 50,
    status: 'optimal' as const,
    hubName: 'Maison',
    lastUpdate: '2023-12-09T11:00:00', // Format ISO valide pour être sûr
  };

  it('affiche les infos de la pièce (Cas Optimal)', () => {
    const mockOnClick = jest.fn();
    render(<HumidityRoomCard room={mockRoom} onClick={mockOnClick} />);

    expect(screen.getByText('Chambre Bébé')).toBeInTheDocument();
    const humidityElements = screen.getAllByText(/50%/);
    expect(humidityElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Humidité optimale/i)).toBeInTheDocument();
  });

  it('affiche le statut Danger (Rouge) correctement', () => {
    const dangerRoom = {
      ...mockRoom,
      humidity: 80,
      status: 'danger' as const,
    };
    render(<HumidityRoomCard room={dangerRoom} />);

    const humidityElements = screen.getAllByText(/80%/);
    expect(humidityElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Hors zone de confort/i)).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('applique le style VERT (Optimal) pour une humidité entre 40 et 60', () => {
    render(<HumidityRoomCard room={mockRoom} />);
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getByText(/Humidité optimale/i)).toBeInTheDocument();
  });

  it('applique le style ROUGE (Danger) pour une humidité hors limites', () => {
    const dangerRoom = {
      ...mockRoom,
      humidity: 35,
      status: 'danger' as const,
    };
    render(<HumidityRoomCard room={dangerRoom} />);
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('affiche le taux actuel', () => {
    render(<HumidityRoomCard room={mockRoom} />);
    expect(screen.getByText(/Taux actuel/i)).toBeInTheDocument();
  });

  it('gère le clic sur la carte', () => {
    const mockOnClick = jest.fn();
    render(<HumidityRoomCard room={mockRoom} onClick={mockOnClick} />);

    const card = screen
      .getByText('Chambre Bébé')
      .closest('div[class*="rounded-lg"]') as HTMLElement;
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  it('affiche la dernière mise à jour', () => {
    render(<HumidityRoomCard room={mockRoom} />);
    expect(screen.getByText(/Dernier relevé/i)).toBeInTheDocument();
  });
});
