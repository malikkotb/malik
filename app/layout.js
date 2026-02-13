import './globals.css';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import TransitionLayout from '@/components/TransitionLayout';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Index | Malik Kotb',
  description: 'Designed & Developed by Malik Kotb',
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <Analytics />
      <body className={`antialiased`}>
        <TransitionLayout>
          <Header />
          {children}
        </TransitionLayout>
      </body>
    </html>
  );
}
