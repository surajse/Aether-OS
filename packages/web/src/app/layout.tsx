import React from "react";

export const metadata = {
  title: "AetherOS (OpenDots) — Sovereign Agent OS",
  description: "The Universal Open-Source Sovereign Agent Operating System & Generative UI Canvas."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
