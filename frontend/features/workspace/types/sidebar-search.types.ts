export interface SidebarSearchResultItem {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  spaceId: string;
  spaceName: string;
  createdAt: string;
  updatedAt: string;
  previewText: string;
  searchableTitle: string;
  searchableBody: string;
}

export interface SidebarSearchFilters {
  query: string;
  titleOnly: boolean;
  selectedPageIds: string[];
}

export interface SidebarSearchSection {
  id: string;
  label: string;
  items: SidebarSearchResultItem[];
}
