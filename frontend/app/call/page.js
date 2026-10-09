"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { fetchApi } from "../../lib/api";

function CallInterface() {
  const searchParams = useSearchParams();
  const rid = searchParams.get("rid");
  
  const [callState, setCallState] = useState("ringing"); // ringing, active, ended, declined, error
  const [micPermissionError, setMicPermissionError] = useState(false);

  const conversation = useConversation({
    onConnect: () => setCallState("active"),
    onDisconnect: () => setCallState("ended"),
    onError: (error) => {
      console.error("ElevenLabs Error:", error);
      setCallState("error");
    },
  });

  const handleAnswer = async () => {
    try {
      // 1. Ask for mic permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Log to backend
      if (rid) {
        try {
          await fetchApi("/call-event/", {
            method: "POST",
            body: JSON.stringify({ recipient_id: parseInt(rid), event: "answered" })
          });
        } catch (e) {
          console.warn("Could not log call event to backend (might be a standalone test):", e);
        }
      }

      // 3. Start ElevenLabs agent
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";
      if (!agentId) {
         console.warn("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID in env.");
      }
      
      await conversation.startSession({
        agentId: agentId,
        clientTools: {},
        dynamicVariables: {
          recipient_id: rid || "unknown",
        }
      });
      
    } catch (err) {
      console.error(err);
      if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
        setMicPermissionError(true);
      }
      setCallState("error");
    }
  };

  const handleDecline = async () => {
    setCallState("declined");
    if (rid) {
      try {
        await fetchApi("/call-event/", {
          method: "POST",
          body: JSON.stringify({ recipient_id: parseInt(rid), event: "declined" })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleEndCall = async () => {
    await conversation.endSession();
    setCallState("ended");
  };

  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval = null;
    if (callState === "active") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background pulsing effect when ringing */}
      {callState === "ringing" && (
        <div className="absolute inset-0 bg-red-900/20 animate-pulse-slow"></div>
      )}

      {/* Active Call Background */}
      {callState === "active" && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      )}

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        
        {/* Ringing State */}
        {callState === "ringing" && (
          <>
            <div className="w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-bounce border-2 border-red-500/50 relative">
              <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-20 animate-ping"></div>
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Campus Safety</h1>
            <p className="text-red-400 font-medium mb-12 animate-pulse uppercase tracking-widest text-sm">Incoming Emergency Call</p>
          </>
        )}
        
        {/* Active State */}
        {callState === "active" && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold text-gray-300">Campus Safety AI</h2>
              <p className="text-sm text-gray-500 font-mono mt-2">{formatTime(callDuration)}</p>
            </div>

            <div className="relative w-48 h-48 mb-16 flex items-center justify-center">
              {/* Outer pulsing ring that reacts to speaking */}
              <div className={`absolute inset-0 rounded-full bg-blue-500/20 transition-all duration-300 ${conversation.isSpeaking ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`}></div>
              <div className={`absolute inset-4 rounded-full bg-blue-500/30 transition-all duration-200 ${conversation.isSpeaking ? 'scale-125' : 'scale-100'}`}></div>
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] z-10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>

            <div className="h-16 flex items-center justify-center text-center px-6">
              {conversation.isSpeaking ? (
                <p className="text-blue-400 font-medium animate-pulse">Agent is speaking...</p>
              ) : (
                <p className="text-gray-500 font-medium italic">Listening...</p>
              )}
            </div>
          </>
        )}

        {/* Ended State */}
        {callState === "ended" && (
          <div className="text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Response Recorded</h2>
            <p className="text-gray-400 mb-8 max-w-xs">
              Thank you. Your status has been securely transmitted to the command center. Help will be dispatched if requested.
            </p>
          </div>
        )}

        {/* Declined State */}
        {callState === "declined" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Call Missed</h2>
            <p className="text-gray-400">We will attempt to reach you through a backup channel.</p>
          </div>
        )}
        
        {micPermissionError && (
          <div className="bg-orange-900/50 border border-orange-800 rounded-xl p-4 text-orange-200 text-sm text-center mb-8 w-full">
            Microphone access is required. Please allow it in your browser settings.
          </div>
        )}

        {/* Controls (Bottom Bar) */}
        <div className="flex w-full justify-around mt-auto absolute bottom-12 left-0 right-0">
          {callState === "ringing" && (
            <>
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleDecline}
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-transform hover:scale-110 shadow-lg"
                >
                  <svg className="w-8 h-8 text-white transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-gray-400 text-xs mt-3 font-semibold">Decline</span>
              </div>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleAnswer}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-transform hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-bounce"
                >
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-green-400 text-sm mt-3 font-bold">Answer</span>
              </div>
            </>
          )}

          {callState === "active" && (
            <div className="flex flex-col items-center mx-auto">
              <button 
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-transform hover:scale-110 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <svg className="w-8 h-8 text-white transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <span className="text-gray-400 text-xs mt-3 font-semibold">End Call</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CallPage() {
  return (
    <ConversationProvider>
      <Suspense fallback={<div className="min-h-screen bg-black flex justify-center items-center"><div className="animate-spin h-8 w-8 border-t-2 border-red-500 rounded-full"></div></div>}>
        <CallInterface />
      </Suspense>
    </ConversationProvider>
  );
}
