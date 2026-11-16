/**
 * Kalkulasi metadata pagination
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
export function formatPaginationMeta(total, page, limit) {
  const parsedTotal = parseInt(total, 10) || 0;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 12;
  const totalPages = Math.ceil(parsedTotal / parsedLimit) || 1;

  return {
    page: parsedPage,
    limit: parsedLimit,
    total: parsedTotal,
    totalPages,
    hasNextPage: parsedPage < totalPages,
    hasPrevPage: parsedPage > 1,
  };
}

