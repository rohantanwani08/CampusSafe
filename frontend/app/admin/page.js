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
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 font-sans transition-colors duration-500 ${mode === "real" ? "bg-red-950 text-red-50" : "bg-gray-950 text-gray-100"}`}>
      <div className={`w-full max-w-2xl border rounded-3xl p-8 shadow-2xl transition-all duration-500 ${mode === "real" ? "bg-red-900/40 border-red-800 shadow-red-900/50" : "bg-gray-900 border-gray-800"}`}>
        <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 flex items-center">
          <svg className="w-8 h-8 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Trigger Emergency Alert
        </h1>
        
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Mode</label>
            <div className="flex bg-gray-950 rounded-xl p-1 border border-gray-800">
              <button 
                onClick={() => { setMode("drill"); setIsConfirming(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "drill" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-gray-300"}`}
              >
                Drill (Test)
              </button>
              <button 
                onClick={() => setMode("real")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "real" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-gray-300"}`}
              >
                REAL EMERGENCY
              </button>
            </div>
          </div>

          {/* Target Group */}
          <div>
            <div className="flex justify-between mb-2">
              <label className={`block text-sm font-semibold ${mode === "real" ? "text-red-300" : "text-gray-400"}`}>Target Group</label>
              <span className={`text-xs font-bold ${mode === "real" ? "text-red-400" : "text-gray-500"}`}>~5 Recipients (Live)</span>
            </div>
            <select 
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-colors ${mode === "real" ? "bg-red-950/50 border-red-800 text-white focus:border-red-400 focus:ring-red-400" : "bg-gray-950 border-gray-800 text-white focus:border-red-500 focus:ring-red-500"}`}
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
              <label className={`block text-sm font-semibold ${mode === "real" ? "text-red-300" : "text-gray-400"}`}>Message</label>
              <select 
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className={`text-xs border rounded-lg px-2 py-1 outline-none ${mode === "real" ? "bg-red-900 border-red-700 text-red-200" : "bg-gray-800 border-gray-700 text-gray-300"}`}
              >
                <option value="custom">Custom Template</option>
                <option value="fire">🔥 Fire Alarm</option>
                <option value="earthquake">🌍 Earthquake</option>
                <option value="security">🛡 Security Threat</option>
                <option value="evacuation">🚨 Evacuation</option>
              </select>
            </div>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-colors resize-none ${mode === "real" ? "bg-red-950/50 border-red-800 text-white focus:border-red-400 focus:ring-red-400" : "bg-gray-950 border-gray-800 text-white focus:border-red-500 focus:ring-red-500"}`}
            />
            <p className={`text-xs mt-2 font-medium ${mode === "real" ? "text-red-400" : "text-gray-500"}`}>
              Preview: <span className="italic">🚨 CAMPUS ALERT: {message}</span>
            </p>
          </div>

          {statusMsg.text && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${statusMsg.type === 'error' ? 'bg-red-950/50 border-red-900/50 text-red-400' : 'bg-green-950/50 border-green-900/50 text-green-400'}`}>
              {statusMsg.text}
            </div>
          )}

          {/* Confirm Block */}
          {mode === "real" && isConfirming ? (
            <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 mt-6">
              <h3 className="text-red-500 font-bold mb-2">CRITICAL ACTION</h3>
              <p className="text-sm text-gray-400 mb-4">You are about to trigger a real emergency broadcast. Type <strong className="text-white">CONFIRM</strong> to proceed.</p>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="CONFIRM"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="flex-1 bg-gray-950 border border-red-900/50 rounded-xl px-4 py-2 text-red-500 font-bold focus:outline-none focus:border-red-500"
                />
                <button 
                  onClick={handleBroadcast}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "EXECUTE"}
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => mode === "real" ? setIsConfirming(true) : handleBroadcast()}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg mt-6 flex items-center justify-center ${
                mode === "real" 
                ? "bg-red-600 hover:bg-red-500 shadow-red-600/20 text-white" 
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white"
              } disabled:opacity-50`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Broadcasting...
                </span>
              ) : (
                mode === "real" ? "TRIGGER REAL EMERGENCY" : "Start Drill"
              )}
            </button>
          )}
        </div>

        {/* Demo Tools Section */}
        <div className="mt-12 border-t border-gray-800 pt-6">
          <button 
            onClick={() => setDemoToolsOpen(!demoToolsOpen)}
            className="flex items-center justify-between w-full text-left text-gray-500 hover:text-gray-300 font-semibold transition-colors"
          >
            <span>🛠 Demo Tools & Simulation</span>
            <svg className={`w-5 h-5 transform transition-transform ${demoToolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {demoToolsOpen && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button 
                onClick={handleResetDemo}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-gray-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Reset Demo (Clean State)</span>
              </button>
              
              <button 
                onClick={handleSimulateCrowd}
                disabled={loading}
                className="bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300 py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-indigo-700/50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span>Simulate Crowd (40 Users)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
