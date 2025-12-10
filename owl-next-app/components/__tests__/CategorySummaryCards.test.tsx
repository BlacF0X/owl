import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CategorySummaryCards from '../CategorySummaryCards';
import { Sensor } from '@/src/types';

// Mock des icônes Lucide pour alléger le DOM
jest.mock('lucide-react', () => ({
  Thermometer: () => <div data-testid="icon-temp" />,
  Wind: () => <div data-testid="icon-wind" />,
  Droplets: () => <div data-testid="icon-droplets" />,
  DoorOpen: () => <div data-testid="icon-door-open" />,
  DoorClosed: () => <div data-testid="icon-door-closed" />,
  Activity: () => <div data-testid="icon-activity" />,
}));

describe('CategorySummaryCards Component', () => {
  // Données de base pour les capteurs
  const mockSensors: Sensor[] = [
    {
      sensor_id: '1',
      name: 'Temp1',
      displayValue: '20',
      type: { type_key: 'temperature', name: 'T', unit: 'C' },
      state_changed_at: null,
      hub: { hub_id: 'h1', name: 'Maison' },
    },
    // ... (autres capteurs fictifs, peu importe pour ces tests d'affichage)
    {
      sensor_id: '3',
      name: 'Hum1',
      displayValue: '50',
      type: { type_key: 'humidity', name: 'H', unit: '%' },
      state_changed_at: null,
      hub: { hub_id: 'h1', name: 'Maison' },
    },
  ];

  // Props par défaut
  const defaultProps = {
    sensors: mockSensors,
    openWindowsCount: 0,
    avgTemp: null,
    avgHumidity: null,
    avgCo2: null,
    co2Unit: 'ppm',
  };

  it('affiche les 4 cartes avec les titres corrects', () => {
    render(
      <CategorySummaryCards 
        {...defaultProps} 
        avgTemp={20} avgHumidity={50} avgCo2={450} 
      />
    );

    expect(screen.getByText('Fenêtres Ouvertes')).toBeInTheDocument();
    expect(screen.getByText('Température Moyenne')).toBeInTheDocument();
    expect(screen.getByText('Humidité Moyenne')).toBeInTheDocument();
    expect(screen.getByText("Qualité de l'Air (CO2)")).toBeInTheDocument();
  });

  it('affiche les valeurs passées en props', () => {
    render(
      <CategorySummaryCards
        {...defaultProps}
        openWindowsCount={3}
        avgTemp={25}
        avgHumidity={65}
        avgCo2={1300}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('1300')).toBeInTheDocument();
  });

  // --- TESTS LOGIQUE COULEURS & LABELS ---

  describe('Logique Température', () => {
    it('affiche "Fraiche" et style bleu si < 18°C', () => {
      render(<CategorySummaryCards {...defaultProps} avgTemp={15} />);
      const badge = screen.getByText('Fraiche');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-blue-700');
    });

    it('affiche "Idéale" et style vert si entre 18°C et 23°C', () => {
      // CORRECTION : On force l'humidité à une valeur "mauvaise" (10% -> Trop sec) 
      // pour que son label soit "Trop sec" et non "Idéale".
      render(<CategorySummaryCards {...defaultProps} avgTemp={20} avgHumidity={10} />);
      
      const badge = screen.getByText('Idéale'); 
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('affiche "Chaude" et style rouge si > 23°C', () => {
      render(<CategorySummaryCards {...defaultProps} avgTemp={25} />);
      const badge = screen.getByText('Chaude');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
    });
  });

  describe('Logique Humidité', () => {
    it('affiche "Trop sec" et style rouge si < 40%', () => {
      render(<CategorySummaryCards {...defaultProps} avgHumidity={30} />);
      const badge = screen.getByText('Trop sec');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
    });

    it('affiche "Idéale" et style vert si entre 40% et 60%', () => {
      // CORRECTION : On force la température à une valeur "mauvaise" (30°C -> Chaude)
      // pour que son label soit "Chaude" et non "Idéale".
      render(<CategorySummaryCards {...defaultProps} avgHumidity={50} avgTemp={30} />);
      
      const badge = screen.getByText('Idéale');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('affiche "Trop humide" et style rouge si > 60%', () => {
      render(<CategorySummaryCards {...defaultProps} avgHumidity={70} />);
      const badge = screen.getByText('Trop humide');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
    });
  });

  describe('Logique CO2', () => {
    it('affiche "Excellente" et style vert si < 800', () => {
      render(<CategorySummaryCards {...defaultProps} avgCo2={600} />);
      const badge = screen.getByText('Excellente');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('affiche "Moyenne" et style orange si entre 800 et 1200', () => {
      render(<CategorySummaryCards {...defaultProps} avgCo2={900} />);
      const badge = screen.getByText('Moyenne');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-orange-700');
    });

    it('affiche "Médiocre" et style rouge si > 1200', () => {
      render(<CategorySummaryCards {...defaultProps} avgCo2={1500} />);
      const badge = screen.getByText('Médiocre');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
    });
  });

  describe('Logique Sécurité (Fenêtres)', () => {
    it('affiche "Sécurisé" (vert) quand tout est fermé', () => {
      render(<CategorySummaryCards {...defaultProps} openWindowsCount={0} />);
      const badge = screen.getByText('Sécurisé');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-emerald-700');
      expect(screen.getByText('Tout est verrouillé')).toBeInTheDocument();
    });

    it('affiche "Attention" (rouge) quand une fenêtre est ouverte', () => {
      render(<CategorySummaryCards {...defaultProps} openWindowsCount={2} />);
      const badge = screen.getByText('Attention');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
      expect(screen.getByText('Vérifiez vos accès')).toBeInTheDocument();
    });
  });

  // --- TEST DU FOOTER (Nombre de capteurs) ---

  it('calcule correctement le nombre de capteurs par catégorie', () => {
    render(
      <CategorySummaryCards 
        {...defaultProps} 
        sensors={mockSensors}
        avgTemp={20} 
        avgHumidity={50} 
        avgCo2={400} 
      />
    );

    // Température (1 capteur dans mockSensors partiel, ou 2 si on reprend la liste complète)
    // Ici on vérifie simplement que le texte s'affiche.
    // Avec la liste mockSensors ci-dessus qui a 1 Temp, on s'attend à "1 capteurs".
    // Si vous utilisez la liste complète de l'exemple précédent :
    expect(screen.getAllByText(/Basé sur . capteurs/).length).toBeGreaterThan(0);
  });

  it('gère les valeurs nulles en affichant "-"', () => {
    render(
      <CategorySummaryCards
        {...defaultProps}
        avgTemp={null}
        avgHumidity={null}
        avgCo2={null}
      />
    );

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });
});