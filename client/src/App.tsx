import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import ProductionPage from "@/pages/Production";
import InventoryPage from "@/pages/Inventory";
import WorkforcePage from "@/pages/Workforce";
import Analytics from "@/pages/Analytics";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function Router() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Factory list state
  const [factories, setFactories] = useState([
    { id: 1, name: "Jaipur Manufacturing Unit", location: "Jaipur, Rajasthan" },
    { id: 2, name: "Pune Assembly Unit", location: "Pune, Maharashtra" },
    { id: 3, name: "Coimbatore Production", location: "Coimbatore, Tamil Nadu" },
  ]);
  
  // Currently selected factory
  const [currentFactory, setCurrentFactory] = useState(factories[0]);
  
  // Fetch factories on app start
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const response = await fetch('/api/factories');
        if (response.ok) {
          const data = await response.json();
          setFactories(data);
          if (data.length > 0) {
            setCurrentFactory(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching factories:', error);
      }
    };
    
    fetchFactories();
  }, []);
  
  // Create a context value for layout components
  const layoutProps = {
    user: user || { name: "Guest", role: "", factory: "" },
    factories,
    currentFactory,
    setCurrentFactory,
    onLogout: logout
  };
  
  // If not authenticated, show login page, otherwise show dashboard
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={() => <Login />} />
      </Switch>
    );
  }
  
  // Show dashboard when authenticated
  return (
    <Layout {...layoutProps}>
      <Switch>
        <Route path="/" component={() => <Dashboard factory={currentFactory} />} />
        <Route path="/production" component={() => <ProductionPage factory={currentFactory} />} />
        <Route path="/inventory" component={() => <InventoryPage factory={currentFactory} />} />
        <Route path="/workforce" component={() => <WorkforcePage factory={currentFactory} />} />
        <Route path="/analytics" component={() => <Analytics factory={currentFactory} />} />
        <Route path="/login" component={() => <Dashboard factory={currentFactory} />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
