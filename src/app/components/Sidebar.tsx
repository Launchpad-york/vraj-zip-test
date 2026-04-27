import { useNavigate, useLocation } from 'react-router';
import {
  Home,
  CalendarClock,
  Calendar,
  Target,
  FolderKanban,
  CircleUser,
  Users,
  ListChecks,
  Star,
  Award,
  Link as LinkIcon,
  MessageSquare,
  Package,
  Video,
  BarChart3,
  UserCheck,
  FileText,
  UserPlus,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  Icon: typeof Home;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'PRIMARY',
    items: [
      { Icon: Home, label: 'Home', path: '/' },
      { Icon: CalendarClock, label: 'Timesheet', path: '/timesheet' },
      { Icon: Calendar, label: 'Leave & WFH', path: '/leave' },
      { Icon: Target, label: 'MBO', path: '/mbo' },
      { Icon: FolderKanban, label: 'Projects', path: '/projects' },
    ],
  },
  {
    title: 'ORGANIZATIONAL',
    items: [
      { Icon: CircleUser, label: 'Employees', path: '/leads' },
      { Icon: Users, label: 'Organization', path: '/organization' },
      { Icon: ListChecks, label: 'Project Issues', path: '/issues' },
      { Icon: Star, label: 'Kudos', path: '/kudos' },
      { Icon: Award, label: 'Awards', path: '/awards' },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { Icon: LinkIcon, label: 'Link Vault', path: '/vault' },
      { Icon: MessageSquare, label: 'Whisper', path: '/whisper' },
      { Icon: Package, label: 'Inventory', path: '/inventory' },
      { Icon: Video, label: 'Meeting Tracker', path: '/meetings' },
      { Icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { Icon: UserCheck, label: 'Interviews', path: '/interviews' },
    ],
  },
  {
    title: 'MODULE',
    items: [
      { Icon: FileText, label: 'Quotation', path: '/quotations' },
      { Icon: UserPlus, label: 'Resource Planning', path: '/resource-planning' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="w-64 bg-white flex-shrink-0 flex flex-col"
      style={{ borderRight: '1px solid #E2E8F0', minHeight: '100vh' }}
    >
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <div
            className="rounded-lg flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #38A169, #4FD1C5)',
            }}
          >
            <span style={{ fontSize: '14px', color: 'white', fontWeight: '700' }}>Y</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.02em' }}>
            <span style={{ color: '#1A202C' }}>YORK·IE</span>{' '}
            <span style={{ color: '#10B981' }}>HUB</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            <div
              style={{
                fontSize: '10px',
                color: '#A0AEC0',
                fontWeight: '700',
                letterSpacing: '0.08em',
                padding: '6px 10px 8px',
              }}
            >
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 text-left transition-all"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? '#10B981' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <item.Icon
                      size={17}
                      color={isActive ? 'white' : '#4A5568'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: isActive ? 'white' : '#1A202C',
                        fontWeight: isActive ? '700' : '500',
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderTop: '1px solid #E2E8F0' }}
      >
        <div
          className="rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #38A169, #4FD1C5)',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          SG
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: '700' }}>
            Shreya Gokani
          </div>
          <div style={{ fontSize: '11px', color: '#A0AEC0' }}>shreya.g@york.ie</div>
        </div>
        <ChevronDown size={16} color="#A0AEC0" />
      </div>
    </div>
  );
}
