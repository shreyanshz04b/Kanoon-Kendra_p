import { Search, MapPin, Briefcase } from 'lucide-react';
import { useMemo, useState } from 'react';

const data = [
  { name: 'A. Mehta', city: 'Mumbai', specialty: 'Corporate Law' },
  { name: 'R. Iyer', city: 'Chennai', specialty: 'Family Law' },
  { name: 'K. Sharma', city: 'Delhi', specialty: 'Criminal Law' },
  { name: 'P. Das', city: 'Kolkata', specialty: 'Property Law' },
];

export default function Advocates() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((a) => [a.name, a.city, a.specialty].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Advocate Search</h2>
        <p className="text-gray-600 mt-2 font-medium">Find legal professionals by city and expertise.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or specialty"
            className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <div key={`${a.name}-${a.city}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">{a.name}</h3>
            <div className="mt-2 text-sm text-gray-600 inline-flex items-center gap-1.5"><MapPin size={14} /> {a.city}</div>
            <div className="mt-2 text-sm text-gray-700 inline-flex items-center gap-1.5"><Briefcase size={14} /> {a.specialty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
