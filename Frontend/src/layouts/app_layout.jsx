import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import { CartProvider } from "../cart/cart_context";
import { WhatsAppCartProvider } from "../context/whatsapp_cart_context";
import WhatsAppFloatingButton from "../components/ui/whatsapp_floating_button";

export default function AppLayout() {
  return (
    <CartProvider>
      <WhatsAppCartProvider>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppFloatingButton />
        </div>
      </WhatsAppCartProvider>
    </CartProvider>
  );
}
