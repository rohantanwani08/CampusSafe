import { useState, useEffect, useRef } from 'react';
import StatusChip from './StatusChip';

export default function RecipientTable({ recipients }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  // Track previous statuses to highlight changed rows
  const [flashingRows, setFlashingRows] = useState({});
  const prevRecipients = useRef({});

  useEffect(() => {
    if (!recipients) return;
    
    setFlashingRows(prevFlashes => {
      let hasChanges = false;
      const newFlashes = { ...prevFlashes };
      
      recipients.forEach(r => {
        const prevStatus = prevRecipients.current[r.id];
        if (prevStatus && prevStatus !== r.status) {
          newFlashes[r.id] = r.status;
          hasChanges = true;
        }
        prevRecipients.current[r.id] = r.status;
      });
      
      if (hasChanges) {
        setTimeout(() => {
          setFlashingRows(current => {
            const next = { ...current };
            Object.keys(newFlashes).forEach(id => delete next[id]);
            return next;
          });
        }, 600);
        return newFlashes;
      }
      return prevFlashes;
    });
  }, [recipients]);

  if (!recipients || recipients.length === 0) return (
    <div className="h-full flex items-center justify-center text-muted">
      No people to display.
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

  const filtered = recipients.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const getRowBg = (id) => {
    const flashStatus = flashingRows[id];
    if (!flashStatus) return 'bg-transparent hover:bg-surface-2';
    if (flashStatus === 'NEED_ASSISTANCE') return 'bg-help/20';
    if (flashStatus === 'SAFE') return 'bg-safe/20';
    if (flashStatus === 'UNREACHABLE') return 'bg-unreachable/20';
    return 'bg-waiting/20';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-line flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="bg-surface-2 border border-line rounded-md px-3 py-1.5 text-sm text-text focus:outline-none focus:border-drill"
          >
            <option value="ALL">All Statuses</option>
            <option value="SAFE">Safe</option>
            <option value="NEED_ASSISTANCE">Needs Help</option>
            <option value="PENDING">Waiting</option>
            <option value="UNREACHABLE">Can&apos;t Reach</option>
          </select>
        </div>
        <input 
          type="text"
          placeholder="Search name or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface-2 border border-line rounded-md px-3 py-1.5 text-sm text-text focus:outline-none focus:border-drill w-full sm:w-auto"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface z-10 border-b border-line">
            <tr className="text-muted text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Escalation</th>
              <th className="p-4 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-text divide-y divide-line/50">
            {filtered.map((r) => (
              <tr 
                key={r.id} 
                className={`transition-colors duration-600 ${getRowBg(r.id)}`}
              >
                <td className="p-4">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted">{r.building}</div>
                </td>
                <td className="p-4">
                  <StatusChip status={r.status} />
                </td>
                <td className="p-4">
                  <span className="text-xs text-muted block mb-1 font-medium">
                    {r.status === 'PENDING' ? `Step ${r.step || 1}` : 'Resolved'}
                  </span>
                  <EscalationDots step={r.step || (r.status === 'PENDING' ? 1 : 5)} status={r.status} />
                </td>
                <td className="p-4 text-right text-muted tabular-nums">
                  {r.responded_at || r.last_contacted_at ? new Date(r.responded_at || r.last_contacted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '-'}
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
