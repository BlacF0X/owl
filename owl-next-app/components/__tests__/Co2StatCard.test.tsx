import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../Co2StatCard';
import { Wind, Thermometer } from 'lucide-react';

describe('Co2StatCard Component', () => {
  
  it('affiche correctement le titre et la valeur', () => {
    render(<StatCard icon={Wind} title="Moyenne Globale" value="450 ppm" />);

    expect(screen.getByText('Moyenne Globale')).toBeInTheDocument();
    expect(screen.getByText('450 ppm')).toBeInTheDocument();
  });

 
  it('accepte une valeur numérique pour la prop "value"', () => {
    render(<StatCard icon={Wind} title="Capteurs actifs" value={12} />);

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  
  it('rend l\'icône fournie (SVG)', () => {

    const { container } = render(<StatCard icon={Thermometer} title="Température" value="22°C" />);
    
   
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    
    const iconContainer = container.querySelector('.bg-slate-50');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toContainElement(svgElement);
  });


  it('applique les classes de style correctes (hover effects)', () => {
    const { container } = render(<StatCard icon={Wind} title="Test" value="100" />);
    
    
    const card = container.firstChild;
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('hover:scale-[1.01]');
  });

  
  it('gère un titre long sans erreur', () => {
    const longTitle = "Moyenne des capteurs de la zone industrielle nord-ouet";
    render(<StatCard icon={Wind} title={longTitle} value="Ok" />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});
