import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryModal } from '../Co2HistoryModal';
import { SensorHistoryResponse } from '../Co2Types';

const mockHistoryData: SensorHistoryResponse = {
  sensor: {
    sensor_id: '1',
    name: 'Salon',
    type: { type_key: 'co2', name: 'CO2', unit: 'ppm' },
    
  },
  history: [
    { timestamp: '2025-12-03T10:00:00Z', value: 500 },
    { timestamp: '2025-12-03T09:00:00Z', value: 450 },
  ],
};

describe('Co2HistoryModal Component', () => {
  // Comme on utilise createPortal, le contenu sera rendu dans document.body.
  // @testing-library/react gère cela assez bien par défaut.
  
  it('ne rend rien si isOpen est false', () => {
    render(
      <HistoryModal
        isOpen={false}
        historyData={null}
        isLoading={false}
        error={null}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByText('Analyse détaillée')).not.toBeInTheDocument();
  });

    it('affiche le chargement', () => {
    render(
      <HistoryModal
        isOpen={true}
        historyData={null}
        isLoading={true}
        error={null}
        onClose={jest.fn()}
      />
    );
    
    expect(screen.getAllByText('Chargement...').length).toBeGreaterThan(0);
  });


  it('affiche les données statistiques et le tableau', () => {
    render(
      <HistoryModal
        isOpen={true}
        historyData={mockHistoryData}
        isLoading={false}
        error={null}
        onClose={jest.fn()}
      />
    );

    // Titre
    expect(screen.getByText('Salon')).toBeInTheDocument();
    
    // Stats calculées (Moyenne de 500 et 450 = 475)
    expect(screen.getByText('475')).toBeInTheDocument(); 
    expect(screen.getByText('Minimum')).toBeInTheDocument();

    // Tableau historique
    expect(screen.getByText('Historique brut')).toBeInTheDocument();
    expect(screen.getAllByText('500').length).toBeGreaterThan(0);
  });

  it('ferme la modale au clic sur fermer', () => {
    const onClose = jest.fn();
    render(
      <HistoryModal
        isOpen={true}
        historyData={mockHistoryData}
        isLoading={false}
        error={null}
        onClose={onClose}
      />
    );

    // Il y a deux boutons de fermeture (la croix et le bouton en bas)
    // On clique sur le bouton "Fermer" du bas
    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
