import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PhishShieldProvider } from "@/context/PhishShieldContext";
import { Layout } from "@/components/Layout";
import { LinkInterceptor } from "@/components/LinkInterceptor";
import Index from "./pages/Index";
import Monitor from "./pages/Monitor";
import HistoryPage from "./pages/History";
import ListsPage from "./pages/Lists";
import SettingsPage from "./pages/Settings";
import EmailScanner from "./pages/EmailScanner";
import FingerprintPage from "./pages/Fingerprint";
import ThreatMapPage from "./pages/ThreatMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/email-scanner" element={<EmailScanner />} />
        <Route path="/threat-map" element={<ThreatMapPage />} />
        <Route path="/fingerprint" element={<FingerprintPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PhishShieldProvider>
          <LinkInterceptor>
            <Layout>
              <AnimatedRoutes />
            </Layout>
          </LinkInterceptor>
        </PhishShieldProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
