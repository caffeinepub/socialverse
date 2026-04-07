import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

/**
 * Returns the initialized backend actor with object-storage callbacks wired up.
 * The actor is null while it's still being initialized (isFetching = true).
 */
export function useBackend(): {
  backend: backendInterface | null;
  isFetching: boolean;
} {
  const { actor, isFetching } = useActor(createActor);
  return { backend: actor, isFetching };
}
