"use client"

import * as React from "react"
import { LayoutDashboard, ListTodo, MapPin, LogOut, Milk, ClipboardCheck, Archive, UserCircle, Warehouse, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "डॅशबोर्ड (Dashboard)",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "दैनिक रिपोर्ट (Daily Report)",
    url: "/daily-report",
    icon: ClipboardCheck,
  },
  {
    title: "कामकाज नोंद (Work Log)",
    url: "/work-log",
    icon: ListTodo,
  },
  {
    title: "संकलन केंद्र (Centers)",
    url: "/centers",
    icon: Warehouse,
  },
  {
    title: "रूट (Routes)",
    url: "/routes",
    icon: MapPin,
  },
  {
    title: "अहवाल पहा (View Reports)",
    url: "/reports",
    icon: Archive,
  },
  {
    title: "प्रोफाईल (Profile)",
    url: "/profile",
    icon: UserCircle,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Milk className="h-7 w-7" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-base font-bold tracking-tight text-foreground">
              Procurement Notebook
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">दूध संकलन नोंदवही</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-6 uppercase tracking-[0.2em] text-[10px] font-bold text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
            मुख्य मेनू (Main Menu)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="flex h-12 items-center gap-4 rounded-xl px-4 transition-all hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-bold tracking-wide text-xs">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl px-4 font-bold">
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span className="text-xs">बाहेर पडा (Sign Out)</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
