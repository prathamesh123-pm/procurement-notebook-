
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

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
          @page {
            size: A4;
            margin: 10mm;
          }
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .tabs-list { display: none !important; }
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
          .card { border: 1px solid #000 !important; box-shadow: none !important; margin-bottom: 15px !important; break-inside: avoid; }
          body { background: white !important; font-family: 'Times New Roman', serif; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .grid-cols-6 { grid-template-columns: repeat(6, 1fr) !important; }
          .print-header { border-bottom: 2px solid #000 !important; margin-bottom: 10px !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">View Reports</h2>
          <p className="text-muted-foreground mt-1 font-medium">Review and download your daily work documentation.</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-xl text-primary font-bold shadow-sm border border-primary/5">
          <Archive className="h-5 w-5" /> {reports.length} Reports Archived
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

      <div className="space-y-6 no-print">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary hover:shadow-md transition-all bg-white">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] px-3 py-1 bg-muted/20 border-muted-foreground/20">ID: {report.id.slice(0, 8)}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SUMMARY / अहवाल सारांश</p>
                      <div className="text-sm text-muted-foreground leading-relaxed italic bg-muted/5 p-4 rounded-lg border-l-2 border-muted">
                        {report.summary}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3">
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
               <h3 className="text-xl font-bold text-muted-foreground">No reports found.</h3>
               <p className="text-sm text-muted-foreground/60">Try adjusting your filters or search date.</p>
             </div>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[210mm] h-[95vh] flex flex-col p-0 dialog-content bg-white overflow-hidden shadow-2xl">
          <DialogHeader className="p-4 border-b no-print shrink-0 bg-primary/5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                {selectedReport && getIcon(selectedReport.type)}
                {selectedReport?.type} - अहवाल तपशील
              </DialogTitle>
              <div className="flex gap-2 no-print">
                <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>बंद करा</Button>
                <Button size="sm" onClick={handleDownloadPDF} className="gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
              </div>
            </div>
            <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[9px]">
              Date: {selectedReport?.date} | ID: {selectedReport?.id}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            <div className="p-[10mm] space-y-4 max-w-full mx-auto bg-white" id="printable-report-content">
              {/* PRINT HEADER - Official Look (Compact) */}
              <div className="flex flex-col items-center border-b-2 border-black pb-2 mb-3 text-center print-header">
                <h1 className="text-base font-bold uppercase tracking-tight">MilkPath Log - Procurement Operations</h1>
                <h2 className="text-sm font-bold">संकलन विभाग - दैनिक कामकाज अहवाल</h2>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Collection Department - Daily Work Report</p>
              </div>

              {/* SECTION 1: BASIC INFO - GRID STYLE */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-1.5 bg-muted/20 py-1">१) प्रतिनिधीची मूलभूत माहिती (Basic Info)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 border p-3 rounded-md">
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">नाव (Name)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.fullData?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">आयडी (ID)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.fullData?.idNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">पदनाम (Designation)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.fullData?.designation || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">मोबाईल (Mobile)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.fullData?.mobile || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">तारीख (Date)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.date || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">शिफ्ट (Shift)</Label>
                    <p className="text-[11px] font-bold border-b-2 border-muted pb-0.5">{selectedReport?.fullData?.shift === 'Sakal' ? 'सकाळ (Morning)' : 'संध्या (Evening)'}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: OFFICE WORK CONTENT */}
              {selectedReport?.type === 'Daily Office Work' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-1 bg-muted/20 py-1">२) ऑफिस वर्क (Office Work)</h3>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-md">
                      {[
                        "दुग्ध नमुना नोंद तपासणी", "दरपत्रक तपासणी / मंजुरी", "बिलिंग / पेमेंट मंजुरी", 
                        "संकलन रजिस्टर तपासणी", "बर्फ वाढवणे/कमी करणे", "ई-मेल / पत्रव्यवहार", 
                        "कॉल करणे (Calls Made)", "पत्र पाठवणे (Letters Sent)", "वास दूध नोंदणी (Vas Milk Reg)", 
                        "नवीन ERP कामकाज", "FSSAI लायसन्स एक्सपायरी तपासणी"
                      ].map((task) => (
                        <div key={task} className="flex items-center space-x-2 border p-1.5 rounded bg-muted/5">
                          <Checkbox checked={selectedReport?.fullData?.officeTasks?.includes(task)} disabled className="h-3 w-3" />
                          <Label className="text-[9px] font-semibold">{task}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">कामाचा संक्षिप्त तपशील (Work Description)</Label>
                    <div className="p-3 border rounded-md text-[10px] min-h-[60px] leading-relaxed bg-muted/5 font-medium italic">
                      {selectedReport?.fullData?.officeTaskDetail || "तपशील उपलब्ध नाही."}
                    </div>
                  </div>

                  {/* MEETINGS TABLE STYLE */}
                  {selectedReport?.fullData?.meetings && selectedReport.fullData.meetings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-1.5 bg-muted/20 py-1">३) महत्वाच्या भेटी / बैठका (Meetings)</h3>
                      {selectedReport.fullData.meetings.map((m: any, index: number) => (
                        <div key={m.id} className="border rounded-md overflow-hidden mb-3">
                          <div className="bg-muted p-1.5 text-[9px] font-bold uppercase">Meeting {index + 1}</div>
                          <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase">व्यक्ती (Person)</Label>
                              <p className="text-[10px] font-bold border-b">{m.person || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase">पद (Position)</Label>
                              <p className="text-[10px] font-bold border-b">{m.org || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase">वेळ (Time)</Label>
                              <p className="text-[10px] font-bold border-b">{m.from} - {m.to}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase">विषय (Subject)</Label>
                              <p className="text-[10px] font-bold border-b">{m.subject || "N/A"}</p>
                            </div>
                            <div className="col-span-full space-y-0.5 mt-1">
                              <Label className="text-[7px] font-bold uppercase">निर्णय (Decision)</Label>
                              <div className="p-1.5 border rounded bg-muted/5 text-[9px] italic">{m.decision || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: FIELD VISIT CONTENT */}
              {selectedReport?.type === 'Field Visit' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-1 bg-muted/20 py-1">२) रूटवारी / फील्ड विसिट (Field Visit Details)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-3 rounded-md">
                      <div className="space-y-0.5">
                        <Label className="text-[8px] font-bold uppercase">रूट (Route)</Label>
                        <p className="text-[10px] font-bold border-b">{selectedReport?.fullData?.fieldRoute || "N/A"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[8px] font-bold uppercase">वाहन (Vehicle)</Label>
                        <p className="text-[10px] font-bold border-b">{selectedReport?.fullData?.vehicleType} - {selectedReport?.fullData?.vehicleNumber}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[8px] font-bold uppercase">वेळ (Time)</Label>
                        <p className="text-[10px] font-bold border-b">{selectedReport?.fullData?.fieldTimeFrom} ते {selectedReport?.fullData?.fieldTimeTo}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[8px] font-bold uppercase text-primary">एकूण (Total KM)</Label>
                        <p className="text-[10px] font-bold border-b text-primary">{selectedReport?.fullData?.totalKm || 0} KM</p>
                      </div>
                    </div>
                  </div>

                  {/* CENTER VISITS LIST - IMPROVED SUTATUTIT LAYOUT */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-2 bg-muted/20 py-1.5">३) केंद्रांची माहिती (Center Visit Logs)</h3>
                    {selectedReport?.fullData?.centerVisits?.map((visit: any, index: number) => (
                      <div key={visit.id} className="border-2 border-black rounded-lg overflow-hidden break-inside-avoid mb-4 bg-white">
                        {/* Visit Header */}
                        <div className="bg-black text-white px-3 py-1.5 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Visit #{index + 1}: {visit.name}</span>
                          <span className="text-[8px] font-bold bg-white text-black px-1.5 py-0.5 rounded uppercase">{visit.topic || "General Visit"}</span>
                        </div>

                        <div className="p-3 space-y-4">
                          {/* Core Observations */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase font-bold text-muted-foreground border-b pb-0.5 block">निरीक्षण (Observation)</Label>
                              <p className="text-[10px] font-bold leading-tight">{visit.observation || "---"}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase font-bold text-muted-foreground border-b pb-0.5 block">सूचना (Suggestion)</Label>
                              <p className="text-[10px] font-bold leading-tight">{visit.suggestion || "---"}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase font-bold text-muted-foreground border-b pb-0.5 block">रूट उद्दिष्ट (Objectives)</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {visit.objectives?.length > 0 ? 
                                  visit.objectives.map((o: string) => <Badge key={o} variant="outline" className="text-[7px] border-black py-0 px-1">{o}</Badge>) 
                                  : <span className="text-[9px] italic">---</span>
                                }
                              </div>
                            </div>
                          </div>

                          {/* Technical Data Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Quality Table */}
                            <div className="border border-black rounded p-2.5 space-y-1.5 bg-blue-50/10">
                              <div className="flex items-center gap-1.5 border-b border-blue-200 pb-1 mb-1.5">
                                <Activity className="h-3 w-3 text-blue-700" />
                                <span className="text-[9px] font-bold uppercase text-blue-700">Quality & Collection</span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[9px] font-bold">
                                  <span className="text-muted-foreground">Mix Milk:</span>
                                  <span>{visit.mixQty}L / {visit.mixFat}% / {visit.mixSnf}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold">
                                  <span className="text-muted-foreground">Cow Milk:</span>
                                  <span>{visit.cowQty}L / {visit.cowFat}% / {visit.cowSnf}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Cleanliness Checklist */}
                            <div className="border border-black rounded p-2.5 space-y-1.5 bg-green-50/10">
                              <div className="flex items-center gap-1.5 border-b border-green-200 pb-1 mb-1.5">
                                <ShieldCheck className="h-3 w-3 text-green-700" />
                                <span className="text-[9px] font-bold uppercase text-green-700">Cleanliness & FSSAI</span>
                              </div>
                              <div className="space-y-1">
                                 {visit.compliance?.length > 0 ? visit.compliance.map((c: string) => (
                                   <div key={c} className="text-[8px] leading-tight">
                                      <span className="font-bold">✓ {c}:</span> <span className="italic">{visit.complianceRemarks?.[c] || "ठीक आहे (OK)"}</span>
                                   </div>
                                 )) : <span className="text-[9px] italic">---</span>}
                              </div>
                            </div>

                            {/* Equipment Status */}
                            <div className="border border-black rounded p-2.5 space-y-1.5 bg-amber-50/10">
                              <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1 mb-1.5">
                                <Settings className="h-3 w-3 text-amber-700" />
                                <span className="text-[9px] font-bold uppercase text-amber-700">Equipment Check</span>
                              </div>
                              <div className="space-y-1">
                                 {visit.equipment?.length > 0 ? visit.equipment.map((e: string) => (
                                   <div key={e} className="text-[8px] leading-tight">
                                      <span className="font-bold">✓ {e}:</span> <span className="italic">{visit.equipmentRemarks?.[e] || "कार्यरत (Working)"}</span>
                                   </div>
                                 )) : <span className="text-[9px] italic">---</span>}
                              </div>
                            </div>
                          </div>

                          {/* Remark at Bottom */}
                          {visit.remark && (
                            <div className="border-t border-dashed border-muted pt-2">
                              <Label className="text-[8px] font-bold uppercase text-primary flex items-center gap-1.5 mb-1">
                                <MessageSquare className="h-2.5 w-2.5" /> शेरा / सूचना (Final Remark)
                              </Label>
                              <p className="text-[9px] italic text-muted-foreground leading-relaxed pl-4 bg-muted/5 p-1.5 rounded">
                                "{visit.remark}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUMMARY SECTION - FIXED AT BOTTOM OR AFTER CONTENT */}
              <div className="space-y-3 pt-4">
                <h3 className="text-[10px] font-bold uppercase border-l-4 border-black pl-2 mb-1.5 bg-muted/20 py-1">दिवसाचा सारांश (Day Summary)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-bold uppercase text-green-700">आजची प्रमुख कामगिरी (Achievements)</Label>
                    <div className="p-2.5 border rounded-md text-[9px] min-h-[50px] italic bg-green-50/10">{selectedReport?.fullData?.achievements || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-bold uppercase text-red-700">आलेल्या समस्या (Problems)</Label>
                    <div className="p-2.5 border rounded-md text-[9px] min-h-[50px] italic bg-red-50/10">{selectedReport?.fullData?.problems || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-bold uppercase text-blue-700">केलेली कार्यवाही (Actions Taken)</Label>
                    <div className="p-2.5 border rounded-md text-[9px] min-h-[50px] italic bg-blue-50/10">{selectedReport?.fullData?.actionsTaken || "N/A"}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <div className="text-center min-w-[200px]">
                    <div className="border-b border-black mb-1 h-[30px] flex items-end justify-center">
                       <span className="text-xs font-bold font-headline mb-0.5">{selectedReport?.fullData?.supervisorName}</span>
                    </div>
                    <Label className="text-[9px] font-bold uppercase block">सुपरवायझरची स्वाक्षरी (Supervisor Signature)</Label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
