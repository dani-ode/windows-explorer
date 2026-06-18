export interface ExplorerItemDto {
  id: string;
  name: string;

  type: "folder" | "file";

  parentId: string | null;
  hasChildren: boolean;
  path: string;

  extension?: string;
  storedName?: string;
  storagePath?: string;
  url?: string;
  folderId?: string;
  size?: number;
  mimeType?: string;
  icon?: string;
}
