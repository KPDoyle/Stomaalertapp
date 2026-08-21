import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stomaalertapp.vercel.app"),
  title: "Stoma Alert",
  description: "Calm, connected stoma recovery support for patients and their care teams.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Stoma Alert",
    description: "Calm, connected recovery support",
    type: "website",
    url: "/",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stoma Alert",
    description: "Calm, connected recovery support",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
