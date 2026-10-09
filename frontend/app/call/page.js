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
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* 3px top border across page based on mode */}
      <div className={`fixed top-0 left-0 right-0 h-[3px] z-50 bg-help`}></div>

      {/* Background pulsing effect when ringing */}
      {callState === "ringing" && (
        <div className="absolute inset-0 bg-help/20 animate-pulse-slow"></div>
      )}

      {/* Active Call Background */}
      {callState === "active" && (
        <div className="absolute inset-0 bg-surface"></div>
      )}

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        
        {/* Ringing State */}
        {callState === "ringing" && (
          <>
            <div className="w-28 h-28 bg-surface rounded-full flex items-center justify-center mb-6 border-2 border-help/50 relative">
              <div className="absolute inset-0 rounded-full border-4 border-help opacity-20 animate-ping"></div>
              <svg className="w-12 h-12 text-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-text mb-2">Campus Safety</h1>
            <p className="text-help font-medium mb-12 animate-pulse uppercase tracking-widest text-sm">Incoming emergency call</p>
          </>
        )}
        
        {/* Active State */}
        {callState === "active" && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-xl font-medium text-text">Campus Safety AI</h2>
              <p className="text-sm text-muted font-condensed mt-2 tabular-nums">{formatTime(callDuration)}</p>
            </div>

            <div className="relative w-48 h-48 mb-16 flex items-center justify-center">
              {/* Outer pulsing ring that reacts to speaking */}
              <div className={`absolute inset-0 rounded-full bg-drill/20 transition-all duration-300 ${conversation.isSpeaking ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`}></div>
              <div className={`absolute inset-4 rounded-full bg-drill/30 transition-all duration-200 ${conversation.isSpeaking ? 'scale-125' : 'scale-100'}`}></div>
              <div className="absolute inset-8 rounded-full bg-drill z-10 flex items-center justify-center">
                <svg className="w-12 h-12 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>

            <div className="h-16 flex items-center justify-center text-center px-6">
              {conversation.isSpeaking ? (
                <p className="text-drill font-medium animate-pulse">Agent is speaking...</p>
              ) : (
                <p className="text-muted font-medium italic">Listening...</p>
              )}
            </div>
          </>
        )}

        {/* Ended State */}
        {callState === "ended" && (
          <div className="text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-safe/14 border border-safe/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-text mb-4">Response recorded</h2>
            <p className="text-muted mb-8 max-w-xs">
              Thank you. Your status has been securely transmitted to the command center.
            </p>
          </div>
        )}

        {/* Declined State */}
        {callState === "declined" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-help/14 border border-help/30 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">Call missed</h2>
            <p className="text-muted">We will attempt to reach you through a backup channel.</p>
          </div>
        )}
        
        {/* Error State */}
        {callState === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-waiting/14 border border-waiting/50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-waiting" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">Connection Error</h2>
            <p className="text-muted mb-4 max-w-xs mx-auto">
              The AI Agent failed to connect. This usually happens if the agent ID is invalid, or if your ElevenLabs account is out of credits.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-surface-2 hover:bg-line text-text font-medium py-2 px-6 rounded-md transition-all border border-line"
            >
              Try Again
            </button>
          </div>
        )}

        {micPermissionError && (
          <div className="bg-waiting/14 border border-waiting/50 rounded-md p-4 text-waiting text-sm text-center mb-8 w-full">
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
                  className="w-16 h-16 bg-help rounded-full flex items-center justify-center hover:bg-help/80 transition-transform hover:scale-110"
                >
                  <svg className="w-8 h-8 text-bg transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-muted text-xs mt-3 font-medium">Decline</span>
              </div>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleAnswer}
                  className="w-20 h-20 bg-safe rounded-full flex items-center justify-center hover:bg-safe/80 transition-transform hover:scale-110 animate-bounce"
                >
                  <svg className="w-10 h-10 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-safe text-sm mt-3 font-medium">Answer</span>
              </div>
            </>
          )}

          {callState === "active" && (
            <div className="flex flex-col items-center mx-auto">
              <button 
                onClick={handleEndCall}
                className="w-16 h-16 bg-help rounded-full flex items-center justify-center hover:bg-help/80 transition-transform hover:scale-110"
              >
                <svg className="w-8 h-8 text-bg transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <span className="text-muted text-xs mt-3 font-medium">End call</span>
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
      <Suspense fallback={<div className="min-h-screen bg-bg flex justify-center items-center"><div className="animate-spin h-8 w-8 border-t-2 border-drill rounded-full"></div></div>}>
        <CallInterface />
      </Suspense>
    </ConversationProvider>
  );
}
