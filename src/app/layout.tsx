import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'أرشيف المحاضرات الأكاديمية | جامعة الزهراوي',
  description: 'المنصة الرقمية الرسمية لأرشفة وتصفح وتحميل المحاضرات والمقررات الدراسية لجامعة الزهراوي',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 font-['Cairo',sans-serif] antialiased selection:bg-sky-500 selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
