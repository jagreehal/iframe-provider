import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Provider',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-screen`}>
      <body>{children}</body>
    </html>
  );
}
