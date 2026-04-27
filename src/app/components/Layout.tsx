import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Search, Sun, Bell, LayoutGrid } from 'lucide-react';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Header */}
        <div className="bg-white px-6 pt-5 pb-4 flex items-center gap-4 flex-shrink-0">
          <div
            className="flex items-center gap-2 rounded-full bg-white flex-1"
            style={{
              border: '1px solid #E2E8F0',
              padding: '10px 16px',
              maxWidth: '560px',
            }}
          >
            <Search size={15} color="#A0AEC0" />
            <input
              placeholder="Search people or projects..."
              style={{
                fontSize: '13px',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                flex: 1,
                color: '#2D3748',
              }}
            />
            <span
              className="rounded-md"
              style={{
                fontSize: '11px',
                color: '#A0AEC0',
                padding: '2px 8px',
                border: '1px solid #E2E8F0',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              }}
            >
              ⌘ /
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#F7FAFC',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
              aria-label="Assistant"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  background: 'radial-gradient(circle at 30% 30%, #F6AD55, #DD6B20)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                ✦
              </div>
            </button>
            <button
              className="rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#F7FAFC',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Theme"
            >
              <Sun size={16} color="#1A202C" />
            </button>
            <button
              className="rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#F7FAFC',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Notifications"
            >
              <Bell size={16} color="#1A202C" />
            </button>
            <button
              className="rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#F7FAFC',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Apps"
            >
              <LayoutGrid size={16} color="#1A202C" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
