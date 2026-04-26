import { useCallback } from "react";

import { useAuth } from "./context/auth";

export const useApiClient = () => {
  const { getAccessToken, logout } = useAuth();

  const client = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        await logout();
        return null;
      }

      const res = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || data.status == 401) {
        throw new Error("Internal Server Error");
      }
      return data;
    } catch (err) {
      throw new Error(`Error: ${err}`);
    }
  }, [getAccessToken, logout]);
  return client;
};
