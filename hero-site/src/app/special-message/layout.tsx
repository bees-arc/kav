import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Birthday Surprise for Kaawya 💌 | Happy Birthday Kaawya',
  description: 'A private birthday letter and romantic surprise prepared exclusively for Kaawya.',
  alternates: {
    canonical: '/special-message',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SpecialMessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
