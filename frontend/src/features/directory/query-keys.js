export const directoryKeys = {
  all: ['directory'],
  counters: (filters) => ['directory', 'counters', filters],
  detail: (id, providerId) => ['directory', 'detail', id, { providerId }],
  providers: () => ['directory', 'providers'],
  regions: () => ['directory', 'regions'],
  locations: () => ['directory', 'locations'],
  settings: () => ['directory', 'settings'],
};

