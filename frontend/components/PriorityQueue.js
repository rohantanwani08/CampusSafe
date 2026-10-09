import { useEffect, useState } from 'react';

function TimeAgo({ date }) {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (!date) return;
    const updateTime = () => {
      const ms = Date.now() - new Date(date).getTime();
      const min = Math.floor(ms / 60000);
      if (min < 1) setText('just now');
      else if (min === 1) setText('1 min ago');
      else setText(`${min} min ago`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [date]);
  
  if (!date) return null;
  return <span>contacted {text}</span>;
}

export default function PriorityQueue({ queue, onPersonClick }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-sm font-semibold text-text mb-2 px-4 py-2 bg-surface">Needs attention</h2>
        <div className="flex-1 flex items-center justify-center text-muted text-sm px-4">
          No one needs attention right now.
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'NEED_ASSISTANCE') return 'bg-help';
    if (status === 'UNREACHABLE') return 'bg-unreachable';
    return 'bg-drill';
  };

  const getUrgencyText = (urgency) => {
    if (!urgency) return null;
    let color = 'text-text';
    if (urgency === 'HIGH') color = 'text-help';
    if (urgency === 'MEDIUM') color = 'text-waiting';
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 ${color}`}>{urgency.charAt(0) + urgency.slice(1).toLowerCase()}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold text-text mb-0 px-4 py-3 bg-surface border-b border-line sticky top-0 z-10">Needs attention</h2>
      <div className="overflow-y-auto flex-1 divide-y divide-line">
        {queue.map((person) => (
          <div 
            key={person.id} 
            onClick={() => onPersonClick?.(person)}
            className="group cursor-pointer relative py-3 px-4 hover:bg-surface-2 transition-colors"
          >
            <div className={`absolute top-0 left-0 w-[3px] h-full ${getStatusColor(person.status)}`}></div>
            
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-medium text-text text-sm group-hover:text-help transition-colors">{person.name}</h3>
                <p className="text-xs text-muted">
                  {person.building} {person.location ? `• ${person.location}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-1">
                {getUrgencyText(person.urgency)}
                <div className="text-[10px] text-muted whitespace-nowrap">
                  {person.responded_at || person.last_contacted_at ? <TimeAgo date={person.responded_at || person.last_contacted_at} /> : 'never contacted'}
                </div>
              </div>
            </div>
            
            {person.summary && (
              <p className="text-xs text-text mt-1.5 truncate">
                {person.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
