/** Minimal typings for the YouTube IFrame Player API surface Tubefy uses. */

export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  setVolume(volume: number): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  loadVideoById(videoId: string): void
  cueVideoById(videoId: string): void
  destroy(): void
}

interface OnStateChangeEvent {
  data: number
  target: YTPlayer
}

interface YTPlayerOptions {
  width?: string | number
  height?: string | number
  videoId?: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: { target: YTPlayer }) => void
    onStateChange?: (event: OnStateChangeEvent) => void
    onError?: (event: { data: number }) => void
  }
}

interface YTNamespace {
  Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}
