export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

// Simple fuzzy search
export function fuzzySearch(query: string, text: string): boolean {
  if (!query) return true;
  
  query = query.toLowerCase();
  text = text.toLowerCase();
  
  let qIdx = 0;
  let tIdx = 0;
  
  while (qIdx < query.length && tIdx < text.length) {
    if (query[qIdx] === text[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }
  
  return qIdx === query.length;
}
