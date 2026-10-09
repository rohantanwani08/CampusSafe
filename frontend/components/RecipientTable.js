import { useState } from 'react';
import StatusChip from './StatusChip';

export default function RecipientTable({ recipients }) {
  const [search, setSearch] = useState('');

  if (!recipients || recipients.length === 0) return (
    <div className="bg-surface border border-line rounded-lg p-6 h-full flex items-center justify-center text-muted">
      No recipients to display.
    </div>
  );

  const EscalationDots = ({ step, status }) => {
    const totalSteps = 5;
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(totalSteps)].map((_, i) => {
          const isActive = i < step;
          const isCurrent = i === step - 1 && status === 'PENDING';
          return (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${isActive ? 'bg-drill' : 'bg-surface-2'} ${isCurrent ? 'animate-pulse' : ''}`}
              title={`Step ${i+1}`}
            />
          );
        })}
      </div>
    );
  };

  const filtered = recipients.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface border border-line rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-line flex justify-between items-center">
        <h2 className="text-sm font-semibold text-text">Target roster</h2>
        <input 
          type="text"
          placeholder="Search name or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bg border border-line rounded-md px-3 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-drill"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface z-10 border-b border-line">
            <tr className="text-muted text-xs">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Escalation</th>
              <th className="p-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-text">
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line/50 hover:bg-surface-2 transition-colors duration-200">
                <td className="p-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted">{r.building}</div>
                </td>
                <td className="p-3">
                  <StatusChip status={r.status} />
                </td>
                <td className="p-3">
                  <span className="text-xs text-muted block mb-0.5">
                    {r.status === 'PENDING' ? `Step ${r.step}` : 'Resolved'}
                  </span>
                  <EscalationDots step={r.step} status={r.status} />
                </td>
                <td className="p-3 text-right text-muted tabular-nums">
                  {r.responded_at ? new Date(r.responded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '-'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-muted">No matches found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
