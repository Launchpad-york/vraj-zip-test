import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus, XCircle, ChevronDown, Save, Lock, CheckCircle2,
  Zap, UserPlus, Users, Calendar, AlertTriangle, Search,
  X, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { BENCH, BenchResource, HIRING_STAGES, HiringStage, isOnLeaveSoon } from '../data/resources';
import { EMPLOYEES } from '../data/employees';
import { addTriggeredProject } from '../data/triggeredProjects';
import { setSelectedVersion as saveSelectedVersion } from '../data/quotationVersions';

const POSITION_OPTIONS: string[] = Array.from(new Set(EMPLOYEES.map(e => e.title))).sort();

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuoteStatus = 'Draft' | 'In Review' | 'Locked' | 'SOW Signed' | 'Triggered';

interface ResourceAssignment {
  resourceId: string;
  hrsPerWeek: number;
}

interface TaggedResource {
  assignments: ResourceAssignment[];
  isHiring: boolean;
  hiringPositions?: number;
  hiringHrsPerWeek?: number;
  hiringStage?: HiringStage;
  hiringRole?: string;
}

interface PhaseRow {
  id: string;
  title: string;
  position: string;
  startDate?: string;
  percentage: number;
  hrsPerMonth: number;
  rateLocal: number;
  totalLocal: number;
  totalUsd: number;
  tagged?: TaggedResource;
}

interface MarginRow {
  id: string;
  title: string;
  type: '%' | '$';
  amount: number;
  total: number;
}

