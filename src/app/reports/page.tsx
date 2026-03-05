
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, ArrowRight, FileText, ClipboardList, 
  Filter, Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, MapPin, Activity, ShieldCheck, Settings, MessageSquare, Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const MOCK_REPORTS: any[] = [
  {
    id: "1",
    type: "Daily Office Work",
    date: "2024-05-20",
    workItemsCount: 8,
    interactionsCount: 12,
    summary: "Operations ran smoothly today across all routes. All milk collection centers reported data on time.",
    fullData: { 
      officeTasks: ["दुग्ध नमुना नोंद तपासणी", "दरपत्रक तपासणी / मंजुरी"], 
      officeTaskDetail: "सर्व कामे वेळेत पूर्ण झाली. कॉल करून माहिती घेतली.",
      meetings: [
        { person: "Rahul Patil", org: "Quality Dept", from: "10:00", to: "11:00", subject: "Fat Issues", decision: "Check all centers again" }
      ],
      supervisorName: "Vikram Shinde"
    }
  },
  {
    id: "2",
    type: "Field Visit",
    date: "2024-05-19",
    workItemsCount: 4,
    interactionsCount: 5,
    summary: "Conducted quality audits in the Northern Sector. Identified two suppliers needing training.",
    fullData: { 
      fieldRoute: "North Route", 
      vehicleNumber: "MH 12 AB 1234", 
      totalKm: 45,
      fieldTimeFrom: "09:00",
      fieldTimeTo: "17:00",
      centerVisits: [
        { 
          name: "Center A", 
          topic: "Quality check", 
          observation: "Good", 
          suggestion: "Maintain", 
          mixQty: "100", mixFat: "4.5", mixSnf: "8.5", 
          cowQty: "50", cowFat: "3.5", cowSnf: "8.2", 
          compliance: ["परिसर स्वच्छता"],
          complianceRemarks: { "परिसर स्वच्छता": "Clean area" },
          remark: "Very good center",
          objectives: ["दूध संकलन तपासणी"]
        }
      ],
      supervisorName: "Vikram Shinde"
    }
  }
]

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ReportType | 'All'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const { toast } = useToast()

  // View Modal State
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

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
    setSelectedReport(report)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setIsViewOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20 print:p-0" id="printable-reports">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .tabs-list { display: none !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; page-break-inside: avoid; }
          body { background: white !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .dialog-content { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            max-width: none !important; 
            border: none !important; 
            transform: none !important; 
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .printable-area { display: block !important; }
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
          <Label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap no-print">Filter by Date:</Label>
          <Input 
            type="date" 
            className="h-9 w-full md:w-[180px] text-xs font-bold no-print" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <Button variant="ghost" size="icon" className="h-9 w-9 no-print" onClick={() => setFilterDate("")}>
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

                  <div className="flex flex-col justify-end gap-3 no-print">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewReport(report)}
                      className="gap-2 group font-bold px-6 py-4 h-auto border-primary/20"
                    >
                      <Eye className="h-4 w-4" /> अहवाल पहा (View)
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleDownloadPDF(report)}
                      className="gap-2 group font-bold px-6 py-4 h-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" /> PDF डाउनलोड
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
               <h3 className="text-xl font-bold text-muted-foreground">कोणताही रिपोर्ट सापडल नाही</h3>
               <p className="text-sm text-muted-foreground/60">निवडलेली तारीख किंवा कॅटेगरी तपासा.</p>
             </div>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 dialog-content">
          <DialogHeader className="p-6 border-b no-print">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedReport && getIcon(selectedReport.type)}
              {selectedReport?.type} - अहवाल तपशील
            </DialogTitle>
            <DialogDescription className="font-bold text-primary">
              तारीख: {selectedReport?.date} | ID: {selectedReport?.id.slice(0, 12)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 scroll-area-viewport">
            <div className="space-y-8 printable-area">
              {/* Header for Print */}
              <div className="hidden print:block border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold">संकलन विभाग - दैनिक कामकाज अहवाल</h1>
                <p className="text-sm font-bold text-primary">प्रकार: {selectedReport?.type} | तारीख: {selectedReport?.date}</p>
              </div>

              {/* Summary Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> सारांश (Summary)
                </h4>
                <div className="p-4 rounded-xl bg-muted/20 border text-sm leading-relaxed italic">
                  {selectedReport?.summary}
                </div>
              </div>

              {/* Specific Data Sections */}
              {selectedReport?.type === 'Field Visit' && selectedReport?.fullData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-xl bg-primary/5">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">रूट / क्षेत्र</Label>
                      <p className="text-sm font-bold">{selectedReport.fullData.fieldRoute}</p>
                    </div>
                    <div className="p-3 border rounded-xl bg-primary/5">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">वाहन क्रमांक</Label>
                      <p className="text-sm font-bold">{selectedReport.fullData.vehicleNumber}</p>
                    </div>
                    <div className="p-3 border rounded-xl bg-primary/5">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">एकूण KM</Label>
                      <p className="text-sm font-bold">{selectedReport.fullData.totalKm} KM</p>
                    </div>
                    <div className="p-3 border rounded-xl bg-primary/5">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">वेळ</Label>
                      <p className="text-sm font-bold">{selectedReport.fullData.fieldTimeFrom} - {selectedReport.fullData.fieldTimeTo}</p>
                    </div>
                  </div>

                  <Separator />
                  <h4 className="text-lg font-bold">केंद्रांची भेट माहिती (Center Visits)</h4>
                  
                  {selectedReport.fullData.centerVisits?.map((visit: any, idx: number) => (
                    <Card key={idx} className="border border-primary/10 mb-4">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start border-b pb-2">
                          <h5 className="font-bold text-primary">{idx + 1}. {visit.name}</h5>
                          <Badge variant="outline" className="text-[10px]">{visit.topic}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">निरीक्षण व समस्या</Label>
                            <p className="text-xs">{visit.observation}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">सूचना</Label>
                            <p className="text-xs">{visit.suggestion}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <Label className="text-[9px] font-bold text-blue-700 block mb-2">Mix Milk Quality</Label>
                            <p className="text-[10px]">Qty: {visit.mixQty}L | FAT: {visit.mixFat}% | SNF: {visit.mixSnf}% | Temp: {visit.mixTemp}°C</p>
                          </div>
                          <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                            <Label className="text-[9px] font-bold text-green-700 block mb-2">Cow Milk Quality</Label>
                            <p className="text-[10px]">Qty: {visit.cowQty}L | FAT: {visit.cowFat}% | SNF: {visit.cowSnf}% | Temp: {visit.cowTemp}°C</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">स्वच्छता (Compliance)</Label>
                            <div className="flex flex-wrap gap-1">
                              {visit.compliance?.map((c: string) => (
                                <Badge key={c} variant="outline" className="text-[8px]">{c}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">उपकरणे (Equipment)</Label>
                            <div className="flex flex-wrap gap-1">
                              {visit.equipment?.map((e: string) => (
                                <Badge key={e} variant="outline" className="text-[8px]">{e}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 bg-muted/10 p-2 rounded">
                          <Label className="text-[9px] font-bold uppercase">शेरा (Remark)</Label>
                          <p className="text-xs italic">{visit.remark}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedReport?.type === 'Daily Office Work' && selectedReport?.fullData && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="font-bold">केलेली कामे (Office Tasks)</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.fullData.officeTasks?.map((task: string) => (
                        <Badge key={task} className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">{task}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">कामाचा सविस्तर तपशील</Label>
                    <p className="text-sm bg-muted/10 p-4 rounded-xl border leading-relaxed">{selectedReport.fullData.officeTaskDetail}</p>
                  </div>
                  
                  {selectedReport.fullData.meetings && selectedReport.fullData.meetings.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-bold">महत्वाच्या भेटी / बैठका</h5>
                      {selectedReport.fullData.meetings.map((m: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-xl bg-muted/5 space-y-2">
                          <div className="flex justify-between border-b pb-1">
                            <p className="font-bold text-sm text-primary">{m.person} ({m.org})</p>
                            <p className="text-[10px] font-bold">{m.from} - {m.to}</p>
                          </div>
                          <p className="text-xs font-semibold">विषय: {m.subject}</p>
                          <p className="text-xs text-muted-foreground italic">निर्णय: {m.decision}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedReport?.type === 'Daily Task' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold border-b pb-2">पूर्ण केलेल्या कामाचा तपशील</h4>
                  <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {selectedReport.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Day Summary Footer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-green-600 uppercase tracking-widest">आजची कामगिरी</Label>
                  <p className="text-xs font-medium">{selectedReport?.fullData?.achievements || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-red-600 uppercase tracking-widest">समस्या</Label>
                  <p className="text-xs font-medium">{selectedReport?.fullData?.problems || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">केलेली कार्यवाही</Label>
                  <p className="text-xs font-medium">{selectedReport?.fullData?.actionsTaken || "N/A"}</p>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <div className="text-right border-t-2 border-primary pt-2 min-w-[250px]">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">सुपरवायझरची स्वाक्षरी</Label>
                  <p className="text-xl font-bold mt-1 text-foreground">
                    {selectedReport?.fullData?.supervisorName || "Vikram Shinde"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t gap-3 no-print">
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className="font-bold h-11 px-8 rounded-xl">
              बंद करा (Close)
            </Button>
            <Button onClick={() => handleDownloadPDF(selectedReport)} className="font-bold bg-primary gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
              <Download className="h-4 w-4" /> PDF डाउनलोड करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <label className={className}>{children}</label>
}
