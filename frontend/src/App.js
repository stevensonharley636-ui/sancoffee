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
    </div>
  );
}

export default App;
