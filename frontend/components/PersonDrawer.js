import { useEffect } from 'react';
import StatusChip from './StatusChip';

export default function PersonDrawer({ person, events, smsLog, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!person) return null;

  const personEvents = events.filter(e => e.contact_id === person.contact_id);
  const personSms = smsLog.filter(s => s.contact_id === person.contact_id);

  const steps = [
    { label: 'Alert', stepNum: 1 },
    { label: 'Retry', stepNum: 2 },
    { label: 'Call link', stepNum: 3 },
    { label: 'Backup', stepNum: 4 },
    { label: 'Flagged', stepNum: 5 }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md bg-surface h-full shadow-2xl border-l border-line flex flex-col animate-slide-in-right overflow-hidden"
        style={{ animationDuration: '200ms' }}
      >
        <div className="p-6 border-b border-line flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-text">{person.name}</h2>
            <p className="text-sm text-muted">{person.building}</p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusChip status={person.status} />
            <button onClick={onClose} className="text-muted hover:text-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Extracted Fields */}
          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 bg-surface-2 p-4 rounded-lg text-sm">
              <div>
                <span className="block text-muted text-xs">Status</span>
                <span className="font-medium text-text">{person.status.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="block text-muted text-xs">Location</span>
                <span className="font-medium text-text">{person.location || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-muted text-xs">People Hurt</span>
                <span className="font-medium text-text">{person.people_hurt || 0}</span>
              </div>
              <div>
                <span className="block text-muted text-xs">Urgency</span>
                <span className="font-medium text-text">{person.urgency || 'None'}</span>
              </div>
              {person.confidence != null && (
                <div>
                  <span className="block text-muted text-xs">Confidence</span>
                  <span className="font-medium text-text">{Math.round(person.confidence * 100)}%</span>
                </div>
              )}
            </div>
            {person.summary && (
              <div className="mt-3 bg-surface-2 p-3 rounded-lg text-sm text-text italic">
                &quot;{person.summary}&quot;
              </div>
            )}
          </section>

          {/* Escalation Tracker */}
          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Escalation Tracker</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-2 left-4 right-4 h-0.5 bg-line -z-10"></div>
              {steps.map((stepInfo, i) => {
                const isDone = person.step > stepInfo.stepNum || person.status !== 'PENDING';
                const isCurrent = person.step === stepInfo.stepNum && person.status === 'PENDING';
                const notReached = !isDone && !isCurrent;
                
                let dotColor = 'bg-line';
                if (isDone) dotColor = 'bg-safe';
                if (isCurrent) dotColor = 'bg-drill animate-pulse';

                // find step time from events or smsLog
                const stepSms = personSms.find(s => s.step === stepInfo.stepNum);
                const stepTime = stepSms ? new Date(stepSms.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${dotColor} mb-2`}></div>
                    <span className="text-[10px] text-text font-medium">{stepInfo.label}</span>
                    <span className="text-[10px] text-muted h-3">{stepTime}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transcript (Messages) */}
          {personSms.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-text mb-3">Transcript</h3>
              <div className="space-y-3">
                {[...personSms].reverse().map(sms => (
                  <div key={sms.id} className="bg-surface-2 p-3 rounded-lg rounded-tr-sm ml-auto max-w-[85%] border border-line">
                    <p className="text-sm text-text">{sms.text}</p>
                    <div className="text-[10px] text-muted mt-2 text-right">
                      {new Date(sms.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Event Timeline */}
          {personEvents.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-text mb-3">Audit Log</h3>
              <div className="space-y-4">
                {personEvents.map(ev => (
                  <div key={ev.id} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-drill mt-1.5 mr-3"></div>
                    <div>
                      <p className="text-sm text-text capitalize">{ev.type.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-muted">{new Date(ev.created_at).toLocaleString()}</p>
                      {ev.payload && (
                        <pre className="text-[10px] text-muted mt-1 bg-bg p-1 rounded overflow-x-auto">
                          {JSON.stringify(ev.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
