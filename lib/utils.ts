export function readTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
