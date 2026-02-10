import StickyFooter from "@/components/StickyFooter";

export const metadata = {
  title: "About | Malik Kotb",
  description: "Designed & Developed by Malik Kotb",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function AboutLayout({ children }) {
  return (
    <>
      {children}
      <StickyFooter />
    </>
  );
}

