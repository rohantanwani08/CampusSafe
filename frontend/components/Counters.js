export default function Counters({ counters }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-900 border border-green-900/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-green-500 mb-1">SAFE</span>
        <span className="text-4xl font-extrabold text-white">{counters?.SAFE || 0}</span>
      </div>
      <div className="bg-gray-900 border border-red-900/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
        <span className="text-sm font-bold text-red-500 mb-1">NEED HELP</span>
        <span className="text-4xl font-extrabold text-white">{counters?.NEED_ASSISTANCE || 0}</span>
      </div>
      <div className="bg-gray-900 border border-orange-900/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-orange-500 mb-1">UNREACHABLE</span>
        <span className="text-4xl font-extrabold text-white">{counters?.UNREACHABLE || 0}</span>
      </div>
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-gray-500 mb-1">PENDING</span>
        <span className="text-4xl font-extrabold text-white">{(counters?.PENDING || 0) + (counters?.CONTACTED || 0)}</span>
      </div>
    </div>
  );
}
