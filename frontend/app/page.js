import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans p-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text drop-shadow-sm">
          CampusSafe
        </h1>
        <p className="text-lg text-gray-400 font-medium">
          Emergency Broadcast & Safety AI
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link 
            href="/admin" 
            className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-red-500/50 hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
          >
            <span className="text-xl font-bold mb-2 group-hover:text-red-400">Admin</span>
            <span className="text-sm text-gray-500">Trigger an Alert</span>
          </Link>
          
          <Link 
            href="/dashboard" 
            className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
          >
            <span className="text-xl font-bold mb-2 group-hover:text-blue-400">Dashboard</span>
            <span className="text-sm text-gray-500">Live Status View</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
