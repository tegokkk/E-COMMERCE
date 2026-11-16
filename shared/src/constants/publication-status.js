/**
 * Status Publikasi untuk Konter dan Paket
 */
export const PUBLICATION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  INACTIVE: 'inactive',
};

export const PUBLICATION_STATUS_VALUES = Object.values(PUBLICATION_STATUS);

export const PUBLICATION_STATUS_LABELS = {
  [PUBLICATION_STATUS.DRAFT]: 'Draft',
  [PUBLICATION_STATUS.PUBLISHED]: 'Diterbitkan',
  [PUBLICATION_STATUS.INACTIVE]: 'Nonaktif',
};

