import { useState, useRef, useEffect, type CSSProperties, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
  Plus,
  ExternalLink,
  Check,
  Circle,
  Video,
  Trash2,
  Link as LinkIcon,
  LogOut,
  Settings as SettingsIcon,
  AlertTriangle,
  LayoutGrid,
  Camera,
  TrendingDown,
  Zap,
  X as XIcon,
} from 'lucide-react';
import { TeamAvatars, type TeamAvatarMember } from './TeamAvatars';
import { getAllocations, setAllocations } from '../data/projectAllocations';

export const AVATAR_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#4A5568', '#0EA5E9', '#EF4444'];

function formatDate(d: string): string {
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

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function heroMembers(project: ProjectLike, rows: AllocationRow[]): TeamAvatarMember[] {
  if (rows && rows.length > 0) {
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
  return project.team.map((m) => ({ initials: m.initials, color: m.color }));
}

interface TeamMember {
  initials: string;
  color: string;
}

interface PrefilledAllocation {
  role: string;
  person: string;
  hours: number;
  isHiring?: boolean;
}

interface ProjectLike {
  name: string;
  client: string;
  tags: string[];
  team: TeamMember[];
  start: string;
  end: string;
  links?: string[];
  lastUpdated: string;
  triggered?: boolean;
  prefilledAllocations?: PrefilledAllocation[];
}

interface Note {
  author: string;
  initials: string;
  color: string;
  date: string;
  title?: string;
  body: string;
  showIncludes?: boolean;
}

const NOTES: Note[] = [
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '14th Apr 2026',
    title: 'Deployed v2.1.0 to Production',
    body: 'A mix of personalization, hiring flow, permissions, and MBO improvements in this release.\n\n• Dashboard — Personalized home page, profile settings, and widget configuration improvements\n• Employee directory — Permission-based filtering and stronger RBAC permission checks\n• Hiring — Attach candidates to new jobs with Slack notifications and onboarding autofill\n• Document verification — Optional steps and US location-based email handling for candidates\n• MBO — Better unsaved goals handling, status updates with special permissions, and copy-goal fixes\n• Interviews — Download Zoom meeting artifacts from the interview flow\n• Timesheets — Country-based employee filtering added for generation\n• Projects — Project release notes are now integrated into the project module\n• Platform — Improved Slack auto-status, office map support, and clock skew access protection\n• Misc — Email template, date display, logging, migration, build, and small UI fixes',
    showIncludes: true,
  },
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '30th Mar 2026',
    body: 'v2.0.21 brings powerful updates across analytics, collaboration, and operations.\n\n• Timesheet Analytics for better visibility into time tracking\n• Office Location added for improved employee context\n• Enhancements to Quotations for smoother workflows\n• Random Review Allocations to streamline evaluation distribution\n• Festival Leaves now visible on the Profile page\n• New "Your Team" widget with team overview, allocations, approvals, and notes\n• Cross-function resource request to enable better collaboration across teams\n• Inventory Module introduced for asset and resource management',
  },
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '24th Mar 2026',
    title: 'Deployed v2.0.17 to Production',
    body: 'Includes:\n\n• Added a toggle for daily check-in popup preferences in user profiles.\n• Users can now add celebrations on behalf of others with the required permissions.\n• Improved project notes with shortcuts for adding notes and better date handling.\n• Enhanced timesheet features, including a missing streak count calculation and adjustments.\n• Introduced occasion coin crediting for birthdays and work anniversaries in the shop.\n• Notifications for user activity (active/inactive) are now sent via Slack.\n• Improved error handling and logging for Zoom services and fixed issues with Slack notifications.\n• Updated entity schemas to meet new requirements.\n• Refined badges response structure for users.\n• Minor bug fixes.',
  },
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '18th Mar 2026',
    body: 'Deployed v2.0.15 to Production Includes:  • Awards Nominations  • Team Timesheet – Weekly View  • Celebrations  • Daily Check-ins  • Timesheet Draft Card in Dashboard  • Minor bug fixes',
  },
  { author: 'Jay Gangani', initials: 'JG', color: '#F59E0B', date: '16th Feb 2026', body: 'Launching V2 Soon' },
  { author: 'Jay Gangani', initials: 'JG', color: '#F59E0B', date: '10th Nov 2025', body: 'Started building v2' },
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '7th Jan 2023',
    body: 'We had done a night out at Shilp Epitome 1303 office and completed the 1st version of the York IE Hub',
  },
  {
    author: 'Jay Gangani',
    initials: 'JG',
    color: '#F59E0B',
    date: '29th Nov 2022',
    body: 'First commit added in the project by Kalrav Parsana',
  },
];

