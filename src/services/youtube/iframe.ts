/**
 * Load the YouTube IFrame Player API exactly once. The API invokes a single
 * global `onYouTubeIframeAPIReady`, so we wrap it in a shared promise that every
 * caller awaits (and preserve any pre-existing handler).
 */
let apiPromise: Promise<NonNullable<Window["YT"]>> | null = null

export function loadYouTubeIframeApi(): Promise<NonNullable<Window["YT"]>> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT!)
    }
    if (!document.getElementById("yt-iframe-api")) {
      const script = document.createElement("script")
      script.id = "yt-iframe-api"
      script.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(script)
    }
  })
  return apiPromise
}
