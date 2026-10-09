"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "../../lib/api";
import Counters from "../../components/Counters";
import PriorityQueue from "../../components/PriorityQueue";
import Timeline from "../../components/Timeline";
import RecipientTable from "../../components/RecipientTable";
import SmsPanel from "../../components/SmsPanel";
import PersonDrawer from "../../components/PersonDrawer";
import CampusMap from "../../components/CampusMap";

function ElapsedTimer({ startedAt, endedAt }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const update = () => {
      if (!startedAt) return;
      const end = endedAt ? new Date(endedAt) : new Date();
      const diff = Math.floor((end.getTime() - new Date(startedAt).getTime()) / 1000);
      if (diff < 0) return setElapsed('00:00');
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    };
    update();
    const int = setInterval(update, 1000);
    return () => clearInterval(int);
  }, [startedAt, endedAt]);

  return <span className="font-condensed tabular-nums">{elapsed || '00:00'}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wakingUp, setWakingUp] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  const [muted, setMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const isPolling = useRef(false);
  const prevHelpCount = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/alert.mp3');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isPolling.current) return;
      isPolling.current = true;
      
      try {
        const result = await fetchApi("/state/");
        setData(result);
        setError(null);
        setWakingUp(false);
        
        // Play audio if new Needs Help
        const newHelpCount = result.counters?.NEED_ASSISTANCE || 0;
        if (newHelpCount > prevHelpCount.current && hasInteracted && !muted && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        prevHelpCount.current = newHelpCount;
      } catch (err) {
        console.error(err);
        setError("Can't reach the server. Retrying every 2 seconds.");
      } finally {
        setLoading(false);
        isPolling.current = false;
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 2000);
    
    // Waking up check
    const wakeTimer = setTimeout(() => {
      if (loading) setWakingUp(true);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(wakeTimer);
    };
  }, [hasInteracted, muted, loading]);

  const endAlert = async () => {
    if (!data?.alert?.id) return;
    try {
      await fetchApi(`/alerts/${data.alert.id}/end`, { method: 'POST' });
      // update local state so UI reflects it immediately
      setData(prev => ({
        ...prev,
        alert: { ...prev.alert, status: 'ENDED', ended_at: new Date().toISOString() }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-text space-y-4">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
          <div className="h-16 bg-surface border border-line rounded-lg w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px]">
            <div className="bg-surface border border-line rounded-lg"></div>
            <div className="lg:col-span-2 bg-surface border border-line rounded-lg"></div>
            <div className="bg-surface border border-line rounded-lg"></div>
          </div>
        </div>
        {wakingUp && (
          <p className="text-muted animate-pulse">Waking up the server...</p>
        )}
      </div>
    );
  }

  if (!data?.alert && !loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-surface border border-line rounded-lg p-12 text-center text-text max-w-md w-full">
          <h2 className="text-lg font-medium mb-4">No alert running.</h2>
          <p className="text-sm text-muted mb-6">Start one from Admin to see the dashboard.</p>
          <a href="/admin" className="inline-block bg-drill text-bg font-medium px-4 py-2 rounded-md hover:bg-drill/90 transition-colors">
            Go to Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 flex flex-col">
      {/* 3px top border across page based on mode */}
      <div className={`fixed top-0 left-0 right-0 h-[3px] z-50 ${data?.alert?.mode === "real" ? "bg-help" : data?.alert?.mode === "drill" ? "bg-drill" : "bg-transparent"}`}></div>

      <div className="w-full max-w-[1920px] mx-auto flex-1 flex flex-col space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border border-line p-4 rounded-lg bg-surface">
          <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-baseline space-x-3">
              <h1 className="text-xl font-bold text-text tracking-tight">CampusSafe</h1>
              <span className="text-sm text-muted hidden md:inline-block">Every person accounted for</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-text font-medium border-l border-line pl-4">
                {data.alert.title}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${data.alert.mode === 'real' ? 'bg-help/14 text-help border border-help/30' : 'bg-drill/14 text-drill border border-drill/30'}`}>
                {data.alert.mode === 'real' ? "Real alert" : "Drill"}
              </span>
              <span className="text-2xl text-text font-condensed tracking-wider tabular-nums bg-surface-2 px-3 py-1 rounded-md border border-line">
                <ElapsedTimer startedAt={data.alert.started_at} endedAt={data.alert.ended_at} />
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button 
              onClick={() => setMuted(!muted)} 
              className="p-2 rounded-md hover:bg-surface-2 text-muted hover:text-text transition-colors"
              title={muted ? "Unmute alerts" : "Mute alerts"}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            
            {data.alert.status !== 'ENDED' && (
              <button 
                onClick={endAlert}
                className="text-xs font-medium px-4 py-2 rounded-md bg-surface-2 hover:bg-surface-2/80 text-text border border-line transition-colors"
              >
                End alert
              </button>
            )}

            {error ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-waiting/14 text-waiting border border-waiting/30">
                <span className="w-2 h-2 rounded-full bg-waiting mr-2 animate-pulse"></span>
                Reconnecting
              </span>
            ) : data.alert.status === 'ENDED' ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-surface-2 text-muted border border-line">
                Ended
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-safe/14 text-safe border border-safe/30">
                <span className="w-2 h-2 rounded-full bg-safe mr-2 animate-pulse"></span>
                Live
              </span>
            )}
          </div>
        </header>

        {/* Dashboard Grid - Main Row */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:h-[600px]">
          {/* Status Column */}
          <div className="order-2 lg:order-1 lg:col-span-1 bg-surface border border-line rounded-lg p-6 flex flex-col">
            <Counters counters={data.counters} />
          </div>
          
          {/* Main Panel */}
          <div className="order-1 lg:order-2 lg:col-span-2 bg-surface border border-line rounded-lg flex items-center justify-center text-muted overflow-hidden relative">
            <CampusMap 
              buildingsData={data.buildings} 
              recipients={data.recipients} 
              onPersonClick={setSelectedPerson} 
            />
          </div>
          
          {/* Priority Queue & Summary Slot */}
          <div className="order-3 lg:order-3 lg:col-span-1 flex flex-col space-y-6 lg:h-full lg:min-h-0">
            <div className="flex-[2] bg-surface border border-line rounded-lg overflow-hidden min-h-[400px] lg:min-h-0 flex flex-col">
              <PriorityQueue queue={data.priority_queue} onPersonClick={setSelectedPerson} />
            </div>
            <div className="flex-1 bg-surface border border-line rounded-lg p-4 flex flex-col min-h-[150px] lg:min-h-0">
              <h2 className="text-sm font-semibold text-text mb-2">Right now</h2>
              <div className="flex-1 flex items-center justify-center text-muted text-sm border-2 border-dashed border-line rounded-md">
                Summary slot
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Row */}
        <div className="order-6 lg:order-5 bg-surface border border-line rounded-lg flex flex-col h-[500px]">
          <div className="flex border-b border-line px-4">
            <button 
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-drill text-drill' : 'border-transparent text-muted hover:text-text'}`}
            >
              Activity
            </button>
            <button 
              onClick={() => setActiveTab('people')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'people' ? 'border-drill text-drill' : 'border-transparent text-muted hover:text-text'}`}
            >
              People
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'messages' ? 'border-drill text-drill' : 'border-transparent text-muted hover:text-text'}`}
            >
              Messages
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'activity' && <Timeline events={data.events} />}
            {activeTab === 'people' && <RecipientTable recipients={data.recipients} />}
            {activeTab === 'messages' && <SmsPanel smsLogs={data.sms_log} />}
          </div>
        </div>

      </div>

      {selectedPerson && (
        <PersonDrawer 
          person={selectedPerson} 
          events={data.events} 
          smsLog={data.sms_log} 
          onClose={() => setSelectedPerson(null)} 
        />
      )}
    </div>
  );
}
