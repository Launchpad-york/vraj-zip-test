import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  MapPin,
  Pencil,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Employee } from '../data/employees';

type TabKey = 'about' | 'performance' | 'leave' | 'utilization';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'performance', label: 'Performance' },
  { key: 'leave', label: 'Leave & WFH' },
  { key: 'utilization', label: 'Utilization' },
];

const WEEK_LABELS = ['Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31', 'Apr 7', 'Apr 14', 'Apr 21'];

const UTIL_PROJECTS = [
  { id: 'alpha', name: 'Project Alpha', color: '#10B981' },
  { id: 'beta', name: 'Project Beta', color: '#34D399' },
  { id: 'gamma', name: 'Project Gamma', color: '#059669' },
];

function buildUtilData(empId: string, availability: Employee['availability']) {
  const shapes: Record<Employee['availability'], number[][]> = {
    utilized: [
      [20, 20, 20, 20, 20, 20, 20, 20],
      [20, 20, 20, 20, 20, 20, 20, 20],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    partial: [
      [10, 10, 10, 10, 10, 10, 10, 10],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    bench: [
      [40, 40, 38, 35, 20, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'ending-soon': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [40, 40, 40, 40, 35, 35, 30, 20],
    ],
  };
  const [a, b, g] = shapes[availability];
  return WEEK_LABELS.map((w, i) => ({
    key: `${empId}-${i}`,
    week: w,
    alpha: a[i],
    beta: b[i],
    gamma: g[i],
    total: a[i] + b[i] + g[i],
  }));
}

export function EmployeeProfile({
  employee,
  onBack,
}: {
  employee: Employee;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('about');
  const email = `${employee.name.toLowerCase().split(' ')[0]}.g@york.ie`;

  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* Back */}
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
        Back to Employees
      </button>

      <div className="grid gap-6" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Left: profile card */}
        <div
          className="bg-white rounded-xl p-6"
          style={{ border: '1px solid #E2E8F0', height: 'fit-content' }}
        >
          <div className="flex flex-col items-center pb-5" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div
              className="rounded-full flex items-center justify-center text-white mb-3"
              style={{
                width: 96,
                height: 96,
                backgroundColor: '#10B981',
                fontSize: '32px',
                fontWeight: '700',
                border: '3px solid #D1FAE5',
              }}
            >
              {employee.initials}
            </div>
            <h2 style={{ fontSize: '18px', color: '#1A202C', fontWeight: '600' }}>
              {employee.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
              {employee.title}
            </p>
          </div>

          <div className="space-y-3 py-5" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div className="flex items-center gap-2">
              <Mail size={14} color="#10B981" />
              <span style={{ fontSize: '13px', color: '#2D3748' }}>{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} color="#10B981" />
              <span style={{ fontSize: '13px', color: '#2D3748' }}>+91 8980758885</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#10B981" />
              <span style={{ fontSize: '13px', color: '#2D3748' }}>
                {employee.experience === '-' ? '2 years experience' : `${employee.experience} experience`}
              </span>
            </div>
          </div>

          <div className="py-5" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
              Working Location
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-md"
              style={{
                backgroundColor: '#ECFDF5',
                padding: '6px 10px',
                border: '1px solid #D1FAE5',
              }}
            >
              <MapPin size={13} color="#10B981" />
              <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '500' }}>
                Eastface
              </span>
              <span
                className="rounded-full"
                style={{
                  fontSize: '10px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  padding: '1px 6px',
                  fontWeight: '600',
                }}
              >
                24
              </span>
            </div>
          </div>

          <div className="py-5" style={{ borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
              Reporting To
            </div>
            <div className="flex items-center gap-2">
              <div
                className="rounded-full flex items-center justify-center text-white"
                style={{ width: 28, height: 28, backgroundColor: '#10B981', fontSize: '11px', fontWeight: '600' }}
              >
                {employee.reportingInitials}
              </div>
              <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>
                {employee.reportingTo}
              </span>
            </div>
          </div>

          <div className="pt-5">
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {employee.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full"
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #D1FAE5',
                    fontWeight: '500',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: tabs */}
        <div>
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid #E2E8F0' }}
          >
            <div className="flex" style={{ borderBottom: '1px solid #E2E8F0' }}>
              {TABS.map((t) => {
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="transition-all"
                    style={{
                      padding: '14px 22px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: isActive ? '#059669' : '#718096',
                      backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                      borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
                      border: 'none',
                      borderBottomWidth: '2px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: isActive ? '#10B981' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {tab === 'about' && <AboutTab employee={employee} />}
              {tab === 'performance' && <Placeholder label="Performance metrics coming soon" />}
              {tab === 'leave' && <Placeholder label="Leave & WFH records coming soon" />}
              {tab === 'utilization' && <UtilizationTab employee={employee} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutTab({ employee }: { employee: Employee }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>Introduction</h3>
        <button
          className="flex items-center gap-1"
          style={{
            fontSize: '12px',
            color: '#10B981',
            fontWeight: '500',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#718096', marginBottom: '24px' }}>
        No introduction provided.
      </p>

      <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600', marginBottom: '16px' }}>
        Employee Information
      </h3>
      <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6" style={{ paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
        <Field label="Employee ID" value={employee.id} />
        <Field label="Country" value="India" />
        <Field label="Squad" value={employee.squad === '-' ? 'Not assigned' : employee.squad} />
        <Field label="Guild" value="Not specified" />
        <Field label="Function" value="G&A - Core" />
        <Field label="Office Location" value="Eastface" />
        <Field label="Career Start Date" value="February 28, 2017" />
        <Field label="Joined York" value="April 20, 2026" />
        <Field label="Referred By" value="Himani Shah" />
      </div>

      <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600', marginBottom: '8px' }}>
        Assigned Projects
      </h3>
      <p style={{ fontSize: '13px', color: '#718096', marginBottom: '24px' }}>
        {employee.availability === 'bench' ? 'No projects assigned.' : 'See Utilization tab for current assignments.'}
      </p>

      <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600', marginBottom: '16px' }}>
        Personal Information
      </h3>
      <div className="grid grid-cols-2 gap-y-5 gap-x-8">
        <Field label="Gender" value="—" />
        <Field label="Date of Birth" value="—" />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>{value}</div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ fontSize: '13px', color: '#A0AEC0', padding: '60px 0' }}
    >
      {label}
    </div>
  );
}

function UtilizationTab({ employee }: { employee: Employee }) {
  const data = buildUtilData(employee.id, employee.availability);
  const currentTotal = data[data.length - 1].total;
  const utilPct = Math.min(100, Math.round((currentTotal / 40) * 100));
  const activeLines = (['alpha', 'beta', 'gamma'] as const).filter((id) =>
    data.some((d) => d[id] > 0)
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Current Load" value={`${currentTotal}h / 40h`} />
        <StatCard label="Utilization" value={`${utilPct}%`} />
        <StatCard
          label="Status"
          value={
            employee.availability === 'bench'
              ? 'On Bench'
              : employee.availability === 'partial'
              ? 'Partial'
              : employee.availability === 'ending-soon'
              ? 'Ending Soon'
              : 'Fully Utilized'
          }
        />
      </div>

      <h3 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600', marginBottom: '12px' }}>
        8-Week Utilization Timeline
      </h3>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%" key={`util-${employee.id}`}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
            syncId={`util-sync-${employee.id}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#718096' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[0, 45]}
              tick={{ fontSize: 11, fill: '#718096' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              ticks={[0, 10, 20, 30, 40]}
            />
            <ReferenceLine
              y={40}
              stroke="#CBD5E0"
              strokeDasharray="4 4"
              label={{ value: '40h capacity', position: 'right', fontSize: 10, fill: '#A0AEC0' }}
            />
            <Tooltip
              contentStyle={{
                fontSize: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              formatter={(value, name) => {
                const proj = UTIL_PROJECTS.find((p) => p.id === name);
                return [`${value}h`, proj?.name || String(name)];
              }}
              wrapperStyle={{ outline: 'none' }}
            />
            {activeLines.map((id) => {
              const proj = UTIL_PROJECTS.find((p) => p.id === id)!;
              return (
                <Line
                  key={`util-line-${employee.id}-${id}`}
                  type="monotone"
                  dataKey={id}
                  name={id}
                  stroke={proj.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: proj.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {activeLines.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {activeLines.map((id) => {
            const proj = UTIL_PROJECTS.find((p) => p.id === id)!;
            const peak = Math.max(...data.map((d) => d[id] ?? 0));
            return (
              <div key={`legend-${employee.id}-${id}`} className="flex items-center gap-2">
                <div style={{ width: 20, height: 3, backgroundColor: proj.color, borderRadius: 2 }} />
                <span style={{ fontSize: '12px', color: '#4A5568', fontWeight: '500' }}>
                  {proj.name}
                </span>
                <span style={{ fontSize: '11px', color: '#A0AEC0' }}>peak: {peak}h</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: '#F0FDF4', border: '1px solid #D1FAE5' }}>
      <div style={{ fontSize: '12px', color: '#065F46', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', color: '#059669', fontWeight: '700' }}>{value}</div>
    </div>
  );
}
