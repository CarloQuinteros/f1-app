import { useState, useEffect } from 'react';

interface Driver {
  driver_number: number;
  first_name: string;
  last_name: string;
}

interface DriversListProps {
  sessionKey?: string;
}

export function DriversList({ sessionKey }: DriversListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const url = new URL('/api/drivers', window.location.origin);
    if (sessionKey) {
      url.searchParams.append('sessionKey', sessionKey);
    }

    fetch(url.toString())
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Driver[]) => {
        setDrivers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
        setIsLoading(false);
      });
  }, [sessionKey]);

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Drivers</h2>
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Drivers</h2>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Drivers ({drivers.length})</h2>
      <ul className="space-y-2">
        {drivers.map((driver) => (
          <li key={driver.driver_number} className="text-gray-300 flex justify-between items-center">
            <span>
              #{driver.driver_number} {driver.first_name} {driver.last_name}
            </span>
          </li>
        ))}
      </ul>
      {drivers.length === 0 && <p className="text-gray-400">No drivers found</p>}
    </div>
  );
}
