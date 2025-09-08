import { useState } from "react";

export function useCopyToClipboard() {
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");

  const copyToClipboard = async (text: string) => {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => {
        setCopyState("idle");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopyState("error");
      setTimeout(() => {
        setCopyState("idle");
      }, 1000);
    }
  };

  return {
    copyState,
    copyToClipboard,
  };
}
