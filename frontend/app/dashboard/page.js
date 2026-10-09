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
    <div className="min-h-screen bg-bg text-text p-6">
      {/* 3px top border across page based on mode */}
      <div className={`fixed top-0 left-0 right-0 h-[3px] z-50 ${data?.alert?.mode === "real" ? "bg-help" : data?.alert?.mode === "drill" ? "bg-drill" : "bg-transparent"}`}></div>

      <div className="max-w-[95%] mx-auto mt-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 border border-line p-4 rounded-lg bg-surface">
          <div>
            <h1 className="text-xl font-semibold text-text">
              CampusSafe
              {data?.alert && <span className="ml-2 font-normal text-muted">{data.alert.message.substring(0, 40) + "..."}</span>}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${data?.alert?.mode === 'real' ? 'bg-help/14 text-help' : 'bg-drill/14 text-drill'}`}>
                {data?.alert?.mode === 'real' ? "Real alert" : data?.alert?.mode === 'drill' ? "Drill" : "Standby"}
              </span>
              {data?.alert && (
                <span className="text-muted text-sm font-condensed">
                  Elapsed: 00:45
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {error ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-help/14 text-help border border-help/30">
                Reconnecting
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-safe/14 text-safe border border-safe/30">
                <span className="w-2 h-2 rounded-full bg-safe mr-2"></span>
                Live
              </span>
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
          <div className="bg-surface border border-line rounded-lg p-12 text-center text-muted">
            <h2 className="text-lg font-medium text-text mb-2">No alert running.</h2>
            <p className="text-sm">Start one from Admin.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
