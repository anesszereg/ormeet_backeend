import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ormeet — Find It. Book It. Enjoy It.",
  description:
    "Find concerts, workshops, meetups, and more — your next event is just a search away. Ormeet connects attendees and organizers for unforgettable experiences.",
  keywords: ["events", "concerts", "workshops", "meetups", "tickets", "booking", "ormeet"],
  openGraph: {
    title: "Ormeet — Find It. Book It. Enjoy It.",
    description:
      "Find concerts, workshops, meetups, and more — your next event is just a search away.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
      </body>
    </html>
  );
}
