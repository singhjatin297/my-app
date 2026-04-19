"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { getAccessToken } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isActive = true;

    const verifyAccess = async () => {
      const accessToken = await getAccessToken();

      if (!isActive) return;

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      setIsAllowed(true);
      setIsChecking(false);
    };

    verifyAccess();

    return () => {
      isActive = false;
    };
  }, [getAccessToken, router]);

  if (isChecking || !isAllowed) return null;

  return <>{children}</>;
};
