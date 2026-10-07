import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DriversList } from './DriversList';

const mockDrivers = [
  { driver_number: 1, first_name: 'Max', last_name: 'Verstappen' },
  { driver_number: 2, first_name: 'Lewis', last_name: 'Hamilton' },
];

describe('DriversList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render loading state initially', () => {
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise(() => {
        // Never resolves, keeps loading state
      }),
    );

    render(<DriversList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display drivers after successful fetch', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrivers,
    } as Response);

    render(<DriversList />);

    expect(await screen.findByText('Drivers (2)')).toBeInTheDocument();
    expect(screen.getByText('#1 Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('#2 Lewis Hamilton')).toBeInTheDocument();
  });

  it('should show error message on fetch failure', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<DriversList />);

    expect(await screen.findByText(/Error: API error: 500/)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<DriversList />);

    expect(await screen.findByText(/Error: Network error/)).toBeInTheDocument();
  });

  it('should display empty state when no drivers returned', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<DriversList />);

    expect(await screen.findByText('Drivers (0)')).toBeInTheDocument();
    expect(screen.getByText('No drivers found')).toBeInTheDocument();
  });

  it('should accept optional sessionKey prop', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrivers,
    } as Response);

    render(<DriversList sessionKey="latest" />);

    await screen.findByText('Drivers (2)');

    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining('sessionKey=latest'),
    );
  });
});
