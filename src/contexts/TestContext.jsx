"use client";

import { createContext, useContext, useState, useEffect } from "react";

const TestContext = createContext(undefined);

export const TestProvider = ({ children }) => {
  const [unlockedCourses, setUnlockedCourses] = useState([]);
  const [testAttempts, setTestAttempts] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("unlockedCourses");
      const savedAttempts = localStorage.getItem("testAttempts");

      if (savedCourses) setUnlockedCourses(JSON.parse(savedCourses));
      if (savedAttempts) setTestAttempts(JSON.parse(savedAttempts));
    }
  }, []);

  // Save unlockedCourses to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unlockedCourses", JSON.stringify(unlockedCourses));
    }
  }, [unlockedCourses]);

  // Save testAttempts to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("testAttempts", JSON.stringify(testAttempts));
    }
  }, [testAttempts]);

  // Unlock course
  const unlockCourseAccess = (courseId, plan) => {
    if (!unlockedCourses.includes(courseId)) {
      setUnlockedCourses((prev) => [...prev, courseId]);
    }
  };

  // Check access
  const hasCourseAccess = (courseId) => unlockedCourses.includes(courseId);

  // Save or update attempt
  const saveTestAttempt = (attempt) => {
    setTestAttempts((prev) => {
      const index = prev.findIndex((a) => a.testId === attempt.testId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = attempt;
        return updated;
      }
      return [...prev, attempt];
    });
  };

  // Get attempt by id
  const getTestAttempt = (testId) =>
    testAttempts.find((a) => a.testId === testId);

  // Complete a test
  const completeTest = (
    testId,
    score,
    timeSpent,
    questions,
    correctCount,
    wrongCount
  ) => {
    setTestAttempts((prev) =>
      prev.map((attempt) =>
        attempt.testId === testId
          ? {
              ...attempt,
              status: "completed",
              score,
              timeSpent,
              questions,
              correctCount,
              wrongCount,
              completedAt: new Date().toISOString(),
            }
          : attempt
      )
    );
  };

  // Delete attempt
  const deleteTestAttempt = (testId) => {
    setTestAttempts((prev) => prev.filter((a) => a.testId !== testId));
  };

  return (
    <TestContext.Provider
      value={{
        unlockedCourses,
        unlockCourseAccess,
        hasCourseAccess,
        testAttempts,
        saveTestAttempt,
        getTestAttempt,
        completeTest,
        deleteTestAttempt,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error("useTest must be used within TestProvider");
  return context;
};
