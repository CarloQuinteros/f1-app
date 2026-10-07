const OPENF1_BASE_URL = process.env.OPENF1_BASE_URL || 'https://api.openf1.org/v1';

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
  circuit_key: number;
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
