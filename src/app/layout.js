import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: {
    default: "Pokedesk – Next.js Pokédex",
    template: "%s | Pokedesk",
  },
  description:
    "Search and browse Pokémon by name or ID, view details, and save favorites. Built with Next.js and Tailwind CSS.",
  keywords: [
    "Pokédex",
    "Pokemon",
    "Next.js",
    "React",
    "PokeAPI",
    "Pokemon search",
    "Pokemon comparison",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Pokedesk – Next.js Pokédex",
    description:
      "Search and browse Pokémon by name or ID, view details, and save favorites.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Pokedesk",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokedesk – Next.js Pokédex",
    description:
      "Search and browse Pokémon by name or ID, view details, and save favorites.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#ef4444",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
