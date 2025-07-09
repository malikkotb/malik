import "./globals.css";

export const metadata = {
  title: "Malik - Creative Developer",
  description: "Developed by Malik",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
