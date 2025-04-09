import localFont from "next/font/local";
import "./globals.css";
import StickyFooter from "../components/StickyFooter";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// const neueMontreal = localFont({
//   src: [
//     {
//       path: "../public/fonts/PPNeueMontreal-Bold.woff2",
//       weight: "700",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-BoldItalic.woff2",
//       weight: "700",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Book.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Italic.woff2",
//       weight: "400",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Light.woff2",
//       weight: "300",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Medium.woff2",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-Thin.woff2",
//       weight: "100",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/PPNeueMontreal-ThinItalic.woff2",
//       weight: "100",
//       style: "italic",
//     },
//   ],
//   variable: "--font-neue-montreal", // Optional: Define a CSS variable for easier use
//   display: "swap", // Use font-display: swap for improved performance
// });

export const metadata = {
  title: "Malik - Creative Developer",
  description: "Developed by Malik",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`antialiased`}>
        {children}
        <StickyFooter />
      </body>
    </html>
  );
}
