import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SensorCard } from '../Co2SensorCard';
import { RoomData } from '../Co2Types';

jest.mock('@/src/hooks/useRealtimeSensor', () => ({
  useRealtimeSensor: jest.fn().mockImplementation((id, initialValue) => ({
    value: initialValue,
    lastUpdate: null,
    isLive: false,
  })),
}));

const mockRoom: RoomData = {
  id: '1',
  name: 'Salon',
  value: 450,
  status: 'good',
  location: 'Maison',
};

describe('Co2SensorCard Component', () => {
  it('affiche les données correctes pour un statut "good"', () => {
    render(
      <SensorCard
        room={mockRoom}
        isSelected={false}
        onSelect={jest.fn()}
        onHistory={jest.fn()}
        loadingHistory={false}
      />
    );

    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();

    // Vérification indirecte de la couleur verte (Emerald)
    const statusLabel = screen.getByText('Excellent');
    expect(statusLabel).toHaveClass('text-emerald-700');
  });

  it('affiche les données correctes pour un statut "bad"', () => {
    const badRoom: RoomData = { ...mockRoom, value: 1500, status: 'bad' };
    render(
      <SensorCard
        room={badRoom}
        isSelected={false}
        onSelect={jest.fn()}
        onHistory={jest.fn()}
        loadingHistory={false}
      />
    );

    expect(screen.getByText('Critique')).toBeInTheDocument();
    const statusLabel = screen.getByText('Critique');
    expect(statusLabel).toHaveClass('text-rose-700');
  });

  it('gère le clic sur la carte (sélection)', () => {
    const onSelect = jest.fn();
    render(
      <SensorCard
        room={mockRoom}
        isSelected={false}
        onSelect={onSelect}
        onHistory={jest.fn()}
        loadingHistory={false}
      />
    );

    fireEvent.click(screen.getByText('Salon'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('gère le clic sur le bouton historique', () => {
    const onHistory = jest.fn();
    render(
      <SensorCard
        room={mockRoom}
        isSelected={false}
        onSelect={jest.fn()}
        onHistory={onHistory}
        loadingHistory={false}
      />
    );

    const button = screen.getByRole('button', { name: /voir l'analyse détaillée/i });
    fireEvent.click(button);

    // Le stopPropagation est géré dans le composant, on vérifie juste l'appel
    expect(onHistory).toHaveBeenCalledTimes(1);
  });

  it('affiche un loader sur le bouton si loadingHistory est true', () => {
    render(
      <SensorCard
        room={mockRoom}
        isSelected={false}
        onSelect={jest.fn()}
        onHistory={jest.fn()}
        loadingHistory={true}
      />
    );

    // Le texte reste, mais on vérifie que le bouton est disabled
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // On pourrait chercher la classe 'animate-spin' si nécessaire
  });
});
