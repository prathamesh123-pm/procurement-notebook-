"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, MapPin, Users, PlusCircle, ClipboardCheck } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="flex items-center justify-center h-full text-muted-foreground italic">Loading overview...</div>
  }

  const actions = [
    {
      title: "Daily Report",
      description: "Submit your daily log",
      icon: ClipboardCheck,
      href: "/daily-report",
    },
    {
      title: "Work Log",
      description: "Manage procurement tasks",
      icon: ListTodo,
      href: "/work-log",
    },
    {
      title: "Routes",
      description: "Manage collection paths",
      icon: MapPin,
      href: "/routes",
    },
    {
      title: "Add Route",
      description: "Define new route",
      icon: PlusCircle,
      href: "/routes",
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-headline">Quick Actions</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Card key={action.title} asChild className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white">
              <Link href={action.href}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <action.icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
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
