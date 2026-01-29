import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Digital Assets - Community-Powered Asset Marketplace',
    template: '%s | Digital Assets',
  },
  description:
    'Pool resources with others to purchase premium courses, software, and digital products. Contribute any amount — when funded, everyone gets permanent access.',
  keywords: ['digital assets', 'crowdfunding', 'courses', 'software', 'shared funding', 'community'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-gradient-subtle antialiased font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
