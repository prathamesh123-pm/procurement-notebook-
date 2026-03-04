
"use client"

import * as React from "react"
import { LayoutDashboard, ListTodo, MapPin, Users, FileText, Settings, Milk } from "lucide-react"
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
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Task Log",
    url: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "Routes",
    url: "/dashboard/routes",
    icon: MapPin,
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Milk className="h-6 w-6" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            ProcurePal
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 uppercase tracking-widest text-[10px] font-bold text-muted-foreground group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="flex h-11 items-center gap-3 rounded-md px-3 transition-all hover:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
