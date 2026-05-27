import { useQuery } from "@tanstack/react-query";

export const SESSION_QUERY_KEY = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    enabled: false,
    queryFn: async () => null,
  });
}
