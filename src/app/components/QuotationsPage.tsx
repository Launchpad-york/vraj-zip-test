import { useState } from 'react';
import { Search, Plus, MoreVertical, FileText, LayoutGrid, List } from 'lucide-react';
import { QuotationDetail } from './QuotationDetail';

interface Version {
  name: string;
  quote: number;
  margins: number;
  total: number;
}

interface Quotation {
  name: string;
  account: string;
  created: string;
  updated: string;
  accounts: number;
  versions: Version[];
  currentVersion: string;
}

const QUOTATIONS: Quotation[] = [
  {
    name: 'Serenity GTM Subscription',
    account: 'Serenity',
    created: '17 Apr 2026',
    updated: '17 Apr 2026',
    accounts: 100,
    versions: [
      { name: 'Default Version', quote: 6499, margins: 4211, total: 10700 },
    ],
    currentVersion: 'Default Version',
  },
  {
    name: 'Chirpyest 2nd Engineer',
    account: 'Chirpyest',
    created: '07 Mar 2026',
    updated: '01 Apr 2026',
    accounts: 100,
    versions: [
      { name: '09/25-3/26 team', quote: 1733, margins: 3123, total: 4900 },
      { name: 'Current Team (4/1/26)', quote: 3467, margins: 6252, total: 9700 },
    ],
    currentVersion: 'Current Team (4/1/26)',
  },
  {
    name: 'Coachmetrix',
    account: '-',
    created: '21 Mar 2023',
    updated: '26 Mar 2026',
    accounts: 100,
    versions: [
      { name: 'Pre July 2025', quote: 1872, margins: 2569, total: 4400 },
      { name: 'Current July 2025', quote: 1747, margins: 3201, total: 4900 },
    ],
    currentVersion: 'Current July 2025',
  },
];

const TABS = ['Quotations', 'Quotation Position'];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export function QuotationsPage() {
  const [tab, setTab] = useState('Quotations');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'modern' | 'classic'>('modern');

  const filtered = QUOTATIONS.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <QuotationDetail
        name={selected.name}
        account={selected.account}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600' }}>Quotation</h1>
        <div className="flex items-center gap-3">
          {/* Modern / Classic toggle */}
          <div
            className="flex items-center rounded-xl"
            style={{ backgroundColor: '#F1F5F9', padding: '3px', gap: '2px' }}
          >
            <button
              onClick={() => setViewMode('modern')}
              className="flex items-center gap-1.5 rounded-lg"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: viewMode === 'modern' ? 'white' : 'transparent',
                color: viewMode === 'modern' ? '#059669' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: viewMode === 'modern' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LayoutGrid size={12} />
              Modern
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className="flex items-center gap-1.5 rounded-lg"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: viewMode === 'classic' ? 'white' : 'transparent',
                color: viewMode === 'classic' ? '#059669' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: viewMode === 'classic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <List size={12} />
              Classic
            </button>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg"
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              padding: '9px 16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16,185,129,0.3)',
            }}
          >
            <Plus size={14} />
            Add Quotation
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5" style={{ borderBottom: '1px solid #E2E8F0' }}>
        {TABS.map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 2px',
                fontSize: '13px',
                fontWeight: '600',
                color: isActive ? '#059669' : '#718096',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#10B981' : 'transparent'}`,
                marginBottom: '-1px',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: '16px', color: '#1A202C', fontWeight: '600' }}>Quotations</h2>
          <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
            Showing {filtered.length} quotations · <span style={{ fontWeight: '600', color: viewMode === 'modern' ? '#059669' : '#64748B' }}>{viewMode === 'modern' ? 'Modern' : 'Classic'} view</span>
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-lg bg-white"
          style={{ border: '1px solid #E2E8F0', padding: '8px 12px', width: '320px' }}
        >
          <Search size={14} color="#A0AEC0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations..."
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
      </div>

      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
              <Th>Project</Th>
              <Th>Account</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th>Accounts</Th>
              <Th>Amounts</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.name} style={{ borderBottom: '1px solid #F0F0F0' }}>
                <Td>
                  <button
                    onClick={() => setSelected(q)}
                    className="flex items-center gap-2 text-left hover:underline"
                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <div
                      className="rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ width: 28, height: 28, backgroundColor: '#ECFDF5' }}
                    >
                      <FileText size={14} color="#10B981" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                      {q.name}
                    </span>
                  </button>
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: q.account === '-' ? '#A0AEC0' : '#2D3748' }}>
                    {q.account}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: '#4A5568' }}>{q.created}</span>
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: '#4A5568' }}>{q.updated}</span>
                </Td>
                <Td>
                  <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>
                    {q.accounts}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-col gap-3">
                    {q.versions.map((v) => (
                      <div key={`${q.name}-${v.name}`}>
                        <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '500' }}>Phase</span>{' '}
                          <span style={{ color: '#1A202C', fontWeight: '600' }}>{v.name}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.6' }}>
                          <div>Quote: <span style={{ color: '#1A202C', fontWeight: '500' }}>{fmt(v.quote)}</span></div>
                          <div>Margins: <span style={{ color: '#1A202C', fontWeight: '500' }}>{fmt(v.margins)}</span></div>
                          <div>Total: <span style={{ color: '#059669', fontWeight: '600' }}>{fmt(v.total)}</span></div>
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '500' }}>
                      Active Phase: {q.currentVersion}
                    </div>
                  </div>
                </Td>
                <Td align="right">
                  <button
                    className="rounded-md hover:bg-gray-100"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
                  >
                    <MoreVertical size={15} color="#718096" />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddQuotationModal onClose={() => setShowAdd(false)} viewMode={viewMode} onOpen={(name) => { setShowAdd(false); }} />}
    </div>
  );
}

