import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humanity Voted",
  description: "One daily question. Two buttons. See how the world voted.",
  openGraph: {
    title: "Humanity Voted",
    description: "Vote on today's would-you-rather question.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
