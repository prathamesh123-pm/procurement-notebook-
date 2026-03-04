
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Milk, MapPin, Users, Archive, IndianRupee } from "lucide-react"
import { useEffect, useState } from "react"
import { Task, Route, Supplier, DailyReport } from "@/lib/types"

export default function DashboardOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTasks(JSON.parse(localStorage.getItem('procurepal_tasks') || '[]'))
    setRoutes(JSON.parse(localStorage.getItem('procurepal_routes') || '[]'))
    setSuppliers(JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]'))
    setDailyReports(JSON.parse(localStorage.getItem('procurepal_daily_reports') || '[]'))
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center h-full text-muted-foreground italic">Loading overview...</div>
  }

  const totalMilk = suppliers.reduce((acc, s) => {
    return acc + (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0)
  }, 0)

  const stats = [
    {
      title: "Active Routes",
      value: routes.length,
      icon: MapPin,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Suppliers",
      value: suppliers.length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Milk (L)",
      value: totalMilk.toFixed(1),
      icon: Milk,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Items Archived",
      value: dailyReports.length + tasks.filter(t => t.status === 'completed').length,
      icon: Archive,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Operational Overview</h2>
          <p className="text-muted-foreground mt-1">Real-time status of MilkPath procurement network.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-lg text-primary font-bold text-sm">
          Procurement Manager Role
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Recent Daily Logs</CardTitle>
            <CardDescription>Daily recaps of collection activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyReports.length > 0 ? (
                dailyReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Date: {new Date(report.date).toLocaleDateString()}</span>
                      <Badge variant="outline">ID: {report.id.slice(0, 4)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <span>Work Items: {report.taskIds.length}</span>
                      <span>Routes Tracked: {report.routeIds.length}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{report.summary || report.notes}</p>
                    <Button variant="link" className="p-0 h-auto text-accent text-xs">View Full Details</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground italic">
                  No daily reports compiled yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Route Efficiency</CardTitle>
            <CardDescription>Performance by collection cost.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {routes.length > 0 ? (
                  routes.slice(0, 4).map((route) => (
                    <div key={route.id} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                       <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{route.name}</span>
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> {route.costPerKm}/km
                          </span>
                       </div>
                       <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-[10px] h-5">{route.vehicle}</Badge>
                          <span className="text-[10px] text-muted-foreground">{route.supplierIds.length} Suppliers</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No routes defined.
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
