export interface TriggeredAssignment {
  positionTitle: string;
  role: string;
  resourceName: string;
  initials: string;
  percentage: number;
  isHiring?: boolean;
}

export interface TriggeredProject {
  shortCode: string;
  name: string;
  client: string;
  tags: string[];
  team: { initials: string; color: string }[];
  start: string;
  end: string;
  latestNote: string;
  lastUpdated: string;
  status: 'Active';
  assignments: TriggeredAssignment[];
  hiringOpen: number;
}

const store: TriggeredProject[] = [];
const listeners = new Set<() => void>();

export function addTriggeredProject(p: TriggeredProject) {
  store.unshift(p);
  listeners.forEach((l) => l());
}

export function getTriggeredProjects(): TriggeredProject[] {
  return store.slice();
}

export function subscribeTriggered(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
