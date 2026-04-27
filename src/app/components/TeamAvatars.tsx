import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, TrendingDown, Zap } from 'lucide-react';

function fmtDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) {
    const [y, m, day] = parts.map((p) => parseInt(p, 10));
    const dt = new Date(y, m - 1, day);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
  }
  const dt = new Date(d);
  if (!isNaN(dt.getTime())) {
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  return d;
}

export interface TeamAvatarMember {
  name?: string;
  initials: string;
  color?: string;
  photoUrl?: string;
  upcomingBurst?: { startDate: string; endDate: string };
  upcomingDowngrade?: { effectiveDate: string; mode: 'reduce' | 'remove'; reducedHours?: number };
}

export function TeamAvatars({
  members,
  visibleCount = 4,
  size = 28,
}: {
  members: TeamAvatarMember[];
  visibleCount?: number;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const visible = members.slice(0, visibleCount);
  const hasOverflow = members.length > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="flex items-center -space-x-2">
        {visible.map((m, i) => (
          <Avatar key={`${m.initials}-${i}`} m={m} size={size} />
        ))}
        {hasOverflow && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full flex items-center justify-center"
            style={{
              width: size,
              height: size,
              backgroundColor: '#F1F5F9',
              color: '#4A5568',
              border: '2px solid white',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Show all members"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>

      {open && (
        <div
          className="rounded-lg bg-white"
          style={{
            position: 'absolute',
            top: size + 6,
            right: 0,
            minWidth: 280,
            maxHeight: 340,
            overflowY: 'auto',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #F0F0F0',
              fontSize: '11px',
              color: '#A0AEC0',
              fontWeight: '700',
              letterSpacing: '0.05em',
            }}
          >
            TEAM · {members.length}
          </div>
          {members.map((m, i) => (
            <div
              key={`${m.initials}-${i}`}
              className="flex items-center gap-3"
              style={{
                padding: '10px 14px',
                borderBottom: i < members.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <Avatar m={m} size={32} />
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: '13px',
                    color: '#1A202C',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {m.name ?? m.initials}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {m.upcomingBurst && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full"
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        backgroundColor: '#DBEAFE',
                        color: '#1D4ED8',
                        fontWeight: '600',
                      }}
                    >
                      <Zap size={9} />
                      Burst {fmtDate(m.upcomingBurst.startDate)} → {fmtDate(m.upcomingBurst.endDate)}
                    </span>
                  )}
                  {m.upcomingDowngrade && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full"
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        backgroundColor:
                          m.upcomingDowngrade.mode === 'remove' ? '#FEE2E2' : '#FFEDD5',
                        color: m.upcomingDowngrade.mode === 'remove' ? '#B91C1C' : '#C2410C',
                        fontWeight: '600',
                      }}
                    >
                      <TrendingDown size={9} />
                      {m.upcomingDowngrade.mode === 'remove'
                        ? `Off on ${fmtDate(m.upcomingDowngrade.effectiveDate)}`
                        : `→ ${m.upcomingDowngrade.reducedHours ?? '?'}h from ${fmtDate(m.upcomingDowngrade.effectiveDate)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ m, size }: { m: TeamAvatarMember; size: number }) {
  if (m.photoUrl) {
    return (
      <img
        src={m.photoUrl}
        alt={m.name ?? m.initials}
        className="rounded-full"
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          border: '2px solid white',
        }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: m.color ?? '#10B981',
        fontSize: Math.max(9, Math.round(size * 0.35)),
        fontWeight: '600',
        border: '2px solid white',
      }}
    >
      {m.initials}
    </div>
  );
}
