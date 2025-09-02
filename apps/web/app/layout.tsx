import { NextIntlClientProvider } from "next-intl";
import "@workspace/ui/globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/provider/theme-provider";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <link href="/icon.svg" rel="icon" sizes="any" />
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="h-full min-h-0 w-full">
            <Providers>
              {/* <SocketProvider>{children}</SocketProvider> */}
              {children}
            </Providers>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