const TABS = [
  'Notes',
  'Work Logs',
  'Buckets',
  'Allocations',
  'Code Quality',
  'Passwords',
  'Strategist Notes',
  'Activity',
  'Settings',
  'Prowler',
];

const ONBOARDING = [
  { label: 'Tags not added', done: false },
  { label: 'Dev Team Setup pending', done: false },
  { label: 'Allocation pending', done: false },
  { label: 'Client POC not added', done: false },
  { label: 'Meetings table empty', done: false },
];

export function ProjectDetail({
  project,
  onBack,
}: {
  project: ProjectLike;
  onBack: () => void;
}) {
  const [tab, setTab] = useState(project.triggered ? 'Allocations' : 'Notes');
  const projectKey = `${project.name}|${project.client}`;
  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const saved = getAllocations(projectKey);
    if (saved) return saved;
    if (project.prefilledAllocations && project.prefilledAllocations.length > 0) {
      return project.prefilledAllocations.map((p) => ({
        role: p.role,
        person: p.isHiring ? 'Hiring in progress' : p.person,
        hours: p.hours,
      }));
    }
    return INITIAL_ALLOCATIONS;
  });

  useEffect(() => {
    setAllocations(projectKey, rows);
  }, [projectKey, rows]);

  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5 hover:underline"
        style={{
          fontSize: '13px',
          color: '#059669',
          fontWeight: '500',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={14} />
        Back to Projects
      </button>

      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600' }}>{project.name}</h1>
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
          }}
        >
          <Sparkles size={13} />
          Generate Summary
        </button>
      </div>

      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div style={{ minWidth: 0 }}>
          <HeroCard project={project} rows={rows} />
        </div>
        <OnboardingCard />
      </div>

      <div className="space-y-5" style={{ minWidth: 0 }}>
        <TabsBar tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'Notes' && <NotesSection />}
        {tab === 'Allocations' && (
          <AllocationsTab
            rows={rows}
            setRows={setRows}
            blankTopFields={project.triggered}
          />
        )}
        {tab === 'Settings' && <SettingsTab />}
        {tab !== 'Notes' && tab !== 'Allocations' && tab !== 'Settings' && (
          <PlaceholderCard label={`${tab} view coming soon`} />
        )}
        <MeetingNotesCard />
      </div>
    </div>
  );
}

