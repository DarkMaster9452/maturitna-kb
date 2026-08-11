import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/components/i18n';

export const metadata: Metadata = {
  title: 'MaturitaKB — Tvoja príprava na maturitu',
  description: 'Organizovaná databáza okruhov, materiálov, poznámok a testov pre prípravu na maturitu. Prehľadne na jednom mieste.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f2ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0d0f' },
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays available (accessibility); the layout just never needs it.
  maximumScale: 5,
  userScalable: true,
  // Paint under the notch / home indicator — the shell handles the insets itself.
  viewportFit: 'cover' as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* display=block: draw nothing until the icon font is ready, rather
            than flashing the raw ligature names and reflowing the page. */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t)d.dataset.theme=t;var m=localStorage.getItem('mode')||'system';var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.dataset.mode='dark';}catch(e){}` }} />
      </head>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  );
}
