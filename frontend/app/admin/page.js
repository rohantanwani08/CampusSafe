"use client";

import { useState } from "react";
import { fetchApi } from "../../lib/api";

export default function AdminPage() {
  const [mode, setMode] = useState("drill");
  const [targetGroup, setTargetGroup] = useState("all");
  const [template, setTemplate] = useState("custom");
  const [message, setMessage] = useState("This is a test of the CampusSafe system. Please reply with your status.");
  
  const templates = {
    "custom": "This is a test of the CampusSafe system. Please reply with your status.",
    "fire": "FIRE ALARM: Evacuate the building immediately using the nearest exit. Do not use elevators. Reply with your status.",
    "earthquake": "EARTHQUAKE: Drop, cover, and hold on. Stay away from windows. Wait for further instructions. Reply with your status.",
    "security": "SECURITY THREAT: Campus lockdown initiated. Stay indoors, lock doors, and stay away from windows. Reply with your status.",
    "evacuation": "EVACUATION: Please evacuate the campus immediately due to an active emergency. Follow staff instructions. Reply with your status."
  };

  const handleTemplateChange = (val) => {
    setTemplate(val);
    if (val !== "custom") {
      setMessage(templates[val]);
    }
  };
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [demoToolsOpen, setDemoToolsOpen] = useState(false);

  const handleResetDemo = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/demo/reset", { method: "POST" });
      setStatusMsg({ text: res.message, type: "success" });
    } catch (err) {
      setStatusMsg({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCrowd = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/demo/simulate", { method: "POST" });
      setStatusMsg({ text: res.message, type: "success" });
    } catch (err) {
      setStatusMsg({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (mode === "real" && confirmText !== "CONFIRM") {
      setStatusMsg({ text: "Please type CONFIRM exactly.", type: "error" });
      return;
    }

    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const res = await fetchApi("/alerts/", {
        method: "POST",
        headers: {
          "X-Admin-Token": "hackathon_demo_secret" // In prod this should be env var, hardcoded for demo
        },
        body: JSON.stringify({
          mode,
          message,
          target_group: targetGroup,
          admin_token: "hackathon_demo_secret"
        })
      });
      
      setStatusMsg({ text: `Success! Alert fired to ${res.recipients_count} people.`, type: "success" });
      setIsConfirming(false);
      setConfirmText("");
    } catch (err) {
      setStatusMsg({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 font-sans transition-colors duration-500 bg-bg text-text relative">
      {/* 3px top border across page based on mode */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] z-50 ${mode === "real" ? "bg-help" : "bg-drill"}`}></div>

      <div className="w-full max-w-2xl border rounded-lg p-8 transition-all duration-500 bg-surface border-line">
        <h1 className="text-2xl font-semibold mb-8 text-text flex items-center">
          Trigger emergency alert
        </h1>
        
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Mode</label>
            <div className="flex bg-surface-2 rounded-md p-1 border border-line">
              <button 
                onClick={() => { setMode("drill"); setIsConfirming(false); }}
                className={`flex-1 py-2 rounded font-medium transition-all duration-300 ${mode === "drill" ? "bg-drill text-surface shadow-sm" : "text-muted hover:text-text"}`}
              >
                Drill (Test)
              </button>
              <button 
                onClick={() => setMode("real")}
                className={`flex-1 py-2 rounded font-medium transition-all duration-300 ${mode === "real" ? "bg-help text-text shadow-sm" : "text-muted hover:text-text"}`}
              >
                Real emergency
              </button>
            </div>
          </div>

          {/* Target Group */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-muted">Target group</label>
              <span className="text-xs text-muted tabular-nums">~5 Recipients (Live)</span>
            </div>
            <select 
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 transition-colors bg-bg border-line text-text focus:ring-drill"
            >
              <option value="all">All Campus</option>
              <option value="building:Library">Library</option>
              <option value="building:Dorm A">Dorm A</option>
              <option value="building:Science Block">Science Block</option>
            </select>
          </div>

          {/* Message Template & Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-muted">Message</label>
              <select 
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="text-xs border rounded px-2 py-1 outline-none bg-surface-2 border-line text-text"
              >
                <option value="custom">Custom template</option>
                <option value="fire">Fire alarm</option>
                <option value="earthquake">Earthquake</option>
                <option value="security">Security threat</option>
                <option value="evacuation">Evacuation</option>
              </select>
            </div>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 transition-colors resize-none bg-bg border-line text-text focus:ring-drill"
            />
            <p className="text-xs mt-2 text-muted">
              Preview: <span className="italic">CAMPUS ALERT: {message}</span>
            </p>
          </div>

          {statusMsg.text && (
            <div className={`p-4 rounded-md text-sm font-medium border ${statusMsg.type === 'error' ? 'bg-help/14 border-help/50 text-help' : 'bg-safe/14 border-safe/50 text-safe'}`}>
              {statusMsg.text}
            </div>
          )}

          {/* Confirm Block */}
          {mode === "real" && isConfirming ? (
            <div className="bg-help/14 border border-help/50 rounded-lg p-6 mt-6">
              <h3 className="text-help font-semibold mb-2">CRITICAL ACTION</h3>
              <p className="text-sm text-text mb-4">You are about to trigger a real emergency broadcast. Type <strong>CONFIRM</strong> to proceed.</p>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="CONFIRM"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="flex-1 bg-bg border border-help/50 rounded-md px-4 py-2 text-text font-medium focus:outline-none focus:border-help"
                />
                <button 
                  onClick={handleBroadcast}
                  disabled={loading}
                  className="bg-help hover:bg-help/80 text-text font-medium py-2 px-6 rounded-md transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Execute"}
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => mode === "real" ? setIsConfirming(true) : handleBroadcast()}
              disabled={loading}
              className={`w-full py-4 rounded-md font-medium text-base transition-all duration-300 mt-6 flex items-center justify-center ${
                mode === "real" 
                ? "bg-help hover:bg-help/90 text-text" 
                : "bg-drill hover:bg-drill/90 text-surface"
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Broadcasting...</span>
              ) : (
                mode === "real" ? "Send real alert" : "Send drill alert"
              )}
            </button>
          )}
        </div>

        {/* Demo Tools Section */}
        <div className="mt-12 border-t border-line pt-6">
          <button 
            onClick={() => setDemoToolsOpen(!demoToolsOpen)}
            className="flex items-center justify-between w-full text-left text-muted hover:text-text font-medium transition-colors"
          >
            <span>Demo tools & simulation</span>
          </button>
          
          {demoToolsOpen && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button 
                onClick={handleResetDemo}
                disabled={loading}
                className="bg-surface-2 hover:bg-line text-text py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center border border-line"
              >
                Reset demo
              </button>
              
              <button 
                onClick={handleSimulateCrowd}
                disabled={loading}
                className="bg-drill/14 hover:bg-drill/20 text-drill py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center border border-drill/30"
              >
                Simulate crowd
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
