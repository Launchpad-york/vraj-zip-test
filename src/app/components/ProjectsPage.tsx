import { useEffect, useState } from 'react';
import { Search, ChevronDown, Plus, Compass, ExternalLink } from 'lucide-react';
import { ProjectDetail } from './ProjectDetail';
import { TeamAvatars, type TeamAvatarMember } from './TeamAvatars';
import { AVATAR_PALETTE, DEFAULT_ALLOCATIONS } from './ProjectDetail';
import {
  getAllocations,
  subscribeAllocations,
  type StoredAllocation,
} from '../data/projectAllocations';

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function rowsToMembers(rows: StoredAllocation[]): TeamAvatarMember[] {
  return rows.map((r, i) => ({
    name: r.person || r.role || 'Unassigned',
    initials: r.person ? initialsOf(r.person) : (r.role || '??').slice(0, 2).toUpperCase(),
    color: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
    upcomingBurst: r.burst && r.burst.startDate ? r.burst : undefined,
    upcomingDowngrade: r.downgrade
      ? {
          effectiveDate: r.downgrade.effectiveDate,
          mode: r.downgrade.mode,
          reducedHours: r.downgrade.reducedHours,
        }
      : undefined,
  }));
}

function cardMembers(project: Project): TeamAvatarMember[] {
  const saved = getAllocations(`${project.name}|${project.client}`);
  if (saved && saved.length > 0) return rowsToMembers(saved);

  if (project.triggered && project.assignments && project.assignments.length > 0) {
    return project.assignments.map((a, i) => ({
      name: a.resourceName || `${a.positionTitle} (hiring)`,
      initials: a.initials || a.positionTitle.slice(0, 2).toUpperCase(),
      color: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
    }));
  }
  return DEFAULT_ALLOCATIONS.map((a, i) => ({
    name: a.person,
    initials: initialsOf(a.person),
    color: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
  }));
}
import {
  getTriggeredProjects,
  subscribeTriggered,
  TriggeredProject,
} from '../data/triggeredProjects';

type Status = 'Active' | 'Inactive';

interface Project {
  shortCode: string;
  name: string;
  client: string;
  tags: string[];
  team: { initials: string; color: string }[];
  start: string;
  end: string;
  latestNote: string;
  noteDetails?: string;
  links?: string[];
  lastUpdated: string;
  bucketUtil?: boolean;
  status: Status;
  triggered?: boolean;
  hiringOpen?: number;
  assignments?: { positionTitle: string; role: string; resourceName: string; initials: string; percentage: number }[];
}

