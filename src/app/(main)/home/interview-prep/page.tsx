"use client";

import { Separator } from "@/components/ui/separator";
import SingleCard from "../../_components/InterviewSingleCard";
import { LuCircleFadingArrowUp } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  GhostIcon,
  LucideActivity,
  LucideHistory,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { InterviewFeedback } from "@/lib/types/allTypes";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const InterviewDefault = () => {
  const { user } = useUserData();

  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<InterviewFeedback | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("others")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase fetch error:", error);
        setFeedbacks([]);
      } else {
        setFeedbacks((data ?? []) as InterviewFeedback[]);
      }

      setLoading(false);
    };

    fetchFeedbacks();
  }, [user]);

  const getAverageScore = (feedback: InterviewFeedback) => {
    const rating =
      feedback?.interviewInsights?.feedback?.rating;

    if (!rating) {
      return "0.0";
    }

    const scores = [
      rating.technicalSkills,
      rating.communication,
      rating.problemSolving,
      rating.experience,
    ].filter(
      (score): score is number => typeof score === "number"
    );

    if (scores.length === 0) {
      return "0.0";
    }

    const average =
      scores.reduce((total, score) => total + score, 0) /
      scores.length;

    return average.toFixed(1);
  };

  return (
    <div className="bg-gray-50 h-full overflow-hidden w-full px-2 py-4">
      <SingleCard />

      <div className="mt-6 flex w-full h-full">
        {/* LEFT SIDE */}
        <div className="w-[320px] flex flex-col px-1">
          <h1 className="text-2xl font-semibold font-sora mb-8">
            Create AI Interviews
          </h1>

          <div className="w-full px-4">
            <h2 className="font-medium font-inter text-base">
              Create New Interview{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />
            </h2>

            <Button
              className="text-sm font-inter mt-4 w-full"
              variant="outline"
            >
              Create New{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />
            </Button>

            <h2 className="font-medium font-inter text-base mt-5">
              Create From Job Tracker Board{" "}
              <LucideActivity className="inline w-5 h-5 ml-2" />
            </h2>

            <Button
              className="text-sm font-inter mt-4 w-full"
              variant="outline"
            >
              Job Tracker{" "}
              <LucideActivity className="inline w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="h-[180px] bg-gradient-to-br from-yellow-50 via-yellow-200 to-yellow-400 w-full mt-10 rounded-lg p-2 relative overflow-hidden">
            <Image
              src="/element1.png"
              alt="element"
              width={200}
              height={200}
              className="w-full h-full object-cover absolute -left-28"
            />

            <h2 className="font-extrabold font-inter text-black text-4xl absolute top-[34%] right-[40%]">
              5
            </h2>

            <h2 className="font-medium font-inter text-black text-xl absolute top-[60%] right-5 text-center max-w-[180px]">
              Interview Creation left for this month
            </h2>
          </div>
        </div>

        <Separator orientation="vertical" className="mx-2" />

        {/* RIGHT SIDE */}
        <div className="flex-1 h-full rounded-md p-4">
          <h1 className="text-2xl font-semibold font-sora tracking-wide ml-4 -mt-4">
            Interviews History{" "}
            <LucideHistory className="inline w-6 h-6 ml-2" />
          </h1>

          {/* LOADING */}
          {loading ? (
            <div className="mt-20 w-full flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />

              <p className="font-inter text-lg text-muted-foreground mt-4">
                Loading interview history...
              </p>
            </div>
          ) : feedbacks.length > 0 ? (
            /* INTERVIEW CARDS */
            <div className="grid grid-cols-3 gap-5 mt-6">
              {feedbacks.map((feedback) => (
                <Card
                  key={feedback.id}
                  onClick={() => setSelected(feedback)}
                  className="p-3 cursor-pointer hover:scale-[1.02] transition-all border border-gray-200 shadow-sm"
                >
                  <h3 className="font-inter font-semibold text-base capitalize tracking-tight">
                    {feedback.jobTitle || "Interview"}
                  </h3>

                  <p className="text-sm text-muted-foreground font-inter -mt-4">
                    {feedback.created_at
                      ? format(
                          new Date(feedback.created_at),
                          "dd MMM yyyy, hh:mm a"
                        )
                      : "Date unavailable"}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="font-inter text-sm text-gray-600">
                      Avg. Score
                    </p>

                    <p className="font-sora font-semibold text-blue-600 text-base">
                      {getAverageScore(feedback)}/10
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="mt-20 w-full flex flex-col items-center justify-center">
              <p className="font-semibold text-muted-foreground mb-6 font-inter text-xl">
                No Interviews Created
              </p>

              <GhostIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* ---------- INSIGHTS DIALOG ---------- */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sora text-xl text-center">
              {selected?.jobTitle || "Interview"}
            </DialogTitle>

            <p className="text-sm font-inter text-gray-500 text-center">
              {selected?.created_at
                ? format(
                    new Date(selected.created_at),
                    "dd MMM yyyy, hh:mm a"
                  )
                : "Date unavailable"}
            </p>
          </DialogHeader>

          {selected?.interviewInsights?.feedback && (
            <div className="space-y-5 mt-4">
              {/* RATINGS */}
              <div>
                <h4 className="font-sora font-semibold mb-3">
                  Interview Scores
                </h4>

                <div className="space-y-4">
                  <RatingBar
                    label="Technical Skills"
                    score={
                      selected.interviewInsights.feedback.rating
                        ?.technicalSkills ?? 0
                    }
                  />

                  <RatingBar
                    label="Communication"
                    score={
                      selected.interviewInsights.feedback.rating
                        ?.communication ?? 0
                    }
                  />

                  <RatingBar
                    label="Problem Solving"
                    score={
                      selected.interviewInsights.feedback.rating
                        ?.problemSolving ?? 0
                    }
                  />

                  <RatingBar
                    label="Experience"
                    score={
                      selected.interviewInsights.feedback.rating
                        ?.experience ?? 0
                    }
                  />
                </div>
              </div>

              {/* SUMMARY */}
              <div>
                <h4 className="font-sora font-semibold mb-2">
                  Summary
                </h4>

                <p className="text-sm text-gray-800 font-inter leading-relaxed">
                  {selected.interviewInsights.feedback.summary ||
                    "No summary available."}
                </p>
              </div>

              {/* STRENGTHS */}
              {selected.interviewInsights.feedback.strengths &&
                selected.interviewInsights.feedback.strengths.length >
                  0 && (
                  <div>
                    <h4 className="font-sora font-semibold mb-2">
                      Strengths
                    </h4>

                    <ul className="list-disc pl-5 space-y-1 text-sm font-inter text-gray-800">
                      {selected.interviewInsights.feedback.strengths.map(
                        (strength, index) => (
                          <li key={index}>{strength}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* IMPROVEMENTS */}
              {selected.interviewInsights.feedback.improvements &&
                selected.interviewInsights.feedback.improvements
                  .length > 0 && (
                  <div>
                    <h4 className="font-sora font-semibold mb-2">
                      Areas to Improve
                    </h4>

                    <ul className="list-disc pl-5 space-y-1 text-sm font-inter text-gray-800">
                      {selected.interviewInsights.feedback.improvements.map(
                        (improvement, index) => (
                          <li key={index}>{improvement}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* RECOMMENDATION */}
              {selected.interviewInsights.feedback.recommendation && (
                <div>
                  <h4 className="font-sora font-semibold mb-2">
                    Recommendation
                  </h4>

                  <p className="text-sm text-gray-800 font-inter leading-relaxed">
                    {
                      selected.interviewInsights.feedback
                        .recommendation
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- RATING BAR ---------- */

const RatingBar = ({
  label,
  score,
}: {
  label: string;
  score: number;
}) => {
  const getColor = () => {
    if (score <= 3) return "bg-red-500";
    if (score <= 6) return "bg-orange-400";
    return "bg-green-500";
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="capitalize font-medium">
          {label}
        </span>

        <span className="text-gray-600">{score}/10</span>
      </div>

      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-500`}
          style={{
            width: `${Math.min(Math.max(score, 0), 10) * 10}%`,
          }}
        />
      </div>
    </div>
  );
};

export default InterviewDefault;