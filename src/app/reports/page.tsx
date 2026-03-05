
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, ArrowRight, FileText, ClipboardList, 
  Filter, Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, MapPin, Activity, ShieldCheck, Settings, MessageSquare, Clock, Hash, CheckCircle2, Target, Scale, Thermometer, Package
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
      idNumber: "EMP-001",
      mobile: "9876543210",
      shift: "Sakal",
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

  const handleDownloadPDF = () => {
    window.print()
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
          .card { border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          body { background: white !important; font-size: 10pt; }
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
            background: white !important;
            box-shadow: none !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .print-header { display: flex !important; flex-direction: column !important; align-items: center !important; border-bottom: 2px solid #000 !important; padding-bottom: 10px !important; margin-bottom: 20px !important; }
          .print-section-title { background: #f0f0f0 !important; padding: 4px 8px !important; border: 1px solid #ddd !important; font-weight: bold !important; font-size: 11pt !important; margin-top: 15px !important; margin-bottom: 10px !important; }
          .grid { display: block !important; }
          .grid-cols-2, .grid-cols-4 { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; }
          .grid-cols-2 > div { width: 48% !important; }
          .grid-cols-4 > div { width: 23% !important; }
          .border { border: 1px solid #ddd !important; }
          .p-4 { padding: 10px !important; }
          .rounded-xl { border-radius: 4px !important; }
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
          <label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Filter by Date:</label>
          <Input 
            type="date" 
            className="h-9 w-full md:w-[180px] text-xs font-bold" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
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
                      onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }}
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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 dialog-content bg-white">
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
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* PRINT HEADER */}
              <div className="hidden print:flex flex-col items-center gap-2 border-b-2 border-primary pb-4 mb-8">
                <h2 className="text-xl font-bold text-primary">MilkPath Log - Procurement Operations</h2>
                <h1 className="text-2xl font-bold uppercase tracking-tighter">संकलन विभाग - दैनिक कामकाज अहवाल</h1>
                <h3 className="text-sm font-bold uppercase text-muted-foreground">COLLECTION DEPARTMENT - DAILY WORK REPORT</h3>
              </div>

              {/* SECTION 1: BASIC INFO */}
              <div className="space-y-4">
                <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider">१) प्रतिनिधीची मूलभूत माहिती (Basic Info)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 border rounded-xl">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">नाव (Name)</p>
                    <p className="text-sm font-bold border-b border-dashed min-w-[150px]">{selectedReport?.fullData?.name || "_________________"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">आयडी / कर्मचारी संख्या (ID)</p>
                    <p className="text-sm font-bold border-b border-dashed min-w-[100px]">{selectedReport?.fullData?.idNumber || "_________________"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">पदनाम (Designation)</p>
                    <p className="text-sm font-bold border-b border-dashed min-w-[120px]">{selectedReport?.fullData?.designation || "_________________"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">मोबाईल (Mobile)</p>
                    <p className="text-sm font-bold border-b border-dashed min-w-[120px]">{selectedReport?.fullData?.mobile || "_________________"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 p-4 pt-0">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">तारीख (Date)</p>
                    <p className="text-sm font-bold">{selectedReport?.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">शिफ्ट (Shift)</p>
                    <p className="text-sm font-bold">{selectedReport?.fullData?.shift === 'Sakal' ? 'सकाळ (Sakal)' : 'संध्या (Sandhya)'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 2: OFFICE WORK DATA */}
              {selectedReport?.type === 'Daily Office Work' && selectedReport?.fullData && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">ऑफिस वर्क (Office Work)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-xl bg-muted/5">
                      {selectedReport.fullData.officeTasks?.map((task: string) => (
                        <div key={task} className="flex items-center gap-2 text-[11px] font-bold text-primary">
                          <CheckCircle2 className="h-3 w-3" /> {task}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" /> केलेल्या कामाचा संक्षिप्त तपशील (Description of work done)
                      </p>
                      <div className="p-4 rounded-xl border min-h-[100px] text-sm leading-relaxed whitespace-pre-wrap italic bg-white">
                        {selectedReport.fullData.officeTaskDetail || "तपशील उपलब्ध नाही."}
                      </div>
                    </div>
                  </div>
                  
                  {selectedReport.fullData.meetings && selectedReport.fullData.meetings.length > 0 && (
                    <div className="space-y-4">
                      <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider">महत्वाच्या भेटी / बैठका (Meetings)</span>
                      </div>
                      {selectedReport.fullData.meetings.map((m: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/5 space-y-4 mb-4">
                          <div className="flex justify-between border-b pb-2">
                            <h5 className="font-bold text-sm text-primary">बैठक {idx + 1}: {m.person} <span className="text-muted-foreground font-medium text-xs">({m.org})</span></h5>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <Clock className="h-3 w-3" /> {m.from} - {m.to}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">विषय (Subject)</p>
                              <p className="text-xs font-bold border-b border-dashed">{m.subject}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">निर्णय / कार्यवाही (Decision/Next Steps)</p>
                              <p className="text-xs text-muted-foreground italic border-b border-dashed">{m.decision}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: FIELD VISIT DATA */}
              {selectedReport?.type === 'Field Visit' && selectedReport?.fullData && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">रूट व वाहन तपशील (Route & Vehicle)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-xl">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">रूट / क्षेत्र (Route)</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.fieldRoute}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">वाहन प्रकार (Vehicle Type)</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.vehicleType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">वाहन क्रमांक (No.)</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.vehicleNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">एकूण KM (Total)</p>
                        <p className="text-sm font-bold text-primary">{selectedReport.fullData.totalKm} KM</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4 pt-0">
                       <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">ओडोमीटर सुरुवात (Odo Start)</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.odoStart} KM</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">ओडोमीटर शेवट (Odo End)</p>
                        <p className="text-sm font-bold">{selectedReport.fullData.odoEnd} KM</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">केंद्रांची भेट माहिती (Center Visits)</span>
                    </div>
                    {selectedReport.fullData.centerVisits?.map((visit: any, idx: number) => (
                      <div key={idx} className="border border-muted shadow-none bg-white p-0 overflow-hidden mb-8 rounded-xl print:page-break-inside-avoid">
                        <div className="bg-primary/5 px-4 py-2 border-b flex justify-between items-center">
                          <h5 className="font-bold text-sm text-primary">भेट {idx + 1}: {visit.name}</h5>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{visit.topic}</span>
                        </div>
                        <div className="p-4 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">निरीक्षण (Observation)</p>
                              <p className="text-xs font-semibold italic border-b border-dashed pb-1">{visit.observation}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">सूचना (Suggestion)</p>
                              <p className="text-xs font-semibold italic border-b border-dashed pb-1">{visit.suggestion}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <p className="text-[10px] font-bold text-primary uppercase flex items-center gap-1"><Target className="h-3 w-3" /> रूट उद्दिष्ट</p>
                               <div className="flex flex-wrap gap-2">
                                  {visit.objectives?.map((obj: string) => (
                                    <Badge key={obj} variant="outline" className="bg-muted/30 text-[9px] font-bold">{obj}</Badge>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[10px] font-bold text-primary uppercase flex items-center gap-1"><Activity className="h-3 w-3" /> गुणवत्ता व संकलन</p>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-blue-50/50 p-2 rounded border border-blue-100">
                                    <p className="text-[8px] font-bold text-blue-700 uppercase mb-1">Mix Milk</p>
                                    <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                                      <div><span className="text-muted-foreground font-normal">Qty:</span> {visit.mixQty}L</div>
                                      <div><span className="text-muted-foreground font-normal">F:</span> {visit.mixFat}%</div>
                                      <div><span className="text-muted-foreground font-normal">S:</span> {visit.mixSnf}%</div>
                                    </div>
                                  </div>
                                  <div className="bg-green-50/50 p-2 rounded border border-green-100">
                                    <p className="text-[8px] font-bold text-green-700 uppercase mb-1">Cow Milk</p>
                                    <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                                      <div><span className="text-muted-foreground font-normal">Qty:</span> {visit.cowQty}L</div>
                                      <div><span className="text-muted-foreground font-normal">F:</span> {visit.cowFat}%</div>
                                      <div><span className="text-muted-foreground font-normal">S:</span> {visit.cowSnf}%</div>
                                    </div>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <p className="text-[10px] font-bold text-primary uppercase flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> स्वच्छता व FSSAI</p>
                               <div className="grid grid-cols-1 gap-1.5 p-2 border rounded bg-muted/5">
                                  {visit.compliance?.map((comp: string) => (
                                    <div key={comp} className="text-[10px] flex flex-col gap-0.5 border-l-2 border-green-200 pl-2">
                                      <span className="font-bold flex items-center gap-1"><CheckCircle2 className="h-2 w-2" /> {comp}</span>
                                      {visit.complianceRemarks?.[comp] && (
                                        <span className="text-muted-foreground italic">शेरा: {visit.complianceRemarks[comp]}</span>
                                      )}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-bold text-primary uppercase flex items-center gap-1"><Settings className="h-3 w-3" /> उपकरण तपासणी</p>
                               <div className="grid grid-cols-1 gap-1.5 p-2 border rounded bg-muted/5">
                                  {visit.equipment?.map((eq: string) => (
                                    <div key={eq} className="text-[10px] flex flex-col gap-0.5 border-l-2 border-amber-200 pl-2">
                                      <span className="font-bold flex items-center gap-1">
                                        {eq === 'वजन काटा' && <Scale className="h-2 w-2" />}
                                        {eq === 'फॅट मशीन' && <Thermometer className="h-2 w-2" />}
                                        {eq === 'BMC मशीन' && <Activity className="h-2 w-2" />}
                                        {eq === 'कॅन कुलर' && <Package className="h-2 w-2" />}
                                        {eq}
                                      </span>
                                      {visit.equipmentRemarks?.[eq] && (
                                        <span className="text-muted-foreground italic">शेरा: {visit.equipmentRemarks[eq]}</span>
                                      )}
                                    </div>
                                  ))}
                               </div>
                            </div>
                          </div>

                          {visit.remark && (
                            <div className="bg-muted/30 p-3 rounded border border-dashed text-xs italic leading-relaxed">
                              <span className="font-bold text-primary not-italic uppercase mr-2 text-[9px] tracking-wider">शेरा / सूचना (Remarks):</span> {visit.remark}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: DAILY TASK DATA */}
              {selectedReport?.type === 'Daily Task' && (
                <div className="space-y-6">
                  <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider">टास्क तपशील (Task Details)</span>
                  </div>
                  <div className="p-6 border rounded-2xl bg-muted/5 space-y-4">
                    <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap italic">
                      {selectedReport.summary}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* SECTION 3: DAY SUMMARY SECTION */}
              {selectedReport?.fullData && (
                <div className="space-y-4">
                  <div className="print-section-title bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider">दिवसाचा सारांश (Day Summary)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 p-4 rounded-xl bg-green-50/30 border border-green-100">
                      <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">आजची प्रमुख कामगिरी (ACHIEVEMENTS)</p>
                      <p className="text-xs font-bold leading-relaxed italic border-b border-dashed min-h-[40px]">{selectedReport.fullData.achievements || "---"}</p>
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-red-50/30 border border-red-100">
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest">आलेल्या समस्या (PROBLEMS)</p>
                      <p className="text-xs font-bold leading-relaxed italic border-b border-dashed min-h-[40px]">{selectedReport.fullData.problems || "---"}</p>
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-blue-50/30 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">केलेली कार्यवाही (ACTIONS TAKEN)</p>
                      <p className="text-xs font-bold leading-relaxed italic border-b border-dashed min-h-[40px]">{selectedReport.fullData.actionsTaken || "---"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: SUPERVISOR SIGNATURE */}
              <div className="pt-16 flex justify-end">
                <div className="text-center border-t-2 border-primary pt-2 min-w-[250px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-10">सुपरवायझरची स्वाक्षरी (SUPERVISOR SIGNATURE)</p>
                  <p className="text-xl font-bold text-foreground font-headline">
                    {selectedReport?.fullData?.supervisorName || "_________________"}
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
            <Button onClick={handleDownloadPDF} className="font-bold bg-primary gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
              <Download className="h-4 w-4" /> PDF डाउनलोड करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
