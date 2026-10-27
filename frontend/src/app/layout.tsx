import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/locales';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti — Imtihon platformasi",
  description: "Malakaviy imtihonlarga ro'yxatdan o'tish, hujjatlar topshirish va natijalarni kuzatish rasmiy platformasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#172B3A] antialiased">
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
