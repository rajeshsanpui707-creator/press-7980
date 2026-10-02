/**
 * Google Drive URL handling & safe browser rendering utility.
 * Google Drive share links cannot be directly placed into <img src="..."> tags
 * without extracting the file ID and using supported embed endpoints.
 * Also handles folder links and unrenderable links with safe fallback previews.
 */

export interface GoogleDriveParsed {
  isValid: boolean;
  isFolder: boolean;
  id: string | null;
  renderableUrl: string;
  fallbackThumbnailUrl: string;
  originalUrl: string;
}

/**
 * Extracts Google Drive ID and constructs browser-safe image URLs.
 */
export function parseGoogleDriveUrl(url?: string): GoogleDriveParsed {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      isFolder: false,
      id: null,
      renderableUrl: '',
      fallbackThumbnailUrl: '',
      originalUrl: '',
    };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Security: Reject dangerous protocols (javascript:, data:, file:, vbscript:)
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    return {
      isValid: false,
      isFolder: false,
      id: null,
      renderableUrl: '',
      fallbackThumbnailUrl: '',
      originalUrl: '',
    };
  }

  // Must be https://, http://, or local relative path starting with /
  if (!lower.startsWith('https://') && !lower.startsWith('http://') && !lower.startsWith('/')) {
    return {
      isValid: false,
      isFolder: false,
      id: null,
      renderableUrl: '',
      fallbackThumbnailUrl: '',
      originalUrl: '',
    };
  }

  // Check if it is a regular direct image URL (not Google Drive)
  if (
    !trimmed.includes('drive.google.com') &&
    !trimmed.includes('docs.google.com') &&
    !trimmed.includes('googleusercontent.com')
  ) {
    const isImageExtension = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i.test(trimmed);
    if (isImageExtension || trimmed.startsWith('http') || trimmed.startsWith('/')) {
      return {
        isValid: true,
        isFolder: false,
        id: null,
        renderableUrl: trimmed,
        fallbackThumbnailUrl: trimmed,
        originalUrl: trimmed,
      };
    }
  }

  // Check for Google Drive folder link
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return {
      isValid: true,
      isFolder: true,
      id: folderMatch[1],
      renderableUrl: '', // Folders cannot be rendered as single image
      fallbackThumbnailUrl: '',
      originalUrl: trimmed,
    };
  }

  // Extract File ID from various Google Drive share URL formats:
  // 1. https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
  // 2. https://drive.google.com/open?id={FILE_ID}
  // 3. https://drive.google.com/uc?id={FILE_ID}
  // 4. https://docs.google.com/uc?export=download&id={FILE_ID}
  // 5. https://lh3.googleusercontent.com/d/{FILE_ID}
  let fileId: string | null = null;

  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  } else {
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    } else {
      const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
      if (lh3Match && lh3Match[1]) {
        fileId = lh3Match[1];
      }
    }
  }

  if (fileId) {
    const renderable = `https://lh3.googleusercontent.com/d/${fileId}`;
    const fallbackThumbnail = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    return {
      isValid: true,
      isFolder: false,
      id: fileId,
      renderableUrl: renderable,
      fallbackThumbnailUrl: fallbackThumbnail,
      originalUrl: trimmed,
    };
  }

  // Return original trimmed url as fallback
  return {
    isValid: Boolean(trimmed),
    isFolder: false,
    id: null,
    renderableUrl: trimmed,
    fallbackThumbnailUrl: trimmed,
    originalUrl: trimmed,
  };
}

/**
 * Quick helper to get best candidate image URL or empty string
 */
export function getSafeImageSource(url?: string): string {
  const parsed = parseGoogleDriveUrl(url);
  if (parsed.isFolder) return '';
  return parsed.renderableUrl || parsed.fallbackThumbnailUrl || parsed.originalUrl || '';
}

/**
 * Helper to get secondary fallback image URL if primary fails
 */
export function getFallbackImageSource(url?: string): string {
  const parsed = parseGoogleDriveUrl(url);
  if (parsed.isFolder) return '';
  return parsed.fallbackThumbnailUrl || '';
}

