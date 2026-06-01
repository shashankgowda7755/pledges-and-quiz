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
  title: 'COMMUNITREE & EZONE — Small Acts. Living Forests.',
  description: 'Take a pledge, test what you know, and earn a personalised certificate in under a minute. Join a growing community planting man-made forests and protecting nature — no login, free forever.',
  openGraph: {
    siteName: 'COMMUNITREE & EZONE',
    title: 'COMMUNITREE & EZONE — Small Acts. Living Forests.',
    description: 'Pledge, learn, and earn your certificate. Be part of the movement growing man-made forests.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${montserrat.variable} ${inter.variable} ${ibmMono.variable} font-inter antialiased bg-cream text-ink min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
