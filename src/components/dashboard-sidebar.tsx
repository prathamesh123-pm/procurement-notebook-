"use client"

import * as React from "react"
import { 
  LayoutDashboard, ListTodo, MapPin, LogOut, Milk, 
  ClipboardCheck, Archive, UserCircle, Warehouse, 
  Settings2, FileEdit, X 
} from "lucide-react"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const items = [
  {
    title: "डॅशबोर्ड (Dashboard)",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "दैनिक अहवाल (Report)",
    url: "/daily-report",
    icon: ClipboardCheck,
  },
  {
    title: "कामकाज नोंद (Tasks)",
    url: "/work-log",
    icon: ListTodo,
  },
  {
    title: "फॉर्म भरा (Forms)",
    url: "/forms",
    icon: FileEdit,
  },
  {
    title: "संकलन केंद्र (Centers)",
    url: "/centers",
    icon: Warehouse,
  },
  {
    title: "रूट माहिती (Routes)",
    url: "/routes",
    icon: MapPin,
  },
  {
    title: "अहवाल पहा (Archive)",
    url: "/reports",
    icon: Archive,
  },
  {
    title: "फॉर्म बिल्डर (Settings)",
    url: "/form-builder",
    icon: Settings2,
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
  const { setOpenMobile, isMobile } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  if (!mounted) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4 bg-white relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <Milk className="h-6 w-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
            <span className="font-headline text-sm font-black tracking-tight text-foreground truncate uppercase">
              संकलन नोंदवही
            </span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate opacity-60">Daily Register</span>
          </div>
        </div>
        {isMobile && (
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-4 h-8 w-8 rounded-full lg:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 uppercase tracking-[0.3em] text-[9px] font-black text-muted-foreground/40 group-data-[collapsible=icon]:hidden">
            मुख्य मेनू (MAIN MENU)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1.5">
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={handleLinkClick}
                      className="flex h-10 items-center gap-3 rounded-xl px-3 transition-all hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-black tracking-tight text-[11px] uppercase">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-3 border-t group-data-[collapsible=icon]:hidden bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              onClick={handleLinkClick}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 rounded-xl px-3 font-black uppercase text-[10px] tracking-widest"
            >
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span>बाहेर पडा</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
