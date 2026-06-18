// src/types/explorer-item.ts

export interface ExplorerItem {
  id: string;
  name: string;

  type: "folder" | "file";

  parentId: string | null;
  path: string;

  hasChildren?: boolean;
  size?: number;
  breadcrumb?: string;

  children?: ExplorerItem[];
  expanded?: boolean;
  loaded?: boolean;
  isSearchResult?: boolean;

  url?: string;
  mimeType?: string;
  extension?: string;
}
