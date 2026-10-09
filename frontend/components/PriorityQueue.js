export default function PriorityQueue({ queue }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="bg-surface border border-line rounded-lg p-6 h-full flex flex-col">
        <h2 className="text-sm font-semibold text-text mb-4">Needs help (Priority)</h2>
        <div className="flex-1 flex items-center justify-center text-muted text-sm">
          No assistance needed currently.
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency) => {
    if (urgency === 'HIGH') return 'bg-help text-text animate-pulse';
    if (urgency === 'MEDIUM') return 'bg-waiting text-surface-2';
    return 'bg-drill text-text';
  };

  return (
    <div className="bg-surface border border-line rounded-lg p-6 h-full flex flex-col">
      <h2 className="text-sm font-semibold text-text mb-4">Needs help (Priority)</h2>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {queue.map((person) => (
          <div key={person.id} className="bg-bg border border-line rounded-md p-4 flex flex-col relative overflow-hidden transition-all hover:bg-surface-2">
            <div className={`absolute top-0 left-0 w-1 h-full ${getUrgencyColor(person.urgency).split(' ')[0]}`}></div>
            
            <div className="flex justify-between items-start mb-2 pl-2">
              <div>
                <h3 className="font-medium text-text">{person.name}</h3>
                <p className="text-xs text-muted">{person.building} {person.location ? `• ${person.location}` : ''}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getUrgencyColor(person.urgency)} uppercase`}>
                {person.urgency || 'UNKNOWN'}
              </span>
            </div>
            
            <p className="text-sm text-text pl-2 border-l border-line ml-2 mt-2">
              "{person.summary}"
            </p>
            {person.people_hurt > 0 && (
              <p className="text-xs text-help mt-2 pl-2 font-medium">
                Reports {person.people_hurt} person(s) hurt
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
