"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

// Supabase redirects here after Google OAuth.
// It sets the session from the URL hash — we just wait and redirect.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    function routeUser(userId: string) {
      fetch("http://localhost:8000/profile/", {
        headers: { "X-User-ID": userId },
      })
        .then(r => r.json())
        .then(profile => {
          router.replace(profile?.id ? "/dashboard" : "/onboarding");
        })
        .catch(() => router.replace("/onboarding"));
    }

    // If session already exists when callback page loads (common with Google OAuth)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        routeUser(data.session.user.id);
      }
    });

    // Also listen for the SIGNED_IN event in case session isn't ready yet
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        routeUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