function AddQuotationModal({ onClose, viewMode, onOpen }: { onClose: () => void; viewMode: 'modern' | 'classic'; onOpen: (name: string) => void }) {
  const [active, setActive] = useState(true);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full"
        style={{ maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', padding: '28px 32px' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 style={{ fontSize: '20px', color: '#1A202C', fontWeight: '700', marginBottom: '6px' }}>
              Add Quotation
            </h2>
            <p style={{ fontSize: '13px', color: '#718096' }}>
              Will open in <span style={{ fontWeight: '600', color: viewMode === 'modern' ? '#059669' : '#64748B' }}>{viewMode === 'modern' ? 'Modern' : 'Classic'}</span> view.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#4A5568' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <Field label="Client">
          <div
            className="flex items-center justify-between rounded-lg"
            style={{ border: '1px solid #E2E8F0', padding: '11px 14px', backgroundColor: 'white' }}
          >
            <span style={{ fontSize: '14px', color: '#A0AEC0' }}>Select client</span>
            <span style={{ color: '#A0AEC0' }}>▾</span>
          </div>
        </Field>

        <Field label="Project">
          <input
            autoFocus
            placeholder="Project Name"
            className="w-full rounded-lg"
            style={{
              fontSize: '14px',
              padding: '11px 14px',
              border: '2px solid #A7F3D0',
              outline: 'none',
              color: '#1A202C',
            }}
          />
        </Field>

        <Field label="Confidence Level">
          <input
            placeholder="Confidence Level"
            className="w-full rounded-lg"
            style={{
              fontSize: '14px',
              padding: '11px 14px',
              border: '1px solid #E2E8F0',
              outline: 'none',
              color: '#1A202C',
            }}
          />
        </Field>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#4A5568', marginBottom: '10px' }}>Active</div>
          <div className="flex items-center gap-8">
            <RadioOption checked={active} onChange={() => setActive(true)} label="True" />
            <RadioOption checked={!active} onChange={() => setActive(false)} label="False" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              padding: '10px 22px',
              backgroundColor: 'white',
              color: '#1A202C',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-lg"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              padding: '10px 26px',
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
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', color: '#4A5568', marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  );
}

function RadioOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-2"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${checked ? '#10B981' : '#CBD5E0'}`,
          backgroundColor: 'white',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
        )}
      </span>
      <span style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>{label}</span>
    </button>
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
    <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: align ?? 'left' }}>
      {children}
    </td>
  );
}
