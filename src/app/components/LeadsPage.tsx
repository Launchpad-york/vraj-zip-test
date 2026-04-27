import { useState } from 'react';
import { Search, Linkedin, ChevronDown, Users, UserMinus, UserCheck, Clock, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfile';
import { EMPLOYEES, type Employee, type Availability } from '../data/employees';

const AVAILABILITY_OPTIONS: {
  key: Availability;
  label: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { key: 'all', label: 'All Employees', hint: 'Everyone on the roster', Icon: Users },
  { key: 'bench', label: 'On Bench', hint: 'No active assignment', Icon: UserX },
  { key: 'partial', label: 'Partial Bench', hint: 'Spare capacity available', Icon: UserMinus },
  { key: 'ending-soon', label: 'Ending Soon', hint: 'Rolling off in 2 weeks', Icon: Clock },
  { key: 'utilized', label: 'Fully Utilized', hint: 'At capacity', Icon: UserCheck },
];


export function LeadsPage() {
  const [availability, setAvailability] = useState<Availability>('all');
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = EMPLOYEES.filter(
    (e) => availability === 'all' || e.availability === availability
  );

  if (selected) {
    return <EmployeeProfile employee={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* Page header */}
      <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600', marginBottom: '20px' }}>
        Employee Directory
      </h1>

      {/* Availability segment — clickable stat cards */}
      <div
        className="grid gap-3 mb-6"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
      >
        {AVAILABILITY_OPTIONS.map((opt) => {
          const count =
            opt.key === 'all'
              ? EMPLOYEES.length
              : EMPLOYEES.filter((e) => e.availability === opt.key).length;
          const isActive = availability === opt.key;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.key}
              onClick={() => setAvailability(opt.key)}
              className="rounded-lg text-left transition-all"
              style={{
                backgroundColor: isActive ? '#ECFDF5' : 'white',
                border: `1px solid ${isActive ? '#10B981' : '#E2E8F0'}`,
                padding: '14px 16px',
                boxShadow: isActive ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="rounded-md flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: isActive ? '#10B981' : '#F0FDF4',
                  }}
                >
                  <Icon size={15} color={isActive ? 'white' : '#10B981'} />
                </div>
                <span
                  style={{
                    fontSize: '20px',
                    color: isActive ? '#065F46' : '#1A202C',
                    fontWeight: '700',
                  }}
                >
                  {count}
                </span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: isActive ? '#065F46' : '#2D3748',
                  fontWeight: '600',
                  marginBottom: '2px',
                }}
              >
                {opt.label}
              </div>
              <div style={{ fontSize: '11px', color: '#718096' }}>{opt.hint}</div>
            </button>
          );
        })}
      </div>

      {/* Search row */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 bg-white flex-1"
          style={{ border: '1px solid #E2E8F0', maxWidth: '600px' }}
        >
          <Search size={16} color="#A0AEC0" />
          <input
            placeholder="Search employees by name, email, ID, title, or skill..."
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
        <div className="flex items-center gap-4 ml-auto">
          <a className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '13px', color: '#10B981', fontWeight: '500' }}>
            <Linkedin size={14} color="#10B981" />
            Find Everyone on LinkedIn
          </a>
          <span style={{ fontSize: '13px', color: '#4A5568' }}>
            Current Team: <span style={{ fontWeight: '600', color: '#1A202C' }}>236</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div
        className="grid gap-3 mb-5 p-4 bg-white rounded-lg"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #E2E8F0' }}
      >
        <FilterSelect label="Country" value="All" />
        <FilterSelect label="Skills" value="Select skills" placeholder />
        <FilterSelect label="Squad" value="Select squad" placeholder />
        <FilterSelect label="Guild" value="Select guild" placeholder />
        <FilterSelect label="Product Unit" value="Select product unit" placeholder />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
              <Th>ID</Th>
              <Th>Profile</Th>
              <Th>Skills</Th>
              <Th>Reporting To</Th>
              <Th>Squad</Th>
              <Th>Guild</Th>
              <Th>Experience</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                <Td>
                  <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>{emp.id}</span>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar initials={emp.initials} color="#10B981" size={40} />
                    <div>
                      <button
                        onClick={() => setSelected(emp)}
                        className="text-left hover:underline"
                        style={{
                          fontSize: '13px',
                          color: '#059669',
                          fontWeight: '600',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        {emp.name}
                      </button>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                        {emp.title}
                      </div>
                      <Linkedin size={12} color="#0A66C2" style={{ marginTop: '4px' }} />
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5" style={{ maxWidth: '260px' }}>
                    {emp.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          backgroundColor: '#F3F4F6',
                          color: '#4A5568',
                          fontWeight: '500',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {emp.extraSkills > 0 && (
                      <span
                        className="rounded"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          backgroundColor: '#E5E7EB',
                          color: '#6B7280',
                          fontWeight: '500',
                        }}
                      >
                        +{emp.extraSkills}
                      </span>
                    )}
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.reportingInitials} color="#10B981" size={28} fontSize={11} />
                    <span style={{ fontSize: '13px', color: '#2D3748' }}>{emp.reportingTo}</span>
                  </div>
                </Td>
                <Td>
                  {emp.squad === '-' ? (
                    <span style={{ fontSize: '13px', color: '#A0AEC0' }}>-</span>
                  ) : (
                    <span
                      className="rounded"
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        backgroundColor: '#D1FAE5',
                        color: '#065F46',
                        fontWeight: '600',
                      }}
                    >
                      {emp.squad}
                    </span>
                  )}
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: '#A0AEC0' }}>{emp.guild}</span>
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: '#4A5568' }}>{emp.experience}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '12px',
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

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>{children}</td>;
}

function Avatar({
  initials,
  color,
  size,
  fontSize,
}: {
  initials: string;
  color: string;
  size: number;
  fontSize?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: fontSize ?? Math.round(size * 0.38),
        fontWeight: '600',
      }}
    >
      {initials}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: '500' }}>
        {label}
      </div>
      <div
        className="flex items-center justify-between rounded-md px-3 py-2 bg-white cursor-pointer"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <span style={{ fontSize: '13px', color: placeholder ? '#A0AEC0' : '#2D3748' }}>{value}</span>
        <ChevronDown size={14} color="#A0AEC0" />
      </div>
    </div>
  );
}
