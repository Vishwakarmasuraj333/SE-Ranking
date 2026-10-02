'use client';

import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Upload, MoreVertical, Building2, Store } from 'lucide-react';

interface AllLocationsViewProps {
  onAddLocation: () => void;
}

export function AllLocationsView({ onAddLocation }: AllLocationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const locations = [
    {
      id: 'loc-1',
      name: 'Folk Osteria',
      address: 'Highland Dr., Holladay NY, 84117 USA',
      serviceArea: '—',
      phone: '1 801-845-9817',
      score: 85,
      scoreColor: 'bg-emerald-500',
      listingsFound: 37,
      listingsTotal: 60,
      errors: 3,
      isDemo: true,
    },
    {
      id: 'loc-2',
      name: 'Sol de Nieve',
      address: "Carrer de San Martí, 83, L'Eixample, Valencia, 46004 Spain",
      serviceArea: '—',
      phone: '963 31 14 07',
      score: 90,
      scoreColor: 'bg-emerald-500',
      listingsFound: 39,
      listingsTotal: 60,
      errors: 4,
      isDemo: true,
    },
  ];

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations.map((l) => l.id));
    }
  };

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0B69FF] bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddLocation}
            className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ADD LOCATION</span>
          </button>
          <button
            onClick={() => alert('Updating locations status...')}
            className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-[#1E293B] rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>UPDATE</span>
          </button>
          <button
            onClick={() => alert('Exporting locations CSV...')}
            className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-[#1E293B] rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLocations.length === locations.length && locations.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#0B69FF] focus:ring-0"
                  />
                </th>
                <th className="px-4 py-3.5">COMPANY ({locations.length})</th>
                <th className="px-4 py-3.5">ADDRESS</th>
                <th className="px-4 py-3.5">SERVICE AREA</th>
                <th className="px-4 py-3.5">PHONE</th>
                <th className="px-4 py-3.5">SCORE</th>
                <th className="px-4 py-3.5">REVIEWS / LISTINGS</th>
                <th className="px-4 py-3.5 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocations.includes(loc.id);
                return (
                  <tr key={loc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(loc.id)}
                        className="rounded border-gray-300 text-[#0B69FF] focus:ring-0"
                      />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#EBF3FC] flex items-center justify-center text-[#0B69FF]">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-gray-900">{loc.name}</span>
                        {loc.isDemo && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{loc.address}</td>
                    <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{loc.serviceArea}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-700 whitespace-nowrap">{loc.phone}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${loc.scoreColor}`} style={{ width: `${loc.score}%` }} />
                        </div>
                        <span className="font-bold text-gray-900">{loc.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {loc.listingsFound}/{loc.listingsTotal}
                        </span>
                        {loc.errors > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            {loc.errors}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add your locations banner matching Page 3 */}
      <div className="bg-white border-2 border-dashed border-[#CCE0F8] rounded-xl p-8 text-center space-y-3 shadow-xs">
        <h3 className="font-bold text-base text-gray-900">Add your locations</h3>
        <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
          Connect your Google Business Profiles to the system to track the success of local rankings, manage listings and reviews, get GBP stats, and make GBP posts.
        </p>
        <button
          onClick={onAddLocation}
          className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ ADD LOCATION</span>
        </button>
      </div>
    </div>
  );
}
