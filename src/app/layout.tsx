import type { Metadata } from "next";
import "./globals.css";

// SF Pro is the Apple system font; use the native stack so it renders SF on
// Apple devices and degrades to a high-quality sans elsewhere.
const SF_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export const metadata: Metadata = {
  title: "Glance Vision One — AI Glasses",
  description:
    "Glance Vision One — Look classic. Think beyond. Embedded AI, spatial AR interface and a 12 MP smart camera in a timeless 45 g frame.",
  keywords: [
    "Glance Vision",
    "Glance Vision One",
    "AI glasses",
    "smart glasses",
    "AR interface",
    "Apple Vision Pro glasses",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ fontFamily: SF_STACK }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-foreground">
        {children}
      </body>
    </html>
  );
}
