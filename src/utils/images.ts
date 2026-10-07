type ThumbnailSize = 'small' | 'medium' | 'large';

/**
 * TheMealDB serves resized variants by appending a size segment to the image
 * URL. A grid cell only needs `medium` (~30 KB instead of ~125 KB), which
 * makes scrolling noticeably lighter on memory and network.
 */
export function getThumbnailUrl(url: string, size: ThumbnailSize = 'medium'): string {
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes('themealdb.com')) {
    return trimmed;
  }
  return `${trimmed.replace(/\/+$/, '')}/${size}`;
}
