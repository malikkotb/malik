import StickyFooter from "@/components/StickyFooter";

export const metadata = {
  title: "Work | Malik Kotb",
  description: "Designed & Developed by Malik Kotb",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function WorkLayout({ children }) {
  return (
    <>
      {children}
      <StickyFooter />
    </>
  );
}

