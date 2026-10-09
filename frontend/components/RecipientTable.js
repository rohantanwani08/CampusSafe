export default function RecipientTable({ recipients }) {
  if (!recipients || recipients.length === 0) return null;

  const getStatusStyle = (status) => {
    switch(status) {
      case 'SAFE': return 'text-green-400 bg-green-400/10';
      case 'NEED_ASSISTANCE': return 'text-red-400 bg-red-400/10 font-bold';
      case 'UNREACHABLE': return 'text-orange-400 bg-orange-400/10';
      case 'UNCLEAR': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">All Recipients Status</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 text-gray-400 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Building</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Channel</th>
              <th className="p-4 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {recipients.map((r) => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800 transition-colors">
                <td className="p-4 font-medium text-white">{r.name}</td>
                <td className="p-4 text-gray-400">{r.building}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{r.resolved_via || '-'}</td>
                <td className="p-4 text-gray-500">
                  {r.responded_at ? new Date(r.responded_at).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
