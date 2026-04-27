import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Save,
  Video,
  Plus,
  MoreVertical,
  XCircle,
} from 'lucide-react';
import { setSelectedVersion as saveSelectedVersion, getSelectedVersion } from '../data/quotationVersions';
import { QuotationModernView } from './QuotationModernView';

interface QuoteRow {
  title: string;
  position: string;
  percentage: number;
  hrs: number;
  totalLocal: number;
  totalUsd: number;
}

interface MarginRow {
  title: string;
  type: '%' | '$';
  amount: number;
  total: number;
}

const INITIAL_ROWS: QuoteRow[] = [
  { title: 'Dev Support', position: 'Full Stack', percentage: 25, hrs: 43.33, totalLocal: 346.64, totalUsd: 980.62 },
  { title: 'SEO/AEO', position: 'RevOps Specialist', percentage: 100, hrs: 173.33, totalLocal: 1039.98, totalUsd: 2942.02 },
  { title: 'QA', position: 'Quality Assurance', percentage: 25, hrs: 43.33, totalLocal: 216.65, totalUsd: 612.89 },
  { title: 'UX', position: 'User Experience Designer', percentage: 25, hrs: 43.33, totalLocal: 389.97, totalUsd: 1103.19 },
];

const INITIAL_MARGINS: MarginRow[] = [
  { title: 'Oversight', type: '$', amount: 120, total: 120 },
  { title: 'Benefits', type: '%', amount: 15, total: 642 },
  { title: 'Office / General Overhead', type: '%', amount: 10, total: 492.2 },
  { title: '15% Required Margin + 18% Tax', type: '%', amount: 17.7, total: 958.31 },
  { title: 'Markup', type: '%', amount: 105, total: 6691.11 },
];

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function QuotationDetail({
  name,
  account,
  viewMode,
  onViewModeChange,
  onBack,
}: {
  name: string;
  account: string;
  viewMode: 'modern' | 'classic';
  onViewModeChange: (m: 'modern' | 'classic') => void;
  onBack: () => void;
}) {
  const [active, setActive] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [country, setCountry] = useState<'INDIA' | 'USA'>('INDIA');
  const [rows, setRows] = useState<QuoteRow[]>(INITIAL_ROWS);
  const [margins, setMargins] = useState<MarginRow[]>(INITIAL_MARGINS);
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const saved = getSelectedVersion(name);
    return saved?.selectedVersion || 'Default Version';
  });

  const quoteItemsTotal = rows.reduce((s, r) => s + r.totalLocal, 0);
  const marginsTotal = margins.reduce((s, m) => s + m.total, 0);
  const indiaQuote = quoteItemsTotal;
  const indiaMargins = marginsTotal;
  const usaQuote = 0;
  const usaMargins = 0;
  const total = indiaQuote + indiaMargins + usaQuote + usaMargins;
  const grand = Math.round(total / 100) * 100;
  const rounded = grand - total;

  // Save selected version to store whenever it changes
  useEffect(() => {
    saveSelectedVersion(name, selectedVersion, grand);
  }, [selectedVersion, grand, name]);

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
        Back to Quotations
      </button>

      {/* Page title */}
      <div className="mb-5">
        <h1 style={{ fontSize: '22px', color: '#1A202C', fontWeight: '600' }}>
          {name}
        </h1>
        <p style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>
          {account}
        </p>
      </div>

      {/* Modern view */}
      {viewMode === 'modern' && (
        <QuotationModernView name={name} account={account} />
      )}

      {/* Classic view */}
      {viewMode === 'classic' && (<>

      {/* Classic top bar */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: '22px', color: '#1A202C', fontWeight: '600' }}>
            Quotation Details
          </h1>
          <p style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>
            {name} — {account}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActive((a) => !a)}
            className="rounded-full"
            style={{
              fontSize: '11px',
              padding: '5px 12px',
              backgroundColor: active ? '#10B981' : '#E2E8F0',
              color: active ? 'white' : '#718096',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Active Quotation
          </button>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: '12px', color: '#4A5568' }}>Hide Amounts</span>
            <Toggle on={hideAmounts} onChange={setHideAmounts} />
          </div>

          <div className="flex items-center gap-1" style={{ fontSize: '12px', color: '#4A5568' }}>
            <span>Owner</span>
            <div
              className="flex items-center gap-1 rounded-md bg-white"
              style={{ border: '1px solid #E2E8F0', padding: '5px 10px' }}
            >
              <span style={{ color: '#A0AEC0', fontSize: '12px' }}>Select owner</span>
              <ChevronDown size={12} color="#A0AEC0" />
            </div>
          </div>

          <div
            className="flex items-center gap-1 rounded-md bg-white"
            style={{ border: '1px solid #E2E8F0', padding: '6px 10px', fontSize: '12px', color: '#4A5568' }}
          >
            <span>Confidence</span>
            <span style={{ color: '#1A202C', fontWeight: '600' }}>100%</span>
          </div>

          <button
            className="flex items-center gap-1.5 rounded-md"
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              padding: '7px 14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Save size={13} />
            Save
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-1.5 rounded-md bg-white"
          style={{
            fontSize: '12px',
            color: '#4A5568',
            fontWeight: '500',
            padding: '6px 12px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          <Video size={13} color="#4A5568" />
          Zoom Meetings
        </button>
      </div>

      {/* Quote versions card */}
      <div
        className="bg-white rounded-xl mb-5"
        style={{ border: '1px solid #E2E8F0', padding: '20px 24px' }}
      >
        {/* Row 1: Title + primary actions */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>
            Quote versions &amp; calculations
          </h2>
          <div className="flex items-center gap-2">
            <button
              style={{
                fontSize: '12px',
                color: '#4A5568',
                fontWeight: '500',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Show Archived
            </button>
            <span style={{ width: 1, height: 18, backgroundColor: '#E2E8F0' }} />
            <button
              className="flex items-center gap-1.5 rounded-md"
              style={{
                fontSize: '12px',
                color: 'white',
                fontWeight: '600',
                padding: '7px 14px',
                backgroundColor: '#10B981',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              Add Version
            </button>
          </div>
        </div>

        {/* Row 2: Version pills (left) + Country pills (right) */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div
            className="flex items-center rounded-lg"
            style={{ backgroundColor: '#F1F5F9', padding: '3px' }}
          >
            <button
              className="flex items-center gap-1.5 rounded-md"
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedVersion === 'Default Version'}
                onChange={() => setSelectedVersion('Default Version')}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer', marginRight: '4px' }}
              />
              Default Version
              <MoreVertical size={11} color="white" />
            </button>
          </div>

          <div
            className="flex items-center rounded-lg"
            style={{ backgroundColor: '#F1F5F9', padding: '3px' }}
          >
            {(['INDIA', 'USA'] as const).map((c) => {
              const isActive = country === c;
              const label =
                c === 'INDIA'
                  ? `INDIA · ${fmt(indiaQuote + indiaMargins)}`
                  : `USA · ${fmt(usaQuote + usaMargins)}`;
              return (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className="rounded-md"
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '6px 14px',
                    backgroundColor: isActive ? 'white' : 'transparent',
                    color: isActive ? '#059669' : '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calc table */}
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <ColTh>Title</ColTh>
              <ColTh>Position</ColTh>
              <Spacer />
              <ColTh>Percentage</ColTh>
              <ColTh>Hrs/mo</ColTh>
              <Spacer />
              <ColTh>Total</ColTh>
              <ColTh />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.title}-${i}`}>
                <td style={{ paddingRight: '10px' }}>
                  <CellInput value={r.title} />
                </td>
                <td style={{ paddingRight: '10px' }}>
                  <CellSelect value={r.position} />
                </td>
                <td style={{ textAlign: 'center', fontSize: '14px', color: '#A0AEC0', width: '16px' }}>*</td>
                <td style={{ paddingRight: '10px', width: '120px' }}>
                  <CellSuffixInput value={String(r.percentage)} suffix="%" />
                </td>
                <td style={{ paddingRight: '10px', width: '110px' }}>
                  <CellInput value={String(r.hrs)} />
                </td>
                <td style={{ textAlign: 'center', fontSize: '14px', color: '#A0AEC0', width: '16px' }}>=</td>
                <td style={{ paddingRight: '10px', whiteSpace: 'nowrap' }}>
                  {hideAmounts ? (
                    <span style={{ fontSize: '13px', color: '#A0AEC0' }}>—</span>
                  ) : (
                    <span>
                      <span style={{ fontSize: '15px', color: '#1A202C', fontWeight: '700' }}>
                        {fmt(r.totalLocal)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#A0AEC0', marginLeft: '4px' }}>
                        ({fmt(r.totalUsd)})
                      </span>
                    </span>
                  )}
                </td>
                <td style={{ width: '24px' }}>
                  <button
                    onClick={() => setRows((xs) => xs.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <XCircle size={16} color="#F87171" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              setRows((xs) => [
                ...xs,
                { title: '', position: '', percentage: 0, hrs: 0, totalLocal: 0, totalUsd: 0 },
              ])
            }
            className="flex items-center gap-1.5 rounded-md"
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              padding: '8px 14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            Add Quote Item
          </button>
        </div>
      </div>

      {/* Margins card */}
      <div
        className="bg-white rounded-xl"
        style={{ border: '1px solid #E2E8F0', padding: '20px 24px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '14px', color: '#1A202C', fontWeight: '600' }}>Margins</h2>
          <button
            className="rounded-md"
            style={{
              fontSize: '12px',
              color: '#1A202C',
              fontWeight: '600',
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            + Default Margins
          </button>
        </div>

        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <ColTh>Title</ColTh>
              <ColTh>Type</ColTh>
              <ColTh>Amount</ColTh>
              <Spacer />
              <th style={{ textAlign: 'right', padding: '0 10px 8px', fontSize: '12px', color: '#4A5568', fontWeight: '600' }}>
                Total
              </th>
              <ColTh />
            </tr>
          </thead>
          <tbody>
            {margins.map((m, i) => (
              <tr key={`${m.title}-${i}`}>
                <td style={{ paddingRight: '10px' }}>
                  <CellInput value={m.title} />
                </td>
                <td style={{ paddingRight: '10px', width: '150px' }}>
                  <div className="flex items-center gap-4" style={{ padding: '0 6px' }}>
                    <TypeRadio
                      checked={m.type === '%'}
                      onChange={() =>
                        setMargins((xs) =>
                          xs.map((r, idx) => (idx === i ? { ...r, type: '%' } : r))
                        )
                      }
                      label="%"
                    />
                    <TypeRadio
                      checked={m.type === '$'}
                      onChange={() =>
                        setMargins((xs) =>
                          xs.map((r, idx) => (idx === i ? { ...r, type: '$' } : r))
                        )
                      }
                      label="$"
                    />
                  </div>
                </td>
                <td style={{ paddingRight: '10px', width: '160px' }}>
                  <CellInput value={String(m.amount)} />
                </td>
                <td style={{ textAlign: 'center', fontSize: '14px', color: '#A0AEC0', width: '16px' }}>=</td>
                <td style={{ paddingRight: '10px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {hideAmounts ? (
                    <span style={{ fontSize: '13px', color: '#A0AEC0' }}>—</span>
                  ) : (
                    <span style={{ fontSize: '15px', color: '#1A202C', fontWeight: '700' }}>
                      {fmt(m.total)}
                    </span>
                  )}
                </td>
                <td style={{ width: '24px' }}>
                  <button
                    onClick={() => setMargins((xs) => xs.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <XCircle size={16} color="#F87171" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              setMargins((xs) => [...xs, { title: '', type: '%', amount: 0, total: 0 }])
            }
            className="flex items-center gap-1.5 rounded-md"
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              padding: '8px 14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            Add Margin Item
          </button>
        </div>

        {/* Totals footer */}
        <div
          className="grid gap-4 mt-6 pt-5"
          style={{ gridTemplateColumns: '1fr 20px 1fr 20px 1.2fr', borderTop: '1px solid #E2E8F0' }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '700', marginBottom: '6px' }}>
              INDIA
            </div>
            <TotalRow label="Quote Items:" value={fmt(indiaQuote)} />
            <TotalRow label="Margins:" value={fmt(indiaMargins)} />
          </div>
          <div className="flex items-center justify-center" style={{ fontSize: '18px', color: '#A0AEC0' }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '700', marginBottom: '6px' }}>
              USA
            </div>
            <TotalRow label="Quote Items:" value={fmt(usaQuote)} />
            <TotalRow label="Margins:" value={fmt(usaMargins)} />
          </div>
          <div className="flex items-center justify-center" style={{ fontSize: '18px', color: '#A0AEC0' }}>
            =
          </div>
          <div>
            <TotalRow label="Quote Items Total:" value={fmt(indiaQuote + usaQuote)} />
            <TotalRow label="Margins Total:" value={fmt(indiaMargins + usaMargins)} />
            <TotalRow label="Total:" value={fmt(total)} />
            <TotalRow label="Rounded:" value={fmt(rounded)} />
            <div className="flex items-center justify-between mt-1">
              <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '700' }}>
                Grand Total:
              </span>
              <span style={{ fontSize: '16px', color: '#059669', fontWeight: '700' }}>
                {fmt(grand)}
              </span>
            </div>
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '3px 0' }}>
      <span style={{ fontSize: '12px', color: '#4A5568' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '600' }}>{value}</span>
    </div>
  );
}

function TypeRadio({
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
      className="flex items-center gap-1.5"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span
        style={{
          width: 13,
          height: 13,
          borderRadius: '50%',
          border: `2px solid ${checked ? '#10B981' : '#CBD5E0'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
        )}
      </span>
      <span style={{ fontSize: '13px', color: '#1A202C', fontWeight: '500' }}>{label}</span>
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 34,
        height: 18,
        borderRadius: 999,
        backgroundColor: on ? '#10B981' : '#E2E8F0',
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
          left: on ? 18 : 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}

function ColTh({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '0 10px 8px 0',
        fontSize: '12px',
        color: '#4A5568',
        fontWeight: '600',
      }}
    >
      {children}
    </th>
  );
}

function Spacer() {
  return <th style={{ width: '16px' }} />;
}

function CellInput({ value }: { value: string }) {
  return (
    <input
      defaultValue={value}
      className="w-full rounded-md"
      style={{
        fontSize: '13px',
        color: '#1A202C',
        padding: '8px 10px',
        border: '1px solid #E2E8F0',
        outline: 'none',
        backgroundColor: 'white',
      }}
    />
  );
}

function CellSelect({ value }: { value: string }) {
  return (
    <div
      className="w-full flex items-center justify-between rounded-md"
      style={{
        fontSize: '13px',
        color: '#1A202C',
        padding: '8px 10px',
        border: '1px solid #E2E8F0',
        backgroundColor: 'white',
      }}
    >
      <span>{value}</span>
      <ChevronDown size={13} color="#A0AEC0" />
    </div>
  );
}

function CellSuffixInput({ value, suffix }: { value: string; suffix: string }) {
  return (
    <div
      className="w-full flex items-center justify-between rounded-md"
      style={{
        fontSize: '13px',
        color: '#1A202C',
        padding: '8px 10px',
        border: '1px solid #E2E8F0',
        backgroundColor: 'white',
      }}
    >
      <span>{value}</span>
      <span style={{ color: '#A0AEC0' }}>{suffix}</span>
    </div>
  );
}
