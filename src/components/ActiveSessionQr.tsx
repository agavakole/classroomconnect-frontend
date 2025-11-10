// src/components/ActiveSessionQr.tsx
import { useEffect, useMemo, useState } from "react";
import { getActiveSession } from "../utils/activeSession";

/**
 * Component props
 */
type Props = {
  size?: number;       // QR code size in pixels (default 220)
  showMeta?: boolean;  // Show code and buttons (default true)
  className?: string;  // Additional CSS classes
};

/**
 * Active session QR code component
 * 
 * Purpose:
 * - Display QR code for students to scan
 * - Auto-generate from active session token
 * - Support both compact and full layouts
 * 
 * Used in:
 * - Home page: Shows QR if teacher has active session
 * - StartSessionPage: Shows QR for students to join
 * 
 * QR generation strategy:
 * 1. Try qrcode library (local generation, fast)
 * 2. Fallback to qrserver.com API (external service)
 * 
 * Data source:
 * - Reads from localStorage: active_session
 * - Set by teacherApi.createSession()
 * - Contains join_token (e.g., "7F9K2A")
 * - Cleared by teacherApi.endSession()
 * 
 * QR target URL:
 * - Format: https://yoursite.com/join/{join_token}
 * - Student scans → browser opens URL → JoinSession page resolves
 */
export default function ActiveSessionQR({ 
  size = 220, 
  showMeta = true, 
  className = "" 
}: Props) {
  const [url, setUrl] = useState<string>(""); // QR code data URL or image URL

  /**
   * Build join URL from active session
   * Uses current window.location.origin for correct domain
   */
  const joinUrl = useMemo(() => {
    const active = getActiveSession(); // { join_token, session_id, ... }
    const token = active?.join_token;
    return token ? `${window.location.origin}/join/${token}` : "";
  }, []);

  /**
   * Generate QR code when joinUrl changes
   * 
   * Strategy 1: Use qrcode library (local, fast, no network)
   * - Generates data URL (base64 PNG)
   * - Better privacy (no external calls)
   * 
   * Strategy 2: Fallback to qrserver.com API
   * - External PNG generation service
   * - Works when qrcode library fails
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!joinUrl) return;
      
      try {
        // Try local generation with qrcode library
        const QR = await import("qrcode");
        const data = await QR.toDataURL(joinUrl, { 
          margin: 1,  // Minimal margin for compact display
          width: size // Target size
        });
        if (!cancelled) setUrl(data);
      } catch {
        // Fallback to external service
        const png = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
          joinUrl
        )}`;
        if (!cancelled) setUrl(png);
      }
    })();

    // Cleanup: prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [joinUrl, size]);

  // Don't render if no active session
  if (!joinUrl) return null;

  /**
   * COMPACT MODE (showMeta = false)
   * Just the QR square, no text or buttons
   * Used in Home page card for tight spaces
   */
  if (!showMeta) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {url ? (
          <img
            src={url}
            alt="Join session QR"
            className="w-full h-full object-contain rounded-md"
            draggable={false} // Prevent accidental drag
          />
        ) : (
          // Loading state
          <div className="animate-pulse text-xs text-gray-500">Generating…</div>
        )}
      </div>
    );
  }

  /**
   * FULL MODE (showMeta = true)
   * QR with URL display and metadata
   * Used in teacher dashboard for complete view
   */
  return (
    <div className={`rounded-xl bg-white/80 p-3 ring-1 ring-black/10 ${className}`}>
      <div className="flex items-center gap-3">
        {/* QR code image */}
        <div className="shrink-0" style={{ width: size, height: size }}>
          {url ? (
            <img
              src={url}
              alt="Join session QR"
              className="w-full h-full object-contain rounded-md"
              draggable={false}
            />
          ) : (
            // Loading state
            <div className="animate-pulse text-xs text-gray-500 h-full flex items-center justify-center">
              Generating…
            </div>
          )}
        </div>
        
        {/* Metadata text */}
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            Students can scan or open{" "}
            <span className="font-mono break-all">{joinUrl}</span>
          </div>
        </div>
      </div>
    </div>
  );
}