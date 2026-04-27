import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  addTriggeredProject,
  getTriggeredProjects,
  subscribeTriggered,
  type TriggeredProject,
} from '../data/triggeredProjects';
import { getSelectedVersion, subscribeVersions } from '../data/quotationVersions';
import {
  Search,
  X,
  Calendar,
  Users,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Briefcase,
  Plus,
  Check,
  Lock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Trash2,
  AlertTriangle,
  Settings,
} from 'lucide-react';

const SKILL_LIBRARY = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'Postgres', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Figma', 'Sketch', 'UX Research', 'UI Design', 'Prototyping',
  'Cypress', 'Jest', 'Playwright', 'Selenium', 'QA Automation',
  'SEO', 'Analytics', 'Google Ads', 'HubSpot', 'Salesforce',
  'Go', 'Rust', 'Swift', 'Kotlin', 'React Native',
  'AWS Amplify', 'Lambda', 'S3', 'DynamoDB',
  'Tailwind CSS', 'Sass', 'CSS-in-JS',
  'AI/ML', 'LangChain', 'OpenAI API',
];

interface Position {
  id: string;
  title: string;
  role: string;
  skills: string[];
  percentage: number;
  hoursPerWeek?: number;
  hoursPerMonth?: number;
}

interface ReadyProject {
  id: string;
  name: string;
  client: string;
  version: string;
  confidence: number;
  totalValue: number;
  positions: Position[];
}

interface BenchResource {
  id: string;
  name: string;
  initials: string;
  role: string;
  skills: string[];
  availableFrom: string; // ISO date
  experience: string;
  utilization: number;
  onLeaveFrom?: string; // ISO date
  onLeaveUntil?: string; // ISO date
}

const READY: ReadyProject[] = [
  {
    id: 'Q-SER',
    name: 'Serenity GTM Subscription',
    client: 'Serenity',
    version: 'Default Version',
    confidence: 100,
    totalValue: 10700,
    positions: [
      { id: 'p1', title: 'Dev Support', role: 'Full Stack', skills: ['React', 'Node.js'], percentage: 25 },
      { id: 'p2', title: 'SEO/AEO', role: 'RevOps Specialist', skills: ['SEO', 'Analytics'], percentage: 100 },
      { id: 'p3', title: 'QA', role: 'Quality Assurance', skills: ['Cypress', 'Jest'], percentage: 25 },
      { id: 'p4', title: 'UX', role: 'User Experience Designer', skills: ['Figma'], percentage: 25 },
    ],
  },
  {
    id: 'Q-CHI',
    name: 'Chirpyest 2nd Engineer',
    client: 'Chirpyest',
    version: 'Current Team (4/1/26)',
    confidence: 100,
    totalValue: 9700,
    positions: [
      { id: 'p1', title: 'Backend Engineer', role: 'Backend', skills: ['Node.js', 'Postgres'], percentage: 100 },
      { id: 'p2', title: 'QA Support', role: 'Quality Assurance', skills: ['Playwright'], percentage: 50 },
    ],
  },
  {
    id: 'Q-COA',
    name: 'Coachmetrix',
    client: 'Coachmetrix',
    version: 'Current July 2025',
    confidence: 90,
    totalValue: 4900,
    positions: [
      { id: 'p1', title: 'Full Stack Engineer', role: 'Full Stack', skills: ['React', 'Django'], percentage: 50 },
      { id: 'p2', title: 'DevOps', role: 'DevOps', skills: ['AWS', 'Terraform'], percentage: 25 },
    ],
  },
];

const PAST_PROJECTS: Record<string, { name: string; role: string; period: string; impact: string }[]> = {
  r1: [
    { name: 'Hub Project', role: 'Full Stack Engineer', period: 'Jan 2024 – Mar 2026', impact: 'Owned personalization + widget framework; shipped v2.0 release' },
    { name: 'Lytica Website', role: 'Full Stack Engineer', period: 'Jun 2023 – Dec 2023', impact: 'Migrated CMS to Next.js, 40% faster page loads' },
  ],
  r2: [
    { name: 'FreightWise QA', role: 'QA Lead', period: 'Sep 2025 – Apr 2026', impact: 'Introduced Playwright regression suite; 3× fewer hotfixes' },
    { name: 'Internal BDR tool', role: 'QA Engineer', period: 'Jan 2023 – Aug 2025', impact: 'Authored >300 E2E tests across 4 modules' },
  ],
  r3: [
    { name: 'Coachmetrix RevOps', role: 'RevOps Specialist', period: 'Nov 2024 – Feb 2026', impact: 'Rebuilt attribution funnel; +22% MQL-to-SQL rate' },
  ],
  r4: [
    { name: 'Network to Code Platform', role: 'Backend Engineer', period: 'Apr 2024 – May 2025', impact: 'Re-architected job runner; throughput up 5×' },
    { name: 'Hub Platform', role: 'Backend Engineer', period: 'Jan 2022 – Mar 2024', impact: 'RBAC + audit logging subsystems' },
  ],
  r5: [
    { name: 'Lytica Portal', role: 'Full Stack Engineer', period: 'Feb 2023 – Jan 2026', impact: 'TypeScript migration, UI design system rollout' },
  ],
  r6: [
    { name: 'Hub UX Refresh', role: 'UX Designer', period: 'Jun 2024 – Apr 2026', impact: 'Dashboard + onboarding redesign adopted org-wide' },
    { name: 'G&A Management', role: 'UX Designer', period: 'Oct 2023 – May 2024', impact: 'Admin UX overhaul, NPS +18' },
  ],
  r7: [
    { name: 'FreightWise Platform', role: 'Backend Engineer', period: 'Sep 2025 – Apr 2026', impact: 'Caching layer; p95 latency cut in half' },
  ],
  r8: [
    { name: 'Hub Frontend', role: 'Frontend Engineer', period: 'Feb 2024 – Apr 2026', impact: 'Tailwind design tokens + component library maintenance' },
  ],
};

const BENCH: BenchResource[] = [
  { id: 'r1', name: 'Jenish Gohil', initials: 'JG', role: 'Full Stack', skills: ['React', 'Node.js', 'AWS'], availableFrom: '2026-04-20', experience: '5 yrs', utilization: 0, onLeaveFrom: '2026-05-10', onLeaveUntil: '2026-05-24' },
  { id: 'r2', name: 'Jiyanshi Patel', initials: 'JP', role: 'Quality Assurance', skills: ['Cypress', 'Jest', 'Playwright'], availableFrom: '2026-04-25', experience: '3 yrs', utilization: 0, onLeaveFrom: '2026-04-30', onLeaveUntil: '2026-05-09' },
  { id: 'r3', name: 'Bhumika Udani', initials: 'BU', role: 'RevOps Specialist', skills: ['SEO', 'Analytics'], availableFrom: '2026-05-10', experience: '4 yrs', utilization: 20 },
  { id: 'r4', name: 'Bryan Belanger', initials: 'BB', role: 'Backend', skills: ['Node.js', 'Postgres'], availableFrom: '2026-05-01', experience: '6 yrs', utilization: 50, onLeaveFrom: '2026-05-18', onLeaveUntil: '2026-05-25' },
  { id: 'r5', name: 'Shreya Gokani', initials: 'SG', role: 'Full Stack', skills: ['React', 'TypeScript'], availableFrom: '2026-06-01', experience: '7 yrs', utilization: 100 },
  { id: 'r6', name: 'Kalrav Parsana', initials: 'KP', role: 'User Experience Designer', skills: ['Figma', 'UX Research'], availableFrom: '2026-05-15', experience: '8 yrs', utilization: 80 },
  { id: 'r7', name: 'Jaydip Makwana', initials: 'JM', role: 'Backend', skills: ['Node.js', 'Postgres', 'Redis'], availableFrom: '2026-05-20', experience: '4 yrs', utilization: 100 },
  { id: 'r8', name: 'Khushi Vyas', initials: 'KV', role: 'Frontend', skills: ['React', 'Tailwind CSS'], availableFrom: '2026-04-28', experience: '2 yrs', utilization: 20, onLeaveFrom: '2026-05-05', onLeaveUntil: '2026-05-16' },
];

const fmtMoney = (n: number) => `$${n.toLocaleString()}`;
const today = '2026-04-23';

// Standard hours for allocation calculations
const STANDARD_HOURS_PER_WEEK = 40;
const STANDARD_HOURS_PER_MONTH = 160; // 40 hours * 4 weeks

function percentageToHoursPerWeek(percentage: number): number {
  return (percentage / 100) * STANDARD_HOURS_PER_WEEK;
}

function percentageToHoursPerMonth(percentage: number): number {
  return (percentage / 100) * STANDARD_HOURS_PER_MONTH;
}

function hoursPerWeekToPercentage(hours: number): number {
  return (hours / STANDARD_HOURS_PER_WEEK) * 100;
}

function hoursPerMonthToPercentage(hours: number): number {
  return (hours / STANDARD_HOURS_PER_MONTH) * 100;
}

function hoursPerWeekToHoursPerMonth(hours: number): number {
  return hours * 4;
}

function hoursPerMonthToHoursPerWeek(hours: number): number {
  return hours / 4;
}

function isOnLeaveSoon(resource: BenchResource, withinDays = 28): boolean {
  if (!resource.onLeaveFrom) return false;
  const leaveDate = new Date(resource.onLeaveFrom);
  const currentDate = new Date(today);
  const diffTime = leaveDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= withinDays;
}

