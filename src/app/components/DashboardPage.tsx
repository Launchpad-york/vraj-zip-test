import { BenchWidget } from './BenchWidget';

export function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl">
      {/* Greeting */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: '24px', color: '#1A202C', marginBottom: '4px' }}>
            Good Evening, Shreya
          </h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>
            Late nights build early successes.
          </p>
        </div>
        <button
          className="px-3 py-1.5 rounded-lg"
          style={{ fontSize: '12px', color: '#38A169', border: '1px solid #A7F3D0', backgroundColor: 'white' }}
        >
          Personalize home
        </button>
      </div>

      {/* Announcements + Today's Meeting */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Left – Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '15px', color: '#1A202C', fontWeight: '600' }}>Announcements</h2>
          </div>
          <div className="space-y-3">
            <div
              className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div style={{ fontSize: '14px', color: '#2D3748', fontWeight: '500' }}>
                  Guess what's back...👀
                </div>
                <button style={{ fontSize: '11px', color: '#38A169' }}>Open</button>
              </div>
              <div className="flex items-center gap-3">
                {[['🏓', 45], ['🔥', 20], ['🥳', 12], ['🤩', 7], ['😶', 1]].map(
                  ([emoji, count]) => (
                    <div key={String(emoji)} className="flex items-center gap-1">
                      <span style={{ fontSize: '14px' }}>{emoji}</span>
                      <span style={{ fontSize: '11px', color: '#718096' }}>{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div
              className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div style={{ fontSize: '14px', color: '#2D3748', fontWeight: '500' }}>
                  Introducing – York Proud Moments!
                </div>
                <button style={{ fontSize: '11px', color: '#38A169' }}>Open</button>
              </div>
              <div className="flex items-center gap-3">
                {[['👏', 55], ['❤️', 30], ['👍', 21], ['🥰', 18]].map(([emoji, count]) => (
                  <div key={String(emoji)} className="flex items-center gap-1">
                    <span style={{ fontSize: '14px' }}>{emoji}</span>
                    <span style={{ fontSize: '11px', color: '#718096' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right – Today's Meeting */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '15px', color: '#1A202C', fontWeight: '600' }}>Today's Meeting</h2>
          </div>
          <div
            className="bg-white rounded-xl p-4"
            style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontSize: '12px', color: '#38A169', marginBottom: '12px', fontWeight: '500' }}>
              21st Apr
            </div>
            <div className="space-y-3">
              {[
                { title: 'York HUB Demo', time: '11:30 AM – 1:00 PM' },
                { title: 'Hub demo', time: '2:00 PM – 3:00 PM' },
                { title: 'Gaurav / Shreya', time: '4:30 PM – 5:00 PM' },
                { title: 'Eastface-2nd-Dalalstreet (4)', time: '' },
              ].map((meeting, idx, arr) => (
                <div
                  key={meeting.title}
                  className={idx < arr.length - 1 ? 'pb-3' : ''}
                  style={
                    idx < arr.length - 1 ? { borderBottom: '1px solid #F0FFF4' } : {}
                  }
                >
                  <div style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>{meeting.title}</div>
                  {meeting.time && (
                    <div style={{ fontSize: '12px', color: '#A0AEC0' }}>{meeting.time}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bench Watch Widget */}
      <BenchWidget />
    </div>
  );
}
