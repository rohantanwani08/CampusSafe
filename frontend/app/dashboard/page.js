"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "../../lib/api";
import Counters from "../../components/Counters";
import PriorityQueue from "../../components/PriorityQueue";
import Timeline from "../../components/Timeline";
import RecipientTable from "../../components/RecipientTable";
import SmsPanel from "../../components/SmsPanel";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use a ref to prevent overlapping polls if the network is slow
  const isPolling = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isPolling.current) return;
      isPolling.current = true;
      
      try {
        const result = await fetchApi("/state/");
        setData(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Lost connection to server");
      } finally {
        setLoading(false);
        isPolling.current = false;
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 2 seconds
    const intervalId = setInterval(fetchData, 2000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Live Responder Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Real-time emergency tracking</p>
          </div>
          
          <div className="text-right">
            {error ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-900/50 text-red-400 border border-red-800 animate-pulse">
                Disconnected
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-900/50 text-green-400 border border-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Live
              </span>
            )}
            
            {data?.alert && (
              <div className="mt-2 text-sm">
                Active Alert: <span className="font-bold text-white">{data.alert.mode.toUpperCase()}</span>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Grid */}
        {data?.alert ? (
          <>
            <Counters counters={data.counters} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1 h-full">
                <PriorityQueue queue={data.priority_queue} />
              </div>
              <div className="lg:col-span-1 h-full">
                <Timeline events={data.events} />
              </div>
              <div className="lg:col-span-1 h-full">
                <SmsPanel smsLogs={data.sms_log} />
              </div>
            </div>
            
            <RecipientTable recipients={data.recipients} />
          </>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400 shadow-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No Active Alerts</h2>
            <p>The system is currently standing by. All clear.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
