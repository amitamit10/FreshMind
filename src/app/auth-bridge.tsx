"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

const COOKIE_NAME = "freshmind_firebase_id_token";

function setSessionCookie(idToken: string) {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${idToken}; Path=/; Max-Age=3300; SameSite=Lax${secureFlag}`;
}

export function AuthBridge() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const currentUser = user ?? (await signInAnonymously(auth)).user;
        const idToken = await currentUser.getIdToken();
        setSessionCookie(idToken);

        if (isMounted && !document.cookie.includes(`${COOKIE_NAME}=`)) {
          return;
        }

        if (isMounted && !sessionStorage.getItem("freshmind-session-ready")) {
          sessionStorage.setItem("freshmind-session-ready", "true");
          router.refresh();
        }
      } catch (error) {
        console.error("Unable to start FreshMind Firebase session", error);
      }
    });

    const refreshTimer = window.setInterval(async () => {
      const user = auth.currentUser;
      if (!user) return;
      setSessionCookie(await user.getIdToken(true));
    }, 45 * 60 * 1000);

    return () => {
      isMounted = false;
      unsubscribe();
      window.clearInterval(refreshTimer);
    };
  }, [router]);

  return null;
}
