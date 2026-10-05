import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/navbar/Header";
import Footer from "@/components/site/Footer";

const displayFont = Cormorant_Garamond({
  variable: "--font-sepy-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const sansFont = Manrope({
  variable: "--font-sepy-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SEPY — style engendered performance & you",
  description:
    "SEPY — a modern fashion and lifestyle brand where style meets performance and you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer/>
      </body>
    </html>
  );
}