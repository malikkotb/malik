import localFont from "next/font/local";
import "./globals.css";
import StickyFooter from "../components/StickyFooter";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MALIK | Web Design & Development",
  description: "Developed by Malik Kotb",
  icons: {
    icon: "/fav_white.png",
    shortcut: "/fav_white.png",
    apple: "/fav_white.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`antialiased`}>
        {/* <body className={`${neueMontreal.className} antialiased`}> */}
        {children}
        <StickyFooter />
      </body>
    </html>
  );
}
