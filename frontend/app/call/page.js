"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
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
        await fetchApi("/call-event/", {
          method: "POST",
          body: JSON.stringify({ recipient_id: parseInt(rid), event: "answered" })
        });
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

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background pulsing effect when ringing */}
      {callState === "ringing" && (
        <div className="absolute inset-0 bg-red-900/20 animate-pulse-slow"></div>
      )}

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Campus Safety</h1>
        
        {callState === "ringing" && (
          <p className="text-red-400 font-medium mb-12 animate-pulse">Incoming Emergency Call...</p>
        )}
        
        {callState === "active" && (
          <div className="flex flex-col items-center mb-12">
            <p className="text-green-400 font-medium mb-2">Connected</p>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
            {conversation.isSpeaking && (
              <p className="text-xs text-gray-500 mt-4">Agent is speaking...</p>
            )}
          </div>
        )}

        {callState === "ended" && (
          <p className="text-gray-400 font-medium mb-12">Call Ended</p>
        )}

        {callState === "declined" && (
          <p className="text-red-500 font-medium mb-12">Call Declined</p>
        )}
        
        {micPermissionError && (
          <p className="text-orange-400 text-sm text-center mb-8 px-4">
            Microphone access is required to answer the call. Please allow access in your browser.
          </p>
        )}

        <div className="flex w-full justify-around mt-8">
          {callState === "ringing" && (
            <>
              <button 
                onClick={handleDecline}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
              >
                <svg className="w-8 h-8 text-white transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              
              <button 
                onClick={handleAnswer}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-bounce"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </>
          )}

          {callState === "active" && (
            <button 
              onClick={handleEndCall}
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
            >
              <svg className="w-8 h-8 text-white transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex justify-center items-center"><div className="animate-spin h-8 w-8 border-t-2 border-red-500 rounded-full"></div></div>}>
      <CallInterface />
    </Suspense>
  );
}
