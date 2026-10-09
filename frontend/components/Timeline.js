export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-surface border border-line rounded-lg p-6 h-full flex flex-col">
        <h2 className="text-sm font-semibold text-text mb-4">Activity</h2>
        <div className="text-muted text-sm flex-1 flex items-center justify-center">Waiting for events...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-6 h-full overflow-hidden flex flex-col">
      <h2 className="text-sm font-semibold text-text mb-4">Activity</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start">
            <div className="flex flex-col items-center mr-3 mt-1.5">
              <div className="w-2 h-2 bg-drill rounded-full"></div>
              <div className="w-px h-full bg-line my-1 min-h-[40px]"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-text capitalize">{event.type.replace(/_/g, ' ')}</span>
                <span className="text-xs text-muted tabular-nums">
                  {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">Recipient ID: {event.contact_id} • via {event.channel || 'system'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
