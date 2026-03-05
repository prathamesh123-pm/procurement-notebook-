
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, ArrowRight, FileText, ClipboardList, 
  Filter, Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, MapPin, Activity, ShieldCheck, Settings, MessageSquare, Clock, Hash, CheckCircle2
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
    interactionsCount: 1,
    summary: "प्रतिनिधी: राहुल पाटील. रिपोर्ट प्रकार: Daily Office Work. सर्व कामे वेळेत पूर्ण झाली.",
    fullData: { 
      name: "Rahul Patil",
      designation: "Collection Executive",
      officeTasks: ["दुग्ध नमुना नोंद तपासणी", "दरपत्रक तपासणी / मंजुरी", "कॉल करणे (Calls Made)"], 
      officeTaskDetail: "आज एकूण १५ केंद्रांना कॉल केले. दरपत्रक तपासणी पूर्ण झाली.",
      meetings: [
        { id: "m1", person: "Vikram Shinde", org: "Quality Dept", from: "10:00", to: "11:00", subject: "Fat Issues", decision: "Increase sampling at Route A" }
      ],
      achievements: "१५ केंद्रांचा डेटा अपडेट केला.",
      problems: "इंटरनेट स्लो होते.",
      actionsTaken: "ऑफिस मधूनच काम पूर्ण केले.",
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
      case 'Field Visit': return <Truck className="h-5 w-5" />
      case 'Daily Office Work': return <Briefcase className="h-5 w-5" />
      case 'Daily Task': return <ListTodo className="h-5 w-5" />
      default: return <ClipboardList className="h-5 w-5" />
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

      {/* Detailed Report View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 dialog-content">
          <DialogHeader className="p-6 border-b no-print">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedReport && getIcon(selectedReport.type)}
              {selectedReport?.type} - अहवाल तपशील
            </DialogTitle>
            <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">
              तारीख: {selectedReport?.date} | ID: {selectedReport?.id.slice(0, 12)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-8 scroll-area-viewport">
            <div className="space-y-10 printable-area">
              {/* Header for Print Output */}
              <div className="hidden print:flex flex-col gap-2 border-b-2 border-primary pb-4 mb-8">
                <h1 className="text-2xl font-bold text-center uppercase tracking-tighter">संकलन विभाग - दैनिक कामकाज अहवाल</h1>
                <div className="flex justify-between items-end text-[11px] font-bold uppercase text-muted-foreground">
                  <span>प्रकार: {selectedReport?.type}</span>
                  <span>तारीख: {selectedReport?.date}</span>
                </div>
              </div>

              {/* Summary Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                  <FileText className="h-4 w-4" /> १. अहवाल सारांश (Summary)
                </h4>
                <div className="p-4 rounded-xl bg-muted/10 border text-sm leading-relaxed italic">
                  {selectedReport?.summary}
                </div>
              </div>

              {/* Representative Info (if available in fullData) */}
              {selectedReport?.fullData && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                    <User className="h-4 w-4" /> २. प्रतिनिधीची माहिती (Representative Info)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">नाव</p>
                      <p className="text-sm font-bold">{selectedReport.fullData.name || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">आयडी</p>
                      <p className="text-sm font-bold">{selectedReport.fullData.idNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">पदनाम</p>
                      <p className="text-sm font-bold">{selectedReport.fullData.designation || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">शिफ्ट</p>
                      <p className="text-sm font-bold">{selectedReport.fullData.shift || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FIELD VISIT DATA */}
              {selectedReport?.type === 'Field Visit' && selectedReport?.fullData && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                      <Truck className="h-4 w-4" /> ३. रूट व वाहन तपशील (Route & Vehicle)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-xl bg-muted/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">रूट / क्षेत्र</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.fieldRoute}</p>
                      </div>
                      <div className="p-3 border rounded-xl bg-muted/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">वाहन क्रमांक</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.vehicleNumber}</p>
                      </div>
                      <div className="p-3 border rounded-xl bg-muted/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">एकूण KM</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.totalKm} KM</p>
                      </div>
                      <div className="p-3 border rounded-xl bg-muted/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">वेळ</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.fieldTimeFrom} ते {selectedReport.fullData.fieldTimeTo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                      <MapPin className="h-4 w-4" /> ४. केंद्रांची भेट माहिती (Center Visits)
                    </h4>
                    {selectedReport.fullData.centerVisits?.map((visit: any, idx: number) => (
                      <Card key={idx} className="border border-muted shadow-none bg-white p-0 overflow-hidden">
                        <div className="bg-primary/5 px-4 py-2 border-b flex justify-between items-center">
                          <h5 className="font-bold text-sm text-primary">{idx + 1}. {visit.name}</h5>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">{visit.topic}</span>
                        </div>
                        <CardContent className="p-4 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">निरीक्षण व समस्या</p>
                              <p className="text-xs font-medium">{visit.observation}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">सूचना</p>
                              <p className="text-xs font-medium">{visit.suggestion}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                              <p className="text-[9px] font-bold text-blue-700 uppercase">Mix Milk Quality</p>
                              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold">
                                <div><span className="text-muted-foreground font-normal">Qty:</span> {visit.mixQty}L</div>
                                <div><span className="text-muted-foreground font-normal">FAT:</span> {visit.mixFat}%</div>
                                <div><span className="text-muted-foreground font-normal">SNF:</span> {visit.mixSnf}%</div>
                                <div><span className="text-muted-foreground font-normal">Temp:</span> {visit.mixTemp}°C</div>
                              </div>
                            </div>
                            <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 space-y-2">
                              <p className="text-[9px] font-bold text-green-700 uppercase">Cow Milk Quality</p>
                              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold">
                                <div><span className="text-muted-foreground font-normal">Qty:</span> {visit.cowQty}L</div>
                                <div><span className="text-muted-foreground font-normal">FAT:</span> {visit.cowFat}%</div>
                                <div><span className="text-muted-foreground font-normal">SNF:</span> {visit.cowSnf}%</div>
                                <div><span className="text-muted-foreground font-normal">Temp:</span> {visit.cowTemp}°C</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground">स्वच्छता (Compliance)</p>
                              <div className="flex flex-wrap gap-1.5">
                                {visit.compliance?.length > 0 ? visit.compliance.map((c: string) => (
                                  <div key={c} className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded border">
                                    {c} {visit.complianceRemarks?.[c] && <span className="text-primary font-normal ml-1">({visit.complianceRemarks[c]})</span>}
                                  </div>
                                )) : <span className="text-[9px] text-muted-foreground italic">No compliance issues</span>}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground">उपकरणे (Equipment Check)</p>
                              <div className="flex flex-wrap gap-1.5">
                                {visit.equipment?.length > 0 ? visit.equipment.map((e: string) => (
                                  <div key={e} className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded border">
                                    {e} {visit.equipmentRemarks?.[e] && <span className="text-primary font-normal ml-1">({visit.equipmentRemarks[e]})</span>}
                                  </div>
                                )) : <span className="text-[9px] text-muted-foreground italic">No equipment issues</span>}
                              </div>
                            </div>
                          </div>
                          
                          {visit.remark && (
                            <div className="bg-muted/30 p-2.5 rounded border border-dashed text-[10px] italic leading-relaxed">
                              <span className="font-bold text-primary not-italic uppercase mr-2">शेरा:</span> {visit.remark}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* DAILY OFFICE WORK DATA */}
              {selectedReport?.type === 'Daily Office Work' && selectedReport?.fullData && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                      <Briefcase className="h-4 w-4" /> ३. ऑफिस वर्क तपशील (Office Tasks)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedReport.fullData.officeTasks?.map((task: string) => (
                        <div key={task} className="flex items-center gap-2 p-2 border rounded-lg bg-blue-50/30 text-[11px] font-bold text-primary">
                          <CheckCircle2 className="h-3 w-3" /> {task}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">केलेल्या कामाचा सविस्तर तपशील</p>
                    <div className="p-4 rounded-xl border bg-muted/5 text-sm leading-relaxed whitespace-pre-wrap italic">
                      {selectedReport.fullData.officeTaskDetail || "N/A"}
                    </div>
                  </div>
                  
                  {selectedReport.fullData.meetings && selectedReport.fullData.meetings.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                        <MessageSquare className="h-4 w-4" /> ४. महत्वाच्या भेटी / बैठका (Meetings)
                      </h4>
                      {selectedReport.fullData.meetings.map((m: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/5 space-y-3">
                          <div className="flex justify-between border-b pb-2">
                            <p className="font-bold text-sm text-primary">{m.person} <span className="text-muted-foreground font-medium text-xs">({m.org})</span></p>
                            <p className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded">{m.from} - {m.to}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground">चर्चेचा विषय</p>
                              <p className="text-xs font-semibold">{m.subject}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground">निर्णय / कार्यवाही</p>
                              <p className="text-xs text-muted-foreground italic">{m.decision}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DAILY TASK DATA */}
              {selectedReport?.type === 'Daily Task' && (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                    <ListTodo className="h-4 w-4" /> ३. पूर्ण केलेल्या कामाचा तपशील
                  </h4>
                  <div className="p-6 rounded-2xl bg-orange-50/30 border border-orange-100 shadow-inner">
                    <p className="text-sm text-foreground leading-relaxed italic">
                      {selectedReport.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* DAY SUMMARY SECTION */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1">
                  <Activity className="h-4 w-4" /> {selectedReport?.type === 'Daily Task' ? '४' : '५'}. दिवसाचा सारांश (Day Summary)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 p-3 rounded-xl bg-green-50/30 border border-green-100">
                    <p className="text-[9px] font-bold text-green-700 uppercase tracking-widest">आजची प्रमुख कामगिरी</p>
                    <p className="text-xs font-medium leading-relaxed italic">{selectedReport?.fullData?.achievements || "N/A"}</p>
                  </div>
                  <div className="space-y-2 p-3 rounded-xl bg-red-50/30 border border-red-100">
                    <p className="text-[9px] font-bold text-red-700 uppercase tracking-widest">आलेल्या समस्या</p>
                    <p className="text-xs font-medium leading-relaxed italic">{selectedReport?.fullData?.problems || "N/A"}</p>
                  </div>
                  <div className="space-y-2 p-3 rounded-xl bg-blue-50/30 border border-blue-100">
                    <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">केलेली कार्यवाही</p>
                    <p className="text-xs font-medium leading-relaxed italic">{selectedReport?.fullData?.actionsTaken || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* SUPERVISOR SIGNATURE */}
              <div className="pt-12 flex justify-end print:pt-16">
                <div className="text-center border-t-2 border-primary pt-2 min-w-[250px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">सुपरवायझरची स्वाक्षरी</p>
                  <p className="text-xl font-bold mt-2 text-foreground font-headline">
                    {selectedReport?.fullData?.supervisorName || "Vikram Shinde"}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">(Collection Supervisor)</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t gap-3 no-print">
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className="font-bold h-11 px-8 rounded-xl shadow-sm">
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
