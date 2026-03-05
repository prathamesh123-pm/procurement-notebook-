
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Archive, Calendar, ArrowRight, FileText, ClipboardList, Filter, Briefcase, ListTodo, Truck, Download, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType, Report } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const MOCK_REPORTS: Report[] = [
  {
    id: "1",
    type: "Daily Office Work",
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
  const [activeFilter, setActiveFilter] = useState<ReportType | 'All'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const { toast } = useToast()

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

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesType = activeFilter === 'All' || r.type === activeFilter
      const matchesDate = filterDate === "" || r.date === filterDate
      return matchesType && matchesDate
    })
  }, [reports, activeFilter, filterDate])

  const getIcon = (type: ReportType) => {
    switch (type) {
      case 'Field Visit': return <Truck className="h-6 w-6" />
      case 'Daily Office Work': return <Briefcase className="h-6 w-6" />
      case 'Daily Task': return <ListTodo className="h-6 w-6" />
      default: return <ClipboardList className="h-6 w-6" />
    }
  }

  const getTypeColor = (type: ReportType) => {
    switch (type) {
      case 'Field Visit': return 'bg-purple-100 text-purple-600'
      case 'Daily Office Work': return 'bg-blue-100 text-blue-600'
      case 'Daily Task': return 'bg-orange-100 text-orange-600'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm("तुम्हाला हा रिपोर्ट हटवायचा आहे का?")) return
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('procurepal_reports', JSON.stringify(updated))
    toast({ title: "रिपोर्ट हटवला", description: "अहवाल यशस्वीरित्या काढून टाकला आहे." })
  }

  const handleDownloadPDF = (report: any) => {
    // Basic print functionality for the prototype
    // In a real app, this would generate a clean PDF
    window.print()
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20 print:p-0" id="printable-reports">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger { display: none !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; page-break-inside: avoid; }
          body { background: white !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Management Reports</h2>
          <p className="text-muted-foreground mt-1 font-medium">Review historical operational data and field logs.</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-xl text-primary font-bold shadow-sm border border-primary/5">
          <Archive className="h-5 w-5" /> {reports.length} Total items archived
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print bg-card p-3 rounded-2xl shadow-sm border items-end md:items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {['All', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className="font-bold rounded-xl px-4"
            >
              {type === 'All' ? 'All' : (
                <span className="flex items-center gap-1.5">
                  {type === 'Field Visit' && <Truck className="h-3.5 w-3.5" />}
                  {type === 'Daily Office Work' && <Briefcase className="h-3.5 w-3.5" />}
                  {type === 'Daily Task' && <ListTodo className="h-3.5 w-3.5" />}
                  {type}
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Filter by Date:</Label>
          <Input 
            type="date" 
            className="h-9 w-full md:w-[180px] text-xs font-bold" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setFilterDate("")}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary hover:shadow-md transition-all bg-white">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shadow-sm ${getTypeColor(report.type)}`}>
                          {getIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xl leading-none text-foreground">{report.type}</h4>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-2 font-bold uppercase tracking-[0.2em]">
                            <Calendar className="h-3 w-3 text-primary" /> {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 no-print">
                        <Badge variant="outline" className="font-mono text-[10px] px-3 py-1 bg-muted/20 border-muted-foreground/20">ID: {report.id.slice(0, 8)}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/20 rounded-xl border border-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Work Items</p>
                        <p className="text-xl font-bold text-foreground mt-1">{report.workItemsCount}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-xl border border-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Interactions</p>
                        <p className="text-xl font-bold text-foreground mt-1">{report.interactionsCount}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SUMMARY / अहवाल सारांश</p>
                      <div className="text-sm text-muted-foreground leading-relaxed italic bg-muted/5 p-4 rounded-lg border-l-2 border-muted">
                        {report.summary}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end no-print">
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadPDF(report)}
                      className="gap-2 group font-bold px-6 py-4 h-auto transition-all hover:bg-primary hover:text-primary-foreground border-primary/20"
                    >
                      <Download className="h-4 w-4" /> PDF डाउनलोड करा
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed flex flex-col items-center gap-4">
             <Archive className="h-16 w-16 text-muted-foreground/20" />
             <div className="space-y-1">
               <h3 className="text-xl font-bold text-muted-foreground">कोणताही रिपोर्ट सापडला नाही</h3>
               <p className="text-sm text-muted-foreground/60">निवडलेली तारीख किंवा कॅटेगरी तपासा.</p>
             </div>
             {filterDate && (
               <Button variant="link" onClick={() => setFilterDate("")}>तारीख फिल्टर काढून टाका</Button>
             )}
          </div>
        )}
      </div>
    </div>
  )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <label className={className}>{children}</label>
}
