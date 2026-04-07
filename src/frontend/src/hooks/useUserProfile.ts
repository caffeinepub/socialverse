import { useContext } from "react";
import { UserContext } from "../context/UserContext";

/**
 * Returns the current user's profile and related helpers.
 * Must be used within UserProvider.
 */
export function useUserProfile() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserProfile must be used within UserProvider");
  }
  return ctx;
}
