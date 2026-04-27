// Store for tracking finalized versions of quotations

interface VersionSelection {
  quotationName: string;
  selectedVersion: string;
  totalValue: number;
}

const store: Record<string, VersionSelection> = {
  'Serenity GTM Subscription': {
    quotationName: 'Serenity GTM Subscription',
    selectedVersion: 'Default Version',
    totalValue: 10700,
  },
  'Chirpyest 2nd Engineer': {
    quotationName: 'Chirpyest 2nd Engineer',
    selectedVersion: 'Current Team (4/1/26)',
    totalValue: 9700,
  },
  'Coachmetrix': {
    quotationName: 'Coachmetrix',
    selectedVersion: 'Current July 2025',
    totalValue: 4900,
  },
};

const listeners = new Set<() => void>();

export function getSelectedVersion(quotationName: string): VersionSelection | undefined {
  return store[quotationName];
}

export function setSelectedVersion(quotationName: string, versionName: string, totalValue: number) {
  store[quotationName] = {
    quotationName,
    selectedVersion: versionName,
    totalValue,
  };
  listeners.forEach((l) => l());
}

export function subscribeVersions(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
