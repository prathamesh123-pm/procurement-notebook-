
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo, MapPin, Users, PlusCircle, ClipboardCheck, Milk, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Supplier, CollectionCenter, Route, Task } from "@/lib/types"

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalMilk: 0,
    activeRoutes: 0,
    totalSuppliers: 0,
    pendingTasks: 0
  })

  useEffect(() => {
    setMounted(true)
    
    // Load all data from localStorage
    const suppliers: Supplier[] = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const centers: CollectionCenter[] = JSON.parse(localStorage.getItem('procurepal_centers') || '[]')
    const routes: Route[] = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const tasks: Task[] = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')

    // Calculate Dynamic Stats
    const totalSuppMilk = suppliers.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0), 0)
    const totalCenterMilk = centers.reduce((acc, c) => acc + (c.cowMilk?.quantity || 0) + (c.buffaloMilk?.quantity || 0), 0)
    
    setStats({
      totalMilk: totalSuppMilk + totalCenterMilk,
      activeRoutes: routes.length,
      totalSuppliers: suppliers.length + centers.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length
    })
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center h-full text-muted-foreground italic">Loading overview...</div>
  }

  const statCards = [
    {
      title: "Today's Milk",
      value: `${stats.totalMilk.toFixed(1)} L`,
      subValue: "Total collection",
      icon: Milk,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Routes",
      value: stats.activeRoutes,
      subValue: "Collection paths",
      icon: MapPin,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Total Points",
      value: stats.totalSuppliers,
      subValue: "Suppliers & Centers",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      subValue: "Needs attention",
      icon: ListTodo,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ]

  const actions = [
    {
      title: "Daily Report",
      description: "Submit daily log",
      icon: ClipboardCheck,
      href: "/daily-report",
    },
    {
      title: "Work Log",
      description: "Manage tasks",
      icon: ListTodo,
      href: "/work-log",
    },
    {
      title: "Centers",
      description: "Manage centers",
      icon: PlusCircle,
      href: "/centers",
    },
    {
      title: "Routes",
      description: "Manage paths",
      icon: MapPin,
      href: "/routes",
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" /> 
          Procurement Dashboard
        </h2>
        <p className="text-muted-foreground font-medium">येथे तुमच्या संकलनाची आणि कामाची सद्यस्थिती दिसेल.</p>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 pt-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-1.5 rounded-lg`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase">{stat.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold font-headline px-1">Quick Actions (झटपट पर्याय)</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Card key={action.title} asChild className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group">
              <Link href={action.href}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{action.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{action.description}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
