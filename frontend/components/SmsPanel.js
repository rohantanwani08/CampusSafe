export default function SmsPanel({ smsLogs }) {
  return (
    <div className="flex flex-col h-full bg-bg/30">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse">
        {!smsLogs || smsLogs.length === 0 ? (
          <div className="text-muted text-sm text-center mt-10 h-full flex justify-center items-center">No messages sent yet</div>
        ) : (
          [...smsLogs].map((sms) => (
            <div key={sms.id} className="flex flex-col items-end w-full mt-4">
              <div className="bg-drill/20 border border-drill/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-drill mr-4">To: {sms.name}</span>
                  {sms.channel === 'call_link' && (
                    <span className="text-[10px] bg-drill/30 px-1.5 py-0.5 rounded text-drill">📞 call</span>
                  )}
                </div>
                <p className="text-sm text-text leading-relaxed">{sms.text}</p>
                <div className="flex justify-between items-center mt-2 w-full gap-4">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Step {sms.step}</span>
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
