import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Products } from "@/components/Products";
import { Founder } from "@/components/Founder";
import { Impact } from "@/components/Impact";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { QuoteDialog } from "@/components/QuoteDialog";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";

const WhatsAppWidget = () => (
  <a
    href="https://wa.me/4915214300152"
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-widget"
    aria-label="Chat on WhatsApp"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28" height="28">
      <path fill="#fff" d="M4.9 43.3l2.7-9.9C5.9 30.7 5 27.4 5 24 5 13.5 13.5 5 24 5s19 8.5 19 19-8.5 19-19 19c-3.3 0-6.4-.9-9.1-2.4L4.9 43.3z"/>
      <path fill="#25D366" d="M24 7c-9.4 0-17 7.6-17 17 0 3.1.8 6 2.3 8.5l.4.7-1.7 6.3 6.5-1.7.7.4C17.9 39.4 20.9 40 24 40c9.4 0 17-7.6 17-17S33.4 7 24 7z"/>
      <path fill="#fff" d="M19.3 16c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.9 4.6 7.1 6.3 3.5 1.4 4.2 1.1 5 1s2.5-1 2.9-2 .4-1.8.3-2c-.1-.2-.4-.3-.9-.6s-2.7-1.3-3.1-1.5c-.4-.2-.7-.2-1 .2-.3.4-1.2 1.5-1.4 1.8-.2.3-.5.3-.9.1-.4-.2-1.8-.7-3.4-2.1-1.3-1.1-2.1-2.5-2.4-2.9-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.6-.1-.8-.1-.3-.9-2.3-1.2-3.2z"/>
    </svg>
  </a>
);

const Landing = () => {
const [quoteProduct, setQuoteProduct] = React.useState(null);

return (
<div className="bg-gh-background min-h-screen">
<Navbar />
<main>
<Hero />
<About />
<Products onRequestQuote={(p) => setQuoteProduct(p)} />
<Founder />
<Impact />
<Contact />
</main>
<Footer />
<QuoteDialog
product={quoteProduct}
open={!!quoteProduct}
onClose={() => setQuoteProduct(null)}
/>
</div>
);
};

function App() {
return (
<div className="App">
<AuthProvider>
<ContentProvider>
<BrowserRouter>
<Routes>
<Route path="/" element={<Landing />} />
<Route path="/login" element={<Login />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard />
</ProtectedRoute>
}
/>
</Routes>
</BrowserRouter>
</ContentProvider>
</AuthProvider>
<Toaster position="top-center" richColors />
<WhatsAppWidget />
</div>
);
}

export default App;