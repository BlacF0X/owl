import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomCard from '../HumidityRoomCard';
import { HumidityRoom } from '../HumidityRoomCard';

// Fonction utilitaire pour créer un capteur mock rapidement
const createMockRoom = (overrides?: Partial<HumidityRoom>): HumidityRoom => ({
  id: '1',
  name: 'Salon',
  humidity: 55,
  status: 'optimal',
  lastUpdate: new Date().toISOString(),
  hubName: 'Maison',
  ...overrides,
});

describe('HumidityRoomCard Component', () => {
  // Test 1: État Optimal (40-60%) - Cas de base
  it('affiche correctement une pièce avec humidité optimale', () => {
    const room = createMockRoom({ humidity: 55, status: 'optimal' });
    render(<HumidityRoomCard room={room} />);

    // Vérifie le nom et la valeur
    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();

    // Vérifie que le message "Humidité optimale" est présent (spécifique à l'état optimal)
    expect(screen.getByText(/Humidité optimale/i)).toBeInTheDocument();
  });

  // Test 2: État Warning (60-70%) - Surveillance
  it('affiche une pièce avec humidité en warning', () => {
    const room = createMockRoom({ humidity: 65, status: 'warning' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('65')).toBeInTheDocument();

    // Vérifie la présence du message de surveillance
    expect(screen.getByText(/Surveillance recommandée/i)).toBeInTheDocument();

    // Vérifie la présence visuelle de la couleur text-amber-600 (jaune/orange)
    const statusText = screen.getByText(/Surveillance recommandée/i);
    expect(statusText).toHaveClass('text-amber-600');
  });

  // Test 3: État Danger (>70%) - ALERTE
  it('affiche une pièce avec humidité critique (Alerte)', () => {
    const room = createMockRoom({ humidity: 75, status: 'danger' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('75')).toBeInTheDocument();

    // Vérifie la présence du message d'action
    expect(screen.getByText(/Action nécessaire/i)).toBeInTheDocument();

    // Vérifie que la couleur est passée au ROUGE (alerte)
    const statusText = screen.getByText(/Action nécessaire/i);
    expect(statusText).toHaveClass('text-red-600');
  });

  // Test 4: Bordure verte pour optimal
  it('applique la bordure verte pour le statut optimal', () => {
    const room = createMockRoom({ status: 'optimal' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-green-500');
  });

  // Test 5: Bordure amber pour warning
  it('applique la bordure amber pour le statut warning', () => {
    const room = createMockRoom({ status: 'warning' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-amber-500');
  });

  // Test 6: Bordure rouge pour danger
  it('applique la bordure rouge pour le statut danger', () => {
    const room = createMockRoom({ status: 'danger' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-red-500');
  });

  // Test 7: Callback onClick
  it('appelle onClick quand on clique sur la carte', () => {
    const onClick = jest.fn();
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} onClick={onClick} />);

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Test 8: Affichage du dernier relevé
  it('affiche le dernier relevé formaté', () => {
    const room = createMockRoom({ lastUpdate: '2025-12-04T10:30:00Z' });
    render(<HumidityRoomCard room={room} />);

    // Vérifie la présence du texte "Dernier relevé"
    expect(screen.getByText(/Dernier relevé/i)).toBeInTheDocument();
  });

  // Test 9: Affiche l'icône Droplets
  it('affiche l\'icône Droplets', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    // Droplets est une icône SVG de lucide-react
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Test 10: Valeurs limites - 40%
  it('gère les valeurs à la limite basse (40%)', () => {
    const room = createMockRoom({ humidity: 40, status: 'optimal' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText(/Humidité optimale/i)).toBeInTheDocument();
  });

  // Test 11: Valeurs limites - 70%
  it('gère les valeurs à la limite haute (70%)', () => {
    const room = createMockRoom({ humidity: 70, status: 'danger' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText(/Action nécessaire/i)).toBeInTheDocument();
  });

  // Test 12: Humidité très basse
  it('gère l\'humidité très basse (10%)', () => {
    const room = createMockRoom({ humidity: 10, status: 'optimal' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // Test 13: Humidité très élevée
  it('gère l\'humidité très élevée (95%)', () => {
    const room = createMockRoom({ humidity: 95, status: 'danger' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('95')).toBeInTheDocument();
  });

  // Test 14: Nom de pièce long
  it('gère les noms de pièce longs', () => {
    const room = createMockRoom({ name: 'Salle de bain principale avec douche' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('Salle de bain principale avec douche')).toBeInTheDocument();
  });

  // Test 15: Sans lastUpdate
  it('gère les valeurs sans lastUpdate', () => {
    const room = createMockRoom({ lastUpdate: undefined });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  // Test 16: Classes CSS de base
  it('applique les classes CSS correctes à la carte', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('p-6');
    expect(card).toHaveClass('shadow-sm');
  });

  // Test 17: Cursor pointer quand cliquable
  it('applique cursor-pointer quand onClick est fourni', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} onClick={jest.fn()} />);

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  // Test 18: Pas de cursor pointer sans onClick
  it('n\'applique pas cursor-pointer sans onClick', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).not.toHaveClass('cursor-pointer');
  });
});