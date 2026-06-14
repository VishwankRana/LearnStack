/**
 * Parses [[Wiki Link]] syntax from note content.
 * Returns an array of unique, non-empty title strings referenced in the content.
 *
 * Examples:
 *   "See [[OAuth]] and [[JWT Authentication]]" → ["OAuth", "JWT Authentication"]
 *   "[[  Spaces  ]]" → ["Spaces"]
 *   "[[]]" → []        (empty links are ignored)
 */
const WIKI_LINK_RE = /\[\[([^\[\]]+)\]\]/g

export function parseWikiLinks(content) {
  if (!content) return []

  const titles = new Set()

  for (const match of content.matchAll(WIKI_LINK_RE)) {
    const title = match[1].trim()
    if (title) titles.add(title)
  }

  return [...titles]
}
