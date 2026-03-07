
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo, MapPin, Users, ClipboardCheck, Milk, TrendingUp, Warehouse, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Supplier, CollectionCenter, Route, Task } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalMilk: 0,
    cowMilk: 0,
    bufMilk: 0,
    activeRoutes: 0,
    totalPoints: 0,
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
    const suppCow = suppliers.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0)
    const suppBuf = suppliers.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0)
    
    const centerCow = centers.reduce((acc, c) => acc + (c.cowMilk?.quantity || 0), 0)
    const centerBuf = centers.reduce((acc, c) => acc + (c.buffaloMilk?.quantity || 0), 0)
    
    setStats({
      cowMilk: suppCow + centerCow,
      bufMilk: suppBuf + centerBuf,
      totalMilk: suppCow + suppBuf + centerCow + centerBuf,
      activeRoutes: routes.length,
      totalPoints: suppliers.length + centers.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length
    })
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center h-[80vh] text-muted-foreground italic">माहिती लोड होत आहे...</div>
  }

  const statCards = [
    {
      title: "एकूण दूध संकलन",
      value: `${stats.totalMilk.toFixed(1)} L`,
      subValue: `गाय: ${stats.cowMilk.toFixed(1)} | म्हैस: ${stats.bufMilk.toFixed(1)}`,
      icon: Milk,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-200",
    },
    {
      title: "सक्रिय रूट (Routes)",
      value: stats.activeRoutes,
      subValue: "वाहन आणि लॉजिस्टिक",
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200",
    },
    {
      title: "एकूण संकलन केंद्र",
      value: stats.totalPoints,
      subValue: "गवळी व सेंटर्स",
      icon: Warehouse,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-200",
    },
    {
      title: "प्रलंबित कामे",
      value: stats.pendingTasks,
      subValue: "तात्काळ लक्ष द्या",
      icon: ListTodo,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-200",
    },
  ]

  const actions = [
    {
      title: "दैनिक रिपोर्ट",
      description: "Daily Route Log",
      icon: ClipboardCheck,
      href: "/daily-report",
      color: "bg-blue-500",
    },
    {
      title: "कामकाज नोंद",
      description: "Task & Remarks",
      icon: ListTodo,
      href: "/work-log",
      color: "bg-orange-500",
    },
    {
      title: "संकलन केंद्र",
      description: "Manage Centers",
      icon: Warehouse,
      href: "/centers",
      color: "bg-purple-500",
    },
    {
      title: "रूट व्यवस्थापन",
      description: "Manage Routes",
      icon: MapPin,
      href: "/routes",
      color: "bg-emerald-500",
    },
  ]

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-primary animate-pulse" /> 
            Procurement Dashboard
          </h2>
          <p className="text-muted-foreground font-medium ml-1">येथे तुमच्या संकलनाची आणि कामाची सद्यस्थिती दिसेल.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-bold">
          Updated: Today, {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">{stat.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold font-headline flex items-center gap-2">
          Quick Actions <span className="text-muted-foreground font-normal">(झटपट पर्याय)</span>
        </h3>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${action.color}`} />
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-2xl ${action.color} text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                    <action.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground">{action.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 absolute bottom-4 right-4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
