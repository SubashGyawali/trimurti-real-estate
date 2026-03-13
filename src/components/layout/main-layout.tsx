import { Header } from "./header";
import { Footer } from "./footer";
import { WhatsAppButton } from "./whatsapp-button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
