import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tech Yuva — Where Youth Meet to Build Future Tech',
  description:
    'Tech Yuva is a student-led innovation guild empowering the next generation of builders through AI, Web3, production systems, and startup culture. Join 500+ active members building future tech.',
  openGraph: {
    title: 'Tech Yuva — Where Youth Meet to Build Future Tech',
    description:
      'Student-led innovation guild. Build real systems. Deploy real products. Join the builder community.',
    type: 'website',
    url: 'https://www.techyuva.org/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Yuva — Where Youth Meet to Build Future Tech',
    description:
      'Student-led innovation guild. Build real systems. Deploy real products. Join the builder community.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050B18',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
