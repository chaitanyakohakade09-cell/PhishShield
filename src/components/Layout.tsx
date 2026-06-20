import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
          </div>
          <div className="relative z-10">
            <header className="sticky top-0 z-20 flex items-center h-12 px-4 border-b border-border bg-background/80 backdrop-blur-md">
              <SidebarTrigger />
            </header>
            <div className="p-4 md:p-6 scanline">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
