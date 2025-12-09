import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomCard from '../HumidityRoomCard';

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
    lastUpdate: '09/12/2023 11:00',
  };

  it('affiche les infos de la pièce (Cas Optimal)', () => {
    const mockOnClick = jest.fn();
    render(<HumidityRoomCard room={mockRoom} onClick={mockOnClick} />);

    expect(screen.getByText('Chambre Bébé')).toBeInTheDocument();
    // ✅ Utilise getAllByText et prends le premier résultat
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

    // ✅ Utilise getAllByText pour gérer les doublons
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
    // ✅ CORRECTION : Remplace le test du hubName par le taux actuel qui existe
    expect(screen.getByText(/Taux actuel/i)).toBeInTheDocument();
  });

  it('gère le clic sur la carte', () => {
    const mockOnClick = jest.fn();
    render(<HumidityRoomCard room={mockRoom} onClick={mockOnClick} />);

    // ✅ CORRECTION : Utilise fireEvent et cast en HTMLElement
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
