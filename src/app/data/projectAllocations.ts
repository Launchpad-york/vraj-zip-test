export interface StoredDowngrade {
  mode: 'reduce' | 'remove';
  effectiveDate: string;
  reducedHours?: number;
  note?: string;
}
export interface StoredBurst {
  startDate: string;
  endDate: string;
  note?: string;
}
export interface StoredAllocation {
  role: string;
  person: string;
  hours: number;
  downgrade?: StoredDowngrade;
  burst?: StoredBurst;
}

const store = new Map<string, StoredAllocation[]>();
const listeners = new Set<() => void>();

export function getAllocations(projectId: string): StoredAllocation[] | undefined {
  return store.get(projectId);
}

export function setAllocations(projectId: string, rows: StoredAllocation[]) {
  store.set(projectId, rows);
  listeners.forEach((l) => l());
}

export function subscribeAllocations(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
