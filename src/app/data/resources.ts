export interface BenchResource {
  id: string;
  name: string;
  initials: string;
  role: string;
  skills: string[];
  availableFrom: string;
  experience: string;
  utilization: number;
  onLeaveFrom?: string;
  onLeaveUntil?: string;
}

export const BENCH: BenchResource[] = [
  { id: 'r1', name: 'Jenish Gohil', initials: 'JG', role: 'Full Stack', skills: ['React', 'Node.js', 'AWS'], availableFrom: '2026-04-20', experience: '5 yrs', utilization: 0, onLeaveFrom: '2026-05-10', onLeaveUntil: '2026-05-24' },
  { id: 'r2', name: 'Jiyanshi Patel', initials: 'JP', role: 'Quality Assurance', skills: ['Cypress', 'Jest', 'Playwright'], availableFrom: '2026-04-25', experience: '3 yrs', utilization: 0, onLeaveFrom: '2026-04-30', onLeaveUntil: '2026-05-09' },
  { id: 'r3', name: 'Bhumika Udani', initials: 'BU', role: 'RevOps Specialist', skills: ['SEO', 'Analytics'], availableFrom: '2026-05-10', experience: '4 yrs', utilization: 20 },
  { id: 'r4', name: 'Bryan Belanger', initials: 'BB', role: 'Backend', skills: ['Node.js', 'Postgres'], availableFrom: '2026-05-01', experience: '6 yrs', utilization: 50, onLeaveFrom: '2026-05-18', onLeaveUntil: '2026-05-25' },
  { id: 'r5', name: 'Shreya Gokani', initials: 'SG', role: 'Full Stack', skills: ['React', 'TypeScript'], availableFrom: '2026-06-01', experience: '7 yrs', utilization: 100 },
  { id: 'r6', name: 'Kalrav Parsana', initials: 'KP', role: 'User Experience Designer', skills: ['Figma', 'UX Research'], availableFrom: '2026-05-15', experience: '8 yrs', utilization: 80 },
  { id: 'r7', name: 'Jaydip Makwana', initials: 'JM', role: 'Backend', skills: ['Node.js', 'Postgres', 'Redis'], availableFrom: '2026-05-20', experience: '4 yrs', utilization: 100 },
  { id: 'r8', name: 'Khushi Vyas', initials: 'KV', role: 'Frontend', skills: ['React', 'Tailwind CSS'], availableFrom: '2026-04-28', experience: '2 yrs', utilization: 20, onLeaveFrom: '2026-05-05', onLeaveUntil: '2026-05-16' },
];

export const HIRING_STAGES = ['Requested', 'Sourcing', 'Interviewing', 'Offer', 'Hired'] as const;
export type HiringStage = typeof HIRING_STAGES[number];

export function isOnLeaveSoon(resource: BenchResource, withinDays = 28): boolean {
  if (!resource.onLeaveFrom) return false;
  const leaveDate = new Date(resource.onLeaveFrom);
  const currentDate = new Date('2026-04-27');
  const diffDays = Math.ceil((leaveDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= withinDays;
}

export function getDaysUntilAvailable(resource: BenchResource): number {
  const avail = new Date(resource.availableFrom);
  const now = new Date('2026-04-27');
  return Math.max(0, Math.ceil((avail.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}
