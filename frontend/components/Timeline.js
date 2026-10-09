export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        Waiting for events...
      </div>
    );
  }

  const getSentence = (event) => {
    // Basic heuristics since we don't have all names joined. We can use payload if it has name.
    // The requirement says "Aarav answered the call and reported safe in Library, 2nd floor"
    // Since backend might just give type, we use payload.name or fallback.
    const name = event.payload?.name || `Recipient ${event.contact_id}`;
    
    switch(event.type) {
      case 'RESPONSE':
        return `${name} replied via ${event.channel || 'system'} and reported ${event.payload?.status || 'a status change'}.`;
      case 'STATUS_CHANGE':
        return `${name}'s status changed to ${event.payload?.status || 'unknown'}.`;
      case 'SENT':
        return `Initial alert sent to ${name} via ${event.channel || 'system'}.`;
      case 'RETRY':
        return `Follow-up sent to ${name} (Step ${event.payload?.step || 2}).`;
      case 'CALL_LINK':
        return `Automated call placed to ${name}.`;
      case 'BACKUP_NOTIFIED':
        return `No reply from ${name}, backup contact notified.`;
      default:
        return `System event for ${name}: ${event.type.replace(/_/g, ' ')}`;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-start">
          <div className="flex flex-col items-center mr-3 mt-1.5">
            <div className="w-2 h-2 bg-drill rounded-full"></div>
            <div className="w-px h-full bg-line my-1 min-h-[30px]"></div>
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text">{getSentence(event)}</span>
              <span className="text-xs text-muted tabular-nums whitespace-nowrap ml-4">
                {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
