import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.happybirthdaykaawya.site'),
  title: 'Happy Birthday Kaawya 🎂 | A Special Birthday Surprise',
  description:
    'Happy Birthday Kaawya! A special birthday website filled with beautiful memories, heartfelt wishes, and a surprise made just for Kaawya.',
  alternates: {
    canonical: 'https://www.happybirthdaykaawya.site/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Happy Birthday Kaawya 🎂 | A Special Birthday Surprise',
    description:
      'Happy Birthday Kaawya! A special birthday website filled with beautiful memories, heartfelt wishes, and a surprise made just for Kaawya.',
    url: 'https://www.happybirthdaykaawya.site/',
    siteName: 'Happy Birthday Kaawya',
    locale: 'en_LK',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 571,
        alt: 'Happy Birthday Kaawya 🎂',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Birthday Kaawya 🎂 | A Special Birthday Surprise',
    description:
      'Happy Birthday Kaawya! A special birthday website filled with beautiful memories, heartfelt wishes, and a surprise made just for Kaawya.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/bunny-favicon.jpg', type: 'image/jpeg' },
      { url: '/bunny-favicon.jpg', sizes: '32x32', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/bunny-favicon.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#08000f',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.happybirthdaykaawya.site/#webpage',
  url: 'https://www.happybirthdaykaawya.site/',
  name: 'Happy Birthday Kaawya 🎂 | A Special Birthday Surprise',
  description:
    'Happy Birthday Kaawya! A special birthday website filled with beautiful memories, heartfelt wishes, and a surprise made just for Kaawya.',
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    '@id': 'https://www.happybirthdaykaawya.site/#website',
    url: 'https://www.happybirthdaykaawya.site/',
    name: 'Happy Birthday Kaawya',
    description: 'A special birthday celebration website created with love for Kaawya.',
  },
  about: {
    '@type': 'Person',
    name: 'Kaawya',
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://www.happybirthdaykaawya.site/og-image.png',
    caption: 'Happy Birthday Kaawya',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href="/Dreamy%20Blue%20Birthday%20Bunny%20Cake.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/Dreamy%20Underwater%20Reef%20Sanctuary.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/Watercolour%20Blue%20Bow%20with%20Floating%20Hearts.webp"
          type="image/webp"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
