export const PROJECTS = [
  { id: 'alpha', name: 'Project Alpha', color: '#4FD1C5', description: 'E-commerce Platform' },
  { id: 'beta', name: 'Project Beta', color: '#48BB78', description: 'Mobile App Redesign' },
  { id: 'gamma', name: 'Project Gamma', color: '#ED8936', description: 'Analytics Dashboard' },
  { id: 'delta', name: 'Project Delta', color: '#9F7AEA', description: 'API Integration' },
] as const;

export type ProjectId = 'alpha' | 'beta' | 'gamma' | 'delta';

export const WEEK_LABELS = ['Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31', 'Apr 7', 'Apr 14', 'Apr 21'];

export type Role = 'Product Manager' | 'UX/UI Designer' | 'Developer' | 'QA';
export type BenchStatus = 'bench' | 'partial' | 'utilized' | 'ending-soon';

export interface WeekData {
  week: string;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  total: number;
}

export interface ProjectAssignment {
  projectId: ProjectId;
  hoursPerWeek: number;
  endingSoon?: boolean;
  endDate?: string;
}

export interface Resource {
  id: string;
  name: string;
  role: Role;
  initials: string;
  avatarColor: string;
  status: BenchStatus;
  maxHours: number;
  currentAssignments: ProjectAssignment[];
  weeklyData: WeekData[];
}

function makeWeek(week: string, alpha = 0, beta = 0, gamma = 0, delta = 0): WeekData {
  return { week, alpha, beta, gamma, delta, total: alpha + beta + gamma + delta };
}

export const RESOURCES: Resource[] = [
  // ── Product Managers ──────────────────────────────────────────
  {
    id: 'pm-1',
    name: 'Marcus Johnson',
    role: 'Product Manager',
    initials: 'MJ',
    avatarColor: '#4FD1C5',
    status: 'bench',
    maxHours: 40,
    currentAssignments: [],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, [40, 40, 38, 35, 20, 0, 0, 0][i])
    ),
  },
  {
    id: 'pm-2',
    name: 'Sarah Chen',
    role: 'Product Manager',
    initials: 'SC',
    avatarColor: '#38A169',
    status: 'utilized',
    maxHours: 40,
    currentAssignments: [
      { projectId: 'alpha', hoursPerWeek: 20 },
      { projectId: 'beta', hoursPerWeek: 20 },
    ],
    weeklyData: WEEK_LABELS.map((w) => makeWeek(w, 20, 20)),
  },

  // ── UX/UI Designers ──────────────────────────────────────────
  {
    id: 'ux-1',
    name: 'Priya Patel',
    role: 'UX/UI Designer',
    initials: 'PP',
    avatarColor: '#ED8936',
    status: 'partial',
    maxHours: 40,
    currentAssignments: [{ projectId: 'beta', hoursPerWeek: 15 }],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, [30, 30, 28, 25, 20, 15, 15, 15][i])
    ),
  },
  {
    id: 'ux-2',
    name: 'Alex Kim',
    role: 'UX/UI Designer',
    initials: 'AK',
    avatarColor: '#9F7AEA',
    status: 'bench',
    maxHours: 40,
    currentAssignments: [],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, [40, 40, 38, 30, 20, 0, 0, 0][i])
    ),
  },

  // ── Developers ───────────────────────────────────────────────
  {
    id: 'dev-1',
    name: 'James Wilson',
    role: 'Developer',
    initials: 'JW',
    avatarColor: '#FC8181',
    status: 'bench',
    maxHours: 40,
    currentAssignments: [],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, [40, 40, 40, 40, 25, 10, 0, 0][i])
    ),
  },
  {
    id: 'dev-2',
    name: 'David Chen',
    role: 'Developer',
    initials: 'DC',
    avatarColor: '#48BB78',
    status: 'partial',
    maxHours: 40,
    currentAssignments: [{ projectId: 'gamma', hoursPerWeek: 10 }],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, [35, 30, 25, 20, 15, 12, 10, 10][i])
    ),
  },
  {
    id: 'dev-3',
    name: 'Lisa Park',
    role: 'Developer',
    initials: 'LP',
    avatarColor: '#4FD1C5',
    status: 'utilized',
    maxHours: 40,
    currentAssignments: [
      { projectId: 'alpha', hoursPerWeek: 20 },
      { projectId: 'beta', hoursPerWeek: 20 },
    ],
    weeklyData: WEEK_LABELS.map((w) => makeWeek(w, 20, 20)),
  },
  {
    id: 'dev-4',
    name: 'Tom Bradley',
    role: 'Developer',
    initials: 'TB',
    avatarColor: '#ED8936',
    status: 'bench',
    maxHours: 40,
    currentAssignments: [],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, 0, [40, 40, 35, 10, 0, 0, 0, 0][i])
    ),
  },

  // ── QA ───────────────────────────────────────────────────────
  {
    id: 'qa-1',
    name: 'Emma Rodriguez',
    role: 'QA',
    initials: 'ER',
    avatarColor: '#9F7AEA',
    status: 'bench',
    maxHours: 40,
    currentAssignments: [],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, 0, [40, 40, 40, 30, 15, 0, 0, 0][i])
    ),
  },
  {
    id: 'qa-2',
    name: 'Ryan Thompson',
    role: 'QA',
    initials: 'RT',
    avatarColor: '#48BB78',
    status: 'partial',
    maxHours: 40,
    currentAssignments: [{ projectId: 'beta', hoursPerWeek: 30 }],
    weeklyData: WEEK_LABELS.map((w) => makeWeek(w, 0, 30)),
  },

  // ── Ending Soon ──────────────────────────────────────────────
  {
    id: 'pm-3',
    name: 'Amanda Lewis',
    role: 'Product Manager',
    initials: 'AL',
    avatarColor: '#F59E0B',
    status: 'ending-soon',
    maxHours: 40,
    currentAssignments: [{ projectId: 'delta', hoursPerWeek: 40, endingSoon: true, endDate: 'Apr 30' }],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, 0, i < 6 ? 40 : 40)
    ),
  },
  {
    id: 'dev-5',
    name: 'Michael Zhang',
    role: 'Developer',
    initials: 'MZ',
    avatarColor: '#6366F1',
    status: 'ending-soon',
    maxHours: 40,
    currentAssignments: [{ projectId: 'alpha', hoursPerWeek: 40, endingSoon: true, endDate: 'May 5' }],
    weeklyData: WEEK_LABELS.map((w) => makeWeek(w, 40)),
  },
  {
    id: 'ux-3',
    name: 'Nina Patel',
    role: 'UX/UI Designer',
    initials: 'NP',
    avatarColor: '#EC4899',
    status: 'ending-soon',
    maxHours: 40,
    currentAssignments: [{ projectId: 'gamma', hoursPerWeek: 35, endingSoon: true, endDate: 'Apr 28' }],
    weeklyData: WEEK_LABELS.map((w, i) =>
      makeWeek(w, 0, 0, i < 6 ? 35 : 35)
    ),
  },
];

export function getActiveProjectIds(resource: Resource): ProjectId[] {
  const projectIds: ProjectId[] = ['alpha', 'beta', 'gamma', 'delta'];
  return projectIds.filter((id) =>
    resource.weeklyData.some((w) => (w[id] ?? 0) > 0)
  );
}

export function getProjectById(id: ProjectId) {
  return PROJECTS.find((p) => p.id === id);
}

export function getCurrentHours(resource: Resource): number {
  return resource.currentAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
}