const PROJECTS: Project[] = [
  {
    shortCode: 'Hub Project',
    name: 'Hub Project',
    client: 'York IE',
    tags: ['Internal - BDR', 'Internal - BDR'],
    team: [
      { initials: 'EY', color: '#6366F1' },
      { initials: 'KP', color: '#10B981' },
      { initials: 'JG', color: '#F59E0B' },
      { initials: 'JG', color: '#8B5CF6' },
    ],
    start: 'Jan 01, 2024',
    end: 'Dec 31, 2024',
    latestNote: 'Deployed v2.1.0 to Production',
    noteDetails:
      'A mix of personalization, hiring flow, permissions, and MBO improvements in this release....',
    links: ['Production'],
    lastUpdated: 'Apr 22, 2026',
    status: 'Active',
  },
  {
    shortCode: 'GM',
    name: 'G&A Management',
    client: 'York IE',
    tags: ['External - Other'],
    team: [
      { initials: 'KP', color: '#10B981' },
      { initials: 'KP', color: '#10B981' },
      { initials: 'KP', color: '#10B981' },
      { initials: 'KP', color: '#10B981' },
    ],
    start: 'Oct 01, 2024',
    end: 'Oct 31, 2030',
    latestNote: '-',
    lastUpdated: 'Apr 22, 2026',
    status: 'Active',
  },
  {
    shortCode: 'LWM',
    name: 'Lytica Website Maintenance & Support',
    client: 'Lytica',
    tags: ['Website Retainer', 'Website Maintenance'],
    team: [
      { initials: 'JM', color: '#4A5568' },
      { initials: 'JM', color: '#4A5568' },
      { initials: 'PS', color: '#10B981' },
      { initials: 'TP', color: '#EC4899' },
    ],
    start: 'Jun 19, 2023',
    end: 'Jul 31, 2023',
    latestNote:
      '- Updated the Webinars on staging website and waiting for confirmation for moving it on live',
    links: ['Confluence'],
    lastUpdated: 'Apr 21, 2026',
    bucketUtil: true,
    status: 'Active',
  },
  {
    shortCode: 'FWM',
    name: 'FreightWise Website Maintenance & Support',
    client: 'FreightWise',
    tags: ['Website Maintenance'],
    team: [
      { initials: 'JM', color: '#4A5568' },
      { initials: 'JM', color: '#4A5568' },
      { initials: 'PS', color: '#10B981' },
      { initials: 'PC', color: '#F59E0B' },
    ],
    start: 'Sep 02, 2025',
    end: 'Aug 31, 2026',
    latestNote: 'Plugin Updates for all FW domains will start at the start of next month.',
    lastUpdated: 'Apr 20, 2026',
    bucketUtil: true,
    status: 'Active',
  },
  {
    shortCode: 'Network to Code (NTC) Website Maintenance & Support',
    name: 'Network to Code (NTC) Website Maintenance & Support',
    client: 'Network to Code',
    tags: ['Website Project'],
    team: [
      { initials: 'JM', color: '#4A5568' },
      { initials: 'JM', color: '#4A5568' },
      { initials: 'PS', color: '#10B981' },
      { initials: 'PS', color: '#10B981' },
    ],
    start: 'Apr 20, 2024',
    end: 'May 01, 2025',
    latestNote: 'Nautobot Pillar Page is in progress.',
    links: ['Confluence', 'Jira'],
    lastUpdated: 'Apr 17, 2026',
    bucketUtil: true,
    status: 'Active',
  },
];

function triggeredToProject(t: TriggeredProject): Project {
  return {
    shortCode: t.shortCode,
    name: t.name,
    client: t.client,
    tags: t.tags,
    team: t.team,
    start: t.start,
    end: t.end,
    latestNote: t.latestNote,
    lastUpdated: t.lastUpdated,
    status: t.status,
    triggered: true,
    hiringOpen: t.hiringOpen,
    assignments: t.assignments,
  };
}

