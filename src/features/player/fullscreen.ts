/**
 * Fullscreen plumbing for the player stage, kept out of the component so the
 * enter/exit branch and the document sync can be tested on their own.
 *
 * The browser owns the truth here. `document.fullscreenElement` is the only
 * reliable answer to "are we fullscreen", because fullscreen can end without
 * our button being involved at all (Escape, F11, the browser's own control), so
 * a boolean of our own would go stale the first time that happened. Everything
 * below reads the document instead of remembering.
 */

/** True when `element` is the document's fullscreen element. */
export function isFullscreen(
  element: Element | null | undefined,
  doc: Document = document
): boolean {
  return Boolean(element) && doc.fullscreenElement === element
}

/**
 * Enter fullscreen for `element`, or leave fullscreen when it is already the
 * one filling the screen. Rejections are swallowed: the browser turns the
 * request down outside a user gesture, and there is nothing useful to say.
 */
export function toggleFullscreen(
  element: Element | null | undefined,
  doc: Document = document
): void {
  if (isFullscreen(element, doc)) {
    doc.exitFullscreen?.().catch(() => {})
    return
  }
  element?.requestFullscreen?.().catch(() => {})
}

/**
 * Listen for fullscreen starting or ending, whoever started or ended it.
 * Returns the unsubscribe function.
 */
export function subscribeFullscreen(
  onChange: () => void,
  doc: Document = document
): () => void {
  doc.addEventListener("fullscreenchange", onChange)
  return () => doc.removeEventListener("fullscreenchange", onChange)
}
