
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Archive, Calendar, ArrowRight, FileText, ClipboardList, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Management Reports</h2>
          <p className="text-muted-foreground mt-1">Review historical operational data and field logs.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold shadow-sm">
          <Archive className="h-4 w-4" /> 13 Total items archived
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2 font-bold">
          <Calendar className="h-4 w-4" /> Filter by Date
        </Button>
        <Button variant="outline" size="sm" className="gap-2 font-bold">
          <Filter className="h-4 w-4" /> All Types
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full ${report.type === 'Daily Log' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {report.type === 'Daily Log' ? <ClipboardList className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-none">{report.type}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-bold uppercase tracking-widest">
                          <Calendar className="h-3 w-3" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">ID: {report.id}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Work Items</p>
                      <p className="text-xl font-bold text-foreground">{report.workItemsCount}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Interactions</p>
                      <p className="text-xl font-bold text-foreground">{report.interactionsCount}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Summary</p>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button variant="outline" className="gap-2 group font-bold">
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
