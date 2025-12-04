import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HumidityRoomCard from '../HumidityRoomCard';
import { HumidityRoom } from '../HumidityRoomCard';

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
  it('affiche correctement une piece avec humidite optimale', () => {
    const room = createMockRoom({ humidity: 55, status: 'optimal' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(container.textContent).toContain('55');
    expect(screen.getByText(/optimal/i)).toBeInTheDocument();
  });

  it('affiche une piece avec humidite en warning', () => {
    const room = createMockRoom({ humidity: 65, status: 'warning' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('65');
    expect(screen.getByText(/Surveillance/i)).toBeInTheDocument();
    const statusText = screen.getByText(/Surveillance/i);
    expect(statusText).toHaveClass('text-amber-600');
  });

  it('affiche une piece avec humidite critique (Alerte)', () => {
    const room = createMockRoom({ humidity: 75, status: 'danger' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('75');
    expect(screen.getByText(/Action/i)).toBeInTheDocument();
    const statusText = screen.getByText(/Action/i);
    expect(statusText).toHaveClass('text-red-600');
  });

  it('applique la bordure verte pour le statut optimal', () => {
    const room = createMockRoom({ status: 'optimal' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-green-500');
  });

  it('applique la bordure amber pour le statut warning', () => {
    const room = createMockRoom({ status: 'warning' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-amber-500');
  });

  it('applique la bordure rouge pour le statut danger', () => {
    const room = createMockRoom({ status: 'danger' });
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('border-red-500');
  });

  it('appelle onClick quand on clique sur la carte', () => {
    const onClick = jest.fn();
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} onClick={onClick} />);

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('affiche le dernier releve formate', () => {
    const room = createMockRoom({ lastUpdate: '2025-12-04T10:30:00Z' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('Dernier');
  });

  it('affiche l icone Droplets', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('gere les valeurs a la limite basse (40%)', () => {
    const room = createMockRoom({ humidity: 40, status: 'optimal' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('40');
    expect(screen.getByText(/optimal/i)).toBeInTheDocument();
  });

  it('gere les valeurs a la limite haute (70%)', () => {
    const room = createMockRoom({ humidity: 70, status: 'danger' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('70');
    expect(screen.getByText(/Action/i)).toBeInTheDocument();
  });

  it('gere l humidite tres basse (10%)', () => {
    const room = createMockRoom({ humidity: 10, status: 'optimal' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('10');
  });

  it('gere l humidite tres elevee (95%)', () => {
    const room = createMockRoom({ humidity: 95, status: 'danger' });
    const { container } = render(<HumidityRoomCard room={room} />);

    expect(container.textContent).toContain('95');
  });

  it('gere les noms de piece longs', () => {
    const room = createMockRoom({ name: 'Salle de bain principale avec douche' });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('Salle de bain principale avec douche')).toBeInTheDocument();
  });

  it('gere les valeurs sans lastUpdate', () => {
    const room = createMockRoom({ lastUpdate: undefined });
    render(<HumidityRoomCard room={room} />);

    expect(screen.getByText('Salon')).toBeInTheDocument();
  });

  it('applique les classes CSS correctes a la carte', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('p-6');
    expect(card).toHaveClass('shadow-sm');
  });

  it('applique cursor-pointer quand onClick est fourni', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} onClick={jest.fn()} />);

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('n applique pas cursor-pointer sans onClick', () => {
    const room = createMockRoom();
    const { container } = render(<HumidityRoomCard room={room} />);

    const card = container.firstChild;
    expect(card).not.toHaveClass('cursor-pointer');
  });
});
