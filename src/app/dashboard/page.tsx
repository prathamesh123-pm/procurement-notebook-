
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Milk, MapPin, Users, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { Task, Route, Supplier } from "@/lib/types"

export default function DashboardOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    // Basic mock data initialization for demo purposes
    const storedTasks = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSuppliers = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    
    setTasks(storedTasks)
    setRoutes(storedRoutes)
    setSuppliers(storedSuppliers)
  }, [])

  const stats = [
    {
      title: "Total Routes",
      value: routes.length,
      icon: MapPin,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Suppliers",
      value: suppliers.length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Tasks Completed",
      value: tasks.filter(t => t.status === 'completed').length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Milk Quantity (L)",
      value: suppliers.reduce((acc, curr) => acc + (Number(curr.milkQuantity) || 0), 0),
      icon: Milk,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground">Operational Overview</h2>
        <p className="text-muted-foreground mt-1">Real-time status of your procurement network.</p>
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
            <CardTitle className="font-headline">Active Tasks</CardTitle>
            <CardDescription>Tasks currently in progress or recently assigned.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/40">
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : task.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                      {task.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No active tasks. Start by adding one in the Task Log.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Key Route Performance</CardTitle>
            <CardDescription>Top collection routes by supplier density.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {routes.length > 0 ? (
                  routes.slice(0, 4).map((route) => (
                    <div key={route.id} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                       <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{route.name}</span>
                          <span className="text-xs text-muted-foreground">{route.distanceKm} km</span>
                       </div>
                       <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-5">{route.vehicle}</Badge>
                          <span className="text-[10px] text-muted-foreground">{route.supplierIds.length} Suppliers</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No routes defined yet.
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
