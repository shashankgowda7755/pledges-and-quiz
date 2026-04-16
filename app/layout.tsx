import type { Metadata } from 'next';
import { Montserrat, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400','500','600','700','800','900'],
  variable: '--font-montserrat'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-inter'
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400','600'],
  variable: '--font-ibm-mono'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://communitreepledges.netlify.app'),
  title: 'COMMUNITREE — Turn Intention into Action',
  description: 'Take a pledge in 30 seconds. Download your poster instantly. Join thousands of changemakers.',
  openGraph: { siteName: 'Communitree', url: 'https://communitreepledges.netlify.app' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${montserrat.variable} ${inter.variable} ${ibmMono.variable} font-inter antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
