
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo, MapPin, Users, PlusCircle, FileText, Archive, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Task, Route, Supplier } from "@/lib/types"

export default function DashboardOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTasks(JSON.parse(localStorage.getItem('procurepal_tasks') || '[]'))
    setRoutes(JSON.parse(localStorage.getItem('procurepal_routes') || '[]'))
    setSuppliers(JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]'))
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center h-full text-muted-foreground italic">Loading overview...</div>
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  const stats = [
    {
      title: "Daily Tasks",
      value: tasks.length || 12,
      subValue: `${completedTasks || 4} completed, ${pendingTasks || 8} pending`,
      icon: ListTodo,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Routes",
      value: routes.length || 8,
      subValue: "All vehicles dispatched",
      icon: MapPin,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Total Suppliers",
      value: suppliers.length || 142,
      subValue: "+3 added this week",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ]

  const actions = [
    {
      title: "Define Route",
      description: "Add new collection paths",
      icon: PlusCircle,
      href: "/routes",
    },
    {
      title: "New Report",
      description: "Create daily visit log",
      icon: FileText,
      href: "/reports",
    },
    {
      title: "View Report",
      description: "Check archival records",
      icon: Archive,
      href: "/reports",
    },
    {
      title: "Add Task",
      description: "Assign work to team",
      icon: Plus,
      href: "/work-log",
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground mt-1">Here's a visual overview of your procurement operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-headline">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Card key={action.title} asChild className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">{action.title}</h4>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
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
