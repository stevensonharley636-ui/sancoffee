import React from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import ContentEditor from "../components/dashboard/ContentEditor";
import ProductsManager from "../components/dashboard/ProductsManager";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gh-background">
      <header className="border-b border-gh-border bg-gh-surface">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div>
            <p className="font-serif-display text-gh-primary text-lg leading-none">
              Green-Haus
            </p>
            <p className="text-xs text-gh-soft mt-0.5">Content Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gh-soft hidden sm:inline" data-testid="dashboard-user">
              {user?.email}
            </span>
            <a href="/" target="_blank" rel="noreferrer" data-testid="dashboard-view-site" className="gh-btn-secondary !py-2 !px-4 !text-xs">
              <ExternalLink size={14} /> View site
            </a>
            <button data-testid="dashboard-logout" onClick={handleLogout} className="gh-btn-ghost !py-2 !px-4 !text-xs">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-serif-display text-gh-primary text-3xl sm:text-4xl mb-8">
          Manage your website
        </h1>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="content" data-testid="tab-content">Site Content</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <ContentEditor />
          </TabsContent>
          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
