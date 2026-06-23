import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Browser — CodeVector Task',
  description: 'Browse 200,000 products with cursor-based pagination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
