
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, MapPin, TrendingUp, Warehouse, Calendar, Milk, ArrowUpRight, ShieldAlert, UserCheck } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

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

  const { data: userData } = useDoc(userDocRef)
  const { data: centers } = useCollection(centersQuery)
  const { data: tasks } = useCollection(tasksQuery)
  const { data: routes } = useCollection(routesQuery)
  const { data: suppliers } = useCollection(suppliersQuery)

  useEffect(() => setMounted(true), [])

  const stats = useMemo(() => {
    const routeTotalCow = (suppliers || [])?.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0) || 0
    const routeTotalBuf = (suppliers || [])?.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0) || 0
    const centerTotalCow = (centers || [])?.reduce((acc, c) => acc + (c.cowMilk?.quantity || 0), 0) || 0
    const centerTotalBuf = (centers || [])?.reduce((acc, c) => acc + (c.buffaloMilk?.quantity || 0), 0) || 0
    
    return {
      cowMilk: routeTotalCow + centerTotalCow,
      bufMilk: routeTotalBuf + centerTotalBuf,
      totalMilk: routeTotalCow + routeTotalBuf + centerTotalCow + centerTotalBuf,
      activeRoutes: routes?.length || 0,
      totalPoints: (suppliers?.length || 0) + (centers?.length || 0),
      pendingTasks: (tasks || [])?.filter(t => t.status === 'pending').length || 0
    }
  }, [centers, tasks, routes, suppliers])

  if (!mounted) {
    return <div className="flex items-center justify-center h-[80vh] text-muted-foreground animate-pulse font-black uppercase text-xs">लोड होत आहे...</div>
  }

  const statCards = [
    {
      title: "एकूण दूध (Total Milk)",
      value: `${stats.totalMilk.toFixed(1)} L`,
      subValue: `गाय: ${stats.cowMilk.toFixed(1)} | म्हैस: ${stats.bufMilk.toFixed(1)}`,
      icon: Milk,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
    },
    {
      title: "सक्रिय रूट (Routes)",
      value: stats.activeRoutes,
      subValue: "वाहन व लॉजिस्टिक",
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-600",
    },
    {
      title: "संकलन पॉइंट (Points)",
      value: stats.totalPoints,
      subValue: "गवळी व सेंटर्स",
      icon: Warehouse,
      color: "text-purple-600",
      bg: "bg-purple-50",
      accent: "bg-purple-600",
    },
    {
      title: "प्रलंबित कामे (Tasks)",
      value: stats.pendingTasks,
      subValue: "तात्काळ लक्ष द्या",
      icon: ListTodo,
      color: "text-rose-600",
      bg: "bg-rose-50",
      accent: "bg-rose-600",
    },
  ]

  const actions = [
    { title: "दैनिक अहवाल", sub: "Daily Report", href: "/daily-report", color: "bg-blue-600", icon: Calendar },
    { title: "कामकाज नोंद", sub: "Work Log", href: "/work-log", color: "bg-orange-600", icon: ListTodo },
    { title: "जप्ती व दंड", sub: "Seizure", href: "/reports/entry/seizure", color: "bg-amber-600", icon: ShieldAlert },
    { title: "रूट माहिती", sub: "Routes", href: "/routes", color: "bg-emerald-600", icon: MapPin },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            डॅशबोर्ड
          </h2>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-1 opacity-70">
            {userData?.displayName ? `स्वागत आहे, ${userData.displayName}` : "तुमच्या दैनंदिन कार्याचा सारांश"}
          </p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-2 rounded-2xl border-primary/20 bg-white shadow-sm text-primary font-black text-xs uppercase">
          <Calendar className="h-4 w-4 mr-2" /> {new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group rounded-3xl relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />
            <CardContent className="p-6 flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className={`h-5 w-5 ${stat.color} opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1`} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.title}</p>
                <div className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">{stat.subValue}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400 ml-1">
          <div className="w-8 h-[2px] bg-slate-200" /> झटपट पर्याय
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white overflow-hidden rounded-3xl h-full flex flex-col items-center justify-center p-6 text-center group-hover:-translate-y-1">
                <div className={`p-4 rounded-2xl ${action.color} text-white shadow-xl shadow-current/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{action.title}</h4>
                <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1 opacity-50">{action.sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
