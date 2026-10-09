"use client";

import { useState } from "react";
import { fetchApi } from "../../lib/api";

export default function AdminPage() {
  const [mode, setMode] = useState("drill");
  const [targetGroup, setTargetGroup] = useState("all");
  const [message, setMessage] = useState("This is a test of the CampusSafe system. Please reply with your status.");
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-4 font-sans text-gray-100">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
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
            <label className="block text-sm font-semibold text-gray-400 mb-2">Target Group</label>
            <select 
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            >
              <option value="all">All Campus</option>
              <option value="building:Library">Library</option>
              <option value="building:Dorm A">Dorm A</option>
              <option value="building:Science Block">Science Block</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
            />
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
      </div>
    </div>
  );
}
