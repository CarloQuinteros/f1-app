import { useState, useEffect } from 'react';

interface ApiResponse {
  message: string;
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<string>('Loading...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: ApiResponse) => setApiStatus(data.message))
      .catch(() => setApiStatus('Error connecting to API'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-black">
      <div className="container mx-auto px-4 py-20">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">F1 API</h1>
          <p className="text-xl text-gray-300">Real-time Formula 1 Data</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">API Status</h2>
            <p className="text-gray-300">{apiStatus}</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Information</h2>
            <ul className="space-y-2 text-gray-300">
              <li>✓ React + TypeScript</li>
              <li>✓ Tailwind CSS</li>
              <li>✓ Vite Dev Server</li>
              <li>✓ Express Backend</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
