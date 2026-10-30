"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider"; // contains mentor
import Image from "next/image";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: "peer" | "mentor";
  sender_type: "peer" | "mentor";
  content: string;
  created_at: string;
};

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

const MentorMessagesId = () => {
  const params = useParams();
  const supabase = createClient();
  const { mentor } = useUserData(); // ✅ logged in mentor
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const profileId = params.id; // always peer id
  const profileType = "mentor"; //  always mentor

  // 🔹 Fetch peer profile (users table only)
  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users_directory")
        .select("id, userName, userEmail, avatar")
        .eq("id", profileId)
        .single();

      if (error) {
        console.error("Error fetching peer profile:", error);
        setProfile(null);
      } else {
        setProfile({
          id: data.id.toString(),
          name: data.userName,
          email: data.userEmail,
          avatar: data.avatar,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [profileId]);

  // 🔹 Fetch messages
  useEffect(() => {
    if (!profileId || !mentor?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
                .or(
          `and(sender_id.eq.${mentor.id},sender_type.eq.mentor,receiver_id.eq.${profileId},receiver_type.eq.peer),` +
            `and(sender_id.eq.${profileId},sender_type.eq.peer,receiver_id.eq.${mentor.id},receiver_type.eq.mentor)`
        )
        .order("created_at", { ascending: true });

      if (error) console.error("Fetch error:", error);
      else setMessages(data || []);
    };

    fetchMessages();

    // 🔹 Realtime subscription
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;

        if (
          (String(newMessage.sender_id) === String(mentor.id) && newMessage.sender_type === "mentor" && String(newMessage.receiver_id) === String(profileId) && newMessage.receiver_type === "peer") ||
          (String(newMessage.sender_id) === String(profileId) && newMessage.sender_type === "peer" && String(newMessage.receiver_id) === String(mentor.id) && newMessage.receiver_type === "mentor")
        ) {
          setMessages(prev => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]);
        }
        }
      )
      .subscribe();
    const poll = setInterval(fetchMessages, 5000);

    return () => {
      clearInterval(poll);
    supabase.removeChannel(subscription);
    };
  }, [profileId, mentor?.id]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!text.trim() || !mentor?.id || !profileId) return;

    const { data: sent, error } = await supabase.from("messages").insert({
      sender_id: mentor.id,
      receiver_id: profileId,
      receiver_type: "peer",
      sender_type: "mentor",
      content: text,
    }).select().single();

    if (error) {
      console.error("Send error:", error);
    } else {
      if (sent) setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Profile Header */}
          {profile && (
            <div className="flex items-center gap-3 p-3 border-b bg-blue-500 text-white">
              <Image
                src={profile.avatar || "/user.png"}
                alt={profile.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h2 className="font-medium">{profile.name}</h2>
                <p className="text-sm text-white">{profile.email}</p>
              </div>
            </div>
          )}
          <p className="text-muted-foreground text-base font-inter px-6 my-2">
            Keep the conversation formal and professional. Any inappropriate
            messages will be Reported.
          </p>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-blue-100 ">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-2 ${
                  String(m.sender_id) === String(mentor?.id) && m.sender_type === "mentor" ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-block px-3 py-2 rounded-lg bg-white">
                  {m.content}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex p-3 border-t">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              maxLength={10000}
          aria-label="Message"
          value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MentorMessagesId;
