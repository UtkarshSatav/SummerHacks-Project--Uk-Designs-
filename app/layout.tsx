import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Inter, Roboto_Mono, Antonio } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const sans = Inter({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = Roboto_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const disp = Cormorant_Garamond({
  variable: "--font-disp-stack",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const impact = Antonio({
  variable: "--font-impact-stack",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Ghost — Your AI Business Partner",
  description:
    "The AI business partner that runs the agency side of your solo operation — finding leads, monitoring client health, drafting proposals, and telling you the one thing to do right now to grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${sans.variable} ${mono.variable} ${disp.variable} ${impact.variable}`}
    >
      <body className="bg-[#090909]">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
