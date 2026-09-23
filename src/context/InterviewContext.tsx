"use client";

import { createContext, useContext, useState } from "react";

type InterviewQuestion = {
  question: string;
};

type InterviewData = {
  jobTitle: string;
  questions: InterviewQuestion[];
};

type InterviewContextType = {
  interviewData: InterviewData;
  setInterviewData: React.Dispatch<React.SetStateAction<InterviewData>>;
};

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

export const InterviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    jobTitle: "",
    questions: [],
  });

  return (
    <InterviewContext.Provider
      value={{
        interviewData,
        setInterviewData,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error(
      "useInterview must be used inside an InterviewProvider"
    );
  }

  return context;
};