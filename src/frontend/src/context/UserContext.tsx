import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useCallback } from "react";
import { useBackend } from "../hooks/useBackend";
import type { UserProfile } from "../types";

interface UserContextValue {
  /** The current user's profile, null if not yet created, undefined while loading */
  profile: UserProfile | null | undefined;
  isLoadingProfile: boolean;
  /** Refresh the profile from the backend */
  refetchProfile: () => void;
  /** Call after creating a new profile to update the cache */
  setProfile: (profile: UserProfile) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
);

export function UserProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const { backend, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const principalStr = identity?.getPrincipal().toString();

  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["userProfile", principalStr],
    queryFn: async () => {
      if (!backend) return null;
      return await backend.getCallerUserProfile();
    },
    enabled: !!identity && !!backend && !isFetching,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refetchProfile = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["userProfile", principalStr] });
  }, [queryClient, principalStr]);

  const setProfile = useCallback(
    (newProfile: UserProfile) => {
      queryClient.setQueryData(["userProfile", principalStr], newProfile);
    },
    [queryClient, principalStr],
  );

  // profile is undefined while loading, null if no profile yet, UserProfile if exists
  const isLoadingProfile = isLoading || isFetching;

  return (
    <UserContext.Provider
      value={{
        profile: isLoadingProfile ? undefined : (profile ?? null),
        isLoadingProfile,
        refetchProfile,
        setProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
