import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thinhcorner.com"),
  title: {
    default: "Thinh's Corner",
    template: "%s | Thinh's Corner",
  },
  description: "Developer, writer, and creator.",
  openGraph: {
    title: "Thinh's Corner",
    description: "Developer, writer, and creator.",
    url: "https://thinhcorner.com",
    siteName: "Thinh's Corner",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Thinh's Corner",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="text-black bg-white dark:text-white dark:bg-[#111010] "
    >
      <body
        className={cn(
          "antialiased font-sans max-w-2xl mb-40 flex flex-col md:flex-row mx-4 mt-8 lg:mx-auto ",
          fontSans.variable
        )}
      >
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
        </main>
      </body>
      <GoogleAnalytics gaId="G-P4B7XCWCYP" />
      <Script id="clarity-script" strategy="afterInteractive">
        {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "msjdwtwwqu");
        `}
      </Script>
    </html>
  );
}
