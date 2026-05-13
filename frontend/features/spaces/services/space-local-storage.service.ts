'use client';

const LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED =
  "LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED";

export const SpaceLocalStorageService = {
  isFetched: () => {
    const fetchOnlyRecentlyUpdated = !!localStorage.getItem(
      LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED,
    );
    return fetchOnlyRecentlyUpdated;
  },
  setFetched: () => {
    localStorage.setItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED, "done");
  },
  resetFetched: () => {
    localStorage.removeItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED);
  },
};
