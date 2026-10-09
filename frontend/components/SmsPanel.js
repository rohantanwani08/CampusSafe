export default function SmsPanel({ smsLogs }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          Simulated SMS Gateway
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        {!smsLogs || smsLogs.length === 0 ? (
          <div className="text-gray-500 italic text-center mt-10 h-full flex justify-center items-center">No messages sent yet</div>
        ) : (
          [...smsLogs].map((sms) => (
            <div key={sms.id} className="animate-fade-in-down flex flex-col items-end w-full mt-4">
              <div className="bg-blue-600 rounded-2xl rounded-tr-none px-4 py-2 max-w-[85%] shadow-md">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-blue-200 mr-4">To: {sms.name}</span>
                  {sms.channel === 'call_link' && (
                    <span className="text-[10px] bg-blue-800 px-1.5 py-0.5 rounded ml-2 font-semibold">📞 call link</span>
                  )}
                </div>
                <p className="text-sm text-white">{sms.text}</p>
                <div className="flex justify-between items-center mt-1 w-full gap-4">
                  <span className="text-[10px] text-blue-300">Step {sms.step}</span>
                  <span className="text-[10px] text-blue-300">{new Date(sms.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
