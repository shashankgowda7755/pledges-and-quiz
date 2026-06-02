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
  title: 'COMMUNITREE & EZONE — Turning Intentions Into Action.',
  description: 'Take a pledge, test what you know, and earn a personalised certificate in under a minute. Join a growing community planting man-made forests and protecting nature — no login required.',
  openGraph: {
    siteName: 'COMMUNITREE & EZONE',
    title: 'COMMUNITREE & EZONE — Turning Intentions Into Action.',
    description: 'Pledge, learn, and earn your certificate. Be part of the movement growing man-made forests.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  other: { google: 'notranslate' }, // belt-and-suspenders against Translate-induced DOM crashes
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // translate="no" + notranslate stop Google Translate from rewriting React's
  // DOM text nodes, which otherwise throws "insertBefore ... not a child of this
  // node" and takes down the page (common on extension-heavy browsers).
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body suppressHydrationWarning className={`notranslate ${montserrat.variable} ${inter.variable} ${ibmMono.variable} font-inter antialiased bg-cream text-ink min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