interface Phase {
  id: string;
  name: string;
  startDate: string;
  rows: PhaseRow[];
  margins: MarginRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const STANDARD_HRS_MONTH = 160;

function pctToHrs(pct: number) {
  return Math.round((pct / 100) * STANDARD_HRS_MONTH * 100) / 100;
}

const uid = () => Math.random().toString(36).slice(2, 9);

function statusColor(s: QuoteStatus) {
  switch (s) {
    case 'Draft': return { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' };
    case 'In Review': return { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' };
    case 'Locked': return { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' };
    case 'SOW Signed': return { bg: '#ECFDF5', text: '#059669', dot: '#10B981' };
    case 'Triggered': return { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' };
  }
}

const STATUS_FLOW: QuoteStatus[] = ['Draft', 'In Review', 'Locked', 'SOW Signed', 'Triggered'];

function getNextStatus(s: QuoteStatus): QuoteStatus | null {
  const idx = STATUS_FLOW.indexOf(s);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function getNextStatusLabel(s: QuoteStatus): string {
  const next = getNextStatus(s);
  if (!next) return '';
  if (next === 'Locked') return 'Lock Quote';
  if (next === 'SOW Signed') return 'Mark SOW Signed';
  if (next === 'Triggered') return 'Trigger Project';
  return `Move to ${next}`;
}

function scoreResource(r: BenchResource, row: PhaseRow): number {
  const roleMatch = r.role.toLowerCase().includes(row.position.toLowerCase()) ||
    row.position.toLowerCase().includes(r.role.toLowerCase()) ? 2 : 0;
  const available = r.utilization < 100 ? 1 : 0;
  const noLeave = !isOnLeaveSoon(r) ? 1 : 0;
  return roleMatch + available + noLeave;
}

function getDaysUntilLeave(r: BenchResource): number {
  if (!r.onLeaveFrom) return 999;
  const leaveDate = new Date(r.onLeaveFrom);
  const now = new Date('2026-04-27');
  return Math.ceil((leaveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface PickerTarget {
  phaseId: string;
  rowId: string;
}

const AVATAR_COLORS = [
  '#4FD1C5', '#48BB78', '#F6AD55', '#9F7AEA',
  '#63B3ED', '#FC8181', '#68D391', '#F687B3',
];
function avatarColor(initials: string) {
  let h = 0;
  for (const c of initials) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_PHASES: Phase[] = [
  {
    id: 'ph1',
    name: 'Phase 1 – Discovery & Build',
    startDate: '2026-05-01',
    rows: [
      { id: uid(), title: 'Dev Support', position: 'Full Stack', percentage: 25, hrsPerMonth: 40, rateLocal: 200, totalLocal: 346.64, totalUsd: 980.62, tagged: undefined },
      { id: uid(), title: 'SEO/AEO', position: 'RevOps Specialist', percentage: 100, hrsPerMonth: 160, rateLocal: 200, totalLocal: 1039.98, totalUsd: 2942.02, tagged: undefined },
      { id: uid(), title: 'QA', position: 'Quality Assurance', percentage: 25, hrsPerMonth: 40, rateLocal: 200, totalLocal: 216.65, totalUsd: 612.89, tagged: undefined },
      { id: uid(), title: 'UX', position: 'User Experience Designer', percentage: 25, hrsPerMonth: 40, rateLocal: 200, totalLocal: 389.97, totalUsd: 1103.19, tagged: undefined },
    ],
    margins: [
      { id: uid(), title: 'Oversight', type: '$', amount: 120, total: 120 },
      { id: uid(), title: 'Benefits', type: '%', amount: 15, total: 642 },
      { id: uid(), title: 'Office / General Overhead', type: '%', amount: 10, total: 492.2 },
      { id: uid(), title: '15% Required Margin + 18% Tax', type: '%', amount: 17.7, total: 958.31 },
      { id: uid(), title: 'Markup', type: '%', amount: 105, total: 6691.11 },
    ],
  },
];

// ─── Mini Leave Badge + Calendar ─────────────────────────────────────────────

function MiniLeaveBadge({ resource }: { resource: BenchResource }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const daysUntil = getDaysUntilLeave(resource);
  const leaveStart = resource.onLeaveFrom ? new Date(resource.onLeaveFrom) : new Date();
  const leaveEnd = resource.onLeaveUntil ? new Date(resource.onLeaveUntil) : leaveStart;
  const [month, setMonth] = useState(leaveStart.getMonth());
  const [year, setYear] = useState(leaveStart.getFullYear());

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  if (!resource.onLeaveFrom) return null;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={(e) => { e.stopPropagation(); if (!open) { setMonth(leaveStart.getMonth()); setYear(leaveStart.getFullYear()); } setOpen(v => !v); }}
        style={{ fontSize: '9px', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: '700', padding: '1px 6px', borderRadius: 999, cursor: 'pointer', border: '1px solid #FCA5A5', display: 'inline-flex', alignItems: 'center', gap: 3 }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} />
        LEAVE {daysUntil}d
      </span>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', zIndex: 3000, backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', minWidth: 220 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#718096' }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A202C' }}>{monthNames[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#718096' }}><ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '600', textAlign: 'center' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {days.map((d, i) => {
              const inLeave = d !== null && new Date(year, month, d) >= leaveStart && new Date(year, month, d) <= leaveEnd;
              return (
                <div key={i} style={{ fontSize: '10px', textAlign: 'center', padding: '5px 2px', borderRadius: 4, backgroundColor: inLeave ? '#FEE2E2' : 'transparent', color: d === null ? 'transparent' : inLeave ? '#991B1B' : '#4A5568', fontWeight: inLeave ? '700' : '400', border: inLeave ? '1px solid #FCA5A5' : 'none' }}>
                  {d ?? '-'}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F0F0F0', fontSize: '10px', color: '#718096', textAlign: 'center' }}>
            {leaveStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {leaveEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resource Profile Panel ───────────────────────────────────────────────────

function ResourceProfilePanel({
  resource,
  row,
  onClose,
}: {
  resource: BenchResource;
  row?: PhaseRow;
  onClose: () => void;
}) {
  const onLeave = isOnLeaveSoon(resource);
  const reasons: { tone: 'good' | 'warn'; text: string }[] = [];
  if (resource.utilization === 0) reasons.push({ tone: 'good', text: 'Fully available on the bench' });
  else if (resource.utilization < 50) reasons.push({ tone: 'good', text: `Has spare capacity (${100 - resource.utilization}% free)` });
  reasons.push({ tone: 'good', text: `${resource.experience} of experience` });
  reasons.push({ tone: 'good', text: `Available from ${resource.availableFrom}` });
  if (onLeave) reasons.push({ tone: 'warn', text: `Scheduled leave in ${getDaysUntilLeave(resource)} days — plan handover` });
  if (resource.utilization >= 50) reasons.push({ tone: 'warn', text: `Currently ${resource.utilization}% utilized — confirm capacity` });

  return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', zIndex: 3100 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl flex flex-col"
        style={{ width: 520, maxWidth: '92vw', maxHeight: '85vh', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}
      >
        <div className="flex items-center gap-3"
          style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)', borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ width: 48, height: 48, backgroundColor: avatarColor(resource.initials), fontSize: '15px', fontWeight: '600' }}>
            {resource.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '16px', color: '#1A202C', fontWeight: '700' }}>{resource.name}</span>
              {onLeave && <MiniLeaveBadge resource={resource} />}
            </div>
            <div style={{ fontSize: '12px', color: '#4A5568', marginTop: 2 }}>
              {resource.role} · {resource.experience} · {resource.utilization}% utilized · avail {resource.availableFrom}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} color="#64748B" />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '18px 20px' }}>
          {row && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.08em', marginBottom: 6 }}>CONSIDERING FOR</div>
              <div className="rounded-lg" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', fontSize: '13px', color: '#1A202C' }}>
                <span style={{ fontWeight: '600' }}>{row.title || row.position}</span>
                <span style={{ color: '#718096' }}> · {row.position} · {row.percentage}%</span>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.08em', marginBottom: 6 }}>WHY THIS FITS</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }} className="space-y-1.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2" style={{ fontSize: '12px', color: '#1A202C', lineHeight: 1.45 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, marginTop: 6, flexShrink: 0, backgroundColor: r.tone === 'good' ? '#10B981' : '#F59E0B' }} />
                  {r.text}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.08em', marginBottom: 6 }}>SKILLS</div>
            <div className="flex flex-wrap gap-1.5">
              {resource.skills.map(s => (
                <span key={s} className="rounded"
                  style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end"
          style={{ borderTop: '1px solid #E2E8F0', padding: '12px 20px', backgroundColor: '#F8FAFC' }}>
          <button onClick={onClose}
            style={{ fontSize: '13px', fontWeight: '600', color: 'white', backgroundColor: '#10B981', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resource Picker Modal (full AllocationDrawer-style) ──────────────────────

function ResourcePickerModal({
  phases,
  target,
  onAssign,
  onHire,
  onUnassign,
  onAddRow,
  onUpdateRow,
  onClose,
}: {
  phases: Phase[];
  target: PickerTarget;
  onAssign: (phaseId: string, rowId: string, r: BenchResource, hrsPerWeek: number) => void;
  onHire: (phaseId: string, rowId: string, role: string, stage: HiringStage, positions: number, hrsPerWeek: number) => void;
  onUnassign: (phaseId: string, rowId: string, resourceId?: string) => void;
  onAddRow: (phaseId: string) => string;
  onUpdateRow: (phaseId: string, rowId: string, updates: Partial<PhaseRow>) => void;
  onClose: () => void;
}) {
  const [activePhaseId, setActivePhaseId] = useState(target.phaseId);
  const [activeRowId, setActiveRowId] = useState(target.rowId);
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const skillBoxRef = useRef<HTMLDivElement>(null);
  const [profileResource, setProfileResource] = useState<BenchResource | null>(null);
  const [hiringOpen, setHiringOpen] = useState(false);
  const [hiringPositions, setHiringPositions] = useState(1);
  const [hiringHrsPerWeek, setHiringHrsPerWeek] = useState(40);

  const allBenchSkills = useMemo(() => {
    const set = new Set<string>();
    BENCH.forEach(r => r.skills.forEach(s => set.add(s)));
    return [...set].sort();
  }, []);

  const filteredSkillOptions = useMemo(() =>
    allBenchSkills.filter(s =>
      !selectedSkills.includes(s) &&
      (skillQuery.trim() === '' || s.toLowerCase().includes(skillQuery.toLowerCase()))
    ), [allBenchSkills, selectedSkills, skillQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (skillBoxRef.current && !skillBoxRef.current.contains(e.target as Node)) {
        setSkillDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activePhase = phases.find(p => p.id === activePhaseId);
  const activeRow = activePhase?.rows.find(r => r.id === activeRowId);

  const assignedResources = useMemo((): { bench: BenchResource; hrsPerWeek: number }[] => {
    if (!activeRow?.tagged || activeRow.tagged.isHiring) return [];
    return activeRow.tagged.assignments
      .map(a => {
        const bench = BENCH.find(b => b.id === a.resourceId);
        return bench ? { bench, hrsPerWeek: a.hrsPerWeek } : null;
      })
      .filter((x): x is { bench: BenchResource; hrsPerWeek: number } => x !== null);
  }, [activeRow]);

  const assignedIds = useMemo(() =>
    new Set(activeRow?.tagged?.assignments.map(a => a.resourceId) ?? []),
    [activeRow]
  );

  const rowStartDate = activeRow?.startDate || activePhase?.startDate || '';

  function updateHrsPerWeek(resourceId: string, hrsPerWeek: number) {
    if (!activeRow?.tagged) return;
    onUpdateRow(activePhaseId, activeRowId, {
      tagged: {
        ...activeRow.tagged,
        assignments: activeRow.tagged.assignments.map(a =>
          a.resourceId === resourceId ? { ...a, hrsPerWeek } : a
        ),
      },
    });
  }

  const suggestions = useMemo(() => {
    if (!activeRow) return [];
    const isSearching = search.trim() !== '';
    return [...BENCH]
      .map(r => {
        const skillMatchCount = selectedSkills.length > 0
          ? selectedSkills.filter(sk => r.skills.map(s => s.toLowerCase()).includes(sk.toLowerCase())).length
          : 0;
        const baseScore = isSearching ? 0 : scoreResource(r, activeRow);
        const availableByDate = !rowStartDate || r.availableFrom <= rowStartDate;
        return { r, score: baseScore + skillMatchCount * 2, skillMatchCount, availableByDate };
      })
      .sort((a, b) => {
        if (a.availableByDate !== b.availableByDate) return a.availableByDate ? -1 : 1;
        return b.score - a.score;
      })
      .filter(({ r, skillMatchCount }) => {
        const matchesSearch = !isSearching ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.role.toLowerCase().includes(search.toLowerCase()) ||
          r.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
        const matchesSkills = selectedSkills.length === 0 || skillMatchCount > 0;
        return matchesSearch && matchesSkills;
      });
  }, [activeRow, search, selectedSkills, rowStartDate]);

  function switchRow(phaseId: string, rowId: string) {
    setActivePhaseId(phaseId);
    setActiveRowId(rowId);
    setHiringOpen(false);
    setHiringPositions(1);
    setHiringHrsPerWeek(40);
    setSearch('');
    setSelectedSkills([]);
    setSkillQuery('');
    setSkillDropdownOpen(false);
  }

  const totalPositions = phases.reduce((s, p) => s + p.rows.length, 0);
  const assignedCount = phases.reduce((s, p) => s + p.rows.filter(r => r.tagged).length, 0);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, padding: '20px' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white flex flex-col rounded-xl"
        style={{ width: '100%', height: '100%', maxWidth: 1160, maxHeight: 820, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px 20px', flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 34, height: 34, backgroundColor: '#ECFDF5' }}>
                <Users size={15} color="#10B981" />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', color: '#1A202C', fontWeight: '700' }}>Resource Assignment</h2>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: 1 }}>
                  <b style={{ color: '#059669' }}>{assignedCount}</b>/{totalPositions} positions filled · {phases.length} phase{phases.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={18} color="#4A5568" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: position rail */}
          <div style={{ width: 256, borderRight: '1px solid #E2E8F0', overflowY: 'auto', flexShrink: 0 }}>
            {phases.map((phase, phaseIdx) => (
              <div key={phase.id}>
                <div style={{ padding: '8px 14px 5px', fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em', backgroundColor: '#F9FAFB', borderBottom: '1px solid #F0F0F0', borderTop: phaseIdx > 0 ? '1px solid #E2E8F0' : 'none' }}>
                  P{phaseIdx + 1} · {phase.name.split('–')[0].trim().substring(0, 20)}
                </div>
                {phase.rows.map(row => {
                  const isActive = row.id === activeRowId && phase.id === activePhaseId;
                  const tagged = row.tagged;
                  const rowStatus = !tagged ? 'open'
                    : (tagged.assignments.length > 0 && tagged.isHiring) ? 'both'
                    : tagged.isHiring ? 'hiring'
                    : 'assigned';
                  if (isActive) {
                    return (
                      <div key={row.id}
                        style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', borderLeft: '3px solid #10B981', backgroundColor: '#ECFDF5' }}
                      >
                        <input
                          value={row.title}
                          onChange={e => onUpdateRow(phase.id, row.id, { title: e.target.value })}
                          placeholder="Role title…"
                          onClick={e => e.stopPropagation()}
                          style={{ width: '100%', fontSize: '12px', color: '#1A202C', fontWeight: '600', padding: '5px 7px', border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', background: 'white', marginBottom: 5, boxSizing: 'border-box' }}
                        />
                        <PositionDropdown
                          value={row.position}
                          onChange={v => onUpdateRow(phase.id, row.id, { position: v })}
                        />
                        <div style={{ marginTop: 6 }}>
                          {rowStatus === 'assigned' ? (
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#059669' }}>ASSIGNED</span>
                          ) : rowStatus === 'hiring' ? (
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#FFF7ED', color: '#C2410C' }}>HIRING</span>
                          ) : rowStatus === 'both' ? (
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#059669' }}>ASSIGNED + HIRING</span>
                          ) : (
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#F1F5F9', color: '#64748B' }}>OPEN</span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <button key={row.id} onClick={() => switchRow(phase.id, row.id)}
                      className="w-full text-left"
                      style={{ padding: '10px 14px', borderTop: 'none', borderRight: 'none', borderBottom: '1px solid #F0F0F0', borderLeft: '3px solid transparent', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title || row.position || 'Untitled'}</div>
                      <div style={{ fontSize: '10px', color: '#718096', marginTop: 2 }}>{row.position} · {row.percentage}%</div>
                      <div style={{ marginTop: 4 }}>
                        {rowStatus === 'assigned' ? (
                          <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#059669' }}>ASSIGNED</span>
                        ) : rowStatus === 'hiring' ? (
                          <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#FFF7ED', color: '#C2410C' }}>HIRING</span>
                        ) : rowStatus === 'both' ? (
                          <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#059669' }}>ASSIGNED + HIRING</span>
                        ) : (
                          <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: 999, backgroundColor: '#F1F5F9', color: '#64748B' }}>OPEN</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {/* Add position button */}
                <button
                  onClick={() => {
                    const newRowId = onAddRow(phase.id);
                    switchRow(phase.id, newRowId);
                  }}
                  className="w-full flex items-center gap-1.5"
                  style={{ padding: '8px 14px', border: 'none', borderBottom: '1px solid #E2E8F0', backgroundColor: 'transparent', cursor: 'pointer', color: '#059669' }}
                >
                  <Plus size={11} color="#059669" />
                  <span style={{ fontSize: '11px', fontWeight: '600' }}>New Position</span>
                </button>
              </div>
            ))}
          </div>

          {/* Right: picker panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', minWidth: 0 }}>
            {activeRow ? (
              <>
                {/* Role info bar + start date */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span style={{ fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: 6, backgroundColor: '#F1F5F9', color: '#1A202C' }}>
                      {activeRow.position || 'No role set'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {activeRow.percentage}% · {activeRow.hrsPerMonth}h/mo
                    </span>
                    {activeRow.title && activeRow.title !== activeRow.position && (
                      <span style={{ fontSize: '12px', color: '#A0AEC0' }}>"{activeRow.title}"</span>
                    )}
                  </div>
                  {/* Start date row */}
                  <div className="flex items-center gap-2">
                    <Calendar size={12} color="#718096" />
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>Start date</span>
                    <input
                      type="date"
                      value={rowStartDate}
                      onChange={e => onUpdateRow(activePhaseId, activeRowId, { startDate: e.target.value })}
                      style={{ fontSize: '11px', color: '#1A202C', padding: '3px 8px', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
                    />
                    {rowStartDate && (
                      <span style={{ fontSize: '10px', color: '#A0AEC0' }}>
                        Resources available from this date will be shown first
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned resources + hiring card */}
                {(assignedResources.length > 0 || activeRow.tagged?.isHiring) && (() => {
                  const hiring = activeRow.tagged?.isHiring ? activeRow.tagged : null;
                  const resourceHrsWk = assignedResources.reduce((s, { hrsPerWeek }) => s + hrsPerWeek, 0);
                  const hiringHrsWk = hiring ? (hiring.hiringPositions ?? 1) * (hiring.hiringHrsPerWeek ?? 40) : 0;
                  const totalHrsWk = resourceHrsWk + hiringHrsWk;
                  const totalHrsMo = Math.round(totalHrsWk * (160 / 40));
                  const totalPct = Math.round((totalHrsMo / 160) * 100);
                  const hasBoth = assignedResources.length > 0 && !!hiring;
                  return (
                    <div className="mb-4 rounded-lg"
                      style={{ border: '1px solid #A7F3D0', backgroundColor: '#F0FDF4', padding: '12px 14px' }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', color: '#059669' }}>
                          {hasBoth ? `ASSIGNED (${assignedResources.length}) + HIRING` : assignedResources.length > 0 ? `ASSIGNED (${assignedResources.length})` : 'HIRING REQUEST'}
                        </span>
                        {assignedResources.length > 0 && (
                          <button onClick={() => onUnassign(activePhaseId, activeRowId)}
                            style={{ fontSize: '10px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Resource rows */}
                      {assignedResources.map(({ bench: r, hrsPerWeek }) => (
                        <div key={r.id} className="flex items-center gap-2 mb-2 rounded-lg"
                          style={{ backgroundColor: 'white', padding: '8px 10px', border: '1px solid #D1FAE5' }}>
                          <div className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ width: 28, height: 28, backgroundColor: avatarColor(r.initials), fontSize: '10px', fontWeight: '600' }}>
                            {r.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <button onClick={() => setProfileResource(r)}
                              style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#CBD5E1', textUnderlineOffset: 3 }}>
                              {r.name}
                            </button>
                            {isOnLeaveSoon(r) && <MiniLeaveBadge resource={r} />}
                            <div style={{ fontSize: '10px', color: '#718096' }}>{r.role}</div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input type="number" min={1} max={160} value={hrsPerWeek}
                              onChange={e => updateHrsPerWeek(r.id, Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: 44, fontSize: '12px', fontWeight: '600', color: '#059669', padding: '3px 5px', border: '1px solid #A7F3D0', borderRadius: 5, outline: 'none', textAlign: 'center', backgroundColor: '#F0FDF4' }} />
                            <span style={{ fontSize: '10px', color: '#718096' }}>h/wk</span>
                          </div>
                          <button onClick={() => onUnassign(activePhaseId, activeRowId, r.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#A0AEC0', flexShrink: 0 }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Hiring request row */}
                      {hiring && (
                        <div className="flex items-center gap-2 mb-2 rounded-lg"
                          style={{ backgroundColor: '#FFF7ED', padding: '8px 10px', border: '1px solid #FED7AA' }}>
                          <div className="rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ width: 28, height: 28, backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                            <UserPlus size={13} color="#C2410C" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: '600' }}>
                              Hiring: {hiring.hiringRole} · {hiring.hiringPositions ?? 1} position{(hiring.hiringPositions ?? 1) > 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '10px', color: '#718096', marginTop: 1 }}>Stage: {hiring.hiringStage}</div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input type="number" min={1} max={160}
                              value={hiring.hiringHrsPerWeek ?? 40}
                              onChange={e => onUpdateRow(activePhaseId, activeRowId, {
                                tagged: { ...activeRow.tagged!, hiringHrsPerWeek: Math.max(1, parseInt(e.target.value) || 1) }
                              })}
                              style={{ width: 44, fontSize: '12px', fontWeight: '600', color: '#C2410C', padding: '3px 5px', border: '1px solid #FED7AA', borderRadius: 5, outline: 'none', textAlign: 'center', backgroundColor: '#FFF7ED' }} />
                            <span style={{ fontSize: '10px', color: '#718096' }}>h/wk</span>
                          </div>
                          <button onClick={() => onUpdateRow(activePhaseId, activeRowId, {
                            tagged: assignedResources.length > 0
                              ? { ...activeRow.tagged!, isHiring: false, hiringRole: undefined, hiringStage: undefined, hiringPositions: undefined, hiringHrsPerWeek: undefined }
                              : undefined
                          })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#A0AEC0', flexShrink: 0 }}>
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Total hours summary */}
                      <div className="mt-2 pt-2" style={{ borderTop: '1px dashed #A7F3D0' }}>
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                              {totalHrsWk}h/wk total
                            </span>
                            <span style={{ fontSize: '11px', color: '#718096' }}>
                              {totalHrsMo}h/mo
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: 999, backgroundColor: totalPct > 100 ? '#FFF1F2' : '#ECFDF5', color: totalPct > 100 ? '#BE123C' : '#059669', border: `1px solid ${totalPct > 100 ? '#FECDD3' : '#A7F3D0'}` }}>
                            {totalPct}%
                          </span>
                        </div>
                        {totalPct > 100 && (
                          <div style={{ fontSize: '10px', color: '#C2410C', marginTop: 4 }}>
                            ⚠ Exceeds 100% capacity (160h/mo standard)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Search */}
                <div className="flex items-center gap-2 rounded-lg mb-3"
                  style={{ border: '1px solid #E2E8F0', padding: '8px 12px', backgroundColor: '#FAFAFA' }}>
                  <Search size={13} color="#A0AEC0" />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or role…"
                    style={{ fontSize: '13px', outline: 'none', border: 'none', background: 'transparent', width: '100%', color: '#1A202C' }} />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X size={12} color="#A0AEC0" />
                    </button>
                  )}
                </div>

                {/* Skill tag-search filter */}
                <div className="mb-3" ref={skillBoxRef} style={{ position: 'relative' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em' }}>FILTER BY SKILL</span>
                    {selectedSkills.length > 0 && (
                      <button onClick={() => { setSelectedSkills([]); setSkillQuery(''); }}
                        style={{ fontSize: '10px', color: '#10B981', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Clear all
                      </button>
                    )}
                  </div>
                  {/* Tag input box */}
                  <div
                    className="flex flex-wrap items-center gap-1"
                    onClick={() => { setSkillDropdownOpen(true); skillInputRef.current?.focus(); }}
                    style={{ border: `1px solid ${skillDropdownOpen ? '#10B981' : '#E2E8F0'}`, borderRadius: 8, padding: '5px 8px', backgroundColor: 'white', cursor: 'text', minHeight: 36 }}
                  >
                    {selectedSkills.map(s => (
                      <span key={s} className="flex items-center gap-1"
                        style={{ fontSize: '11px', fontWeight: '600', padding: '2px 4px 2px 8px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                        {s}
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedSkills(prev => prev.filter(x => x !== s)); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: '#059669', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 flex-1" style={{ minWidth: 90 }}>
                      <Search size={11} color="#A0AEC0" />
                      <input
                        ref={skillInputRef}
                        value={skillQuery}
                        onChange={e => { setSkillQuery(e.target.value); setSkillDropdownOpen(true); }}
                        onFocus={() => setSkillDropdownOpen(true)}
                        placeholder={selectedSkills.length === 0 ? 'Search skills…' : 'Add more…'}
                        style={{ fontSize: '12px', border: 'none', outline: 'none', background: 'transparent', flex: 1, color: '#1A202C', minWidth: 70 }}
                      />
                    </div>
                  </div>
                  {/* Dropdown */}
                  {skillDropdownOpen && filteredSkillOptions.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0, zIndex: 999, backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)', maxHeight: 160, overflowY: 'auto' }}>
                      {filteredSkillOptions.map(s => (
                        <button key={s}
                          onMouseDown={e => { e.preventDefault(); setSelectedSkills(prev => [...prev, s]); setSkillQuery(''); }}
                          className="w-full text-left"
                          style={{ display: 'block', padding: '7px 12px', fontSize: '12px', color: '#1A202C', background: 'white', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestions label */}
                <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {search.trim() !== ''
                    ? `ALL RESOURCES (${suggestions.length})`
                    : selectedSkills.length > 0
                      ? `SKILL MATCHES (${suggestions.length})`
                      : `SUGGESTED MATCHES (${suggestions.length})`}
                </div>

                {/* Suggestion cards */}
                <div className="space-y-2 mb-5">
                  {suggestions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#A0AEC0' }}>
                      {selectedSkills.length > 0 ? 'No resources match the selected skills' : 'No matching resources found'}
                    </div>
                  )}
                  {suggestions.map(({ r, score, skillMatchCount, availableByDate }) => {
                    const onLeave = isOnLeaveSoon(r);
                    const busy = r.utilization >= 100;
                    const isAssigned = assignedIds.has(r.id);
                    return (
                      <div key={r.id} className="rounded-lg"
                        style={{ border: isAssigned ? '1px solid #A7F3D0' : '1px solid #E2E8F0', backgroundColor: isAssigned ? '#F0FDF4' : busy ? '#FAFAFA' : 'white', padding: '10px 12px', opacity: (busy && !isAssigned) ? 0.65 : 1 }}>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ width: 34, height: 34, backgroundColor: avatarColor(r.initials), fontSize: '11px', fontWeight: '600' }}>
                            {r.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button onClick={() => setProfileResource(r)}
                                style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#CBD5E1', textUnderlineOffset: 3 }}>
                                {r.name}
                              </button>
                              {score >= 3 && !isAssigned && <span style={{ fontSize: '9px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: '700', padding: '1px 5px', borderRadius: 999 }}>BEST FIT</span>}
                              {isAssigned && <span style={{ fontSize: '9px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: '700', padding: '1px 5px', borderRadius: 999 }}>✓ ASSIGNED</span>}
                              {skillMatchCount > 0 && selectedSkills.length > 0 && (
                                <span style={{ fontSize: '9px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: '700', padding: '1px 5px', borderRadius: 999 }}>
                                  {skillMatchCount} skill{skillMatchCount > 1 ? 's' : ''}
                                </span>
                              )}
                              {onLeave && <MiniLeaveBadge resource={r} />}
                              {busy && <span style={{ fontSize: '9px', backgroundColor: '#FFF1F2', color: '#BE123C', fontWeight: '700', padding: '1px 5px', borderRadius: 999 }}>FULL</span>}
                            </div>
                            <div style={{ fontSize: '11px', color: '#718096', marginTop: 2 }}>
                              {r.role} · {r.experience} · avail {r.availableFrom}
                              {!availableByDate && rowStartDate && (
                                <span style={{ marginLeft: 6, fontSize: '10px', color: '#C2410C', fontWeight: '600' }}>
                                  · not yet available
                                </span>
                              )}
                            </div>
                            {/* Skill tags row */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {r.skills.map(sk => (
                                <span key={sk} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 4, backgroundColor: selectedSkills.includes(sk) ? '#EFF6FF' : '#F8FAFC', color: selectedSkills.includes(sk) ? '#1D4ED8' : '#94A3B8', fontWeight: selectedSkills.includes(sk) ? '700' : '500', border: `1px solid ${selectedSkills.includes(sk) ? '#BFDBFE' : '#F0F0F0'}` }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div style={{ height: 4, width: 80, borderRadius: 999, backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, r.utilization)}%`, backgroundColor: r.utilization >= 80 ? '#F97316' : '#10B981', borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: '10px', color: r.utilization >= 80 ? '#C2410C' : '#059669', fontWeight: '600' }}>{r.utilization}% utilized</span>
                            </div>
                          </div>
                          {isAssigned ? (
                            <button
                              onClick={() => onUnassign(activePhaseId, activeRowId, r.id)}
                              style={{ fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: 6, backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => !busy && onAssign(activePhaseId, activeRowId, r, 40)}
                              disabled={busy}
                              style={{ fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: 6, backgroundColor: busy ? '#F1F5F9' : 'white', color: busy ? '#A0AEC0' : '#059669', border: busy ? '1px solid #E2E8F0' : '1px solid #A7F3D0', cursor: busy ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Request hire — simplified confirmation */}
                <div className="rounded-lg" style={{ border: '1px dashed #CBD5E0', padding: '14px 16px', backgroundColor: '#FAFAFA' }}>
                  {!hiringOpen ? (
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', color: '#718096' }}>No bench match found?</span>
                      <button onClick={() => setHiringOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg"
                        style={{ fontSize: '11px', fontWeight: '600', padding: '5px 10px', backgroundColor: 'white', color: '#C2410C', border: '1px solid #FED7AA', cursor: 'pointer' }}>
                        <UserPlus size={11} />
                        Request Hire
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 28, height: 28, backgroundColor: '#FFF7ED', marginTop: 1 }}>
                          <UserPlus size={13} color="#C2410C" />
                        </div>
                        <div className="flex-1">
                          <p style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600', marginBottom: 3 }}>
                            Hire request for <span style={{ color: '#C2410C' }}>{activeRow.position || 'this role'}</span>
                          </p>
                          <p style={{ fontSize: '11px', color: '#718096', lineHeight: 1.5, marginBottom: 10 }}>
                            The recruiting team will be notified automatically.
                          </p>
                          {/* Positions + hrs/week */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600', marginBottom: 4, letterSpacing: '0.05em' }}>POSITIONS</div>
                              <input type="number" min={1} max={20} value={hiringPositions}
                                onChange={e => setHiringPositions(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: 60, fontSize: '14px', fontWeight: '700', color: '#C2410C', padding: '5px 8px', border: '1px solid #FED7AA', borderRadius: 6, outline: 'none', textAlign: 'center', backgroundColor: 'white' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600', marginBottom: 4, letterSpacing: '0.05em' }}>HRS / WEEK (PER POSITION)</div>
                              <div className="flex items-center gap-1">
                                <input type="number" min={1} max={160} value={hiringHrsPerWeek}
                                  onChange={e => setHiringHrsPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
                                  style={{ width: 60, fontSize: '14px', fontWeight: '700', color: '#C2410C', padding: '5px 8px', border: '1px solid #FED7AA', borderRadius: 6, outline: 'none', textAlign: 'center', backgroundColor: 'white' }} />
                                <span style={{ fontSize: '11px', color: '#A0AEC0' }}>h/wk</span>
                              </div>
                            </div>
                            <div style={{ paddingTop: 18 }}>
                              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                                = {hiringPositions * hiringHrsPerWeek}h/wk · {Math.round(hiringPositions * hiringHrsPerWeek * 4)}h/mo · {Math.round((hiringPositions * hiringHrsPerWeek * 4 / 160) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setHiringOpen(false)}
                          style={{ fontSize: '12px', fontWeight: '600', padding: '7px 14px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#4A5568', cursor: 'pointer' }}>
                          Cancel
                        </button>
                        <button
                          onClick={() => { onHire(activePhaseId, activeRowId, activeRow.position || 'New Hire', 'Requested', hiringPositions, hiringHrsPerWeek); setHiringOpen(false); }}
                          className="flex items-center gap-1.5"
                          style={{ fontSize: '12px', fontWeight: '600', padding: '7px 14px', borderRadius: 6, border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer' }}>
                          <Check size={12} />
                          Confirm Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px', color: '#CBD5E0' }}>
                ← Select a position from the left
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 20px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>
            Click resource names to view profile · Click "Assign" to tag a resource
          </span>
          <button onClick={onClose}
            style={{ fontSize: '13px', fontWeight: '600', padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      </div>

      {profileResource && (
        <ResourceProfilePanel resource={profileResource} row={activeRow} onClose={() => setProfileResource(null)} />
      )}
    </div>
  );
}

// ─── Trigger Confirm Modal ────────────────────────────────────────────────────

function TriggerModal({
  projectName,
  onConfirm,
  onClose,
}: {
  projectName: string;
  onConfirm: (startDate: string) => void;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState('2026-05-01');

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 2000 }}
    >
      <div
        className="bg-white rounded-2xl"
        style={{ width: 480, padding: '28px 30px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, backgroundColor: '#ECFDF5', flexShrink: 0 }}
          >
            <Zap size={18} color="#10B981" />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} color="#A0AEC0" />
          </button>
        </div>
        <h3 style={{ fontSize: '18px', color: '#1A202C', fontWeight: '700', marginBottom: 4 }}>
          Trigger Project
        </h3>
        <p style={{ fontSize: '13px', color: '#718096', marginBottom: 20 }}>
          <strong style={{ color: '#1A202C' }}>{projectName}</strong> will be triggered and moved to active projects in Resource Planning. All tagged resources will be locked to this project.
        </p>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '12px', color: '#4A5568', fontWeight: '600', display: 'block', marginBottom: 6 }}>
            Project Start Date
          </label>
          <div
            className="flex items-center gap-2 rounded-lg"
            style={{ border: '1px solid #E2E8F0', padding: '10px 12px' }}
          >
            <Calendar size={14} color="#A0AEC0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#1A202C', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <div
          className="rounded-xl"
          style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', padding: '12px 14px', marginBottom: 20 }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} color="#C2410C" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
              This action cannot be undone. Resources tagged to phases will move to active allocation in Resource Planning.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#4A5568' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(startDate)}
            className="flex items-center gap-1.5"
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#10B981', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Zap size={13} />
            Trigger Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phase Row Component ──────────────────────────────────────────────────────

function PositionDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query.trim()
    ? POSITION_OPTIONS.filter(p => p.toLowerCase().includes(query.trim().toLowerCase()))
    : POSITION_OPTIONS;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div className="flex items-center" style={{ border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: 'white', overflow: 'hidden' }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Position / role"
          style={{ width: '100%', fontSize: '13px', color: '#1A202C', padding: '7px 9px', border: 'none', outline: 'none', background: 'transparent' }}
        />
        <button
          onMouseDown={e => { e.preventDefault(); setOpen(v => !v); }}
          style={{ padding: '0 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', flexShrink: 0 }}
        >
          <ChevronDown size={12} />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0, zIndex: 9999,
            backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto',
          }}
        >
          {filtered.map(p => (
            <button
              key={p}
              onMouseDown={e => { e.preventDefault(); onChange(p); setQuery(p); setOpen(false); }}
              className="w-full text-left"
              style={{
                display: 'block', padding: '8px 12px', fontSize: '12px', color: '#1A202C',
                background: p === value ? '#ECFDF5' : 'white', border: 'none', cursor: 'pointer',
                fontWeight: p === value ? '600' : '400',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = p === value ? '#ECFDF5' : 'white')}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseRowItem({
  row,
  locked,
  hideAmounts,
  onUpdate,
  onRemove,
  onOpenPicker,
}: {
  row: PhaseRow;
  locked: boolean;
  hideAmounts: boolean;
  onUpdate: (updates: Partial<PhaseRow>) => void;
  onRemove: () => void;
  onOpenPicker: () => void;
}) {
  const [editingPct, setEditingPct] = useState(false);

  const tagged = row.tagged;
  const primaryResourceId = tagged && !tagged.isHiring ? tagged.assignments[0]?.resourceId : undefined;
  const resource = primaryResourceId ? BENCH.find((b) => b.id === primaryResourceId) : null;
  const extraResources = tagged && !tagged.isHiring && tagged.assignments.length > 1
    ? tagged.assignments.slice(1).map(a => BENCH.find(b => b.id === a.resourceId)).filter(Boolean) as BenchResource[]
    : [];

  function handlePctChange(val: string) {
    const pct = parseFloat(val) || 0;
    const hrs = pctToHrs(pct);
    onUpdate({ percentage: pct, hrsPerMonth: hrs });
  }

  const ac = resource ? avatarColor(resource.initials) : '#E2E8F0';

  return (
    <>
      <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
        {/* Title */}
        <td style={{ padding: '10px 8px 10px 0', minWidth: 120 }}>
          {locked ? (
            <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '500' }}>{row.title}</span>
          ) : (
            <input
              value={row.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Role title"
              style={{
                width: '100%', fontSize: '13px', color: '#1A202C', padding: '7px 9px',
                border: '1px solid #E2E8F0', borderRadius: 6, outline: 'none', background: 'white',
              }}
            />
          )}
        </td>

        {/* Position */}
        <td style={{ padding: '10px 8px', minWidth: 160 }}>
          {locked ? (
            <span style={{ fontSize: '13px', color: '#4A5568' }}>{row.position}</span>
          ) : (
            <PositionDropdown value={row.position} onChange={v => onUpdate({ position: v })} />
          )}
        </td>

        {/* Resource assignment */}
        <td style={{ padding: '10px 8px', minWidth: 200 }}>
          <div>
            <button
              onClick={() => !locked && onOpenPicker()}
              className="w-full flex items-center gap-2 rounded-lg"
              style={{
                border: tagged ? '1px solid #A7F3D0' : '1px dashed #CBD5E0',
                backgroundColor: tagged ? '#ECFDF5' : '#FAFAFA',
                padding: '7px 10px',
                cursor: locked ? 'default' : 'pointer',
              }}
            >
              {resource ? (
                <>
                  <div className="flex flex-shrink-0" style={{ position: 'relative', width: extraResources.length > 0 ? 22 + extraResources.length * 14 : 22, height: 22 }}>
                    {[resource, ...extraResources].map((res, i) => (
                      <div key={res.id}
                        className="flex items-center justify-center rounded-full"
                        style={{ position: 'absolute', left: i * 14, width: 22, height: 22, backgroundColor: avatarColor(res.initials), fontSize: '8px', color: 'white', fontWeight: '700', border: '1.5px solid white', zIndex: 3 - i }}>
                        {res.initials}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 text-left" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resource.name}{extraResources.length > 0 ? ` +${extraResources.length}` : ''}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A0AEC0', marginTop: 2 }}>
                      {extraResources.length > 0 ? `${tagged!.assignments.length} resources` : `${resource.role} · ${resource.utilization}% utilized`}
                    </div>
                  </div>
                  {isOnLeaveSoon(resource) && (
                    <AlertTriangle size={11} color="#F97316" />
                  )}
                  {!locked && <X size={11} color="#A0AEC0" onClick={(e) => { e.stopPropagation(); onUpdate({ tagged: undefined }); }} />}
                </>
              ) : tagged?.isHiring ? (
                <>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, backgroundColor: '#FFF7ED', fontSize: '9px' }}
                  >
                    <UserPlus size={11} color="#C2410C" />
                  </div>
                  <div className="flex-1 text-left">
                    <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: '600', lineHeight: 1 }}>
                      Hiring: {tagged.hiringRole}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A0AEC0', marginTop: 2 }}>
                      Stage: {tagged.hiringStage}
                    </div>
                  </div>
                  {!locked && <X size={11} color="#A0AEC0" onClick={(e) => { e.stopPropagation(); onUpdate({ tagged: undefined }); }} />}
                </>
              ) : (
                <>
                  <Users size={12} color="#A0AEC0" />
                  <span style={{ fontSize: '12px', color: '#A0AEC0' }}>Assign resource…</span>
                  {!locked && <ChevronDown size={11} color="#A0AEC0" style={{ marginLeft: 'auto' }} />}
                </>
              )}
            </button>
          </div>
        </td>

        {/* Percentage */}
        <td style={{ padding: '10px 8px', width: 90 }}>
          {locked ? (
            <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>{row.percentage}%</span>
          ) : (
            <div
              className="flex items-center rounded-lg"
              style={{ border: '1px solid #E2E8F0', backgroundColor: 'white', overflow: 'hidden' }}
            >
              <input
                type="number"
                value={editingPct ? undefined : row.percentage}
                defaultValue={row.percentage}
                onFocus={() => setEditingPct(true)}
                onBlur={(e) => { setEditingPct(false); handlePctChange(e.target.value); }}
                style={{
                  width: '100%', fontSize: '13px', color: '#1A202C', padding: '7px 8px',
                  border: 'none', outline: 'none', background: 'transparent',
                }}
              />
              <span style={{ fontSize: '12px', color: '#A0AEC0', paddingRight: 8 }}>%</span>
            </div>
          )}
        </td>

        {/* Hrs/mo */}
        <td style={{ padding: '10px 8px', width: 80 }}>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>
              {row.hrsPerMonth}
            </span>
            <span style={{ fontSize: '11px', color: '#A0AEC0' }}>h</span>
          </div>
        </td>

        {/* Total */}
        <td style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {hideAmounts ? (
            <span style={{ fontSize: '13px', color: '#A0AEC0' }}>—</span>
          ) : (
            <div>
              <span style={{ fontSize: '14px', color: '#1A202C', fontWeight: '700' }}>{fmt(row.totalLocal)}</span>
              <span style={{ fontSize: '11px', color: '#A0AEC0', marginLeft: 4 }}>({fmt(row.totalUsd)})</span>
            </div>
          )}
        </td>

        {/* Remove */}
        <td style={{ padding: '10px 0 10px 8px', width: 24 }}>
          {!locked && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <XCircle size={15} color="#F87171" />
            </button>
          )}
        </td>
      </tr>

    </>
  );
}

// ─── Phase Card ───────────────────────────────────────────────────────────────

function PhaseCard({
  phase,
  index,
  locked,
  hideAmounts,
  onUpdatePhase,
  onRemovePhase,
  canRemove,
  onOpenPicker,
}: {
  phase: Phase;
  index: number;
  locked: boolean;
  hideAmounts: boolean;
  onUpdatePhase: (p: Phase) => void;
  onRemovePhase: () => void;
  canRemove: boolean;
  onOpenPicker: (rowId: string) => void;
}) {
  const phaseTotal = phase.rows.reduce((s, r) => s + r.totalLocal, 0);

  function updateRow(rowId: string, updates: Partial<PhaseRow>) {
    onUpdatePhase({
      ...phase,
      rows: phase.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)),
    });
  }

  function removeRow(rowId: string) {
    onUpdatePhase({ ...phase, rows: phase.rows.filter((r) => r.id !== rowId) });
  }

  function addRow() {
    onUpdatePhase({
      ...phase,
      rows: [
        ...phase.rows,
        { id: uid(), title: '', position: '', percentage: 25, hrsPerMonth: pctToHrs(25), rateLocal: 200, totalLocal: 0, totalUsd: 0 },
      ],
    });
  }

  return (
    <div
      className="rounded-2xl"
      style={{ border: '1px solid #E2E8F0', marginBottom: 16, overflow: 'hidden' }}
    >
      {/* Phase header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 20px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 28, height: 28, backgroundColor: '#ECFDF5' }}
          >
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>P{index + 1}</span>
          </div>
          {locked ? (
            <span style={{ fontSize: '14px', color: '#1A202C', fontWeight: '700' }}>{phase.name}</span>
          ) : (
            <input
              value={phase.name}
              onChange={(e) => onUpdatePhase({ ...phase, name: e.target.value })}
              style={{
                fontSize: '14px', color: '#1A202C', fontWeight: '700',
                border: 'none', outline: 'none', background: 'transparent', minWidth: 200,
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={13} color="#A0AEC0" />
            {locked ? (
              <span style={{ fontSize: '12px', color: '#4A5568' }}>
                Starts {new Date(phase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              <input
                type="date"
                value={phase.startDate}
                onChange={(e) => onUpdatePhase({ ...phase, startDate: e.target.value })}
                style={{ fontSize: '12px', color: '#4A5568', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer' }}
              />
            )}
          </div>
          {!hideAmounts && (
            <span
              style={{
                fontSize: '12px', color: '#059669', fontWeight: '700',
                backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: 999,
              }}
            >
              {fmtShort(phaseTotal)}
            </span>
          )}
          {!locked && canRemove && (
            <button onClick={onRemovePhase} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <XCircle size={15} color="#F87171" />
            </button>
          )}
        </div>
      </div>

      {/* Roles table */}
      <div style={{ padding: '4px 20px 16px' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Role Title</th>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Resource</th>
              <th style={thStyle}>Allocation</th>
              <th style={thStyle}>Hrs/mo</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
              <th style={{ width: 24 }} />
            </tr>
          </thead>
          <tbody>
            {phase.rows.map((row) => (
              <PhaseRowItem
                key={row.id}
                row={row}
                locked={locked}
                hideAmounts={hideAmounts}
                onUpdate={(updates) => updateRow(row.id, updates)}
                onRemove={() => removeRow(row.id)}
                onOpenPicker={() => onOpenPicker(row.id)}
              />
            ))}
          </tbody>
        </table>

        {!locked && (
          <div className="flex justify-start mt-3">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg"
              style={{
                padding: '7px 12px', fontSize: '12px', fontWeight: '600',
                backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              Add Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px 6px 0',
  fontSize: '11px',
  color: '#A0AEC0',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuotationModernView({
  name,
  account,
}: {
  name: string;
  account: string;
}) {
  const [status, setStatus] = useState<QuoteStatus>('Draft');
  const [hideAmounts, setHideAmounts] = useState(false);
  const [country, setCountry] = useState<'INDIA' | 'USA'>('INDIA');
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [activePhaseId, setActivePhaseId] = useState<string>(INITIAL_PHASES[0].id);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showTrigger, setShowTrigger] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const locked = status === 'Locked' || status === 'SOW Signed' || status === 'Triggered';
  const triggered = status === 'Triggered';
  const sc = statusColor(status);
  const nextLabel = getNextStatusLabel(status);
  const nextStatus = getNextStatus(status);

  const activePhase = phases.find(p => p.id === activePhaseId) ?? phases[0];
  const phaseRowsTotal = activePhase.rows.reduce((s, r) => s + r.totalLocal, 0);
  const phaseMarginsTotal = activePhase.margins.reduce((s, m) => s + m.total, 0);
  const total = phaseRowsTotal + phaseMarginsTotal;
  const grand = Math.round(total / 100) * 100;
  const rounded = grand - total;

  useEffect(() => {
    saveSelectedVersion(name, activePhase.name ?? 'Phase 1', grand);
  }, [grand, name, activePhase]);

  function addPhase() {
    const newId = uid();
    setPhases((ps) => [
      ...ps,
      {
        id: newId,
        name: `Phase ${ps.length + 1} – New Phase`,
        startDate: '2026-06-01',
        rows: [
          { id: uid(), title: '', position: '', percentage: 50, hrsPerMonth: pctToHrs(50), rateLocal: 200, totalLocal: 0, totalUsd: 0 },
        ],
        margins: [],
      },
    ]);
    setActivePhaseId(newId);
  }

  function updateMargin(id: string, updates: Partial<MarginRow>) {
    setPhases(ps => ps.map(ph => ph.id !== activePhaseId ? ph : {
      ...ph,
      margins: ph.margins.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  }

  function removeMargin(id: string) {
    setPhases(ps => ps.map(ph => ph.id !== activePhaseId ? ph : {
      ...ph,
      margins: ph.margins.filter(m => m.id !== id),
    }));
  }

  function addMargin() {
    setPhases(ps => ps.map(ph => ph.id !== activePhaseId ? ph : {
      ...ph,
      margins: [...ph.margins, { id: uid(), title: '', type: '%', amount: 0, total: 0 }],
    }));
  }

  function handleAdvanceStatus() {
    if (nextStatus === 'Triggered') {
      setShowTrigger(true);
    } else if (nextStatus) {
      setStatus(nextStatus);
    }
  }

  function handleTrigger(startDate: string) {
    const allRows = phases.flatMap((ph) => ph.rows);
    const teamMembers = allRows
      .filter((r) => r.tagged && r.tagged.assignments.length > 0)
      .flatMap((r) =>
        (r.tagged!.assignments || []).map(a => {
          const res = BENCH.find((b) => b.id === a.resourceId);
          return res ? { initials: res.initials, color: avatarColor(res.initials) } : null;
        })
      )
      .filter(Boolean) as { initials: string; color: string }[];

    const assignments = allRows.map((r) => {
      const res = r.tagged && !r.tagged.isHiring
        ? BENCH.find((b) => b.id === (r.tagged!.assignments[0]?.resourceId ?? ''))
        : null;
      return {
        positionTitle: r.title,
        role: r.position,
        resourceName: res ? res.name : (r.tagged?.isHiring ? `Hiring: ${r.tagged.hiringRole}` : 'Unassigned'),
        initials: res ? res.initials : '?',
        percentage: r.percentage,
        isHiring: r.tagged?.isHiring ?? false,
      };
    });

    const hiringOpen = allRows.filter((r) => r.tagged?.isHiring).length;

    addTriggeredProject({
      shortCode: `Q-${name.slice(0, 3).toUpperCase()}`,
      name,
      client: account,
      tags: phases.map((ph) => ph.name.split('–')[0].trim()),
      team: teamMembers,
      start: startDate,
      end: '',
      latestNote: `Triggered from Quotation — ${phases.length} phase(s)`,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      assignments,
      hiringOpen,
    });
    setStatus('Triggered');
    setShowTrigger(false);
  }

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Status Banner ── */}
      {triggered && (
        <div
          className="flex items-center gap-3 rounded-xl mb-5"
          style={{ padding: '12px 18px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <p style={{ fontSize: '13px', color: '#065F46', fontWeight: '600' }}>
            This project has been triggered and moved to active allocation in Resource Planning.
          </p>
        </div>
      )}

      {/* ── Top Meta Row ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        {/* Status + flow */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pill */}
          <div
            className="flex items-center gap-1.5 rounded-full"
            style={{ padding: '5px 12px', backgroundColor: sc.bg, border: `1px solid ${sc.dot}30` }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: sc.dot, display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: sc.text, fontWeight: '700' }}>{status}</span>
          </div>

          {/* Step trail */}
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((s, i) => {
              const done = STATUS_FLOW.indexOf(status) >= i;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: done ? '#10B981' : '#E2E8F0',
                    }}
                  />
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{ width: 14, height: 2, backgroundColor: done ? '#A7F3D0' : '#E2E8F0', borderRadius: 1 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hide amounts toggle */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '12px', color: '#4A5568' }}>Hide Amounts</span>
            <ToggleSwitch on={hideAmounts} onChange={setHideAmounts} />
          </div>

          {/* Country toggle */}
          <div
            className="flex items-center rounded-lg"
            style={{ backgroundColor: '#F1F5F9', padding: '2px' }}
          >
            {(['INDIA', 'USA'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: '11px', fontWeight: '700',
                  backgroundColor: country === c ? 'white' : 'transparent',
                  color: country === c ? '#059669' : '#64748B',
                  border: 'none', cursor: 'pointer',
                  boxShadow: country === c ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Save */}
          {!triggered && (
            <button
              className="flex items-center gap-1.5 rounded-lg"
              style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', color: '#4A5568', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              <Save size={13} />
              Save Draft
            </button>
          )}

          {/* Advance status */}
          {nextLabel && !triggered && (
            <button
              onClick={handleAdvanceStatus}
              className="flex items-center gap-1.5 rounded-lg"
              style={{
                padding: '8px 16px',
                backgroundColor: nextStatus === 'Triggered' ? '#1A202C' : '#10B981',
                color: 'white', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
              }}
            >
              {nextStatus === 'Triggered' ? <Zap size={13} /> : nextStatus === 'Locked' ? <Lock size={13} /> : <Check size={13} />}
              {nextLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Phase Tab Bar ── */}
      <div className="flex items-center gap-0 mb-0" style={{ borderBottom: '2px solid #E2E8F0', marginBottom: 0 }}>
        <div className="flex items-center gap-0 flex-1 flex-wrap min-w-0">
          {phases.map((ph, i) => {
            const isActive = ph.id === activePhaseId;
            const isEditing = editingPhaseId === ph.id;
            return (
              <div key={ph.id} className="flex items-center" style={{ position: 'relative' }}>
                <button
                  onClick={() => { setActivePhaseId(ph.id); setEditingPhaseId(null); }}
                  style={{
                    padding: '10px 4px 10px 14px', border: 'none', background: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
                    marginBottom: -2,
                    color: isActive ? '#059669' : '#64748B',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9', color: isActive ? '#059669' : '#94A3B8', padding: '1px 6px', borderRadius: 999, flexShrink: 0 }}>P{i + 1}</span>
                  {isEditing ? (
                    <input
                      autoFocus
                      defaultValue={ph.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v) setPhases(ps => ps.map(p => p.id === ph.id ? { ...p, name: v } : p));
                        setEditingPhaseId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        if (e.key === 'Escape') setEditingPhaseId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: '13px', fontWeight: '600', border: '1px solid #A7F3D0', borderRadius: 4, padding: '2px 6px', outline: 'none', color: '#1A202C', minWidth: 140, maxWidth: 200 }}
                    />
                  ) : (
                    <span
                      style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? '#059669' : '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      onDoubleClick={() => !locked && setEditingPhaseId(ph.id)}
                    >
                      {ph.name.includes('–') ? ph.name.split('–').slice(1).join('–').trim() : ph.name}
                    </span>
                  )}
                </button>
                {!locked && !isEditing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingPhaseId(ph.id); setActivePhaseId(ph.id); }}
                    title="Rename"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: '#A0AEC0', display: isActive ? 'flex' : 'none', alignItems: 'center' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
                {!locked && phases.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = phases.findIndex(p => p.id === ph.id);
                      setPhases(ps => ps.filter(p => p.id !== ph.id));
                      if (ph.id === activePhaseId) {
                        setActivePhaseId(phases[idx > 0 ? idx - 1 : 1]?.id ?? phases[0].id);
                      }
                    }}
                    title="Remove phase"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px 0 4px', color: '#CBD5E0', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {!locked && (
          <button
            onClick={addPhase}
            className="flex items-center gap-1 flex-shrink-0"
            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '600', backgroundColor: 'transparent', color: '#4A5568', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 }}
          >
            <Plus size={13} />
            Add Phase
          </button>
        )}
      </div>

      {/* ── Active Phase Card ── */}
      <div style={{ marginTop: 16 }}>
        <PhaseCard
          key={activePhase.id}
          phase={activePhase}
          index={phases.findIndex(p => p.id === activePhase.id)}
          locked={locked}
          hideAmounts={hideAmounts}
          onUpdatePhase={(updated) => setPhases((ps) => ps.map((p) => (p.id === updated.id ? updated : p)))}
          onRemovePhase={() => {
            const idx = phases.findIndex(p => p.id === activePhase.id);
            setPhases((ps) => ps.filter((p) => p.id !== activePhase.id));
            const remaining = phases.filter(p => p.id !== activePhase.id);
            if (remaining.length > 0) setActivePhaseId(remaining[Math.max(0, idx - 1)].id);
          }}
          canRemove={phases.length > 1}
          onOpenPicker={(rowId) => setPickerTarget({ phaseId: activePhase.id, rowId })}
        />
      </div>

      {/* ── Margins ── */}
      <div
        className="rounded-2xl"
        style={{ border: '1px solid #E2E8F0', overflow: 'hidden', marginTop: 8 }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: '14px 20px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '700' }}>Margins & Overheads</span>
            <span style={{ fontSize: '11px', color: '#718096' }}>applied to quote base</span>
          </div>
          <div className="flex items-center gap-2">
            {!hideAmounts && (
              <span
                style={{
                  fontSize: '12px', color: '#4A5568', fontWeight: '700',
                  backgroundColor: '#F1F5F9', padding: '3px 10px', borderRadius: 999,
                }}
              >
                {fmtShort(phaseMarginsTotal)}
              </span>
            )}
            {!locked && (
              <button
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: '11px', fontWeight: '600',
                  backgroundColor: 'white', color: '#4A5568',
                  border: '1px solid #E2E8F0', cursor: 'pointer',
                }}
              >
                + Default Margins
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '4px 20px 16px' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Amount</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                <th style={{ width: 24 }} />
              </tr>
            </thead>
            <tbody>
              {activePhase.margins.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '9px 8px 9px 0', minWidth: 200 }}>
                    {locked ? (
                      <span style={{ fontSize: '13px', color: '#1A202C' }}>{m.title}</span>
                    ) : (
                      <input
                        value={m.title}
                        onChange={(e) => updateMargin(m.id, { title: e.target.value })}
                        style={{ width: '100%', fontSize: '13px', color: '#1A202C', padding: '7px 9px', border: '1px solid #E2E8F0', borderRadius: 6, outline: 'none', background: 'white' }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '9px 8px', width: 120 }}>
                    <div className="flex items-center gap-3">
                      {(['%', '$'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => !locked && updateMargin(m.id, { type: t })}
                          className="flex items-center gap-1.5"
                          style={{ background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer', padding: 0 }}
                        >
                          <span
                            style={{
                              width: 13, height: 13, borderRadius: '50%',
                              border: `2px solid ${m.type === t ? '#10B981' : '#CBD5E0'}`,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {m.type === t && <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10B981' }} />}
                          </span>
                          <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '500' }}>{t}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '9px 8px', width: 120 }}>
                    {locked ? (
                      <span style={{ fontSize: '13px', color: '#1A202C' }}>{m.amount}{m.type}</span>
                    ) : (
                      <input
                        type="number"
                        value={m.amount}
                        onChange={(e) => updateMargin(m.id, { amount: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', fontSize: '13px', color: '#1A202C', padding: '7px 9px', border: '1px solid #E2E8F0', borderRadius: 6, outline: 'none', background: 'white' }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '9px 8px', textAlign: 'right' }}>
                    {hideAmounts ? (
                      <span style={{ fontSize: '13px', color: '#A0AEC0' }}>—</span>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#1A202C', fontWeight: '700' }}>{fmt(m.total)}</span>
                    )}
                  </td>
                  <td style={{ padding: '9px 0 9px 8px', width: 24 }}>
                    {!locked && (
                      <button onClick={() => removeMargin(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <XCircle size={15} color="#F87171" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!locked && (
            <div className="flex justify-start mt-3">
              <button
                onClick={addMargin}
                className="flex items-center gap-1.5 rounded-lg"
                style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#F1F5F9', color: '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              >
                <Plus size={12} />
                Add Margin Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Grand Total Card ── */}
      <div
        className="rounded-2xl mt-4"
        style={{ border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB', padding: '20px 24px' }}
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '1fr 24px 1fr 24px 1fr' }}
        >
          <div>
            <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em', marginBottom: 8 }}>POSITIONS ({activePhase.name.split('–')[0].trim()})</div>
            {activePhase.rows.map((r) => (
              <div key={r.id} className="flex justify-between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: '12px', color: '#718096', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || r.position || 'Untitled'}:</span>
                <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{hideAmounts ? '—' : fmt(r.totalLocal)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center" style={{ fontSize: '20px', color: '#CBD5E0', fontWeight: '300' }}>+</div>
          <div>
            <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em', marginBottom: 8 }}>MARGINS</div>
            {activePhase.margins.map((m) => (
              <div key={m.id} className="flex justify-between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: '12px', color: '#718096', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}:</span>
                <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{hideAmounts ? '—' : fmt(m.total)}</span>
              </div>
            ))}
            {activePhase.margins.length === 0 && (
              <div style={{ fontSize: '11px', color: '#CBD5E0', fontStyle: 'italic' }}>No margins added</div>
            )}
          </div>
          <div className="flex items-center justify-center" style={{ fontSize: '20px', color: '#CBD5E0', fontWeight: '300' }}>=</div>
          <div>
            <div style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '700', letterSpacing: '0.06em', marginBottom: 8 }}>SUMMARY</div>
            <div className="flex justify-between" style={{ padding: '3px 0' }}>
              <span style={{ fontSize: '12px', color: '#718096' }}>Base Total:</span>
              <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{hideAmounts ? '—' : fmt(phaseRowsTotal)}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '3px 0' }}>
              <span style={{ fontSize: '12px', color: '#718096' }}>Margins Total:</span>
              <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{hideAmounts ? '—' : fmt(phaseMarginsTotal)}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '3px 0' }}>
              <span style={{ fontSize: '12px', color: '#718096' }}>Rounding:</span>
              <span style={{ fontSize: '12px', color: '#1A202C', fontWeight: '600' }}>{hideAmounts ? '—' : fmt(rounded)}</span>
            </div>
            <div
              className="flex justify-between items-center mt-2 pt-2"
              style={{ borderTop: '2px solid #E2E8F0' }}
            >
              <span style={{ fontSize: '14px', color: '#1A202C', fontWeight: '700' }}>Grand Total</span>
              <span style={{ fontSize: '20px', color: '#059669', fontWeight: '800' }}>
                {hideAmounts ? '—' : fmt(grand)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Modal */}
      {showTrigger && (
        <TriggerModal
          projectName={name}
          onConfirm={handleTrigger}
          onClose={() => setShowTrigger(false)}
        />
      )}

      {/* Resource Picker Modal */}
      {pickerTarget && (
        <ResourcePickerModal
          phases={phases.filter(p => p.id === pickerTarget.phaseId)}
          target={pickerTarget}
          onAssign={(phaseId, rowId, r, hrsPerWeek) => {
            setPhases(ps => ps.map(ph => ph.id !== phaseId ? ph : {
              ...ph,
              rows: ph.rows.map(row => {
                if (row.id !== rowId) return row;
                const existing = row.tagged && !row.tagged.isHiring ? row.tagged.assignments : [];
                if (existing.some(a => a.resourceId === r.id)) return row;
                return {
                  ...row,
                  tagged: { assignments: [...existing, { resourceId: r.id, hrsPerWeek }], isHiring: false },
                  hrsPerMonth: pctToHrs(row.percentage),
                };
              }),
            }));
          }}
          onHire={(phaseId, rowId, role, stage, positions, hrsPerWeek) => {
            setPhases(ps => ps.map(ph => ph.id !== phaseId ? ph : {
              ...ph,
              rows: ph.rows.map(row => row.id !== rowId ? row : {
                ...row,
                tagged: {
                  assignments: row.tagged?.assignments ?? [],
                  isHiring: true,
                  hiringStage: stage,
                  hiringRole: role,
                  hiringPositions: positions,
                  hiringHrsPerWeek: hrsPerWeek,
                },
              }),
            }));
          }}
          onUnassign={(phaseId, rowId, resourceId) => {
            setPhases(ps => ps.map(ph => ph.id !== phaseId ? ph : {
              ...ph,
              rows: ph.rows.map(row => {
                if (row.id !== rowId) return row;
                if (!resourceId || !row.tagged) return { ...row, tagged: undefined };
                const remaining = row.tagged.assignments.filter(a => a.resourceId !== resourceId);
                return {
                  ...row,
                  tagged: remaining.length > 0 ? { ...row.tagged, assignments: remaining } : undefined,
                };
              }),
            }));
          }}
          onAddRow={(phaseId) => {
            const newRowId = uid();
            setPhases(ps => ps.map(ph => ph.id !== phaseId ? ph : {
              ...ph,
              rows: [...ph.rows, { id: newRowId, title: '', position: '', percentage: 50, hrsPerMonth: pctToHrs(50), rateLocal: 200, totalLocal: 0, totalUsd: 0 }],
            }));
            return newRowId;
          }}
          onUpdateRow={(phaseId, rowId, updates) => {
            setPhases(ps => ps.map(ph => ph.id !== phaseId ? ph : {
              ...ph,
              rows: ph.rows.map(row => row.id !== rowId ? row : { ...row, ...updates }),
            }));
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 34, height: 18, borderRadius: 999,
        backgroundColor: on ? '#10B981' : '#E2E8F0',
        border: 'none', position: 'relative', cursor: 'pointer', padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%',
          backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}
