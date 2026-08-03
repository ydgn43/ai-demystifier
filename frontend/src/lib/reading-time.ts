const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(body: string[]): number {
  const wordCount = body.reduce((total, paragraph) => total + paragraph.split(/\s+/).length, 0);
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
