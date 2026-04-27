import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { DashboardPage } from './components/DashboardPage';
import { LeadsPage } from './components/LeadsPage';
import { QuotationsPage } from './components/QuotationsPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ResourcePlanningPage } from './components/ResourcePlanningPage';

function ComingSoonPage() {
  return (
    <div className="p-8" style={{ backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      <h1 style={{ fontSize: '24px', color: '#1A202C', fontWeight: '600', marginBottom: '8px' }}>
        Coming Soon
      </h1>
      <p style={{ fontSize: '13px', color: '#718096' }}>This page is not available yet.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'leads', Component: LeadsPage },
      { path: 'quotations', Component: QuotationsPage },
      { path: 'projects', Component: ProjectsPage },
      { path: 'resource-planning', Component: ResourcePlanningPage },
      { path: '*', Component: ComingSoonPage },
    ],
  },
]);
