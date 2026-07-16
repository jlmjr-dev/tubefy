import { config } from "@/shared/lib/config"

/**
 * In demo mode, resolve to a committed fixture instead of calling the real API;
 * otherwise use the real query function. Keeps the demo switch to one line per
 * query hook.
 */
export function demoOr<T>(demoValue: T, real: () => Promise<T>): () => Promise<T> {
  return config.demo ? () => Promise.resolve(demoValue) : real
}
