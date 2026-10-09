export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg h-full">
        <h2 className="text-xl font-bold text-white mb-4">Live Timeline</h2>
        <div className="text-gray-500 italic">Waiting for events...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg h-full overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Live Timeline</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
        {events.map((event) => (
          <div key={event.id} className="flex items-start">
            <div className="flex flex-col items-center mr-3 mt-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="w-px h-full bg-gray-800 my-1 min-h-[40px]"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-blue-400">{event.type}</span>
                <span className="text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Contact ID: {event.contact_id} • via {event.channel || 'system'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
