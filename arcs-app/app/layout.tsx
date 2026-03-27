import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ARCS — See the moment you lose the room",
    template: "%s | ARCS",
  },
  description:
    "ARCS turns your calls and demos into a HUD that shows where people tune out—and how to refine who you talk to and how.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
