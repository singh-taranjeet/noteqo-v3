export const SEARCH_LABELS = {
  SHEET_TITLE: "Search notes",
  SEARCH_PLACEHOLDER: "Search or ask a question...",
  SEARCH_RESULTS_REGION_LABEL: "Search results",
  PREVIEW_REGION_LABEL: "Note preview",
  FILTER_TITLE_ONLY: "Title only",
  FILTER_CREATED_BY: "Created by",
  FILTER_IN: "In",
  FILTER_ADD: "+ Filter",
  FILTER_CREATED_BY_UNAVAILABLE: "Creator metadata unavailable in local cache",
  FILTER_PAGES_EMPTY: "No pages found",
  FILTER_PAGES_ALL: "All pages",
  SECTION_RECENT: "Past 30 days",
  SECTION_OLDER: "Older",
  EMPTY_PREVIEW: "Hover over a result to preview",
  EMPTY_RESULTS: "No matching notes found",
  EMPTY_NOTES: "No local notes found",
  CONTENT_UNAVAILABLE: "No local content preview available",
  TITLE_ONLY_BADGE: "Aa",
} as const;

export const SEARCH_FILTER_IDS = {
  TITLE_ONLY: "title-only",
  CREATED_BY: "created-by",
  IN: "in",
} as const;

export const SEARCH_CONFIG = {
  RECENT_DAYS_WINDOW: 30,
  QUERY_DEBOUNCE_MS: 150,
  LOCAL_REFRESH_INTERVAL_MS: 1_000,
  RESULT_TITLE_TRUNCATE: 80,
  PREVIEW_TEXT_TRUNCATE: 280,
  ELLIPSIS: "...",
} as const;
