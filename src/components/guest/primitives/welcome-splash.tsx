"use client";

import React, { ReactNode } from "react";
import { WelcomeSplashOversized } from "./welcome-splash-oversized";
import { WelcomeSplashText } from "./welcome-splash-text";

export type WelcomeSplashVariant = "oversized" | "text";

interface WelcomeSplashProps {
  name: string;
  tagline?: React.ReactNode;
  coverImageUrl?: string;
  fallbackContent?: ReactNode;
  onEnter: () => void;
  variant?: WelcomeSplashVariant;
}

export function WelcomeSplash({ variant = "oversized", ...props }: WelcomeSplashProps) {
  if (variant === "text") {
    return <WelcomeSplashText {...props} />;
  }
  return <WelcomeSplashOversized {...props} />;
}
