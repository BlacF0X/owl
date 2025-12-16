import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import WindowLazyChart from '../WindowLazyChart';

// On mock le composant dynamique importé pour vérifier qu'il est bien appelé
jest.mock('../WindowHourlyActivityChart', () => {
  return function MockChart() {
    return <div data-testid="real-chart">Chart Loaded</div>;
  };
});

describe('WindowLazyChart Component', () => {
  it('rend le composant chart après chargement', async () => {
    render(<WindowLazyChart data={[]} />);

    // next/dynamic est asynchrone
    await waitFor(() => {
      expect(screen.getByTestId('real-chart')).toBeInTheDocument();
    });
  });
});
