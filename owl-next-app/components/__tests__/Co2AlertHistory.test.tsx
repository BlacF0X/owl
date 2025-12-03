import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AlertHistory } from '../Co2AlertHistory';
import { AlertData } from '../Co2Types';

describe('Co2AlertHistory Component', () => {
  // ... Les tests précédents qui fonctionnaient restent inchangés ...
  it('affiche toujours le titre principal "Alertes actives"', () => {
    const { rerender } = render(<AlertHistory alerts={[{ room: 'A', message: 'B', time: 'C' }]} />);
    expect(screen.getByRole('heading', { name: /alertes actives/i })).toBeInTheDocument();
    rerender(<AlertHistory alerts={[]} />);
    expect(screen.getByRole('heading', { name: /alertes actives/i })).toBeInTheDocument();
  });

  describe("quand il n'y a aucune alerte", () => {
    beforeEach(() => {
      render(<AlertHistory alerts={[]} />);
    });

    it('affiche le message "Aucune alerte en cours."', () => {
      expect(screen.getByText('Aucune alerte en cours.')).toBeInTheDocument();
    });

    // On vérifie l'absence de texte d'alerte
    it("n'affiche aucun élément d'alerte", () => {
      expect(screen.queryByText('CO₂ critique')).not.toBeInTheDocument();
    });
  });

  describe('quand il y a des alertes', () => {
    const mockAlerts: AlertData[] = [
      { room: 'Cuisine', message: 'CO₂ critique (>1200)', time: '12:00' },
      { room: 'Chambre', message: 'Aération nécessaire', time: '12:30' },
      { room: 'Bureau', message: 'CO₂ critique (>1200)', time: '13:00' },
    ];

    beforeEach(() => {
      render(<AlertHistory alerts={mockAlerts} />);
    });

    // CORRECTION 1 : On compte les éléments uniques (les noms des pièces)
    // ou on vérifie la longueur globale via une classe CSS commune si nécessaire.
    it("affiche le bon nombre d'alertes", () => {
      // Puisque "Cuisine", "Chambre", "Bureau" sont uniques, si on les trouve tous les 3, c'est bon.
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
      expect(screen.getByText('Chambre')).toBeInTheDocument();
      expect(screen.getByText('Bureau')).toBeInTheDocument();
    });

    // CORRECTION 2 : Gestion des textes dupliqués
    it('affiche les détails corrects pour chaque alerte', () => {
      // Pour les textes uniques, on utilise getByText
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
      expect(screen.getByText('12:00')).toBeInTheDocument();

      expect(screen.getByText('Chambre')).toBeInTheDocument();
      expect(screen.getByText('Aération nécessaire')).toBeInTheDocument();

      // Pour les textes dupliqués (message critique présent 2 fois), on utilise getAllByText
      const criticalMessages = screen.getAllByText('CO₂ critique (>1200)');
      expect(criticalMessages).toHaveLength(2); // Doit apparaître 2 fois (Cuisine et Bureau)
    });

    it('n\'affiche pas le message "Aucune alerte en cours."', () => {
      expect(screen.queryByText('Aucune alerte en cours.')).not.toBeInTheDocument();
    });

    it('applique les classes de style correctes à chaque alerte', () => {
      // On sélectionne un élément spécifique pour vérifier son style
      const cuisineElement = screen.getByText('Cuisine').closest('div.flex');
      expect(cuisineElement).toHaveClass('bg-red-50');
      expect(cuisineElement).toHaveClass('border-red-100/50');
    });
  });
});
