"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Headless Admin Quick Access Listener
 * Completely invisible to public visitors (renders null).
 * Listens for secret admin hotkeys:
 *   - Alt + A
 *   - Cmd + Shift + A (Mac)
 *   - Ctrl + Shift + A (Windows/Linux)
 */
export default function AdminQuickAccess({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAltA = e.altKey && (e.key === "a" || e.key === "A");
      const isCtrlShiftA = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A");

      if (isAltA || isCtrlShiftA) {
        e.preventDefault();
        router.push("/admin");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Completely invisible — zero visual buttons or clues on screen
  return null;
}
