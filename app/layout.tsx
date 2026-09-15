import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jeruto.com"),

  title: {
    default: "Jeruto Movie Intelligence",
    template: "%s | Jeruto Movie Intelligence",
  },

  description:
    "India's movie intelligence platform for movies, box office, people, companies, industries and markets.",

  

  openGraph: {
    title: "Jeruto Movie Intelligence",
    description:
      "India's movie intelligence platform for movies, box office, people, companies, industries and markets.",
    
    siteName: "Jeruto Movie Intelligence",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        {children}
      </body>
    </html>
  );
}