import React, { use } from "react";
import SeasonLayoutClient from "./SeasonLayoutClient";

export default function SeasonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = use(params);
  return <SeasonLayoutClient joinCode={joinCode}>{children}</SeasonLayoutClient>;
}