function HeroCard({ project, rows }: { project: ProjectLike; rows: AllocationRow[] }) {
  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid #E2E8F0', padding: '18px 20px' }}>
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
          {project.name.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '15px', color: '#1A202C', fontWeight: '600' }}>
            {project.name} - {project.client}
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
          <TeamAvatars members={heroMembers(project, rows)} visibleCount={4} size={28} />
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

      <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '14px 0' }} />

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Latest Note:</div>
          <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
            Deployed v2.1.0 to Production
          </div>
          <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginTop: '6px' }}>
            Includes
          </div>
          <p style={{ fontSize: '12px', color: '#4A5568', marginTop: '4px', lineHeight: '1.5' }}>
            A mix of personalization, hiring flow, permissions, and MBO improvements in this release....
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
        </div>
        {project.links && project.links.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '6px' }}>Links</div>
            <div className="flex flex-col gap-1">
              {project.links.map((l) => (
                <a
                  key={l}
                  className="flex items-center gap-1"
                  style={{ fontSize: '12px', color: '#10B981', fontWeight: '500', cursor: 'pointer' }}
                >
                  <ExternalLink size={11} />
                  {l}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #F0F0F0', marginTop: '14px', paddingTop: '10px' }}>
        <span style={{ fontSize: '11px', color: '#A0AEC0' }}>
          Last Updated: {project.lastUpdated}
        </span>
      </div>
    </div>
  );
}

function OnboardingCard() {
  const done = ONBOARDING.filter((o) => o.done).length;
  const total = ONBOARDING.length;
  const complete = total - done; // shown as "4 of 5 complete" (items still pending + 4 done already in example)
  return (
    <div
      className="bg-white rounded-xl"
      style={{ border: '1px solid #E2E8F0', padding: '18px 20px', height: 'fit-content' }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>Project Onboarding</h3>
      </div>
      <p style={{ fontSize: '12px', color: '#718096', marginBottom: '14px' }}>
        {complete - 1} of {total} complete
      </p>
      <div className="space-y-3">
        {ONBOARDING.map((o) => (
          <div key={o.label} className="flex items-center gap-2">
            {o.done ? (
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 16, height: 16, backgroundColor: '#10B981' }}
              >
                <Check size={10} color="white" />
              </div>
            ) : (
              <Circle size={16} color="#CBD5E0" />
            )}
            <span style={{ fontSize: '12px', color: '#4A5568' }}>{o.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabsBar({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div
      className="bg-white rounded-xl flex items-center overflow-x-auto"
      style={{ border: '1px solid #E2E8F0', padding: '0 8px' }}
    >
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isActive ? '#059669' : '#718096',
              padding: '14px 14px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? '#10B981' : 'transparent'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function NotesSection() {
  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid #E2E8F0', padding: '20px 24px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: '16px', color: '#1A202C', fontWeight: '600' }}>Notes</h3>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-md bg-white"
            style={{ border: '1px solid #E2E8F0', padding: '6px 10px', fontSize: '12px', color: '#4A5568' }}
          >
            Newest First
            <ChevronDown size={12} color="#A0AEC0" />
          </div>
          <button
            className="flex items-center gap-1 rounded-md"
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '7px 12px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            Add Note
          </button>
        </div>
      </div>

      <div
        className="flex gap-4 overflow-x-auto"
        style={{ paddingBottom: '4px' }}
      >
        {NOTES.map((n, i) => (
          <NoteItem key={`${n.date}-${i}`} note={n} />
        ))}
      </div>
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  return (
    <div
      className="rounded-xl bg-white flex-shrink-0"
      style={{
        border: '1px solid #E2E8F0',
        padding: '16px 18px',
        width: 280,
        height: 260,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="rounded-full flex items-center justify-center text-white"
          style={{ width: 24, height: 24, backgroundColor: note.color, fontSize: '10px', fontWeight: '600' }}
        >
          {note.initials}
        </div>
        <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>{note.author}</span>
        <span
          style={{
            fontSize: '11px',
            color: '#A0AEC0',
            marginLeft: 'auto',
            cursor: 'pointer',
          }}
        >
          ⧉
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#A0AEC0', marginBottom: '10px' }}>{note.date}</div>
      {note.title && (
        <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginBottom: '6px' }}>
          {note.title}
        </div>
      )}
      {note.showIncludes && (
        <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginBottom: '4px' }}>
          Includes
        </div>
      )}
      <p
        style={{
          fontSize: '12px',
          color: '#4A5568',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
        }}
      >
        {note.body}
      </p>
    </div>
  );
}

function MeetingNotesCard() {
  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid #E2E8F0', padding: '20px 24px' }}>
      <h3 style={{ fontSize: '16px', color: '#1A202C', fontWeight: '600', marginBottom: '4px' }}>
        Meeting Notes
      </h3>
      <p style={{ fontSize: '12px', color: '#718096', marginBottom: '20px' }}>
        Review meeting summaries, action items, and insights
      </p>
      <div className="flex flex-col items-center text-center py-8">
        <div
          className="rounded-full flex items-center justify-center mb-3"
          style={{ width: 48, height: 48, backgroundColor: '#ECFDF5' }}
        >
          <Video size={22} color="#10B981" />
        </div>
        <div style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600', marginBottom: '6px' }}>
          No meeting notes available
        </div>
        <p style={{ fontSize: '12px', color: '#718096', maxWidth: '460px', lineHeight: '1.5' }}>
          Meeting notes will appear here once meetings are recorded and processed. Connect your Zoom
          account to automatically capture meeting summaries.
        </p>
      </div>
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div
      className="bg-white rounded-xl flex items-center justify-center"
      style={{ border: '1px solid #E2E8F0', padding: '60px 24px', fontSize: '13px', color: '#A0AEC0' }}
    >
      {label}
    </div>
  );
}

interface Downgrade {
  mode: 'reduce' | 'remove';
  effectiveDate: string;
  reducedHours?: number;
  note?: string;
}
interface BurstWindow {
  startDate: string;
  endDate: string;
  note?: string;
}
interface AllocationRow {
  role: string;
  person: string;
  hours: number;
  downgrade?: Downgrade;
  burst?: BurstWindow;
}

export const DEFAULT_ALLOCATIONS: { role: string; person: string; hours: number }[] = [
  { role: 'BE', person: 'Jaydip Makwana', hours: 40 },
  { role: 'Full Stack', person: 'Jal Patel', hours: 40 },
  { role: 'FE', person: 'Laxit Shah', hours: 40 },
  { role: 'FE', person: 'Khushi Vyas', hours: 20 },
  { role: 'BE', person: 'Karan Vaghela', hours: 40 },
];

const INITIAL_ALLOCATIONS: AllocationRow[] = [
  { role: 'BE', person: 'Jaydip Makwana', hours: 40 },
  { role: 'Full Stack', person: 'Jal Patel', hours: 40 },
  { role: 'FE', person: 'Laxit Shah', hours: 40 },
  { role: 'FE', person: 'Khushi Vyas', hours: 20 },
  { role: 'BE', person: 'Karan Vaghela', hours: 40 },
];

function AllocationsTab({
  rows,
  setRows,
  blankTopFields,
}: {
  rows: AllocationRow[];
  setRows: Dispatch<SetStateAction<AllocationRow[]>>;
  blankTopFields?: boolean;
}) {
  const blankVal = blankTopFields ? '' : undefined;

  const updateRow = (i: number, patch: Partial<AllocationRow>) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const addRow = () =>
    setRows((r) => [...r, { role: '', person: '', hours: 40 }]);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl" style={{ border: '1px solid #E2E8F0', padding: '22px 24px' }}>
      <div className="flex items-start justify-end mb-4">
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
      </div>

      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <AllocField label="Product Manager *" value={blankVal ?? 'Jay Gangani'} />
        <AllocField label="Product Strategist *" value={blankVal ?? 'Evan York'} />
        <AllocField label="Lead *" value={blankVal ?? 'Kalrav Parsana'} />
        <AllocField label="Dev Principal *" value={blankVal ?? 'Jay Gangani'} />
        <AllocField label="APM" value={blankVal ?? 'Jay Gangani'} />
        <AllocField label="Squad *" value={blankVal ?? 'York'} />
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
          <AllocationRowItem
            key={`${row.role}-${row.person}-${i}`}
            row={row}
            onUpdate={(patch) => updateRow(i, patch)}
            onRemove={() => removeRow(i)}
          />
        ))}
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

function AllocationRowItem({
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
        style={{ gridTemplateColumns: '1fr 1fr 140px 100px 28px 28px' }}
      >
        <RoleSelect value={row.role} onChange={(role) => onUpdate({ role })} />
        <ResourceSelect value={row.person} onChange={(person) => onUpdate({ person })} />
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
          <Trash2 size={16} color="#EF4444" />
        </button>
      </div>

      {/* Scenario actions */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {isBurst && (
          <span
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              padding: '3px 8px',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              border: '1px solid #93C5FD',
            }}
          >
            <Zap size={10} />
            BURST RESOURCE
          </span>
        )}
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
                ? `To be removed on ${formatDate(row.downgrade.effectiveDate)}`
                : `To be reduced to ${row.downgrade.reducedHours ?? '?'}h/wk from ${formatDate(row.downgrade.effectiveDate)}`}
              <XIcon
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
              Burst {formatDate(row.burst.startDate)} → {formatDate(row.burst.endDate)}
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
  initial?: Downgrade;
  currentHours: number;
  onCancel: () => void;
  onSave: (d: Downgrade) => void;
}) {
  const [mode, setMode] = useState<'reduce' | 'remove'>(initial?.mode ?? 'reduce');
  const [effectiveDate, setEffectiveDate] = useState(initial?.effectiveDate ?? '');
  const [reducedHours, setReducedHours] = useState<string>(
    initial?.reducedHours != null ? String(initial.reducedHours) : ''
  );
  const [note, setNote] = useState(initial?.note ?? '');

  const canSave =
    !!effectiveDate && (mode === 'remove' || !!reducedHours);

  return (
    <div
      className="rounded-lg mt-3"
      style={{
        backgroundColor: 'white',
        border: '1px solid #FCA5A5',
        padding: '12px 14px',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown size={13} color="#B91C1C" />
        <span style={{ fontSize: '12px', color: '#B91C1C', fontWeight: '700' }}>
          Schedule downgrade
        </span>
        <span style={{ fontSize: '11px', color: '#718096' }}>
          (current: {currentHours}h/wk)
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {(['reduce', 'remove'] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                border: `1px solid ${active ? '#DC2626' : '#E2E8F0'}`,
                backgroundColor: active ? '#FEE2E2' : 'white',
                color: active ? '#B91C1C' : '#4A5568',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {m === 'reduce' ? 'Reduce hours' : 'Remove resource'}
            </button>
          );
        })}
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: mode === 'reduce' ? '1fr 1fr' : '1fr' }}
      >
        <MiniField label="Effective from *">
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            style={miniInput}
          />
        </MiniField>
        {mode === 'reduce' && (
          <MiniField label="New hours/week *">
            <input
              type="number"
              placeholder="e.g. 20"
              value={reducedHours}
              onChange={(e) => setReducedHours(e.target.value)}
              style={miniInput}
            />
          </MiniField>
        )}
      </div>
      <MiniField label="Reason / note">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            mode === 'remove'
              ? 'e.g. resource rolling off to another project'
              : 'e.g. scaling down after launch'
          }
          style={miniInput}
        />
      </MiniField>
      <div className="flex items-center justify-end gap-2 mt-3">
        <button onClick={onCancel} style={miniBtn}>
          Cancel
        </button>
        <button
          onClick={() =>
            canSave &&
            onSave({
              mode,
              effectiveDate,
              reducedHours: mode === 'reduce' ? Number(reducedHours) : undefined,
              note: note || undefined,
            })
          }
          disabled={!canSave}
          style={{
            ...miniBtn,
            backgroundColor: canSave ? '#DC2626' : '#E2E8F0',
            color: canSave ? 'white' : '#A0AEC0',
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          Save downgrade
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
  initial?: BurstWindow;
  onCancel: () => void;
  onSave: (b: BurstWindow) => void;
}) {
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  return (
    <div
      className="rounded-lg mt-3"
      style={{
        backgroundColor: 'white',
        border: '1px solid #93C5FD',
        padding: '12px 14px',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} color="#1D4ED8" />
        <span style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: '700' }}>
          Schedule burst
        </span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <MiniField label="Starts on *">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={miniInput}
          />
        </MiniField>
        <MiniField label="Ends on *">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={miniInput}
          />
        </MiniField>
      </div>
      <MiniField label="Reason / note">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. release crunch support"
          style={miniInput}
        />
      </MiniField>
      <div className="flex items-center justify-end gap-2 mt-3">
        <button onClick={onCancel} style={miniBtn}>
          Cancel
        </button>
        <button
          onClick={() =>
            startDate &&
            endDate &&
            onSave({
              startDate,
              endDate,
              note: note || undefined,
            })
          }
          style={{ ...miniBtn, backgroundColor: '#2563EB', color: 'white', border: 'none' }}
        >
          Save burst window
        </button>
      </div>
    </div>
  );
}

