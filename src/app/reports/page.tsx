
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Management Reports</h2>
          <p className="text-muted-foreground mt-1 font-medium">Review historical operational data and field logs.</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-xl text-primary font-bold shadow-sm border border-primary/5">
          <Archive className="h-5 w-5" /> 13 Total items archived
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" size="sm" className="gap-2 font-bold px-4">
          <Calendar className="h-4 w-4" /> Filter by Date
        </Button>
        <Button variant="outline" size="sm" className="gap-2 font-bold px-4">
          <Filter className="h-4 w-4" /> All Types
        </Button>
      </div>

      <div className="space-y-5">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary hover:shadow-md transition-all bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm ${report.type === 'Daily Log' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {report.type === 'Daily Log' ? <ClipboardList className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl leading-none text-foreground">{report.type}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-2 font-bold uppercase tracking-[0.2em]">
                          <Calendar className="h-3 w-3 text-primary" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] px-3 py-1 bg-muted/20 border-muted-foreground/20">ID: {report.id}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-4 bg-muted/20 rounded-xl border border-muted/50 transition-colors hover:bg-muted/30">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Work Items</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{report.workItemsCount}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl border border-muted/50 transition-colors hover:bg-muted/30">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Interactions</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{report.interactionsCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SUMMARY</p>
                    <p className="text-sm text-muted-foreground leading-relaxed italic bg-muted/5 p-4 rounded-lg border-l-2 border-muted">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button variant="outline" className="gap-2 group font-bold px-6 py-6 h-auto transition-all hover:bg-primary hover:text-primary-foreground border-primary/20">
                    View Full Details <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
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
