/**
 * Upload history management utilities
 * Manages upload history in localStorage with a max limit of 20 items
 */

export interface UploadedFile {
  path: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
  uploadedAt: string; // ISO timestamp
  mediaType?: 'image' | 'video';
  thumbnailPath?: string; // video-only: path of the extracted WebP thumbnail
}

const STORAGE_KEY = "upload_history";
const MAX_HISTORY_ITEMS = 20;

/**
 * Get all upload history from localStorage
 */
export function getUploadHistory(): UploadedFile[] {
  if (typeof window === "undefined") return [];

  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? (JSON.parse(history) as unknown as UploadedFile[]) : [];
  } catch (error) {
    console.error("Error reading upload history:", error);
    return [];
  }
}

/**
 * Add file(s) to upload history
 * Maintains max 20 items, newest first
 */
export function addToUploadHistory(files: UploadedFile | UploadedFile[]): void {
  if (typeof window === "undefined") return;

  try {
    const currentHistory = getUploadHistory();
    const filesToAdd = Array.isArray(files) ? files : [files];

    // Add timestamp if not present
    const filesWithTimestamp = filesToAdd.map((file) => ({
      ...file,
      uploadedAt: file.uploadedAt || new Date().toISOString(),
    }));

    // Combine new files with existing history
    const updatedHistory = [...filesWithTimestamp, ...currentHistory];

    // Keep only the most recent MAX_HISTORY_ITEMS
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Error saving upload history:", error);
  }
}

/**
 * Remove a specific file from upload history by path
 */
export function removeFromUploadHistory(path: string): void {
  if (typeof window === "undefined") return;

  try {
    const currentHistory = getUploadHistory();
    const updatedHistory = currentHistory.filter((file) => file.path !== path);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error removing from upload history:", error);
  }
}

/**
 * Clear all upload history
 */
export function clearUploadHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing upload history:", error);
  }
}

/**
 * Get formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}
