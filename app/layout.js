import localFont from "next/font/local";
import "./globals.css";
import StickyFooter from "../components/StickyFooter";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata = {
  title: "Index | Malik Kotb",
  description: "Designed & Developed by Malik Kotb",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
