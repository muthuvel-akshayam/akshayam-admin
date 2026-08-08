import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import "./globals.css";

export const metadata: Metadata = {
  title: "Akshayam Matrimony - Owners Admin Portal",
  description: "Separate administrator portal to manage matrimonial profiles, user privileges, and astrological compatibility matrix.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
