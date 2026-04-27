import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  RESOURCES,
  PROJECTS,
  getActiveProjectIds,
  getCurrentHours,
  type Role,
} from '../data/mockData';
import { ArrowRight } from 'lucide-react';

const roleFilters: Array<{ key: string; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'Product Manager', label: 'PM' },
  { key: 'UX/UI Designer', label: 'UX/UI' },
  { key: 'Developer', label: 'Dev' },
  { key: 'QA', label: 'QA' },
];

export function BenchWidget() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('All');

  const benchResources = RESOURCES.filter(
    (r) => r.status === 'bench' || r.status === 'partial' || r.status === 'ending-soon'
  );
  const filteredResources =
    activeRole === 'All'
      ? benchResources
      : benchResources.filter((r) => r.role === activeRole);

  const benchCount = RESOURCES.filter((r) => r.status === 'bench').length;
  const partialCount = RESOURCES.filter((r) => r.status === 'partial').length;
  const endingSoonCount = RESOURCES.filter((r) => r.status === 'ending-soon').length;

  return (
    <div>
      {/* Header with white background */}
      <div className="mb-3">
        <h2 style={{ fontSize: '15px', color: '#1A202C', fontWeight: '600' }}>Bench Watch</h2>
      </div>
      <div
        className="bg-white rounded-2xl"
        style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        {/* Stats Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #F7FAFC' }}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full"
                  style={{
                    fontSize: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    padding: '2px 8px',
                    fontWeight: '600',
                  }}
                >
                  {benchCount} on bench
                </span>
                <span
                  className="rounded-full"
                  style={{
                    fontSize: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#38A169',
                    padding: '2px 8px',
                    fontWeight: '600',
                  }}
                >
                  {partialCount} partial
                </span>
                <span
                  className="rounded-full"
                  style={{
                    fontSize: '10px',
                    backgroundColor: '#FFF7ED',
                    color: '#C2410C',
                    padding: '2px 8px',
                    fontWeight: '600',
                  }}
                >
                  {endingSoonCount} ending soon
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                Resources unassigned, under-utilized, or projects ending soon
              </p>
            </div>
          </div>
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
          style={{
            fontSize: '12px',
            color: '#059669',
            border: '1px solid #A7F3D0',
            backgroundColor: '#ECFDF5',
          }}
        >
          View all resources
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Role filter */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F7FAFC' }}>
        {roleFilters.map((rf) => (
          <button
            key={rf.key}
            onClick={() => setActiveRole(rf.key)}
            className="rounded-full transition-all"
            style={{
              fontSize: '11px',
              padding: '3px 12px',
              border: `1px solid ${activeRole === rf.key ? '#38A169' : '#E2E8F0'}`,
              backgroundColor: activeRole === rf.key ? '#ECFDF5' : 'transparent',
              color: activeRole === rf.key ? '#38A169' : '#718096',
              fontWeight: activeRole === rf.key ? '500' : '400',
            }}
          >
            {rf.label}
          </button>
        ))}
        <span style={{ fontSize: '11px', color: '#A0AEC0', marginLeft: 'auto' }}>
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable resource cards */}
      <div className="px-5 py-4 flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        {filteredResources.length === 0 && (
          <div
            className="flex items-center justify-center w-full py-8"
            style={{ color: '#A0AEC0', fontSize: '13px' }}
          >
            No resources on bench for this role 🎉
          </div>
        )}
        {filteredResources.map((resource) => {
          const activeProjectIds = getActiveProjectIds(resource);
          const currentHours = getCurrentHours(resource);
          const utilPct = Math.round((currentHours / resource.maxHours) * 100);

          return (
            <div
              key={resource.id}
              className="flex-shrink-0 rounded-xl p-3 flex flex-col gap-2 bg-white"
              style={{
                border: '1px solid #E2E8F0',
                width: '210px',
              }}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: resource.avatarColor, fontSize: '11px', fontWeight: '600' }}
                >
                  {resource.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="truncate"
                    style={{ fontSize: '12px', color: '#2D3748', fontWeight: '500' }}
                  >
                    {resource.name}
                  </div>
                  <div className="truncate" style={{ fontSize: '10px', color: '#A0AEC0' }}>
                    {resource.role}
                  </div>
                </div>
              </div>

              {/* Status + utilization bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  {resource.status === 'ending-soon' ? (
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span
                        className="rounded-full w-fit"
                        style={{
                          fontSize: '9px',
                          padding: '1px 7px',
                          backgroundColor: '#FFF7ED',
                          color: '#C2410C',
                          fontWeight: '600',
                        }}
                      >
                        ● Ending Soon
                      </span>
                      {resource.currentAssignments[0]?.endingSoon && (
                        <span style={{ fontSize: '8px', color: '#9CA3AF' }}>
                          {PROJECTS.find(p => p.id === resource.currentAssignments[0].projectId)?.name} ends {resource.currentAssignments[0].endDate}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span
                      className="rounded-full"
                      style={{
                        fontSize: '9px',
                        padding: '1px 7px',
                        backgroundColor: '#ECFDF5',
                        color: resource.status === 'bench' ? '#059669' : '#38A169',
                        fontWeight: '600',
                      }}
                    >
                      {resource.status === 'bench' ? '● On Bench' : `● ${currentHours}h / 40h`}
                    </span>
                  )}
                  <span style={{ fontSize: '9px', color: '#A0AEC0' }}>
                    {utilPct}% utilized
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: '4px', backgroundColor: '#E2E8F0' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${utilPct}%`,
                      backgroundColor: '#38A169',
                    }}
                  />
                </div>
              </div>

              {/* Mini sparkline chart */}
              <Sparkline
                data={resource.weeklyData}
                projectIds={activeProjectIds}
              />

              {/* Project legend */}
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {activeProjectIds.map((projectId) => {
                  const proj = PROJECTS.find((p) => p.id === projectId);
                  return (
                    <div key={`${resource.id}-legend-${projectId}`} className="flex items-center gap-1">
                      <div
                        className="rounded-full"
                        style={{ width: 6, height: 6, backgroundColor: proj?.color }}
                      />
                      <span style={{ fontSize: '9px', color: '#718096' }}>
                        {proj?.name}
                      </span>
                    </div>
                  );
                })}
                {activeProjectIds.length === 0 && (
                  <span style={{ fontSize: '9px', color: '#CBD5E0' }}>
                    No recent project history
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function Sparkline({
  data,
  projectIds,
}: {
  data: { week: string; alpha: number; beta: number; gamma: number; delta: number }[];
  projectIds: Array<'alpha' | 'beta' | 'gamma' | 'delta'>;
}) {
  const width = 180;
  const height = 58;
  const pad = 4;
  const maxY = 40;
  const xStep = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const y = (v: number) => height - pad - (Math.min(v, maxY) / maxY) * (height - pad * 2);

  if (projectIds.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#CBD5E0' }}>—</div>;
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {projectIds.map((pid) => {
        const proj = PROJECTS.find((p) => p.id === pid);
        const points = data
          .map((d, i) => `${pad + i * xStep},${y(d[pid])}`)
          .join(' ');
        return (
          <polyline
            key={pid}
            points={points}
            fill="none"
            stroke={proj?.color || '#4FD1C5'}
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}
