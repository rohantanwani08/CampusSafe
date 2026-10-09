import { Public_Sans, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600"]
});

export const metadata = {
  title: "CampusSafe Voice",
  description: "Campus emergency operations dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${barlowCondensed.variable} h-full antialiased tabular-nums`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
