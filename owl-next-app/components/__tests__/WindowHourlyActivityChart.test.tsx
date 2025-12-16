import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WindowHourlyActivityChart from '../WindowHourlyActivityChart';
import React from 'react';

// 1. Mock de ResizeObserver (Requis par Recharts)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 2. Mock de Recharts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  // On require React à l'intérieur du mock pour avoir accès à isValidElement/cloneElement
  const React = require('react');

  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    // BarChart affiche les enfants (dont le Tooltip)
    BarChart: ({ data, children }: any) => (
      <div data-testid="barchart">
        <div data-testid="chart-data">{JSON.stringify(data)}</div>
        {children}
      </div>
    ),
    // CORRECTION : Le Tooltip injecte les props factices dans le composant `content`
    Tooltip: ({ content }: any) => {
      const mockProps = {
        active: true,
        payload: [{ value: 15 }],
        label: '10h',
      };

      // Si content est <CustomTooltip />, on le clone en lui ajoutant les props mockées
      if (React.isValidElement(content)) {
        return React.cloneElement(content as React.ReactElement, mockProps);
      }
      // Si content est une render function
      if (typeof content === 'function') {
        return content(mockProps);
      }
      return null;
    },
    XAxis: () => null,
    YAxis: () => null,
    Bar: () => null,
    Cell: () => null,
  };
});

const mockData = [
  { hour: 0, count: 2 },
  { hour: 9, count: 10 },
  { hour: 14, count: 5 },
];

describe('WindowHourlyActivityChart Component', () => {
  it('formate correctement les heures (ex: 9 -> 09h)', () => {
    render(<WindowHourlyActivityChart data={mockData} />);

    const dataDiv = screen.getByTestId('chart-data');
    const parsedData = JSON.parse(dataDiv.textContent || '[]');

    expect(parsedData).toEqual(
      expect.arrayContaining([
        { name: '00h', count: 2, originalHour: 0 },
        { name: '09h', count: 10, originalHour: 9 },
        { name: '14h', count: 5, originalHour: 14 },
      ])
    );
  });

  it('rend le CustomTooltip correctement', () => {
    render(<WindowHourlyActivityChart data={mockData} />);

    // Le mock force l'affichage du tooltip avec les données factices (10h, 15)
    expect(screen.getByText('10h')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/ouvertures/i)).toBeInTheDocument();
  });
});
