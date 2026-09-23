"use client";

import { useUserData } from "@/context/UserDataProvider";
import React, { useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

const Room = ({
  params,
}: {
  params: Promise<{ roomid: string }> | { roomid: string };
}) => {
  // @ts-ignore
  const unwrappedParams = React.use ? React.use(params) : params;
  const roomID = (unwrappedParams && (unwrappedParams as any).roomid) || "";

  const { mentor } = useUserData();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    if (!roomID) {
      console.error("[Room] roomID is empty.");
      return;
    }

    const init = async () => {
      try {
        const zegoModule = await import(
          "@zegocloud/zego-uikit-prebuilt"
        );

        const userID = uuid();
        const userName =
          mentor?.full_name || `user-${Date.now()}`;

        const response = await fetch("/api/zego-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomID,
            userID,
            userName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          console.error(
            "[ZEGOCLOUD] Token request failed:",
            errorData?.error || response.statusText
          );

          return;
        }

        const { kitToken } = await response.json();

        if (!kitToken) {
          console.error("[ZEGOCLOUD] Token was not returned.");
          return;
        }

        if (!mounted) return;

        const zp =
          (zegoModule as any).ZegoUIKitPrebuilt.create(kitToken);

        zpRef.current = zp;

        if (!containerRef.current) {
          console.error("[Room] Video container is unavailable.");
          return;
        }

        zp.joinRoom({
          container: containerRef.current,

          sharedLinks: [
            {
              name: "Shareable link",
              url:
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname,
            },
          ],

          scenario: {
            mode:
              (zegoModule as any).ZegoUIKitPrebuilt
                .VideoConference,
          },
        });
      } catch (err: any) {
        console.error(
          "[Room] Zego initialization error:",
          err?.message || err
        );
      }
    };

    init();

    return () => {
      mounted = false;

      try {
        if (zpRef.current?.destroy) {
          zpRef.current.destroy();
        } else if (zpRef.current?.leave) {
          zpRef.current.leave();
        }
      } catch {
        // Ignore cleanup errors.
      }

      zpRef.current = null;
    };
  }, [roomID, mentor?.full_name]);

  return (
    <div
      className="myCallContainer"
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

export default Room;
