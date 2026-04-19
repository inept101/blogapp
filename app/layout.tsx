import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Blogg — Write & Share',
  description: 'A place to write, read, and share interesting blogs.',
  icons: { icon: '/img/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Blogg — Built with Next.js
          </footer>
        </Providers>
      </body>
    </html>
  );
}