export function ProjectsPage() {
  const [status, setStatus] = useState<Status>('Active');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [triggered, setTriggered] = useState<TriggeredProject[]>(() => getTriggeredProjects());

  useEffect(() => subscribeTriggered(() => setTriggered(getTriggeredProjects())), []);
  const [, setAllocTick] = useState(0);
  useEffect(() => subscribeAllocations(() => setAllocTick((t) => t + 1)), []);

  const allProjects: Project[] = [...triggered.map(triggeredToProject), ...PROJECTS];

  const filtered = allProjects.filter(
    (p) =>
      p.status === status &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    const prefilled =
      selected.triggered && selected.assignments
        ? selected.assignments.map((a) => ({
            role: `${a.positionTitle} (${a.role})`,
            person: a.resourceName,
            hours: Math.round((a.percentage / 100) * 40),
            isHiring: a.isHiring,
          }))
        : undefined;
    return (
      <ProjectDetail
        project={{ ...selected, triggered: selected.triggered, prefilledAllocations: prefilled }}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600' }}>Projects</h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-lg bg-white"
            style={{
              fontSize: '13px',
              color: '#4A5568',
              fontWeight: '500',
              padding: '8px 14px',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            <Compass size={13} />
            Take a tour
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg"
            style={{
              fontSize: '13px',
              color: 'white',
              fontWeight: '600',
              padding: '9px 16px',
              backgroundColor: '#10B981',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16,185,129,0.3)',
            }}
          >
            <Plus size={13} />
            Create Project
          </button>
        </div>
      </div>

      {/* Search + status toggle */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center gap-2 rounded-lg bg-white flex-1"
          style={{ border: '1px solid #E2E8F0', padding: '9px 14px' }}
        >
          <Search size={14} color="#A0AEC0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{
              fontSize: '13px',
              outline: 'none',
              border: 'none',
              background: 'transparent',
              width: '100%',
              color: '#2D3748',
            }}
          />
        </div>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid #E2E8F0', backgroundColor: 'white' }}
        >
          {(['Active', 'Inactive'] as Status[]).map((s) => {
            const isActive = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '8px 18px',
                  backgroundColor: isActive ? '#10B981' : 'white',
                  color: isActive ? 'white' : '#4A5568',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter row */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <FilterSelect label="All Statuses" />
        <FilterSelect label="All Dev Principals" />
        <FilterSelect label="All Managers" />
        <FilterSelect label="All Leads" />
        <FilterSelect label="All Departments" />
      </div>

      <p style={{ fontSize: '12px', color: '#718096', marginBottom: '14px' }}>
        Showing {filtered.length} projects
      </p>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <ProjectCard key={p.name + p.client} project={p} onSelect={() => setSelected(p)} />
        ))}
      </div>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg bg-white"
      style={{ border: '1px solid #E2E8F0', padding: '8px 12px' }}
    >
      <span style={{ fontSize: '13px', color: '#4A5568' }}>{label}</span>
      <ChevronDown size={13} color="#A0AEC0" />
    </div>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: () => void }) {
  const initials =
    project.shortCode.length <= 4
      ? project.shortCode
      : project.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();

  return (
    <div
      className="bg-white rounded-xl"
      style={{ border: '1px solid #E2E8F0', padding: '18px 20px' }}
    >
      {/* Top */}
      <div className="flex items-start gap-4">
        <div
          className="rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            fontSize: '13px',
            fontWeight: '700',
          }}
        >
          {initials.slice(0, 3)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: '15px', color: '#1A202C', fontWeight: '600' }}>
              {project.name} - {project.client}
            </span>
            <a
              onClick={onSelect}
              style={{ fontSize: '12px', color: '#10B981', fontWeight: '500', cursor: 'pointer' }}
            >
              View Details
            </a>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {project.tags.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="rounded"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  fontWeight: '500',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <TeamAvatars members={cardMembers(project)} visibleCount={4} size={28} />
          <div className="flex items-center gap-4" style={{ fontSize: '12px' }}>
            <div>
              <span style={{ color: '#718096' }}>Start: </span>
              <span style={{ color: '#1A202C', fontWeight: '500' }}>{project.start}</span>
            </div>
            <div>
              <span style={{ color: '#718096' }}>End: </span>
              <span style={{ color: '#1A202C', fontWeight: '500' }}>{project.end}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '14px 0' }} />


      {/* Note + Links */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
            Latest Note:
          </div>
          <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginBottom: '4px' }}>
            {project.latestNote}
          </div>
          {project.noteDetails && (
            <>
              <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginTop: '6px' }}>
                Includes
              </div>
              <p style={{ fontSize: '12px', color: '#4A5568', marginTop: '4px', lineHeight: '1.5' }}>
                {project.noteDetails}
              </p>
              <a
                style={{
                  fontSize: '12px',
                  color: '#10B981',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-block',
                  marginTop: '4px',
                }}
              >
                View full note
              </a>
            </>
          )}
        </div>
        {project.links && project.links.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '6px' }}>Links</div>
            <div className="flex flex-col gap-1">
              {project.links.map((l) => (
                <a
                  key={l}
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '12px',
                    color: '#10B981',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={11} />
                  {l}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4" style={{ borderTop: '1px solid #F0F0F0', paddingTop: '10px' }}>
        <span style={{ fontSize: '11px', color: '#A0AEC0' }}>
          Last Updated: {project.lastUpdated}
        </span>
        {project.bucketUtil && (
          <a style={{ fontSize: '12px', color: '#10B981', fontWeight: '500', cursor: 'pointer' }}>
            Show Bucket Utilization
          </a>
        )}
      </div>
    </div>
  );
}
