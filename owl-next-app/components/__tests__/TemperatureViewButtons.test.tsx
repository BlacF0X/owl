import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardViewButtons from '../TemperatureViewButtons';

describe('TemperatureViewButtons Component', () => {
  // Test 1: Affichage des 4 boutons
  it('affiche les 4 modes de vue', () => {
    render(
      <DashboardViewButtons 
        currentMode="current" 
        onChange={jest.fn()} 
      />
    );

    expect(screen.getByText('Temps Réel (24h)')).toBeInTheDocument();
    expect(screen.getByText('Moyenne (7j)')).toBeInTheDocument();
    expect(screen.getByText('Max (7j)')).toBeInTheDocument();
    expect(screen.getByText('Min (7j)')).toBeInTheDocument();
  });

  // Test 2: Bouton actif (current)
  it('applique le style actif au bouton sélectionné', () => {
    render(
      <DashboardViewButtons 
        currentMode="current" 
        onChange={jest.fn()} 
      />
    );

    const currentButton = screen.getByText('Temps Réel (24h)');
    expect(currentButton).toHaveClass('bg-white');
    expect(currentButton).toHaveClass('text-blue-600');
    expect(currentButton).toHaveClass('shadow-sm');
  });

  // Test 3: Boutons inactifs
  it('applique le style inactif aux autres boutons', () => {
    render(
      <DashboardViewButtons 
        currentMode="current" 
        onChange={jest.fn()} 
      />
    );

    const maxButton = screen.getByText('Max (7j)');
    expect(maxButton).toHaveClass('text-slate-500');
    expect(maxButton).not.toHaveClass('bg-white');
  });

  // Test 4: Changement de mode
  it('appelle onChange avec le bon mode au clic', () => {
    const handleChange = jest.fn();
    
    render(
      <DashboardViewButtons 
        currentMode="current" 
        onChange={handleChange} 
      />
    );

    fireEvent.click(screen.getByText('Max (7j)'));
    expect(handleChange).toHaveBeenCalledWith('max');

    fireEvent.click(screen.getByText('Min (7j)'));
    expect(handleChange).toHaveBeenCalledWith('min');

    fireEvent.click(screen.getByText('Moyenne (7j)'));
    expect(handleChange).toHaveBeenCalledWith('avg');
  });

  // Test 5: Tous les modes possibles
  it.each([
    ['current', 'Temps Réel (24h)'],
    ['avg', 'Moyenne (7j)'],
    ['max', 'Max (7j)'],
    ['min', 'Min (7j)'],
  ])('active correctement le mode %s', (mode, expectedText) => {
    render(
      <DashboardViewButtons 
        currentMode={mode as any} 
        onChange={jest.fn()} 
      />
    );

    const activeButton = screen.getByText(expectedText);
    expect(activeButton).toHaveClass('bg-white');
    expect(activeButton).toHaveClass('text-blue-600');
  });

  // Test 6: Accessibilité - tous les boutons cliquables
  it('rend tous les boutons cliquables', () => {
    render(
      <DashboardViewButtons 
        currentMode="current" 
        onChange={jest.fn()} 
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
    
    buttons.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  // Test 7: Ne casse pas avec un mode invalide
  it('gère un mode invalide sans crasher', () => {
    render(
      <DashboardViewButtons 
        currentMode={'invalid' as any} 
        onChange={jest.fn()} 
      />
    );

    // Tous les boutons devraient être inactifs
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toHaveClass('bg-white');
    });
  });
});
