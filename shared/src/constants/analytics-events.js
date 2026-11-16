/**
 * Event analitik yang diizinkan sesuai PRD bagian 12 dan FR-14
 */
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  DIRECTORY_VIEW: 'directory_view',
  SEARCH_USED: 'search_used',
  FILTER_APPLIED: 'filter_applied',
  COUNTER_DETAIL_OPENED: 'counter_detail_opened',
  WHATSAPP_CLICKED: 'whatsapp_clicked',
  PARTNER_SIGNUP_CLICKED: 'partner_signup_clicked',
};

export const ANALYTICS_EVENT_NAMES = Object.values(ANALYTICS_EVENTS);