function getDaysUntilLeave(resource: BenchResource): number {
  if (!resource.onLeaveFrom) return -1;
  const leaveDate = new Date(resource.onLeaveFrom);
  const currentDate = new Date(today);
  const diffTime = leaveDate.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

type HiringStage = 'Requested' | 'Sourcing' | 'Interviewing' | 'Offer' | 'Hired';
const HIRING_STAGES: HiringStage[] = [
  'Requested',
  'Sourcing',
  'Interviewing',
  'Offer',
  'Hired',
];

interface Recruiter {
  id: string;
  name: string;
  initials: string;
  role: string;
}
const RECRUITERS: Recruiter[] = [
  { id: 'rc1', name: 'Priya Shah', initials: 'PS', role: 'Talent Lead' },
  { id: 'rc2', name: 'Arun Mehta', initials: 'AM', role: 'Sr. Recruiter' },
  { id: 'rc3', name: 'Meera Iyer', initials: 'MI', role: 'Recruiter' },
];

interface ResourceAssignment {
  resourceId: string;
  hoursPerWeek: number;
}

interface ProjectAllocation {
  assignments: Record<string, ResourceAssignment[]>; // positionId -> ResourceAssignment[]
  hiring: Record<string, boolean>;
}

export function ResourcePlanningPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ReadyProject | null>(null);
  const [allocations, setAllocations] = useState<Record<string, ProjectAllocation>>({});
  const [triggeredIds, setTriggeredIds] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'ready' | 'active'>('ready');
  const [activeProjects, setActiveProjects] = useState<TriggeredProject[]>([]);
  const [selectedActiveProject, setSelectedActiveProject] = useState<TriggeredProject | null>(null);
  const [activeProjectAction, setActiveProjectAction] = useState<'burst' | 'downgrade' | undefined>(undefined);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [versionUpdate, setVersionUpdate] = useState(0);

  useEffect(() => {
    setActiveProjects(getTriggeredProjects());
    const unsub = subscribeTriggered(() => {
      setActiveProjects(getTriggeredProjects());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeVersions(() => {
      setVersionUpdate((v) => v + 1);
    });
    return unsub;
  }, []);

  const filtered = READY.filter((p) =>
    (p.name + ' ' + p.client).toLowerCase().includes(search.toLowerCase()) &&
    p.confidence >= confidenceThreshold
  );

  const filteredActive = activeProjects.filter((p) =>
    (p.name + ' ' + p.client).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600' }}>
              Resource Planning
            </h1>
            <p style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
              Manage allocations for ready and active projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-lg bg-white"
              style={{ border: '1px solid #E2E8F0', padding: '8px 12px', width: 320 }}
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
            <button
              onClick={() => setShowThresholdSettings(true)}
              title="Configure confidence threshold"
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                border: '1px solid #E2E8F0',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <Settings size={18} color="#718096" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setView('ready')}
            className="flex items-center gap-2 rounded-lg"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: view === 'ready' ? '#ECFDF5' : 'white',
              color: view === 'ready' ? '#059669' : '#718096',
              border: `1px solid ${view === 'ready' ? '#A7F3D0' : '#E2E8F0'}`,
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={14} />
            Ready to Allocate ({READY.filter((r) => r.confidence >= confidenceThreshold).length})
          </button>
          <button
            onClick={() => setView('active')}
            className="flex items-center gap-2 rounded-lg"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: view === 'active' ? '#ECFDF5' : 'white',
              color: view === 'active' ? '#059669' : '#718096',
              border: `1px solid ${view === 'active' ? '#A7F3D0' : '#E2E8F0'}`,
              cursor: 'pointer',
            }}
          >
            <Briefcase size={14} />
            Active Projects ({activeProjects.length})
          </button>
        </div>

        {/* KPI row */}
        {view === 'ready' && (
          <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Kpi
              Icon={CheckCircle2}
              label="Ready to Allocate"
              value={String(READY.filter((r) => r.confidence === 100).length)}
              tint="#10B981"
            />
            <Kpi Icon={Briefcase} label="Open Positions" value={String(totalPositions(READY))} tint="#10B981" />
            <Kpi Icon={Users} label="Bench Resources" value={String(BENCH.filter((b) => b.utilization === 0).length)} tint="#10B981" />
            <Kpi
              Icon={UserPlus}
              label="Pending Hiring"
              value="2"
              tint="#10B981"
            />
          </div>
        )}

        {/* Table */}
        {view === 'ready' ? (
          <div
            className="bg-white rounded-xl"
            style={{ border: '1px solid #E2E8F0', overflowX: 'auto' }}
          >
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1180 }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
                  <Th>Project</Th>
                  <Th>Client</Th>
                  <Th>Version</Th>
                  <Th>Confidence</Th>
                  <Th>Positions</Th>
                  <Th>Assigned</Th>
                  <Th>Hiring</Th>
                  <Th align="right">Value</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const canAllocate = p.confidence >= confidenceThreshold;
                  const alloc = allocations[p.id];
                  const assignedIds = alloc
                    ? Object.values(alloc.assignments).flat().filter(Boolean)
                    : [];
                  const assignedResources = assignedIds
                    .map((id) => BENCH.find((b) => b.id === id))
                    .filter(Boolean) as BenchResource[];
                  const hiringCount = alloc
                    ? Object.values(alloc.hiring).filter(Boolean).length
                    : 0;
                  const versionData = getSelectedVersion(p.name);
                  const displayVersion = versionData?.selectedVersion || p.version;
                  const displayValue = versionData?.totalValue || p.totalValue;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <Td>
                        <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
                          {p.name}
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '13px', color: '#4A5568' }}>{p.client}</span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '12px', color: '#4A5568' }}>{displayVersion}</span>
                      </Td>
                      <Td>
                        <ConfidencePill value={p.confidence} />
                      </Td>
                      <Td>
                        <span
                          className="rounded-full"
                          style={{
                            fontSize: '11px',
                            padding: '3px 9px',
                            backgroundColor: '#EEF2FF',
                            color: '#3730A3',
                            fontWeight: '600',
                          }}
                        >
                          {p.positions.length} positions
                        </span>
                      </Td>
                      <Td>
                        {assignedResources.length === 0 ? (
                          <span style={{ fontSize: '12px', color: '#A0AEC0' }}>—</span>
                        ) : (
                          <div className="flex items-center -space-x-2">
                            {assignedResources.slice(0, 4).map((r) => (
                              <div
                                key={r.id}
                                title={`${r.name} · ${r.role}`}
                                className="rounded-full flex items-center justify-center text-white"
                                style={{
                                  width: 26,
                                  height: 26,
                                  backgroundColor: '#10B981',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  border: '2px solid white',
                                }}
                              >
                                {r.initials}
                              </div>
                            ))}
                            {assignedResources.length > 4 && (
                              <div
                                className="rounded-full flex items-center justify-center"
                                style={{
                                  width: 26,
                                  height: 26,
                                  backgroundColor: '#F1F5F9',
                                  color: '#4A5568',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  border: '2px solid white',
                                }}
                              >
                                +{assignedResources.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td>
                        {hiringCount === 0 ? (
                          <span style={{ fontSize: '12px', color: '#A0AEC0' }}>—</span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full"
                            style={{
                              fontSize: '11px',
                              padding: '3px 9px',
                              backgroundColor: '#FFFBEB',
                              color: '#B45309',
                              fontWeight: '600',
                            }}
                          >
                            <UserPlus size={11} />
                            {hiringCount} open
                          </span>
                        )}
                      </Td>
                      <Td align="right">
                        <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
                          {fmtMoney(displayValue)}
                        </span>
                      </Td>
                      <Td align="right">
                        <button
                          onClick={() => setSelected(p)}
                          disabled={!canAllocate}
                          className="flex items-center gap-1.5 rounded-md ml-auto"
                          style={{
                            fontSize: '12px',
                            color: canAllocate ? 'white' : '#A0AEC0',
                            fontWeight: '600',
                            padding: '7px 14px',
                            backgroundColor: canAllocate ? '#10B981' : '#F1F5F9',
                            border: 'none',
                            cursor: canAllocate ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {canAllocate ? (alloc ? 'Edit Allocation' : 'Allocate') : 'Not Ready'}
                          {canAllocate && <ChevronRight size={12} />}
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl"
            style={{ border: '1px solid #E2E8F0', overflowX: 'auto' }}
          >
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
                  <Th>Project</Th>
                  <Th>Client</Th>
                  <Th>Team</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#A0AEC0' }}>
                        No active projects yet. Trigger a quotation from the "Ready to Allocate" tab.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActive.map((p) => {
                    const activeAssignments = p.assignments.filter((a) => a.resourceName);
                    return (
                      <tr
                        key={p.shortCode}
                        onClick={() => {
                          setSelectedActiveProject(p);
                          setActiveProjectAction(undefined);
                        }}
                        style={{
                          borderBottom: '1px solid #F0F0F0',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                      <Td>
                        <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                          {p.shortCode}
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '13px', color: '#4A5568' }}>{p.client}</span>
                      </Td>
                      <Td>
                        {activeAssignments.length === 0 ? (
                          <span style={{ fontSize: '12px', color: '#A0AEC0' }}>—</span>
                        ) : (
                          <div className="flex items-center -space-x-2">
                            {activeAssignments.slice(0, 4).map((a, i) => (
                              <div
                                key={i}
                                title={`${a.resourceName} · ${a.role}`}
                                className="rounded-full flex items-center justify-center text-white"
                                style={{
                                  width: 26,
                                  height: 26,
                                  backgroundColor: '#10B981',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  border: '2px solid white',
                                }}
                              >
                                {a.initials}
                              </div>
                            ))}
                            {activeAssignments.length > 4 && (
                              <div
                                className="rounded-full flex items-center justify-center"
                                style={{
                                  width: 26,
                                  height: 26,
                                  backgroundColor: '#F1F5F9',
                                  color: '#4A5568',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  border: '2px solid white',
                                }}
                              >
                                +{activeAssignments.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td align="center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActiveProject(p);
                              setActiveProjectAction('downgrade');
                            }}
                            title="Schedule downgrade"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <TrendingDown size={16} color="#64748B" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActiveProject(p);
                              setActiveProjectAction('burst');
                            }}
                            title="Add burst resource"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Zap size={16} color="#64748B" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <AllocationDrawer
          project={selected}
          initial={allocations[selected.id]}
          locked={!!triggeredIds[selected.id]}
          consideredElsewhere={(() => {
            const map: Record<string, { projectId: string; projectName: string }[]> = {};
            Object.entries(allocations).forEach(([pid, alloc]) => {
              if (pid === selected.id) return;
              if (triggeredIds[pid]) return;
              const proj = READY.find((p) => p.id === pid);
              if (!proj) return;
              Object.values(alloc.assignments).forEach((assignments) => {
                if (!assignments || !Array.isArray(assignments)) return;
                assignments.forEach((assignment) => {
                  if (!assignment || !assignment.resourceId) return;
                  (map[assignment.resourceId] ||= []).push({ projectId: pid, projectName: proj.name });
                });
              });
            });
            return map;
          })()}
          onClose={() => setSelected(null)}
          onConfirm={(next) => {
            setAllocations((a) => ({ ...a, [selected.id]: next }));
            setSelected(null);
          }}
          onTrigger={(next, allPositions) => {
            setAllocations((a) => ({ ...a, [selected.id]: next }));
            setTriggeredIds((t) => ({ ...t, [selected.id]: true }));
            const assignmentList: any[] = [];
            allPositions.forEach((pos) => {
              const resourceAssignments = next.assignments[pos.id] ?? [];
              if (resourceAssignments.length > 0) {
                resourceAssignments.forEach((assignment) => {
                  const r = BENCH.find((b) => b.id === assignment.resourceId);
                  if (r) {
                    assignmentList.push({
                      positionTitle: pos.title,
                      role: pos.role,
                      resourceName: r.name,
                      initials: r.initials,
                      percentage: pos.percentage,
                      isHiring: false,
                    });
                  }
                });
              } else if (next.hiring[pos.id]) {
                assignmentList.push({
                  positionTitle: pos.title,
                  role: pos.role,
                  resourceName: '',
                  initials: '',
                  percentage: pos.percentage,
                  isHiring: true,
                });
              }
            });
            addTriggeredProject({
              shortCode: selected.id,
              name: selected.name,
              client: selected.client,
              tags: [],
              team: [],
              start: '',
              end: '',
              latestNote: '',
              lastUpdated: today,
              status: 'Active',
              assignments: assignmentList,
              hiringOpen: Object.values(next.hiring).filter(Boolean).length,
            });
            setSelected(null);
            navigate('/projects');
          }}
        />
      )}

      {selectedActiveProject && (
        <ActiveProjectDrawer
          project={selectedActiveProject}
          initialAction={activeProjectAction}
          onClose={() => {
            setSelectedActiveProject(null);
            setActiveProjectAction(undefined);
          }}
        />
      )}

      {showThresholdSettings && (
        <ThresholdSettingsModal
          threshold={confidenceThreshold}
          onClose={() => setShowThresholdSettings(false)}
          onSave={(newThreshold) => {
            setConfidenceThreshold(newThreshold);
            setShowThresholdSettings(false);
          }}
        />
      )}
    </div>
  );
}

function totalPositions(list: ReadyProject[]) {
  return list.reduce((s, p) => s + p.positions.length, 0);
}

/* ------------------------- Leave Calendar Badge ------------------------- */

function LeaveCalendarBadge({
  resource,
  daysUntilLeave,
  size = 'small'
}: {
  resource: BenchResource;
  daysUntilLeave: number;
  size?: 'small' | 'medium';
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!resource.onLeaveFrom) return null;

  const leaveStart = new Date(resource.onLeaveFrom);
  const leaveEnd = resource.onLeaveUntil ? new Date(resource.onLeaveUntil) : leaveStart;

  // Initialize with the month containing the leave start date
  const [displayMonth, setDisplayMonth] = useState(leaveStart.getMonth());
  const [displayYear, setDisplayYear] = useState(leaveStart.getFullYear());

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCalendar]);

  // Toggle calendar and reset to leave start month when opened
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showCalendar) {
      setDisplayMonth(leaveStart.getMonth());
      setDisplayYear(leaveStart.getFullYear());
    }
    setShowCalendar(!showCalendar);
  };

  // Get first day of the month
  const firstDay = new Date(displayYear, displayMonth, 1);
  const lastDay = new Date(displayYear, displayMonth + 1, 0);

  // Get the day of week for the first day (0 = Sunday)
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const daysInMonth = lastDay.getDate();
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isDateInLeaveRange = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    return date >= leaveStart && date <= leaveEnd;
  };

  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const sizeStyles = size === 'medium'
    ? { fontSize: '11px', padding: '2px 7px', dotSize: '5px' }
    : { fontSize: '10px', padding: '1px 6px', dotSize: '5px' };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={handleBadgeClick}
        className="rounded flex items-center gap-1"
        style={{
          fontSize: sizeStyles.fontSize,
          color: '#991B1B',
          fontWeight: '600',
          padding: sizeStyles.padding,
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: '50%',
            backgroundColor: '#DC2626',
          }}
        />
        {daysUntilLeave}d
      </span>

      {showCalendar && (
        <div style={{ position: 'relative' }}>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #E2E8F0',
              zIndex: 1001,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid white',
              zIndex: 1002,
            }}
          />
          <div
            className="rounded-lg bg-white"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #E2E8F0',
              padding: '12px',
              minWidth: '240px',
            }}
          >
          {/* Month navigation header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousMonth();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#718096',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A202C', textAlign: 'center', flex: 1 }}>
              {monthNames[displayMonth]} {displayYear}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextMonth();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#718096',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div
                key={i}
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#A0AEC0',
                  textAlign: 'center',
                  padding: '2px',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {calendarDays.map((day, i) => {
              const isLeaveDay = day !== null && isDateInLeaveRange(day);
              return (
                <div
                  key={i}
                  style={{
                    fontSize: '11px',
                    textAlign: 'center',
                    padding: '6px 4px',
                    borderRadius: '4px',
                    backgroundColor: isLeaveDay ? '#FEE2E2' : 'transparent',
                    color: day === null ? 'transparent' : isLeaveDay ? '#991B1B' : '#4A5568',
                    fontWeight: isLeaveDay ? '600' : '400',
                    border: isLeaveDay ? '1px solid #FCA5A5' : 'none',
                  }}
                >
                  {day ?? '-'}
                </div>
              );
            })}
          </div>

            <div
              style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #F0F0F0',
                fontSize: '10px',
                color: '#718096',
                textAlign: 'center',
              }}
            >
              {leaveStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {leaveEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Helper Components ------------------------- */

function AllocField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#4A5568', marginBottom: '6px', fontWeight: '500' }}>
        {label}
      </div>
      <div
        className="flex items-center justify-between rounded-lg bg-white"
        style={{ border: '1px solid #E2E8F0', padding: '10px 14px' }}
      >
        <span style={{ fontSize: '13px', color: '#1A202C' }}>{value}</span>
        <ChevronDown size={14} color="#A0AEC0" />
      </div>
    </div>
  );
}

