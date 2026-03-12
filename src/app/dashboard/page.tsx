
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, MapPin, ClipboardCheck, Milk, TrendingUp, Warehouse, ArrowRight, Calendar } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  // Firestore Queries for real-time stats
  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'centers')
  }, [db, user])

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'tasks')
  }, [db, user])

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'suppliers')
  }, [db, user])

  const { data: centers } = useCollection(centersQuery)
  const { data: tasks } = useCollection(tasksQuery)
  const { data: routes } = useCollection(routesQuery)
  const { data: suppliers } = useCollection(suppliersQuery)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = useMemo(() => {
    const suppCow = suppliers?.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0) || 0
    const suppBuf = suppliers?.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0) || 0
    const centerCow = centers?.reduce((acc, c) => acc + (c.cowMilk?.quantity || 0), 0) || 0
    const centerBuf = centers?.reduce((acc, c) => acc + (c.buffaloMilk?.quantity || 0), 0) || 0
    
    return {
      cowMilk: suppCow + centerCow,
      bufMilk: suppBuf + centerBuf,
      totalMilk: suppCow + suppBuf + centerCow + centerBuf,
      activeRoutes: routes?.length || 0,
      totalPoints: (suppliers?.length || 0) + (centers?.length || 0),
      pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0
    }
  }, [centers, tasks, routes, suppliers])

  if (!mounted) {
    return <div className="flex items-center justify-center h-[80vh] text-muted-foreground italic text-sm">माहिती लोड होत आहे... (Loading...)</div>
  }

  const statCards = [
    {
      title: "एकूण दूध (Total Milk)",
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
      subValue: "वाहन व लॉजिस्टिक",
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200",
    },
    {
      title: "संकलन पॉइंट (Points)",
      value: stats.totalPoints,
      subValue: "गवळी व सेंटर्स",
      icon: Warehouse,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-200",
    },
    {
      title: "प्रलंबित कामे (Tasks)",
      value: stats.pendingTasks,
      subValue: "तात्काळ लक्ष द्या",
      icon: ListTodo,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-200",
    },
  ]

  const actions = [
    { title: "दैनिक रिपोर्ट", sub: "Daily Report", icon: ClipboardCheck, href: "/daily-report", color: "bg-blue-500" },
    { title: "कामकाज नोंद", sub: "Work Log", icon: ListTodo, href: "/work-log", color: "bg-orange-500" },
    { title: "संकलन केंद्र", sub: "Centers", icon: Warehouse, href: "/centers", color: "bg-purple-500" },
    { title: "रूट माहिती", sub: "Routes", icon: MapPin, href: "/routes", color: "bg-emerald-500" },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10 px-2 sm:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl sm:text-3xl font-headline font-black text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> 
            डॅशबोर्ड (Dashboard)
          </h2>
          <p className="text-muted-foreground font-bold text-[11px] sm:text-sm uppercase tracking-widest ml-1">Today's Overview</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-primary font-black text-[11px] uppercase">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> {new Date().toLocaleDateString('mr-IN')}
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border ${stat.border} shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group`}>
            <div className="p-3 sm:p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                <div className={`${stat.bg} p-1.5 rounded-lg`}>
                  <ArrowRight className={`h-3 w-3 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground truncate">{stat.title}</p>
                <div className="text-lg sm:text-2xl font-black tracking-tight text-foreground mt-0.5">{stat.value}</div>
                <p className="text-[9px] text-muted-foreground mt-1 font-bold uppercase truncate">{stat.subValue}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black font-headline flex items-center gap-2 uppercase tracking-tight">
          झटपट पर्याय (Quick Actions)
        </h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="border-none shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white overflow-hidden relative h-full">
                <div className={`absolute top-0 left-0 w-1 h-full ${action.color}`} />
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-xl ${action.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-foreground leading-tight">{action.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase">{action.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