const miniInput: CSSProperties = {
  fontSize: '12px',
  padding: '8px 10px',
  border: '1px solid #E2E8F0',
  outline: 'none',
  color: '#1A202C',
  borderRadius: 6,
  width: '100%',
  backgroundColor: 'white',
};
const miniBtn: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  padding: '7px 12px',
  border: '1px solid #E2E8F0',
  backgroundColor: 'white',
  color: '#1A202C',
  borderRadius: 6,
  cursor: 'pointer',
};

function MiniField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontSize: '11px',
          color: '#4A5568',
          fontWeight: '600',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const INITIAL_ROLES: string[] = [
  'BE',
  'FE',
  'Full Stack',
  'QA',
  'DevOps',
  'UX Designer',
  'Product Manager',
  'Project Manager',
  'Backend',
  'Frontend',
  'Data Engineer',
  'RevOps',
];

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [extra, setExtra] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pool = [...INITIAL_ROLES, ...extra];
  const s = q.trim().toLowerCase();
  const filtered = pool.filter((r) => !s || r.toLowerCase().includes(s));
  const exact = pool.some((r) => r.toLowerCase() === s);
  const canAdd = s.length > 0 && !exact;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQ('');
  };
  const addNew = () => {
    const v = q.trim();
    if (!v) return;
    setExtra((e) => (e.includes(v) ? e : [...e, v]));
    pick(v);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg bg-white"
        style={{
          border: '1px solid #E2E8F0',
          padding: '9px 12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '13px', color: value ? '#1A202C' : '#A0AEC0' }}>
          {value || 'Select role…'}
        </span>
        <ChevronDown size={14} color="#A0AEC0" />
      </button>
      {open && (
        <div
          className="rounded-lg bg-white"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 40,
            maxHeight: 280,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid #F0F0F0' }}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canAdd) {
                  e.preventDefault();
                  addNew();
                }
              }}
              placeholder="Search or add role…"
              style={{
                width: '100%',
                fontSize: '12px',
                padding: '6px 8px',
                border: '1px solid #E2E8F0',
                borderRadius: 6,
                outline: 'none',
                color: '#1A202C',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pick(r)}
                className="w-full"
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#1A202C',
                  background: r === value ? '#ECFDF5' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {r}
              </button>
            ))}
            {filtered.length === 0 && !canAdd && (
              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#A0AEC0' }}>
                No matches
              </div>
            )}
            {canAdd && (
              <button
                type="button"
                onClick={addNew}
                className="w-full flex items-center gap-2"
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#059669',
                  fontWeight: '600',
                  background: '#ECFDF5',
                  border: 'none',
                  borderTop: '1px solid #D1FAE5',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Plus size={12} />
                Add "{q.trim()}" as new role
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const RESOURCE_POOL: { name: string; role: string; initials: string; color: string }[] = [
  { name: 'Jenish Gohil', role: 'Full Stack', initials: 'JG', color: '#6366F1' },
  { name: 'Jiyanshi Patel', role: 'QA', initials: 'JP', color: '#EC4899' },
  { name: 'Bhumika Udani', role: 'RevOps', initials: 'BU', color: '#F59E0B' },
  { name: 'Bryan Belanger', role: 'Backend', initials: 'BB', color: '#10B981' },
  { name: 'Shreya Gokani', role: 'Full Stack', initials: 'SG', color: '#8B5CF6' },
  { name: 'Kalrav Parsana', role: 'UX Designer', initials: 'KP', color: '#10B981' },
  { name: 'Jaydip Makwana', role: 'Backend', initials: 'JM', color: '#4A5568' },
  { name: 'Khushi Vyas', role: 'Frontend', initials: 'KV', color: '#0EA5E9' },
  { name: 'Jal Patel', role: 'Full Stack', initials: 'JP', color: '#6366F1' },
  { name: 'Laxit Shah', role: 'Frontend', initials: 'LS', color: '#EC4899' },
  { name: 'Karan Vaghela', role: 'Backend', initials: 'KV', color: '#F59E0B' },
  { name: 'Jay Gangani', role: 'Dev Principal', initials: 'JG', color: '#F59E0B' },
  { name: 'Priya Shah', role: 'Talent Lead', initials: 'PS', color: '#10B981' },
];

function ResourceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const filtered = RESOURCE_POOL.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.role.toLowerCase().includes(s);
  });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg bg-white"
        style={{
          border: '1px solid #E2E8F0',
          padding: '9px 12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '13px', color: value ? '#1A202C' : '#A0AEC0' }}>
          {value || 'Select resource…'}
        </span>
        <ChevronDown size={14} color="#A0AEC0" />
      </button>
      {open && (
        <div
          className="rounded-lg bg-white"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 40,
            maxHeight: 280,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid #F0F0F0' }}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resource or role…"
              style={{
                width: '100%',
                fontSize: '12px',
                padding: '6px 8px',
                border: '1px solid #E2E8F0',
                borderRadius: 6,
                outline: 'none',
                color: '#1A202C',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#A0AEC0' }}>
                No matches
              </div>
            )}
            {filtered.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  onChange(r.name);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full flex items-center gap-2"
                style={{
                  padding: '8px 12px',
                  background: r.name === value ? '#ECFDF5' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white"
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: r.color,
                    fontSize: 9,
                    fontWeight: '600',
                  }}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#718096' }}>{r.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type BulkPlan = { kind: 'keep' } | { kind: 'remove' } | { kind: 'reduce'; reducedHours: number };

function BulkDowngradePanel({
  rows,
  onClose,
  onApply,
}: {
  rows: AllocationRow[];
  onClose: () => void;
  onApply: (effectiveDate: string, plan: Map<number, BulkPlan>) => void;
}) {
  const [effectiveDate, setEffectiveDate] = useState('');
  const [keep, setKeep] = useState<Set<number>>(() => new Set(rows.map((_, i) => i)));
  const [hoursDraft, setHoursDraft] = useState<Record<number, number>>(() =>
    Object.fromEntries(rows.map((r, i) => [i, r.hours])),
  );
  const toggle = (i: number) =>
    setKeep((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const setHours = (i: number, h: number) =>
    setHoursDraft((d) => ({ ...d, [i]: Math.max(0, h) }));

  const plan = new Map<number, BulkPlan>();
  rows.forEach((row, i) => {
    if (!keep.has(i)) plan.set(i, { kind: 'remove' });
    else if (hoursDraft[i] !== row.hours && hoursDraft[i] >= 0)
      plan.set(i, { kind: 'reduce', reducedHours: hoursDraft[i] });
    else plan.set(i, { kind: 'keep' });
  });
  const changeCount = [...plan.values()].filter((p) => p.kind !== 'keep').length;
  const canApply = !!effectiveDate && changeCount > 0;

  return (
    <div
      className="rounded-lg mb-3"
      style={{
        border: '1px solid #FCA5A5',
        backgroundColor: '#FEF2F2',
        padding: '14px 16px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={14} color="#B91C1C" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#B91C1C' }}>
            Bulk downgrade
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <XIcon size={14} color="#B91C1C" />
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#7F1D1D', marginBottom: '10px' }}>
        Pick the effective date. Uncheck a resource to remove them from that date. Keep them
        checked and edit the hours inline to schedule a reduction.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <label style={{ fontSize: '12px', color: '#7F1D1D', fontWeight: '600' }}>
          Effective date
        </label>
        <input
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          style={{
            fontSize: '12px',
            padding: '6px 8px',
            border: '1px solid #FCA5A5',
            borderRadius: 6,
            outline: 'none',
            color: '#1A202C',
            background: 'white',
          }}
        />
      </div>

      <div
        className="rounded-lg bg-white"
        style={{ border: '1px solid #FECACA', marginBottom: '12px' }}
      >
        {rows.map((row, i) => {
          const p = plan.get(i) ?? { kind: 'keep' };
          const willRemove = p.kind === 'remove';
          const willReduce = p.kind === 'reduce';
          const bg = willRemove ? '#FEF2F2' : willReduce ? '#FFF7ED' : 'white';
          return (
            <div
              key={i}
              className="flex items-center gap-3"
              style={{
                padding: '10px 12px',
                borderBottom: i < rows.length - 1 ? '1px solid #FEF2F2' : 'none',
                background: bg,
              }}
            >
              <input
                type="checkbox"
                checked={keep.has(i)}
                onChange={() => toggle(i)}
                style={{ cursor: 'pointer' }}
              />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
                  {row.person || <span style={{ color: '#A0AEC0' }}>Unassigned</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#718096' }}>
                  {row.role || '—'} · current {row.hours}h/wk
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={row.hours}
                  disabled={willRemove}
                  value={hoursDraft[i] ?? row.hours}
                  onChange={(e) => setHours(i, Number(e.target.value))}
                  style={{
                    width: 64,
                    fontSize: '12px',
                    padding: '6px 8px',
                    border: `1px solid ${willReduce ? '#FDBA74' : '#E2E8F0'}`,
                    borderRadius: 6,
                    outline: 'none',
                    color: willRemove ? '#A0AEC0' : '#1A202C',
                    background: willRemove ? '#F8FAFC' : 'white',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#718096' }}>h/wk</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  minWidth: 78,
                  textAlign: 'right',
                  color: willRemove ? '#B91C1C' : willReduce ? '#C2410C' : '#059669',
                }}
              >
                {willRemove ? 'REMOVE' : willReduce ? 'REDUCE' : 'KEEP'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span style={{ fontSize: '12px', color: '#7F1D1D' }}>
          {changeCount} of {rows.length} will be downgraded
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#4A5568',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            disabled={!canApply}
            onClick={() => onApply(effectiveDate, plan)}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              background: canApply ? '#B91C1C' : '#FCA5A5',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              cursor: canApply ? 'pointer' : 'not-allowed',
            }}
          >
            Apply downgrade
          </button>
        </div>
      </div>
    </div>
  );
}

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

const SETTINGS_TABS = [
  { label: 'General', Icon: SettingsIcon },
  { label: 'Important Links', Icon: LinkIcon },
  { label: 'Exit Status', Icon: LogOut },
  { label: 'Meetings', Icon: Video },
  { label: 'Gerrit configurations', Icon: LayoutGrid },
  { label: 'Danger Zone', Icon: AlertTriangle },
];

const STATUS_OPTIONS = [
  { label: 'RED', color: '#EF4444' },
  { label: 'YELLOW', color: '#F59E0B' },
  { label: 'GREEN', color: '#10B981' },
  { label: 'POTENTIAL DOWNGRADE', color: '#A0AEC0' },
  { label: 'CANCELLATION', color: '#A0AEC0' },
];

function SettingsTab() {
  const [active, setActive] = useState('General');
  const [status, setStatus] = useState('GREEN');
  const [isInternal, setIsInternal] = useState(true);

  return (
    <div
      className="bg-white rounded-xl grid"
      style={{ border: '1px solid #E2E8F0', gridTemplateColumns: '190px minmax(0, 1fr)' }}
    >
      {/* Vertical tabs */}
      <div style={{ borderRight: '1px solid #E2E8F0', padding: '16px 12px' }}>
        <div className="space-y-1">
          {SETTINGS_TABS.map((t) => {
            const isActive = active === t.label;
            return (
              <button
                key={t.label}
                onClick={() => setActive(t.label)}
                className="w-full flex items-center gap-2 text-left"
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <t.Icon size={15} color={isActive ? '#059669' : '#4A5568'} />
                <span
                  style={{
                    fontSize: '13px',
                    color: isActive ? '#059669' : '#4A5568',
                    fontWeight: isActive ? '600' : '500',
                  }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ padding: '20px 22px', minWidth: 0 }}>
        {active === 'General' ? (
          <>
            <h3 style={{ fontSize: '15px', color: '#1A202C', fontWeight: '700', marginBottom: '16px' }}>
              General Details
            </h3>

            <div className="grid gap-5" style={{ gridTemplateColumns: '160px minmax(0, 1fr)' }}>
              {/* Logo */}
              <div>
                <div style={{ fontSize: '12px', color: '#4A5568', fontWeight: '500', marginBottom: '6px' }}>
                  Project Logo
                </div>
                <div
                  className="flex flex-col items-center justify-center rounded-lg"
                  style={{
                    width: '100%',
                    maxWidth: 150,
                    height: 120,
                    border: '1.5px dashed #A7F3D0',
                    backgroundColor: '#F0FDF4',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '40px', color: '#10B981' }}>✦</div>
                  <button
                    className="flex items-center gap-1 rounded-md"
                    style={{
                      fontSize: '12px',
                      color: '#059669',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      border: '1px solid #A7F3D0',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      position: 'absolute',
                      bottom: 10,
                    }}
                  >
                    <Camera size={12} />
                    Change
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <span style={{ fontSize: '13px', color: '#4A5568', fontWeight: '500' }}>
                    Is Internal?
                  </span>
                  <button
                    onClick={() => setIsInternal((v) => !v)}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 9999,
                      backgroundColor: isInternal ? '#10B981' : '#CBD5E0',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: isInternal ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        transition: 'left 0.15s',
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#4A5568', fontWeight: '500', marginBottom: '8px' }}>
                  <span style={{ color: '#EF4444' }}>* </span>Status
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  {STATUS_OPTIONS.map((s) => {
                    const on = status === s.label;
                    return (
                      <button
                        key={s.label}
                        onClick={() => setStatus(s.label)}
                        className="flex items-center gap-2"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: `2px solid ${on ? s.color : '#CBD5E0'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {on && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: s.color,
                              }}
                            />
                          )}
                        </span>
                        <span style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                  <SetField label="Project Name" value="Hub Project" />
                  <SetField label="Project Domain" value="HRMS" />
                  <SetSelect label="Client" value="York IE" />
                </div>

                <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)' }}>
                  <SetSelect label="Department" value="GTM platform" />
                  <SetTags label="Project Tags" tags={['Internal - BDR']} />
                </div>

                <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                  <SetTags label="Tools Used" tags={['JIRA', 'GERRIT']} />
                  <SetTags label="Tech Stack" tags={['REACT', 'AWS AMPLIFY']} />
                  <SetSelect label="Project App Type" value="Web" />
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <SetField label="Start Date" value="January 1st, 2024" icon="📅" />
                  <SetField label="End Date" value="December 31st, 2024" icon="📅" />
                  <SetField label="Client POC" value="" placeholder="Enter client POC" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ minHeight: 300, fontSize: '13px', color: '#A0AEC0' }}
          >
            {active} settings coming soon
          </div>
        )}
      </div>
    </div>
  );
}

function SetField({
  label,
  value,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  placeholder?: string;
  icon?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#4A5568', fontWeight: '500', marginBottom: '5px' }}>
        {label}
      </div>
      <div
        className="flex items-center justify-between rounded-lg bg-white"
        style={{ border: '1px solid #E2E8F0', padding: '7px 10px', minWidth: 0 }}
      >
        <input
          defaultValue={value}
          placeholder={placeholder}
          style={{
            fontSize: '12px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#1A202C',
            flex: 1,
            minWidth: 0,
            width: '100%',
          }}
        />
        {icon && <span style={{ fontSize: '12px' }}>{icon}</span>}
      </div>
    </div>
  );
}

function SetSelect({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: '#4A5568', fontWeight: '500', marginBottom: '5px' }}>
        {label}
      </div>
      <div
        className="flex items-center justify-between rounded-lg bg-white"
        style={{ border: '1px solid #E2E8F0', padding: '7px 10px', minWidth: 0 }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#1A202C',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </span>
        <ChevronDown size={13} color="#A0AEC0" />
      </div>
    </div>
  );
}

function SetTags({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: '#4A5568', fontWeight: '500', marginBottom: '5px' }}>
        {label}
      </div>
      <div
        className="flex items-center gap-1.5 rounded-lg bg-white flex-wrap"
        style={{ border: '1px solid #E2E8F0', padding: '5px 8px', minHeight: 34 }}
      >
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded"
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontWeight: '600',
            }}
          >
            {t}
            <span style={{ cursor: 'pointer', color: '#059669' }}>×</span>
          </span>
        ))}
      </div>
    </div>
  );
}
