const OPENF1_BASE_URL = process.env.OPENF1_BASE_URL || 'https://api.openf1.org/v1';

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
  circuit_key: number;
}

export interface OpenF1Driver {
  driver_number: number;
  first_name: string;
  last_name: string;
}

export async function fetchSessions(year?: number): Promise<OpenF1Session[]> {
  const url = new URL(`${OPENF1_BASE_URL}/sessions`);
  if (year) {
    url.searchParams.append('year', year.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchDrivers(sessionKey?: string | number): Promise<OpenF1Driver[]> {
  const url = new URL(`${OPENF1_BASE_URL}/drivers`);
  if (sessionKey) {
    url.searchParams.append('session_key', sessionKey.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
