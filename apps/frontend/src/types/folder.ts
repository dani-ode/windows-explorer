// src/types/folder.ts

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  hasChildren: boolean;

  children?: Folder[];
  expanded?: boolean;
  loaded?: boolean;
  type?: string;
}
