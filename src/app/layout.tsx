import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Digital Asset Marketplace - Group Fund Courses & Software',
  description:
    'Join forces with others to purchase expensive courses, software, and digital products. Contribute any amount - when the asset is funded, everyone gets access!',
  keywords: ['digital assets', 'group buying', 'courses', 'software', 'shared funding'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-gradient-subtle antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
