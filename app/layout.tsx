import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stoma Alert",
  description: "Calm, connected stoma recovery support for patients and their care teams.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Stoma Alert",
    description: "Calm, connected recovery support",
    type: "website",
    images: ["https://stoma-alert-redesign.kevin-doyle296372.chatgpt.site/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stoma Alert",
    description: "Calm, connected recovery support",
    images: ["https://stoma-alert-redesign.kevin-doyle296372.chatgpt.site/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
