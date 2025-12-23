// src\components\DashboardLayout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden ">
        {/* Animated gradient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="animate-gradient-rise absolute inset-0">
            {/* Main gradient blobs */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/20 via-purple-600/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/25 via-rose-400/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] bg-gradient-to-tl from-violet-500/20 via-indigo-400/10 to-transparent rounded-full blur-3xl" />
          </div>
        </div>
        
        <AppSidebar />
        <main className="flex-1 flex flex-col relative z-10">
          <header className="h-14 border-b border-border/30 flex items-center px-4 gap-4 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
