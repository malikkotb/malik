import localFont from "next/font/local";
import "./globals.css";
import StickyFooter from "../components/StickyFooter";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Malik Kotb - Creative Developer",
  description: "Developed by Malik Kotb",
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
