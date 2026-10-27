import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/locales';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: "Andijon Qishloq Xo'jaligi Instituti — Imtihon Platformasi",
  description: "Malakaviy imtihonlarga ro'yxatdan o'tish, hujjatlar topshirish va natijalarni kuzatish rasmiy platformasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('aqxi-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text)] antialiased transition-colors duration-150">
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <AppShell>{children}</AppShell>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
