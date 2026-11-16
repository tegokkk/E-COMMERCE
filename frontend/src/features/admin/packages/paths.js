export const counterPackagesPath = (counterId) => `/admin/konter/${counterId}/paket`;
export const counterPackagesApi = (counterId) => `/admin/counters/${counterId}/packages`;
export const counterPackageKeys = {
  all: (counterId) => ['admin', 'packages', counterId],
  detail: (counterId, packageId) => ['admin', 'packages', counterId, 'detail', packageId],
};
