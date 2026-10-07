import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const mockDrivers = [
  { driver_number: 1, first_name: 'Max', last_name: 'Verstappen' },
  { driver_number: 2, first_name: 'Lewis', last_name: 'Hamilton' },
];

vi.mock('../services/openf1Client', () => ({
  fetchDrivers: vi.fn(async () => mockDrivers),
}));

describe('GET /api/drivers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return drivers from OpenF1', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/drivers');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toEqual(mockDrivers);
  });

  it('should accept optional sessionKey query parameter', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/drivers')
      .query({ sessionKey: 'latest' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDrivers);
  });

  it('should handle API errors gracefully', async () => {
    const { fetchDrivers } = await import('../services/openf1Client');
    vi.mocked(fetchDrivers).mockRejectedValueOnce(
      new Error('OpenF1 API error: 500 Internal Server Error'),
    );

    const app = createApp();
    const response = await request(app)
      .get('/api/drivers');

    expect(response.status).toBe(502);
    expect(response.body).toHaveProperty('error');
  });
});
