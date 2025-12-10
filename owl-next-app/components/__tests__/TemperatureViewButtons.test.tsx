import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardViewButtons, { ViewMode } from '../TemperatureViewButtons';

describe('TemperatureViewButtons Component', () => {
  // Test 1: Affichage des 5 boutons avec les bons libellés
  it('affiche les 5 modes de vue', () => {
    render(<DashboardViewButtons currentMode="current" onChange={jest.fn()} />);

    expect(screen.getByText('Temps Réel')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();
    expect(screen.getByText('Maximale')).toBeInTheDocument();
    expect(screen.getByText('Minimale')).toBeInTheDocument();
    expect(screen.getByText('Comparaison')).toBeInTheDocument();
  });

  // Test 2: Bouton actif (Style Bleu)
  it('applique le style actif au bouton sélectionné', () => {
    render(<DashboardViewButtons currentMode="current" onChange={jest.fn()} />);

    const currentButton = screen.getByText('Temps Réel').closest('button');
    // Le style actif est bg-blue-600 et text-white
    expect(currentButton).toHaveClass('bg-blue-600');
    expect(currentButton).toHaveClass('text-white');
    expect(currentButton).toHaveClass('shadow-md');
  });

  // Test 3: Boutons inactifs (Style Blanc)
  it('applique le style inactif aux autres boutons', () => {
    render(<DashboardViewButtons currentMode="current" onChange={jest.fn()} />);

    const maxButton = screen.getByText('Maximale').closest('button');
    // Le style inactif est bg-white et text-slate-700
    expect(maxButton).toHaveClass('bg-white');
    expect(maxButton).toHaveClass('text-slate-700');
    expect(maxButton).not.toHaveClass('bg-blue-600');
  });

  // Test 4: Changement de mode
  it('appelle onChange avec le bon mode au clic', () => {
    const handleChange = jest.fn();

    render(<DashboardViewButtons currentMode="current" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Maximale'));
    expect(handleChange).toHaveBeenCalledWith('max');

    fireEvent.click(screen.getByText('Minimale'));
    expect(handleChange).toHaveBeenCalledWith('min');

    fireEvent.click(screen.getByText('Moyenne'));
    expect(handleChange).toHaveBeenCalledWith('avg');

    fireEvent.click(screen.getByText('Comparaison'));
    expect(handleChange).toHaveBeenCalledWith('comparison');
  });

  // Test 5: Tous les modes possibles (Vérification du style actif)
  it.each([
    ['current', 'Temps Réel'],
    ['avg', 'Moyenne'],
    ['max', 'Maximale'],
    ['min', 'Minimale'],
  ])('active correctement le mode %s', (mode, expectedText) => {
    render(<DashboardViewButtons currentMode={mode as ViewMode} onChange={jest.fn()} />);

    const activeButton = screen.getByText(expectedText).closest('button');
    expect(activeButton).toHaveClass('bg-blue-600');
    expect(activeButton).toHaveClass('text-white');
  });

  // Test 6: Accessibilité - tous les boutons cliquables
  it('rend tous les boutons cliquables (5 boutons par défaut)', () => {
    render(<DashboardViewButtons currentMode="current" onChange={jest.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(5); // 4 modes + Comparaison

    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  // Test 7: Ne casse pas avec un mode invalide
  it('gère un mode invalide sans crasher', () => {
    render(
      <DashboardViewButtons
        // @ts-ignore pour tester le runtime
        currentMode={'invalid'}
        onChange={jest.fn()}
      />
    );

    // Tous les boutons devraient être inactifs (donc blancs, pas bleus)
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toHaveClass('bg-blue-600');
      expect(button).toHaveClass('bg-white');
    });
  });

  // Test 8: Masquer le bouton comparaison
  it('peut masquer le bouton comparaison', () => {
    render(
      <DashboardViewButtons currentMode="current" onChange={jest.fn()} showComparison={false} />
    );

    expect(screen.queryByText('Comparaison')).not.toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
  });
});
