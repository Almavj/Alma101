import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Auto sign-out after inactivity (10 minutes)
const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

const IdleSignOut = () => {
  const timerRef = useRef<number | null>(null);
  const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll", "click"];

  useEffect(() => {
    let sessionActive = false;
    let subscription: any = null;

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const signOutNow = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      } finally {
        // redirect to home/login
        window.location.href = "/";
      }
    };

    const resetTimer = () => {
      if (!sessionActive) return;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        signOutNow();
      }, INACTIVITY_MS) as unknown as number;
    };

    const addListeners = () => events.forEach((ev) => window.addEventListener(ev, resetTimer));
    const removeListeners = () => events.forEach((ev) => window.removeEventListener(ev, resetTimer));

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sessionActive = !!session;
        if (sessionActive) {
          resetTimer();
          addListeners();
        }
      } catch (e) {
        // ignore
      }
    })();

    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        const nowActive = !!session;
        if (nowActive && !sessionActive) {
          sessionActive = true;
          resetTimer();
          addListeners();
        } else if (!nowActive && sessionActive) {
          sessionActive = false;
          clearTimer();
          removeListeners();
        }
      });
      subscription = res.data.subscription;
    } catch (e) {
      // ignore
    }

    return () => {
      clearTimer();
      removeListeners();
      try {
        subscription?.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <IdleSignOut />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
