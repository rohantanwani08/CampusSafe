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
      {/* Bold Mode Banner across the top if alert is active */}
      {data?.alert && (
        <div className={`w-full py-2 text-center font-black tracking-[0.2em] text-sm shadow-lg z-50 sticky top-0 ${data.alert.mode === "real" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>
          {data.alert.mode === "real" ? "REAL EMERGENCY IN PROGRESS" : "CAMPUS DRILL IN PROGRESS"}
        </div>
      )}

      <div className="max-w-[95%] mx-auto mt-6">
        
        {/* Header */}
        <header className={`flex justify-between items-center mb-6 border p-4 rounded-2xl shadow-xl bg-gray-900/80 backdrop-blur-md ${data?.alert?.mode === "real" ? "border-red-900/50" : "border-gray-800"}`}>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
              {data?.alert ? data.alert.message.substring(0, 40) + "..." : "CampusSafe Command Center"}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${data?.alert?.mode === 'real' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
                {data?.alert?.mode ? data.alert.mode.toUpperCase() : "STANDBY"}
              </span>
              {data?.alert && (
                <span className="text-gray-400 text-xs font-mono bg-gray-950 px-2 py-1 rounded">
                  Elapsed: 00:45
                </span>
              )}
            </div>
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
            {/* Row 1: Counters */}
            <div className="mb-6">
              <Counters counters={data.counters} />
            </div>
            
            {/* Row 2: Priority Queue, People Table, Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-1 h-[600px] overflow-hidden">
                <PriorityQueue queue={data.priority_queue} />
              </div>
              <div className="lg:col-span-2 h-[600px] overflow-hidden">
                <RecipientTable recipients={data.recipients} />
              </div>
              <div className="lg:col-span-1 h-[600px] overflow-hidden">
                <Timeline events={data.events} />
              </div>
            </div>
            
            {/* Row 3: SMS Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <SmsPanel smsLogs={data.sms_log} />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400 shadow-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-800 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Standing By</h2>
            <p className="text-sm">No active alerts. The system is monitoring for emergencies.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
