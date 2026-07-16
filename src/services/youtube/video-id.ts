const ID = /^[\w-]{11}$/

/**
 * Pull the 11-character video id out of whatever a user pastes: a full watch
 * URL, a youtu.be / embed / shorts link (with any extra query params), or a bare
 * id. Returns null when there's no recognizable id.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (ID.test(trimmed)) return trimmed

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "")

  if (host === "youtu.be") {
    const id = url.pathname.slice(1)
    return ID.test(id) ? id : null
  }

  if (host === "youtube.com") {
    if (url.pathname === "/watch") {
      const v = url.searchParams.get("v")
      return v && ID.test(v) ? v : null
    }
    const match = url.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{11})/)
    if (match) return match[1]
  }

  return null
}
