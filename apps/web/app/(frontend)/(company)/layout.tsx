import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/icon.svg" sizes="any" />
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
