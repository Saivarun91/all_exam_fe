// src/components/home/ScrollHandler.jsx
"use client"; // if it uses browser events like scroll

import { useEffect } from "react";

export default function ScrollHandler({ children }) {
  useEffect(() => {
    const handleScroll = () => {
      // Example: log scroll position
      console.log(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return children || null;
}   