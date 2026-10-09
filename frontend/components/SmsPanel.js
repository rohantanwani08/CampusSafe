export default function SmsPanel({ smsLogs }) {
  return (
    <div className="bg-surface border border-line rounded-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-line flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        {!smsLogs || smsLogs.length === 0 ? (
          <div className="text-muted text-sm text-center mt-10 h-full flex justify-center items-center">No messages sent yet</div>
        ) : (
          [...smsLogs].map((sms) => (
            <div key={sms.id} className="flex flex-col items-end w-full mt-4">
              <div className="bg-drill/20 border border-drill/30 rounded-lg rounded-tr-sm px-4 py-3 max-w-[85%]">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-drill mr-4">To: {sms.name}</span>
                  {sms.channel === 'call_link' && (
                    <span className="text-[10px] bg-drill/30 px-1.5 py-0.5 rounded text-drill">📞 call</span>
                  )}
                </div>
                <p className="text-sm text-text leading-relaxed">{sms.text}</p>
                <div className="flex justify-between items-center mt-2 w-full gap-4">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Step {sms.step}</span>
                  <span className="text-[10px] text-muted tabular-nums">{new Date(sms.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
