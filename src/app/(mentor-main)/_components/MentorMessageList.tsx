/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: "peer" | "mentor";
  sender_type: "peer" | "mentor";
  content: string;
  created_at: string;
};

type UserDisplay = {
  id: string;
  name: string;
  avatar: string | null;
};

const MentorMessagesList: React.FC = () => {
  const { mentor, loading: mentorLoading } = useUserData();
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!mentor?.id) return;

    const supabase = createClient();

    const fetchMessageNames = async () => {
      // 1️⃣ Fetch messages involving this mentor where receiver_type = "mentor"
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${mentor.id},sender_type.eq.mentor),and(receiver_id.eq.${mentor.id},receiver_type.eq.mentor)`);

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      if (!messages || messages.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // 2️⃣ Collect peer (user) IDs
      const peerIds = new Set<string>();
      messages.forEach((msg) => {
        if (msg.sender_type === "peer") peerIds.add(String(msg.sender_id));
        if (msg.receiver_type === "peer") peerIds.add(String(msg.receiver_id));
      });

      // 3️⃣ Fetch peers from users table
      const { data: peers } = await supabase
        .from("users_directory")
        .select("id, userName, avatar")
        .in("id", Array.from(peerIds));

      // 4️⃣ Map into display objects
      const allUsers: UserDisplay[] =
        peers?.map((p) => ({
          id: p.id,
          name: p.userName,
          avatar: p.avatar,
        })) || [];

      setUsers(allUsers);
      setLoading(false);
    };

    void fetchMessageNames();
    const poll = setInterval(fetchMessageNames, 5000);

    // 🔴 Subscribe to new inserts
    const subscription = supabase
      .channel("mentor-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",

        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Only react if this mentor is involved
          if (
            (String(newMessage.sender_id) === String(mentor.id) && newMessage.sender_type === "mentor") ||
            (String(newMessage.receiver_id) === String(mentor.id) && newMessage.receiver_type === "mentor")
          ) {
            // Refetch the users list so new peers appear
            fetchMessageNames();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      supabase.removeChannel(subscription);
    };
  }, [mentor?.id]);

  if (mentorLoading || loading) return <div>Loading users...</div>;
  if (users.length === 0) return <div>No messages found.</div>;

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex flex-col gap-1 bg-gray-50 rounded-md p-2"
          >
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push(`/dashboard/messages/mentor/${u.id}`)}
            >
              <Image
                src={u.avatar || "/user.png"}
                alt={u.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="font-medium font-sora text-base">{u.name}</span>
            </div>
            <span className="text-sm ml-12 -mt-3 text-muted-foreground font-inter cursor-pointer">
              Click to respond back
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MentorMessagesList;
