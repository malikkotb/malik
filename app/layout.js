import './globals.css';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import TransitionLayout from '@/components/TransitionLayout';
import FaviconCycler from '@/components/FaviconCycler';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Index | Malik Kotb',
  description: 'Designed & Developed by Malik Kotb',
  icons: {
    icon: '/fav-initial.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`antialiased`}>
        <TransitionLayout>
          <Header />
          {children}
        </TransitionLayout>
        <FaviconCycler />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
