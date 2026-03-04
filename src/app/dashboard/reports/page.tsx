
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Archive, Calendar, ArrowRight, FileText, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for initial reports if none exist
const MOCK_REPORTS = [
  {
    id: "1",
    type: "Daily Log",
    date: "2024-05-20",
    workItemsCount: 8,
    interactionsCount: 12,
    summary: "Operations ran smoothly today across all routes. All milk collection centers reported data on time."
  },
  {
    id: "2",
    type: "Field Visit",
    date: "2024-05-19",
    workItemsCount: 4,
    interactionsCount: 5,
    summary: "Conducted quality audits in the Northern Sector. Identified two suppliers needing training."
  }
]

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    if (stored.length === 0) {
      setReports(MOCK_REPORTS)
      localStorage.setItem('procurepal_reports', JSON.stringify(MOCK_REPORTS))
    } else {
      setReports(stored)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Management Reports</h2>
          <p className="text-muted-foreground mt-1">Review historical operational data and field logs.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold">
          <Archive className="h-4 w-4" /> {reports.length} Total items archived
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" /> Filter by Date
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${report.type === 'Daily Log' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {report.type === 'Daily Log' ? <ClipboardList className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{report.type}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">ID: {report.id}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Work Items</p>
                      <p className="text-lg font-bold">{report.workItemsCount}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Interactions</p>
                      <p className="text-lg font-bold">{report.interactionsCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Summary</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button variant="outline" className="gap-2 group">
                    View Full Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
