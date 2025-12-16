import 'jest-canvas-mock';
import '@testing-library/jest-dom';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('mock-token'),
    userId: 'mock-user-id',
  }),
  auth: () => ({
    userId: 'mock-user-id',
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line">Chart Mock</div>,
}));

// Mock fetch global
global.fetch = jest.fn();
