"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";

const GetUserLocation = () => {
  const { user } = useUserData();

  useEffect(() => {
    if (!user?.userEmail) return;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("User coordinates:", lat, lon);

        try {
          const supabase = createClient();

          // Find the application's users-table record by email first.
          // This avoids accidentally using the Supabase Auth UUID
          // when the public.users table uses its own numeric ID.
          const { data: dbUser, error: userLookupError } = await supabase
            .from("users")
            .select("id")
            .eq("userEmail", user.userEmail)
            .maybeSingle();

          if (userLookupError) {
            console.error("❌ Failed to find user for location update:", {
              message: userLookupError.message,
              code: userLookupError.code,
              details: userLookupError.details,
              hint: userLookupError.hint,
            });
            return;
          }

          if (!dbUser?.id) {
            console.error(
              "❌ No matching users record found for:",
              user.userEmail
            );
            return;
          }

          const { error: updateError } = await supabase
            .from("users")
            .update({
              latitude: lat,
              longitude: lon,
            })
            .eq("id", dbUser.id);

          if (updateError) {
            console.error("❌ Failed to save location:", {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint,
            });
            return;
          }

          console.log("✅ User location saved successfully.");
        } catch (error: any) {
          console.error("❌ Unexpected location error:", {
            message: error?.message,
            error,
          });
        }
      },
      (error) => {
        console.error("Location permission denied/unavailable:", {
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [user?.userEmail]);

  return null;
};

export default GetUserLocation;
