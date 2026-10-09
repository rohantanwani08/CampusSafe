import { useEffect } from 'react';
import StatusChip from './StatusChip';

export default function BuildingDrawer({ buildingId, buildingName, recipients, onClose, onPersonClick }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!buildingId) return null;

  // sort recipients: NEED_ASSISTANCE first
  const statusMap = { "NEED_ASSISTANCE": 4, "UNREACHABLE": 3, "PENDING": 2, "SAFE": 1 };
  const sortedRecipients = [...recipients].sort((a, b) => {
    const sA = statusMap[a.status] || 0;
    const sB = statusMap[b.status] || 0;
    if (sA !== sB) return sB - sA;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div 
        className="absolute inset-0 bg-bg/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-md bg-surface h-full shadow-2xl border-l border-line flex flex-col animate-slide-in-right overflow-hidden"
        style={{ animationDuration: '200ms' }}
      >
        <div className="p-6 border-b border-line flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-text">{buildingName}</h2>
            <p className="text-sm text-muted">{sortedRecipients.length} people</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedRecipients.length === 0 ? (
            <p className="text-muted text-sm text-center mt-10">No people assigned to this building.</p>
          ) : (
            sortedRecipients.map(person => (
              <div 
                key={person.id}
                onClick={() => onPersonClick(person)}
                className="bg-surface-2 p-4 rounded-lg border border-line cursor-pointer hover:border-drill hover:shadow-lg transition-all flex flex-col space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-text group-hover:text-drill transition-colors">{person.name}</span>
                  <StatusChip status={person.status} />
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Step: {person.step}</span>
                  {person.summary && <span className="italic truncate max-w-[200px]">{person.summary}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
