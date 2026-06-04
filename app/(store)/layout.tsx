import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/store/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    /* 🎯 FIX: Adding the 'dark' class here forces all inner tokens to match your dark layout */
    <div className="dark min-h-screen bg-devcraft-bg flex flex-col text-white">
      <Navbar />
      <main className="pt-16 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}