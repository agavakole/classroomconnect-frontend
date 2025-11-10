// src/components/ActiveSessionQr.tsx
import { useEffect, useMemo, useState } from "react";
import { getActiveSession } from "../utils/activeSession";

type Props = {
  /** Pure QR square size in px (canvas/img side) */
  size?: number;
  /** When false, render just the QR (no code, no buttons) */
  showMeta?: boolean;
  /** Extra class on outer container */
  className?: string;
};

export default function ActiveSessionQR({ size = 220, showMeta = true, className = "" }: Props) {
  const [url, setUrl] = useState<string>("");

  // read join token from active session
  const joinUrl = useMemo(() => {
    const active = getActiveSession(); // { join_token, ... }
    const token = active?.join_token;
    return token ? `${window.location.origin}/join/${token}` : "";
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!joinUrl) return;
      try {
        // try local QR generation (no network)
        const QR = await import("qrcode"); // ok if no types
        const data = await QR.toDataURL(joinUrl, { margin: 1, width: size });
        if (!cancelled) setUrl(data);
      } catch {
        // fallback to simple PNG service
        const png = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
          joinUrl
        )}`;
        if (!cancelled) setUrl(png);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [joinUrl, size]);

  if (!joinUrl) return null;

  if (!showMeta) {
    // COMPACT: just the square QR — fits in tight cards
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
            draggable={false}
          />
        ) : (
          <div className="animate-pulse text-xs text-gray-500">Generating…</div>
        )}
      </div>
    );
  }

  // FULL: QR + small meta (kept for teacher dashboard etc.)
  return (
    <div className={`rounded-xl bg-white/80 p-3 ring-1 ring-black/10 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0" style={{ width: size, height: size }}>
          {url ? (
            <img
              src={url}
              alt="Join session QR"
              className="w-full h-full object-contain rounded-md"
              draggable={false}
            />
          ) : (
            <div className="animate-pulse text-xs text-gray-500 h-full flex items-center justify-center">
              Generating…
            </div>
          )}
        </div>
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
