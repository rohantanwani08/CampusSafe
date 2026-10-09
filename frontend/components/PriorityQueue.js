export default function PriorityQueue({ queue }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg h-full">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
          Priority Queue
        </h2>
        <div className="flex items-center justify-center h-32 text-gray-500 italic">
          No assistance needed currently.
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency) => {
    if (urgency === 'HIGH') return 'bg-red-600 text-white animate-pulse';
    if (urgency === 'MEDIUM') return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-gray-900';
  };

  return (
    <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-6 shadow-lg h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
        Priority Queue
      </h2>
      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
        {queue.map((person) => (
          <div key={person.id} className="bg-gray-950 border border-red-900/50 rounded-xl p-4 flex flex-col relative overflow-hidden transition-all hover:bg-gray-900">
            <div className={`absolute top-0 left-0 w-1 h-full ${getUrgencyColor(person.urgency).split(' ')[0]}`}></div>
            
            <div className="flex justify-between items-start mb-2 pl-2">
              <div>
                <h3 className="font-bold text-white">{person.name}</h3>
                <p className="text-xs text-gray-400">{person.building} {person.location ? `• ${person.location}` : ''}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getUrgencyColor(person.urgency)}`}>
                {person.urgency || 'UNKNOWN'}
              </span>
            </div>
            
            <p className="text-sm text-gray-300 pl-2 border-l border-gray-800 ml-2 mt-2">
              "{person.summary}"
            </p>
            {person.people_hurt > 0 && (
              <p className="text-xs text-red-400 mt-2 pl-2 font-semibold">
                ⚠️ Reports {person.people_hurt} person(s) hurt
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