function ScenarioSummary({ rows }: { rows: AllocationRow[] }) {
  const downgrades = rows.filter((r) => r.downgrade);
  const bursts = rows.filter((r) => r.burst);
  if (downgrades.length === 0 && bursts.length === 0) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg mb-4"
      style={{
        backgroundColor: '#FFF7ED',
        border: '1px solid #FED7AA',
        padding: '10px 14px',
      }}
    >
      <AlertTriangle size={15} color="#C2410C" />
      <div style={{ fontSize: '12px', color: '#9A3412', fontWeight: '600' }}>
        Capacity changes scheduled
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {downgrades.length > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              fontWeight: '600',
            }}
          >
            <TrendingDown size={11} />
            {downgrades.length} downgrade{downgrades.length > 1 ? 's' : ''}
          </span>
        )}
        {bursts.length > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              fontWeight: '600',
            }}
          >
            <Zap size={11} />
            {bursts.length} burst{bursts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Threshold Settings Modal ------------------------- */

function ThresholdSettingsModal({
  threshold,
  onClose,
  onSave,
}: {
  threshold: number;
  onClose: () => void;
  onSave: (threshold: number) => void;
}) {
  const [value, setValue] = useState(threshold);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 950, padding: '24px' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl"
        style={{
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '24px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings size={20} color="#1A202C" />
            <h2 style={{ fontSize: '18px', color: '#1A202C', fontWeight: '700' }}>
              Confidence Threshold
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A5568', padding: 4 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
          Set the minimum confidence level for quotations to appear in the "Ready to Allocate" section.
          Only quotations with confidence at or above this threshold will be shown.
        </p>

        <div className="mb-6">
          <label style={{ fontSize: '12px', color: '#4A5568', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Minimum Confidence Level
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 80,
                height: 40,
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
              }}
            >
              <span style={{ fontSize: '16px', color: '#1A202C', fontWeight: '700' }}>
                {value}%
              </span>
            </div>
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: '11px', color: '#A0AEC0' }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div
          className="rounded-lg p-3 mb-6"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}
        >
          <div style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '600', marginBottom: '4px' }}>
            Current threshold: {value}%
          </div>
          <div style={{ fontSize: '11px', color: '#1E40AF' }}>
            {value === 0
              ? 'All quotations will be shown regardless of confidence level.'
              : `Only quotations with ${value}% or higher confidence will be shown.`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 16px',
              color: '#718096',
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="rounded-md"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 16px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Save Threshold
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Active Project Drawer ------------------------- */

interface AllocationRow {
  role: string;
  person: string;
  hours: number;
  downgrade?: {
    mode: 'remove' | 'reduce';
    effectiveDate: string;
    reducedHours?: number;
  };
  burst?: {
    startDate: string;
    endDate: string;
  };
}

function ActiveProjectDrawer({
  project,
  onClose,
  initialAction,
}: {
  project: TriggeredProject;
  onClose: () => void;
  initialAction?: 'burst' | 'downgrade';
}) {
  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const baseRows = project.assignments.map((a) => ({
      role: a.role,
      person: a.resourceName,
      hours: Math.round((a.percentage / 100) * 40),
    }));

    // If burst action, add a burst row immediately
    if (initialAction === 'burst') {
      return [...baseRows, { role: '', person: '', hours: 40, burst: { startDate: '', endDate: '' } }];
    }

    return baseRows;
  });
  const [bulkOpen, setBulkOpen] = useState(initialAction === 'downgrade');

  const updateRow = (i: number, patch: Partial<AllocationRow>) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const addRow = () =>
    setRows((r) => [...r, { role: '', person: '', hours: 40 }]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 900, padding: '24px' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col rounded-xl"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '1400px',
          maxHeight: '900px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E8F0', padding: '20px 24px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: '18px', color: '#1A202C', fontWeight: '700' }}>
                {project.name}
              </h2>
              <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
                {project.client} · Manage team allocations and scenarios
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-lg"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#10B981',
                  padding: '9px 16px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save Allocations
              </button>
              <button
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A5568', padding: 4 }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl" style={{ border: '1px solid #E2E8F0', padding: '22px 24px' }}>
            <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <AllocField label="Product Manager *" value="Jay Gangani" />
              <AllocField label="Product Strategist *" value="Evan York" />
              <AllocField label="Lead *" value="Kalrav Parsana" />
              <AllocField label="Dev Principal *" value="Jay Gangani" />
              <AllocField label="APM" value="Jay Gangani" />
              <AllocField label="Squad *" value="York" />
            </div>

            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>
                  Dev Team and Allocations
                </h3>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                  Manage team member allocations with their roles and weekly hours.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#B91C1C',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <TrendingDown size={13} />
                  Bulk downgrade
                </button>
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 rounded-lg"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1A202C',
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  Add Team Member
                </button>
              </div>
            </div>

            {bulkOpen && (
              <BulkDowngradePanel
                rows={rows}
                onClose={() => setBulkOpen(false)}
                onApply={(effectiveDate, plan) => {
                  setRows((r) =>
                    r.map((row, idx) => {
                      const p = plan.get(idx);
                      if (!p) return row;
                      if (p.kind === 'remove')
                        return { ...row, downgrade: { mode: 'remove', effectiveDate } };
                      if (p.kind === 'reduce')
                        return {
                          ...row,
                          downgrade: {
                            mode: 'reduce',
                            effectiveDate,
                            reducedHours: p.reducedHours,
                          },
                        };
                      return row;
                    }),
                  );
                  setBulkOpen(false);
                }}
              />
            )}

            <ScenarioSummary rows={rows} />

            <div className="space-y-3">
              {rows.map((row, i) => (
                <ProjectAllocationRow
                  key={`${row.role}-${row.person}-${i}`}
                  row={row}
                  onUpdate={(patch) => updateRow(i, patch)}
                  onRemove={() => removeRow(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectAllocationRow({
  row,
  onUpdate,
  onRemove,
}: {
  row: AllocationRow;
  onUpdate: (patch: Partial<AllocationRow>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState<null | 'downgrade' | 'burst'>(null);
  const isBurst = !!row.burst;

  const isReduce = row.downgrade?.mode === 'reduce';
  const isRemove = row.downgrade?.mode === 'remove';
  const accent =
    isRemove && row.burst
      ? '#C2410C'
      : isRemove
      ? '#DC2626'
      : isReduce
      ? '#C2410C'
      : row.burst
      ? '#2563EB'
      : 'transparent';
  const accentBg =
    isRemove && row.burst
      ? '#FFF7ED'
      : isRemove
      ? '#FEF2F2'
      : isReduce
      ? '#FFF7ED'
      : row.burst
      ? '#EFF6FF'
      : 'transparent';

  return (
    <div
      className="rounded-lg"
      style={{
        border: `1px solid ${row.downgrade || row.burst ? accent + '55' : '#E2E8F0'}`,
        backgroundColor: row.downgrade || row.burst ? accentBg : 'white',
        padding: '10px 12px',
      }}
    >
      <div
        className="grid items-center gap-3"
        style={{ gridTemplateColumns: '200px 200px 140px 100px 28px 28px 28px' }}
      >
        <input
          type="text"
          value={row.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          placeholder="Role"
          className="w-full rounded-lg bg-white"
          style={{
            fontSize: '13px',
            padding: '9px 12px',
            border: '1px solid #E2E8F0',
            outline: 'none',
            color: '#1A202C',
          }}
        />
        <input
          type="text"
          value={row.person}
          onChange={(e) => onUpdate({ person: e.target.value })}
          placeholder="Resource name"
          className="w-full rounded-lg bg-white"
          style={{
            fontSize: '13px',
            padding: '9px 12px',
            border: '1px solid #E2E8F0',
            outline: 'none',
            color: '#1A202C',
          }}
        />
        <input
          type="number"
          value={row.hours}
          onChange={(e) => onUpdate({ hours: Number(e.target.value) })}
          className="w-full rounded-lg bg-white"
          style={{
            fontSize: '13px',
            padding: '9px 12px',
            border: '1px solid #E2E8F0',
            outline: 'none',
            color: '#1A202C',
          }}
        />
        <span style={{ fontSize: '12px', color: '#718096' }}>hours/week</span>

        {isBurst || !row.person ? (
          <button
            onClick={() => {
              if (!isBurst) onUpdate({ burst: { startDate: '', endDate: '' } });
              setEditing(editing === 'burst' ? null : 'burst');
            }}
            title={isBurst ? 'Edit burst window' : 'Mark as burst resource'}
            aria-label="Burst resource"
            style={{
              background: isBurst ? '#DBEAFE' : 'transparent',
              border: isBurst ? '1px solid #93C5FD' : 'none',
              borderRadius: 6,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={15} color={isBurst ? '#1D4ED8' : '#64748B'} />
          </button>
        ) : (
          <button
            onClick={() => setEditing(editing === 'downgrade' ? null : 'downgrade')}
            title={row.downgrade ? 'Edit downgrade' : 'Schedule downgrade'}
            aria-label="Schedule downgrade"
            style={{
              background: isRemove ? '#FEE2E2' : isReduce ? '#FFEDD5' : 'transparent',
              border: isRemove
                ? '1px solid #FCA5A5'
                : isReduce
                ? '1px solid #FDBA74'
                : 'none',
              borderRadius: 6,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown
              size={15}
              color={isRemove ? '#B91C1C' : isReduce ? '#C2410C' : '#64748B'}
            />
          </button>
        )}
        <button
          onClick={onRemove}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Remove"
        >
          <X size={16} color="#EF4444" />
        </button>
      </div>

      {(row.downgrade || (isBurst && row.burst?.startDate)) && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {row.downgrade && (
            <span
              className="inline-flex items-center gap-1 rounded-full"
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                backgroundColor: 'white',
                color: row.downgrade.mode === 'remove' ? '#B91C1C' : '#C2410C',
                fontWeight: '600',
                border: `1px solid ${row.downgrade.mode === 'remove' ? '#FCA5A5' : '#FDBA74'}`,
              }}
            >
              <TrendingDown size={11} />
              {row.downgrade.mode === 'remove'
                ? `To be removed on ${row.downgrade.effectiveDate}`
                : `To be reduced to ${row.downgrade.reducedHours ?? '?'}h/wk from ${row.downgrade.effectiveDate}`}
              <X
                size={11}
                style={{ cursor: 'pointer', marginLeft: 2 }}
                onClick={() => onUpdate({ downgrade: undefined })}
              />
            </span>
          )}
          {isBurst && row.burst?.startDate && (
            <span
              className="inline-flex items-center gap-1 rounded-full"
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                backgroundColor: 'white',
                color: '#1D4ED8',
                fontWeight: '600',
                border: '1px solid #93C5FD',
              }}
            >
              <Zap size={11} />
              Burst {row.burst.startDate} → {row.burst.endDate}
            </span>
          )}
        </div>
      )}

      {editing === 'downgrade' && (
        <DowngradeEditor
          initial={row.downgrade}
          currentHours={row.hours}
          onCancel={() => setEditing(null)}
          onSave={(d) => {
            onUpdate({ downgrade: d });
            setEditing(null);
          }}
        />
      )}
      {editing === 'burst' && (
        <BurstEditor
          initial={row.burst}
          onCancel={() => setEditing(null)}
          onSave={(b) => {
            onUpdate({ burst: b });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function DowngradeEditor({
  initial,
  currentHours,
  onCancel,
  onSave,
}: {
  initial?: { mode: 'remove' | 'reduce'; effectiveDate: string; reducedHours?: number };
  currentHours: number;
  onCancel: () => void;
  onSave: (d: { mode: 'remove' | 'reduce'; effectiveDate: string; reducedHours?: number }) => void;
}) {
  const [mode, setMode] = useState<'remove' | 'reduce'>(initial?.mode ?? 'reduce');
  const [effectiveDate, setEffectiveDate] = useState(initial?.effectiveDate ?? '');
  const [reducedHours, setReducedHours] = useState(initial?.reducedHours ?? Math.round(currentHours * 0.5));

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600', marginBottom: '8px' }}>
        Schedule Downgrade
      </div>
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode('reduce')}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: mode === 'reduce' ? '#FFEDD5' : 'white',
            color: mode === 'reduce' ? '#C2410C' : '#718096',
            border: `1px solid ${mode === 'reduce' ? '#FDBA74' : '#E2E8F0'}`,
            cursor: 'pointer',
          }}
        >
          Reduce hours
        </button>
        <button
          onClick={() => setMode('remove')}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: mode === 'remove' ? '#FEE2E2' : 'white',
            color: mode === 'remove' ? '#B91C1C' : '#718096',
            border: `1px solid ${mode === 'remove' ? '#FCA5A5' : '#E2E8F0'}`,
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label style={{ fontSize: '11px', color: '#718096', display: 'block', marginBottom: '4px' }}>
            Effective Date
          </label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full rounded-md"
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              border: '1px solid #E2E8F0',
              outline: 'none',
              color: '#1A202C',
            }}
          />
        </div>
        {mode === 'reduce' && (
          <div>
            <label style={{ fontSize: '11px', color: '#718096', display: 'block', marginBottom: '4px' }}>
              Reduced Hours/Week
            </label>
            <input
              type="number"
              value={reducedHours}
              onChange={(e) => setReducedHours(Number(e.target.value))}
              className="w-full rounded-md"
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                border: '1px solid #E2E8F0',
                outline: 'none',
                color: '#1A202C',
              }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: 'white',
            color: '#718096',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ mode, effectiveDate, reducedHours: mode === 'reduce' ? reducedHours : undefined })}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function BurstEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial?: { startDate: string; endDate: string };
  onCancel: () => void;
  onSave: (b: { startDate: string; endDate: string }) => void;
}) {
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
      <div style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600', marginBottom: '8px' }}>
        Burst Window
      </div>
      <div className="space-y-2">
        <div>
          <label style={{ fontSize: '11px', color: '#718096', display: 'block', marginBottom: '4px' }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md"
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              border: '1px solid #93C5FD',
              outline: 'none',
              color: '#1A202C',
              backgroundColor: 'white',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#718096', display: 'block', marginBottom: '4px' }}>
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md"
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              border: '1px solid #93C5FD',
              outline: 'none',
              color: '#1A202C',
              backgroundColor: 'white',
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: 'white',
            color: '#718096',
            border: '1px solid #93C5FD',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ startDate, endDate })}
          className="flex-1 rounded-md"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ------------------------- Allocation Drawer ------------------------- */

function AllocationDrawer({
  project,
  initial,
  locked,
  consideredElsewhere = {},
  onClose,
  onConfirm,
  onTrigger,
}: {
  project: ReadyProject;
  initial?: ProjectAllocation;
  locked?: boolean;
  consideredElsewhere?: Record<string, { projectId: string; projectName: string }[]>;
  onClose: () => void;
  onConfirm: (next: ProjectAllocation) => void;
  onTrigger: (next: ProjectAllocation, allPositions: Position[]) => void;
}) {
  const [startDate, setStartDate] = useState(today);
  const [positions, setPositions] = useState<Position[]>(project.positions);
  const [activePositionId, setActivePositionId] = useState<string>(project.positions[0]?.id ?? '');
  const [assignments, setAssignments] = useState<Record<string, ResourceAssignment[]>>(
    initial?.assignments ?? {}
  );
  const [hiringRequests, setHiringRequests] = useState<Record<string, boolean>>(
    initial?.hiring ?? {}
  );
  const [manualQuery, setManualQuery] = useState('');
  const [profileResource, setProfileResource] = useState<BenchResource | null>(null);
  const [skillsByPosition, setSkillsByPosition] = useState<Record<string, string[]>>(
    () => Object.fromEntries(project.positions.map((p) => [p.id, p.skills]))
  );
  const [hiringDetails, setHiringDetails] = useState<
    Record<string, { stage: HiringStage; ownerId: string }>
  >({});
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionForm, setNewPositionForm] = useState({
    title: '',
    role: '',
    percentage: 100,
    hoursPerWeek: 40,
    hoursPerMonth: 160,
  });
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);

  const activePosition = positions.find((p) => p.id === activePositionId);
  const activeSkills = activePosition ? skillsByPosition[activePosition.id] ?? [] : [];

  const suggestions = useMemo(() => {
    if (!activePosition) return [];
    const start = new Date(startDate);
    return BENCH.map((b) => {
      const avail = new Date(b.availableFrom);
      const availableByStart = avail <= start;
      const roleMatch = b.role.toLowerCase() === activePosition.role.toLowerCase();
      const skillMatches = activeSkills.filter((s) =>
        b.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
      ).length;
      const score =
        (availableByStart ? 40 : 0) +
        (roleMatch ? 40 : 0) +
        Math.min(skillMatches, 3) * 7 -
        b.utilization * 0.1;
      return { resource: b, availableByStart, roleMatch, skillMatches, score };
    })
      .sort((a, b) => b.score - a.score)
      .filter((s) => s.roleMatch || s.skillMatches > 0);
  }, [activePosition, startDate, activeSkills]);

  const noMatch = suggestions.length === 0 || suggestions[0].score < 40;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 900, padding: '24px' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col rounded-xl"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '1400px',
          maxHeight: '900px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header with actions */}
        <div style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <h2
                style={{
                  fontSize: '15px',
                  color: '#1A202C',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {project.name}
              </h2>
              <span style={{ fontSize: '12px', color: '#A0AEC0' }}>·</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>{project.client}</span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A5568', padding: 4 }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action bar */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '12px', color: '#718096' }}>Start</span>
                <div
                  className="flex items-center gap-2 rounded-md bg-white"
                  style={{ padding: '4px 8px', border: '1px solid #E2E8F0' }}
                >
                  <Calendar size={12} color="#718096" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      fontSize: '12px',
                      padding: 0,
                      border: 'none',
                      outline: 'none',
                      color: '#1A202C',
                      backgroundColor: 'transparent',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#1A202C' }}>
                <b style={{ color: '#059669' }}>
                  {Object.values(assignments).filter((arr) => arr && arr.length > 0).length}
                </b>
                /{positions.length} assigned
                <span style={{ color: '#CBD5E0', margin: '0 6px' }}>·</span>
                <b style={{ color: '#B45309' }}>
                  {Object.values(hiringRequests).filter(Boolean).length}
                </b>{' '}
                hiring
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const assignedCount = Object.values(assignments).filter((arr) => arr && arr.length > 0).length;
                const readyToTrigger = positions.every((pos) => {
                  const hasResources = assignments[pos.id] && assignments[pos.id].length > 0;
                  if (hasResources) return true;
                  if (
                    hiringRequests[pos.id] &&
                    hiringDetails[pos.id]?.stage === 'Hired'
                  )
                    return true;
                  return false;
                });

                if (locked) {
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md"
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '6px 10px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <Lock size={11} />
                      Locked
                    </span>
                  );
                }

                return (
                  <>
                    <button
                      onClick={() => onConfirm({ assignments, hiring: hiringRequests })}
                      className="rounded-md"
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '6px 12px',
                        color: '#059669',
                        backgroundColor: 'white',
                        border: '1px solid #A7F3D0',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        readyToTrigger &&
                        onTrigger({ assignments, hiring: hiringRequests }, positions)
                      }
                      disabled={!readyToTrigger}
                      title={
                        readyToTrigger
                          ? `Lock ${assignedCount} assignments and trigger project`
                          : 'All positions must be assigned or hired'
                      }
                      className="flex items-center gap-1.5 rounded-md"
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '6px 12px',
                        backgroundColor: readyToTrigger ? '#10B981' : '#E2E8F0',
                        color: readyToTrigger ? 'white' : '#A0AEC0',
                        border: 'none',
                        cursor: readyToTrigger ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Lock size={11} />
                      Trigger
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Positions list + details */}
        <div className="flex-1 overflow-auto">
          <div className="grid" style={{ gridTemplateColumns: '280px 1fr', minHeight: '100%' }}>
            {/* Position rail */}
            <div style={{ borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {positions.map((pos) => {
                  const isActive = activePositionId === pos.id;
                  const isNew = pos.id.startsWith('custom-');
                  const hasAssignments = assignments[pos.id] && assignments[pos.id].length > 0;
                  const status = hasAssignments
                    ? 'assigned'
                    : hiringRequests[pos.id]
                    ? 'hiring'
                    : 'open';
                  return (
                    <button
                      key={pos.id}
                      onClick={() => {
                        setActivePositionId(pos.id);
                        setShowAddPosition(false);
                      }}
                      className="w-full text-left"
                      style={{
                        padding: '14px 16px',
                        borderTop: 'none',
                        borderRight: 'none',
                        borderBottom: '1px solid #F0F0F0',
                        borderLeft: `3px solid ${isActive ? '#10B981' : 'transparent'}`,
                        backgroundColor: isActive ? '#ECFDF5' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', flex: 1 }}>
                          {pos.title}
                        </div>
                        {isNew && (
                          <span
                            className="rounded"
                            style={{
                              fontSize: '9px',
                              padding: '2px 5px',
                              backgroundColor: '#EEF2FF',
                              color: '#3730A3',
                              fontWeight: '700',
                              letterSpacing: '0.02em',
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                        {pos.role} · {pos.percentage}% ({pos.hoursPerWeek ?? Math.round(percentageToHoursPerWeek(pos.percentage))}h/wk)
                      </div>
                      <div className="mt-2">
                        <StatusTag status={status} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setShowAddPosition(true);
                  setActivePositionId('');
                }}
                className="flex items-center justify-center gap-2 w-full"
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #E2E8F0',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderLeft: showAddPosition ? '3px solid #10B981' : '3px solid transparent',
                  backgroundColor: showAddPosition ? '#ECFDF5' : 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#059669',
                  fontWeight: '600',
                }}
              >
                <Plus size={14} />
                Add Position
              </button>
            </div>

            {/* Active position details */}
            <div className="p-4" style={{ minWidth: 0 }}>
              {showAddPosition ? (
                <div>
                  <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '700', marginBottom: '12px' }}>
                    Add New Position
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                        TITLE
                      </label>
                      <input
                        type="text"
                        value={newPositionForm.title}
                        onChange={(e) => setNewPositionForm({ ...newPositionForm, title: e.target.value })}
                        placeholder="Senior Frontend Engineer"
                        style={{
                          width: '100%',
                          fontSize: '13px',
                          padding: '8px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                          color: '#1A202C',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                        ROLE
                      </label>
                      <select
                        value={newPositionForm.role}
                        onChange={(e) => setNewPositionForm({ ...newPositionForm, role: e.target.value })}
                        style={{
                          width: '100%',
                          fontSize: '13px',
                          padding: '8px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                          color: '#1A202C',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Select role...</option>
                        <option value="Full Stack">Full Stack</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="User Experience Designer">User Experience Designer</option>
                        <option value="RevOps Specialist">RevOps Specialist</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Product Manager">Product Manager</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                        ALLOCATION
                      </label>
                      <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: '#718096', display: 'block', marginBottom: '2px' }}>
                            Percentage
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="25"
                            value={newPositionForm.percentage}
                            onChange={(e) => {
                              const percentage = Number(e.target.value);
                              setNewPositionForm({
                                ...newPositionForm,
                                percentage,
                                hoursPerWeek: Math.round(percentageToHoursPerWeek(percentage)),
                                hoursPerMonth: Math.round(percentageToHoursPerMonth(percentage)),
                              });
                            }}
                            style={{
                              width: '100%',
                              fontSize: '13px',
                              padding: '6px 10px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              outline: 'none',
                              color: '#1A202C',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: '#718096', display: 'block', marginBottom: '2px' }}>
                            Hours/Week
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={newPositionForm.hoursPerWeek}
                            onChange={(e) => {
                              const hoursPerWeek = Number(e.target.value);
                              setNewPositionForm({
                                ...newPositionForm,
                                hoursPerWeek,
                                percentage: Math.round(hoursPerWeekToPercentage(hoursPerWeek)),
                                hoursPerMonth: Math.round(hoursPerWeekToHoursPerMonth(hoursPerWeek)),
                              });
                            }}
                            style={{
                              width: '100%',
                              fontSize: '13px',
                              padding: '6px 10px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              outline: 'none',
                              color: '#1A202C',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <label style={{ fontSize: '10px', color: '#718096', display: 'block', marginBottom: '2px' }}>
                          Hours/Month
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={newPositionForm.hoursPerMonth}
                          onChange={(e) => {
                            const hoursPerMonth = Number(e.target.value);
                            setNewPositionForm({
                              ...newPositionForm,
                              hoursPerMonth,
                              percentage: Math.round(hoursPerMonthToPercentage(hoursPerMonth)),
                              hoursPerWeek: Math.round(hoursPerMonthToHoursPerWeek(hoursPerMonth)),
                            });
                          }}
                          style={{
                            width: '100%',
                            fontSize: '13px',
                            padding: '6px 10px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            outline: 'none',
                            color: '#1A202C',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '10px',
                          color: '#718096',
                          fontStyle: 'italic',
                        }}
                      >
                        Standard: 40h/week = 160h/month = 100%
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newPositionForm.title.trim() || !newPositionForm.role) {
                          return;
                        }
                        const newPosition: Position = {
                          id: `custom-${Date.now()}`,
                          title: newPositionForm.title.trim(),
                          role: newPositionForm.role,
                          skills: [],
                          percentage: newPositionForm.percentage,
                          hoursPerWeek: newPositionForm.hoursPerWeek,
                          hoursPerMonth: newPositionForm.hoursPerMonth,
                        };
                        setPositions([...positions, newPosition]);
                        setSkillsByPosition((s) => ({ ...s, [newPosition.id]: [] }));
                        setActivePositionId(newPosition.id);
                        setShowAddPosition(false);
                        setNewPositionForm({ title: '', role: '', percentage: 100, hoursPerWeek: 40, hoursPerMonth: 160 });
                      }}
                      disabled={!newPositionForm.title.trim() || !newPositionForm.role}
                      className="flex items-center justify-center gap-2 rounded-md w-full"
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '8px 14px',
                        backgroundColor: newPositionForm.title.trim() && newPositionForm.role ? '#10B981' : '#E2E8F0',
                        color: newPositionForm.title.trim() && newPositionForm.role ? 'white' : '#A0AEC0',
                        border: 'none',
                        cursor: newPositionForm.title.trim() && newPositionForm.role ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Plus size={14} />
                      Create
                    </button>
                  </div>
                </div>
              ) : activePosition ? (
                <>
                  <div className="mb-3">
                    <span
                      className="rounded-md inline-block mb-2"
                      style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        backgroundColor: '#F1F5F9',
                        color: '#1A202C',
                        fontWeight: '600',
                      }}
                    >
                      {activePosition.role}
                    </span>

                    <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600', marginBottom: '4px' }}>
                      SKILLS
                    </div>
                    <SkillAutocomplete
                      value={activeSkills}
                      onChange={(next) =>
                        setSkillsByPosition((s) => ({ ...s, [activePosition.id]: next }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <ManualResourceSearch
                      query={manualQuery}
                      onQueryChange={setManualQuery}
                      assignments={assignments[activePosition.id] ?? []}
                      positionHoursPerWeek={activePosition.hoursPerWeek ?? Math.round(percentageToHoursPerWeek(activePosition.percentage))}
                      onAssign={(id) =>
                        setAssignments((a) => {
                          const currentAssignments = a[activePosition.id] ?? [];
                          const existing = currentAssignments.find((asn) => asn.resourceId === id);
                          const positionHours = activePosition.hoursPerWeek ?? Math.round(percentageToHoursPerWeek(activePosition.percentage));
                          const newAssignments = existing
                            ? currentAssignments.filter((asn) => asn.resourceId !== id)
                            : [...currentAssignments, { resourceId: id, hoursPerWeek: positionHours }];
                          return { ...a, [activePosition.id]: newAssignments };
                        })
                      }
                      onUpdateHours={(id, hours) =>
                        setAssignments((a) => {
                          const currentAssignments = a[activePosition.id] ?? [];
                          const newAssignments = currentAssignments.map((asn) =>
                            asn.resourceId === id ? { ...asn, hoursPerWeek: hours } : asn
                          );
                          return { ...a, [activePosition.id]: newAssignments };
                        })
                      }
                      onShowProfile={setProfileResource}
                    />
                  </div>

                  {(() => {
                    const positionAssignments = assignments[activePosition.id] ?? [];
                    const totalAllocatedHours = positionAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
                    const positionHoursPerWeek = activePosition.hoursPerWeek ?? Math.round(percentageToHoursPerWeek(activePosition.percentage));
                    const isOverAllocated = totalAllocatedHours > positionHoursPerWeek;

                    const assignedResources = positionAssignments.map((asn) => {
                      const resource = BENCH.find((r) => r.id === asn.resourceId);
                      return resource ? { resource, assignment: asn } : null;
                    }).filter((item): item is { resource: BenchResource; assignment: ResourceAssignment } => item !== null);

                    const unassignedSuggestions = suggestions.filter(({ resource }) => {
                      return !positionAssignments.some((a) => a.resourceId === resource.id);
                    });

                    return (
                      <>
                        {isOverAllocated && (
                          <div
                            className="rounded-lg mb-3"
                            style={{
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FCA5A5',
                              padding: '8px 10px',
                            }}
                          >
                            <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: '600' }}>
                              ⚠️ Over-allocated: {totalAllocatedHours}h/week allocated, but position only needs {positionHoursPerWeek}h/week
                            </div>
                          </div>
                        )}

                        {/* Assigned Resources Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600' }}>
                              ASSIGNED RESOURCES
                            </div>
                            <div style={{ fontSize: '10px', color: '#718096' }}>
                              {totalAllocatedHours}/{positionHoursPerWeek}h/week allocated
                            </div>
                          </div>
                          {assignedResources.length === 0 ? (
                            <div
                              className="rounded-lg"
                              style={{
                                border: '1px dashed #E2E8F0',
                                backgroundColor: '#F8FAFC',
                                padding: '16px',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: '12px', color: '#A0AEC0' }}>
                                No resources assigned yet
                              </div>
                              <div style={{ fontSize: '11px', color: '#CBD5E0', marginTop: '4px' }}>
                                Select from suggestions below or search manually
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {assignedResources.map(({ resource, assignment }) => {
                                const elsewhere = consideredElsewhere[resource.id] ?? [];
                                const leavingSoon = isOnLeaveSoon(resource);
                                const daysUntilLeave = getDaysUntilLeave(resource);
                                const suggestionMatch = suggestions.find((s) => s.resource.id === resource.id);
                                const skillMatches = suggestionMatch?.skillMatches ?? 0;

                                return (
                                  <div
                                    key={resource.id}
                                    className="rounded-lg"
                                    style={{
                                      border: '1px solid #A7F3D0',
                                      backgroundColor: '#F0FDF4',
                                      padding: '8px 10px',
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                                        style={{
                                          width: 32,
                                          height: 32,
                                          backgroundColor: '#10B981',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {resource.initials}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <button
                                            onClick={() => setProfileResource(resource)}
                                            style={{
                                              fontSize: '13px',
                                              color: '#1A202C',
                                              fontWeight: '600',
                                              background: 'transparent',
                                              border: 'none',
                                              padding: 0,
                                              cursor: 'pointer',
                                              textDecoration: 'underline',
                                              textDecorationColor: '#CBD5E1',
                                              textUnderlineOffset: 3,
                                            }}
                                          >
                                            {resource.name}
                                          </button>
                                          {skillMatches > 0 && (
                                            <span
                                              className="rounded"
                                              style={{
                                                fontSize: '10px',
                                                color: '#3730A3',
                                                fontWeight: '600',
                                                padding: '1px 6px',
                                                backgroundColor: '#EEF2FF',
                                              }}
                                            >
                                              {skillMatches} skill{skillMatches === 1 ? '' : 's'}
                                            </span>
                                          )}
                                          {leavingSoon && (
                                            <LeaveCalendarBadge resource={resource} daysUntilLeave={daysUntilLeave} />
                                          )}
                                          {elsewhere.length > 0 && (
                                            <span
                                              title={elsewhere.map((e) => e.projectName).join(', ')}
                                              className="rounded"
                                              style={{
                                                fontSize: '10px',
                                                color: '#92400E',
                                                fontWeight: '600',
                                                padding: '1px 6px',
                                                backgroundColor: '#FEF3C7',
                                                border: '1px solid #FDE68A',
                                              }}
                                            >
                                              In {elsewhere.length} other
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                                          {resource.role} · {resource.experience} · avail {resource.availableFrom}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          setAssignments((a) => {
                                            const currentAssignments = a[activePosition.id] ?? [];
                                            const newAssignments = currentAssignments.filter((asn) => asn.resourceId !== resource.id);
                                            return { ...a, [activePosition.id]: newAssignments };
                                          })
                                        }
                                        className="rounded-md"
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          padding: '5px 10px',
                                          backgroundColor: '#DC2626',
                                          color: 'white',
                                          border: '1px solid #DC2626',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid #D1FAE5' }}>
                                      <div className="flex items-center gap-2">
                                        <label style={{ fontSize: '10px', color: '#059669', fontWeight: '600' }}>
                                          Hours/Week:
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="1"
                                          value={assignment.hoursPerWeek}
                                          onChange={(e) => {
                                            const hours = Math.max(0, Number(e.target.value));
                                            setAssignments((a) => {
                                              const currentAssignments = a[activePosition.id] ?? [];
                                              const newAssignments = currentAssignments.map((asn) =>
                                                asn.resourceId === resource.id
                                                  ? { ...asn, hoursPerWeek: hours }
                                                  : asn
                                              );
                                              return { ...a, [activePosition.id]: newAssignments };
                                            });
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                            width: '70px',
                                            fontSize: '12px',
                                            padding: '4px 8px',
                                            border: '1px solid #A7F3D0',
                                            borderRadius: '4px',
                                            outline: 'none',
                                            color: '#1A202C',
                                            backgroundColor: 'white',
                                          }}
                                        />
                                        <span style={{ fontSize: '10px', color: '#718096' }}>
                                          ≈ {Math.round(assignment.hoursPerWeek * 4)}h/month
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Suggestions Section */}
                        <div className="mb-3">
                          <button
                            onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
                            className="flex items-center justify-between w-full mb-2"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600' }}>
                              SUGGESTIONS ({unassignedSuggestions.length})
                            </div>
                            {suggestionsExpanded ? <ChevronUp size={14} color="#A0AEC0" /> : <ChevronDown size={14} color="#A0AEC0" />}
                          </button>

                          {suggestionsExpanded && (
                            <>
                              {unassignedSuggestions.length === 0 ? (
                                <NoMatch
                                  onHire={() =>
                                    setHiringRequests((h) => ({ ...h, [activePosition.id]: true }))
                                  }
                                  pending={!!hiringRequests[activePosition.id]}
                                />
                              ) : (
                                <div className="space-y-1.5">
                                  {unassignedSuggestions.map(({ resource, availableByStart, roleMatch, skillMatches }) => {
                                    const elsewhere = consideredElsewhere[resource.id] ?? [];
                                    const leavingSoon = isOnLeaveSoon(resource);
                                    const daysUntilLeave = getDaysUntilLeave(resource);

                                    return (
                                      <div
                                        key={resource.id}
                                        className="rounded-lg"
                                        style={{
                                          border: '1px solid #E2E8F0',
                                          backgroundColor: 'white',
                                          padding: '8px 10px',
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                                            style={{
                                              width: 32,
                                              height: 32,
                                              backgroundColor: '#10B981',
                                              fontSize: '11px',
                                              fontWeight: '600',
                                            }}
                                          >
                                            {resource.initials}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <button
                                                onClick={() => setProfileResource(resource)}
                                                style={{
                                                  fontSize: '13px',
                                                  color: '#1A202C',
                                                  fontWeight: '600',
                                                  background: 'transparent',
                                                  border: 'none',
                                                  padding: 0,
                                                  cursor: 'pointer',
                                                  textDecoration: 'underline',
                                                  textDecorationColor: '#CBD5E1',
                                                  textUnderlineOffset: 3,
                                                }}
                                              >
                                                {resource.name}
                                              </button>
                                              {skillMatches > 0 && (
                                                <span
                                                  className="rounded"
                                                  style={{
                                                    fontSize: '10px',
                                                    color: '#3730A3',
                                                    fontWeight: '600',
                                                    padding: '1px 6px',
                                                    backgroundColor: '#EEF2FF',
                                                  }}
                                                >
                                                  {skillMatches} skill{skillMatches === 1 ? '' : 's'}
                                                </span>
                                              )}
                                              {leavingSoon && (
                                                <LeaveCalendarBadge resource={resource} daysUntilLeave={daysUntilLeave} />
                                              )}
                                              {elsewhere.length > 0 && (
                                                <span
                                                  title={elsewhere.map((e) => e.projectName).join(', ')}
                                                  className="rounded"
                                                  style={{
                                                    fontSize: '10px',
                                                    color: '#92400E',
                                                    fontWeight: '600',
                                                    padding: '1px 6px',
                                                    backgroundColor: '#FEF3C7',
                                                    border: '1px solid #FDE68A',
                                                  }}
                                                >
                                                  In {elsewhere.length} other
                                                </span>
                                              )}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                                              {resource.role} · {resource.experience} · avail {resource.availableFrom}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() =>
                                              setAssignments((a) => {
                                                const currentAssignments = a[activePosition.id] ?? [];
                                                const newAssignments = [...currentAssignments, { resourceId: resource.id, hoursPerWeek: positionHoursPerWeek }];
                                                return { ...a, [activePosition.id]: newAssignments };
                                              })
                                            }
                                            className="rounded-md"
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: '600',
                                              padding: '5px 10px',
                                              backgroundColor: 'white',
                                              color: '#059669',
                                              border: '1px solid #A7F3D0',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            Assign
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  <div
                                    className="flex items-center justify-between rounded-lg mt-2"
                                    style={{
                                      backgroundColor: '#FFFBEB',
                                      border: '1px solid #FDE68A',
                                      padding: '8px 10px',
                                    }}
                                  >
                                    <span style={{ fontSize: '12px', color: '#92400E' }}>
                                      No match?
                                    </span>
                                    <button
                                      onClick={() => {
                                        const already = hiringRequests[activePosition.id];
                                        setHiringRequests((h) => ({
                                          ...h,
                                          [activePosition.id]: !already,
                                        }));
                                        if (!already) {
                                          setHiringDetails((d) => ({
                                            ...d,
                                            [activePosition.id]: d[activePosition.id] ?? {
                                              stage: 'Requested',
                                              ownerId: RECRUITERS[0].id,
                                            },
                                          }));
                                        }
                                      }}
                                      className="flex items-center gap-1.5 rounded-md"
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '5px 10px',
                                        backgroundColor: hiringRequests[activePosition.id] ? '#F59E0B' : 'white',
                                        color: hiringRequests[activePosition.id] ? 'white' : '#B45309',
                                        border: '1px solid #FDE68A',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <UserPlus size={11} />
                                      {hiringRequests[activePosition.id] ? 'Requested' : 'Request Hire'}
                                    </button>
                                  </div>

                                  {hiringRequests[activePosition.id] && (
                                    <HiringStatusPanel
                                      detail={
                                        hiringDetails[activePosition.id] ?? {
                                          stage: 'Requested',
                                          ownerId: RECRUITERS[0].id,
                                        }
                                      }
                                      onChange={(next) =>
                                        setHiringDetails((d) => ({
                                          ...d,
                                          [activePosition.id]: next,
                                        }))
                                      }
                                    />
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center" style={{ fontSize: '12px', color: '#CBD5E0', padding: '40px 20px', textAlign: 'center' }}>
                  ← Select a position
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {profileResource && (
        <ResourceProfileModal
          resource={profileResource}
          position={activePosition}
          activeSkills={activeSkills}
          elsewhere={consideredElsewhere[profileResource.id] ?? []}
          onClose={() => setProfileResource(null)}
        />
      )}
    </div>
  );
}

function ResourceProfileModal({
  resource,
  position,
  activeSkills,
  elsewhere,
  onClose,
}: {
  resource: BenchResource;
  position?: { title: string; role: string };
  activeSkills: string[];
  elsewhere: { projectId: string; projectName: string }[];
  onClose: () => void;
}) {
  const roleMatch = position
    ? resource.role.toLowerCase() === position.role.toLowerCase()
    : false;
  const matchedSkills = activeSkills.filter((s) =>
    resource.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()),
  );
  const missingSkills = activeSkills.filter(
    (s) => !resource.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()),
  );
  const past = PAST_PROJECTS[resource.id] ?? [];

  const leavingSoon = isOnLeaveSoon(resource);
  const daysUntilLeave = getDaysUntilLeave(resource);

  const reasons: { tone: 'good' | 'warn'; text: string }[] = [];
  if (matchedSkills.length > 0)
    reasons.push({
      tone: 'good',
      text: `Proven skills: ${matchedSkills.join(', ')}`,
    });
  if (resource.utilization === 0)
    reasons.push({ tone: 'good', text: 'Fully available on the bench' });
  else if (resource.utilization < 50)
    reasons.push({
      tone: 'good',
      text: `Has spare capacity (${100 - resource.utilization}% free)`,
    });
  reasons.push({
    tone: 'good',
    text: `${resource.experience} of experience${past.length > 0 ? ` across ${past.length} prior project${past.length === 1 ? '' : 's'}` : ''}`,
  });
  reasons.push({
    tone: 'good',
    text: `Available from ${resource.availableFrom}`,
  });
  if (leavingSoon)
    reasons.push({
      tone: 'warn',
      text: `Scheduled leave in ${daysUntilLeave} day${daysUntilLeave === 1 ? '' : 's'} — plan handover`,
    });
  if (missingSkills.length > 0)
    reasons.push({
      tone: 'warn',
      text: `May need ramp-up on: ${missingSkills.join(', ')}`,
    });
  if (resource.utilization >= 50)
    reasons.push({
      tone: 'warn',
      text: `Currently ${resource.utilization}% utilized — confirm capacity`,
    });
  if (elsewhere.length > 0)
    reasons.push({
      tone: 'warn',
      text: `Also being considered on: ${elsewhere.map((e) => e.projectName).join(', ')}`,
    });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl flex flex-col"
        style={{
          width: 560,
          maxWidth: '92vw',
          maxHeight: '88vh',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div
            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ width: 48, height: 48, backgroundColor: '#10B981', fontSize: '15px', fontWeight: '600' }}
          >
            {resource.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2" style={{ fontSize: '16px', color: '#1A202C', fontWeight: '700' }}>
              {resource.name}
              {leavingSoon && <LeaveCalendarBadge resource={resource} daysUntilLeave={daysUntilLeave} size="medium" />}
            </div>
            <div style={{ fontSize: '12px', color: '#4A5568', marginTop: '2px' }}>
              {resource.role} · {resource.experience} · {resource.utilization}% utilized · avail{' '}
              {resource.availableFrom}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '18px 20px' }}>
          {position && (
            <div style={{ marginBottom: 16 }}>
              <SectionLabel>Considering for</SectionLabel>
              <div
                className="rounded-lg"
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#1A202C',
                }}
              >
                <span style={{ fontWeight: '600' }}>{position.title}</span>
                <span style={{ color: '#718096' }}> · {position.role}</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Why this fits</SectionLabel>
            <ul className="space-y-1.5" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {reasons.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2"
                  style={{ fontSize: '12px', color: '#1A202C', lineHeight: 1.45 }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      marginTop: 6,
                      flexShrink: 0,
                      backgroundColor: r.tone === 'good' ? '#10B981' : '#F59E0B',
                    }}
                  />
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Skills</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {resource.skills.map((s) => {
                const hit = matchedSkills
                  .map((x) => x.toLowerCase())
                  .includes(s.toLowerCase());
                return (
                  <span
                    key={s}
                    className="rounded"
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      backgroundColor: hit ? '#ECFDF5' : '#F1F5F9',
                      color: hit ? '#059669' : '#475569',
                      border: hit ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                    }}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>Past project work</SectionLabel>
            {past.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#A0AEC0' }}>
                No recorded prior projects yet.
              </div>
            ) : (
              <div className="space-y-2">
                {past.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg"
                    style={{
                      border: '1px solid #E2E8F0',
                      padding: '10px 12px',
                      backgroundColor: 'white',
                    }}
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}
                    >
                      <span>{p.name}</span>
                      <span style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '500' }}>
                        {p.period}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4A5568', marginTop: '2px' }}>
                      {p.role}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#1A202C',
                        marginTop: '6px',
                        lineHeight: 1.45,
                      }}
                    >
                      {p.impact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center justify-end"
          style={{
            borderTop: '1px solid #E2E8F0',
            padding: '12px 20px',
            backgroundColor: '#F8FAFC',
          }}
        >
          <button
            onClick={onClose}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '10px',
        color: '#A0AEC0',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function NoMatch({ onHire, pending }: { onHire: () => void; pending: boolean }) {
  return (
    <div
      className="flex flex-col items-center rounded-lg text-center"
      style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '16px' }}
    >
      <div
        className="rounded-full flex items-center justify-center mb-2"
        style={{ width: 32, height: 32, backgroundColor: '#FEF3C7' }}
      >
        <UserPlus size={15} color="#B45309" />
      </div>
      <div style={{ fontSize: '11px', color: '#92400E', fontWeight: '600', marginBottom: '8px' }}>
        No bench match
      </div>
      <button
        onClick={onHire}
        className="flex items-center gap-1.5 rounded-md"
        style={{
          fontSize: '11px',
          fontWeight: '600',
          padding: '5px 10px',
          backgroundColor: pending ? '#F59E0B' : '#B45309',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <UserPlus size={11} />
        {pending ? 'Requested' : 'Request Hire'}
      </button>
    </div>
  );
}

function StatusTag({ status }: { status: 'assigned' | 'hiring' | 'open' }) {
  const map = {
    assigned: { label: 'Assigned', bg: '#ECFDF5', fg: '#059669' },
    hiring: { label: 'Hiring', bg: '#FFFBEB', fg: '#B45309' },
    open: { label: 'Open', bg: '#F1F5F9', fg: '#64748B' },
  }[status];
  return (
    <span
      className="rounded-full inline-block"
      style={{
        fontSize: '10px',
        padding: '2px 8px',
        backgroundColor: map.bg,
        color: map.fg,
        fontWeight: '600',
      }}
    >
      {map.label}
    </span>
  );
}

function Kpi({
  Icon,
  label,
  value,
  tint,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div
      className="rounded-xl relative"
      style={{
        border: '1px solid #E2E8F0',
        padding: '18px 20px',
        minHeight: 110,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F3FAF7 100%)',
      }}
    >
      <div
        style={{
          fontSize: '28px',
          color: '#1A202C',
          fontWeight: '800',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 20,
          color: tint,
        }}
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div
        style={{
          fontSize: '13px',
          color: '#718096',
          fontWeight: '500',
          marginTop: 22,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function HiringStatusPanel({
  detail,
  onChange,
}: {
  detail: { stage: HiringStage; ownerId: string };
  onChange: (next: { stage: HiringStage; ownerId: string }) => void;
}) {
  const owner = RECRUITERS.find((r) => r.id === detail.ownerId) ?? RECRUITERS[0];
  const currentIdx = HIRING_STAGES.indexOf(detail.stage);

  return (
    <div
      className="rounded-lg mt-2"
      style={{
        border: '1px solid #E2E8F0',
        backgroundColor: 'white',
        padding: '10px',
      }}
    >
      {/* Owner row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full flex items-center justify-center text-white"
            style={{
              width: 28,
              height: 28,
              backgroundColor: '#10B981',
              fontSize: '10px',
              fontWeight: '700',
            }}
          >
            {owner.initials}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#1A202C', fontWeight: '600' }}>
              {owner.name}
            </div>
            <div style={{ fontSize: '10px', color: '#718096' }}>
              {owner.role}
            </div>
          </div>
        </div>
        <span
          className="rounded-full"
          style={{
            fontSize: '9px',
            padding: '2px 7px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            fontWeight: '600',
            letterSpacing: '0.03em',
          }}
        >
          OWNER
        </span>
      </div>

      {/* Stage tracker */}
      <div className="flex items-center mt-2" style={{ gap: 0 }}>
        {HIRING_STAGES.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: done ? '#10B981' : '#F1F5F9',
                    color: done ? 'white' : '#A0AEC0',
                    fontSize: '9px',
                    fontWeight: '700',
                    outline: active ? '2px solid #059669' : 'none',
                    outlineOffset: active ? '1px' : 0,
                  }}
                >
                  {done ? <Check size={11} /> : i + 1}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: active ? '#059669' : done ? '#1A202C' : '#A0AEC0',
                    fontWeight: active ? '700' : '500',
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </div>
              </div>
              {i < HIRING_STAGES.length - 1 && (
                <div
                  style={{
                    height: 2,
                    flex: 1,
                    margin: '0 5px',
                    backgroundColor: i < currentIdx ? '#10B981' : '#E2E8F0',
                    alignSelf: 'flex-start',
                    marginTop: 9,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <a
        href="#"
        className="flex items-center justify-center mt-2"
        style={{
          fontSize: '11px',
          color: '#059669',
          fontWeight: '600',
          textDecoration: 'none',
          borderTop: '1px solid #F0F0F0',
          paddingTop: 6,
        }}
      >
        Open in Hiring →
      </a>
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const color = value >= 100 ? '#10B981' : value >= 80 ? '#F59E0B' : '#A0AEC0';
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full overflow-hidden"
        style={{ width: 60, height: 6, backgroundColor: '#F1F5F9' }}
      >
        <div style={{ width: `${value}%`, height: '100%', backgroundColor: color }} />
      </div>
      <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{value}%</span>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        textAlign: align ?? 'left',
        padding: '12px 16px',
        fontSize: '11px',
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: align ?? 'left' }}>
      {children}
    </td>
  );
}

function SkillAutocomplete({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const remaining = SKILL_LIBRARY.filter(
    (s) => !value.map((v) => v.toLowerCase()).includes(s.toLowerCase())
  );
  const filtered = query.trim()
    ? remaining.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()))
    : remaining.slice(0, 8);

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return;
    if (value.map((v) => v.toLowerCase()).includes(trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setQuery('');
    setHighlight(0);
  };

  const removeSkill = (s: string) => {
    onChange(value.filter((v) => v !== s));
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="flex items-center gap-1.5 flex-wrap rounded-lg bg-white"
        style={{
          border: `1px solid ${open ? '#10B981' : '#E2E8F0'}`,
          padding: '6px 8px',
          minHeight: 40,
        }}
      >
        {value.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 rounded"
            style={{
              fontSize: '11px',
              padding: '3px 4px 3px 8px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontWeight: '600',
            }}
          >
            {s}
            <button
              onClick={() => removeSkill(s)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0 2px',
                color: '#059669',
                lineHeight: 1,
              }}
              aria-label={`Remove ${s}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1 flex-1" style={{ minWidth: 120 }}>
          <Search size={12} color="#A0AEC0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
                setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[highlight]) addSkill(filtered[highlight]);
                else if (query.trim()) addSkill(query.trim());
              } else if (e.key === 'Backspace' && !query && value.length) {
                removeSkill(value[value.length - 1]);
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder={value.length === 0 ? 'Add skills…' : 'Add more…'}
            style={{
              fontSize: '12px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              flex: 1,
              minWidth: 100,
              padding: '4px 2px',
              color: '#1A202C',
            }}
          />
        </div>
      </div>

      {open && (filtered.length > 0 || query.trim()) && (
        <div
          className="rounded-lg bg-white"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            border: '1px solid #E2E8F0',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            maxHeight: 220,
            overflowY: 'auto',
            zIndex: 20,
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSkill(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                className="w-full flex items-center justify-between text-left"
                style={{
                  padding: '8px 12px',
                  backgroundColor: i === highlight ? '#ECFDF5' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#1A202C',
                }}
              >
                <span>{s}</span>
                {i === highlight && <Plus size={12} color="#059669" />}
              </button>
            ))
          ) : null}
          {query.trim() &&
            !filtered.some((f) => f.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSkill(query.trim());
                }}
                className="w-full flex items-center gap-1.5 text-left"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#F8FAFC',
                  border: 'none',
                  borderTop: filtered.length > 0 ? '1px solid #F0F0F0' : 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#059669',
                  fontWeight: '600',
                }}
              >
                <Plus size={12} />
                Add "{query.trim()}"
              </button>
            )}
        </div>
      )}
    </div>
  );
}

function ManualResourceSearch({
  query,
  onQueryChange,
  assignments,
  positionHoursPerWeek,
  onAssign,
  onUpdateHours,
  onShowProfile,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  assignments: ResourceAssignment[];
  positionHoursPerWeek: number;
  onAssign: (id: string) => void;
  onUpdateHours: (id: string, hours: number) => void;
  onShowProfile?: (r: BenchResource) => void;
}) {
  const [open, setOpen] = useState(false);
  const q = query.trim().toLowerCase();
  const results = q
    ? BENCH.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.skills.some((s) => s.toLowerCase().includes(q))
      )
    : BENCH;

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="flex items-center gap-2 rounded-lg bg-white"
        style={{ border: '1px solid #E2E8F0', padding: '8px 12px' }}
      >
        <Search size={13} color="#A0AEC0" />
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 250)}
          placeholder="Search by name, role, or skill"
          style={{
            fontSize: '12px',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            flex: 1,
            color: '#1A202C',
          }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="rounded-lg bg-white"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            border: '1px solid #E2E8F0',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            maxHeight: 260,
            overflowY: 'auto',
            zIndex: 20,
          }}
        >
          {results.map((r) => {
            const assignment = assignments.find((a) => a.resourceId === r.id);
            const picked = !!assignment;
            const leavingSoon = isOnLeaveSoon(r);
            const daysUntilLeave = getDaysUntilLeave(r);
            return (
              <div
                key={r.id}
                className="w-full text-left"
                style={{
                  padding: '8px 12px',
                  backgroundColor: picked ? '#ECFDF5' : 'white',
                  borderBottom: '1px solid #F0F0F0',
                }}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onAssign(r.id);
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: '#10B981',
                      fontSize: '10px',
                      fontWeight: '600',
                    }}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        onMouseDown={(e) => {
                          if (onShowProfile) {
                            e.preventDefault();
                            e.stopPropagation();
                            onShowProfile(r);
                            setOpen(false);
                          }
                        }}
                        style={{
                          fontSize: '12px',
                          color: '#1A202C',
                          fontWeight: '600',
                          cursor: onShowProfile ? 'pointer' : 'default',
                          textDecoration: onShowProfile ? 'underline' : 'none',
                          textDecorationColor: '#CBD5E1',
                          textUnderlineOffset: 3,
                        }}
                      >
                        {r.name}
                      </div>
                      {leavingSoon && (
                        <LeaveCalendarBadge resource={r} daysUntilLeave={daysUntilLeave} />
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#718096' }}>
                      {r.role} · {r.experience} · {r.utilization}% util · avail{' '}
                      {r.availableFrom}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A0AEC0', marginTop: '2px' }}>
                      {r.skills.join(' · ')}
                    </div>
                  </div>
                  {picked && <Check size={14} color="#059669" />}
                </div>
                {picked && assignment && (
                  <div className="mt-2 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid #D1FAE5' }}>
                    <label style={{ fontSize: '10px', color: '#059669', fontWeight: '600' }}>
                      Hours/Week:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={assignment.hoursPerWeek}
                      onChange={(e) => {
                        const hours = Math.max(0, Number(e.target.value));
                        onUpdateHours(r.id, hours);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '70px',
                        fontSize: '12px',
                        padding: '4px 8px',
                        border: '1px solid #A7F3D0',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#1A202C',
                        backgroundColor: 'white',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#718096' }}>
                      ≈ {Math.round(assignment.hoursPerWeek * 4)}h/month
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
