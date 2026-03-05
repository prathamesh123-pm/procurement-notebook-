import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Procurement Notebook - Operations Management',
  description: 'Streamlined daily work logs, route management, and supplier profiles for milk procurement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={true}>
          <DashboardSidebar />
          <SidebarInset className="bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4 md:px-6 sticky top-0 z-10">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-1 items-center justify-between">
                <h1 className="text-lg font-headline font-bold text-foreground tracking-tight">Procurement Notebook - Operations</h1>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-x-hidden">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
