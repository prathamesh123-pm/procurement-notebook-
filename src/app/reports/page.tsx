
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
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .tabs-list { display: none !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; margin-bottom: 10px !important; }
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
          .print-header-top { display: flex !important; flex-direction: column !important; align-items: center !important; border-bottom: 2px solid #000 !important; padding-bottom: 10px !important; margin-bottom: 15px !important; }
          .print-section-title { background: #f0f0f0 !important; padding: 4px 8px !important; border: 1px solid #ddd !important; font-weight: bold !important; font-size: 11pt !important; margin-top: 15px !important; margin-bottom: 10px !important; }
          .grid { display: grid !important; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)) !important; }
          .border { border: 1px solid #ddd !important; }
          .p-4 { padding: 10px !important; }
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
        <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 dialog-content bg-white overflow-hidden">
          <DialogHeader className="p-6 border-b no-print shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedReport && getIcon(selectedReport.type)}
              {selectedReport?.type} - अहवाल तपशील
            </DialogTitle>
            <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">
              Date: {selectedReport?.date} | ID: {selectedReport?.id.slice(0, 12)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            <div className="p-4 md:p-8 space-y-4 max-w-5xl mx-auto" id="printable-report-content">
              {/* PRINT HEADER */}
              <div className="hidden print:flex flex-col gap-0.5 border-b pb-2 mb-4">
                <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  संकलन विभाग - दैनिक कामकाज अहवाल
                </h2>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Collection Department - Daily Work Report</p>
              </div>

              {/* SECTION 1: BASIC INFO */}
              <Card className="border shadow-sm bg-white overflow-hidden mb-4">
                <CardHeader className="bg-primary/5 border-b py-1.5 px-3">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary no-print" /> १) प्रतिनिधीची मूलभूत माहिती (Basic Info)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">नाव</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.fullData?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">आयडी</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.fullData?.idNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">पदनाम</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.fullData?.designation || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">मोबाईल</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.fullData?.mobile || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">तारीख</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.date || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-bold uppercase text-muted-foreground">शिफ्ट</Label>
                    <p className="text-xs font-bold border-b min-h-[1.5rem]">{selectedReport?.fullData?.shift === 'Sakal' ? 'सकाळ' : 'संध्या'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: OFFICE WORK */}
              {selectedReport?.type === 'Daily Office Work' && (
                <div className="space-y-4">
                  <Card className="border shadow-sm bg-white mb-4">
                    <CardHeader className="bg-primary/5 border-b py-1.5 px-3">
                      <CardTitle className="text-xs font-bold">ऑफिस वर्क (Office Work)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        {[
                          "दुग्ध नमुना नोंद तपासणी", "दरपत्रक तपासणी / मंजुरी", "बिलिंग / पेमेंट मंजुरी", 
                          "संकलन रजिस्टर तपासणी", "बर्फ वाढवणे/कमी करणे", "ई-मेल / पत्रव्यवहार", 
                          "कॉल करणे (Calls Made)", "पत्र पाठवणे (Letters Sent)", "वास दूध नोंदणी (Vas Milk Reg)", 
                          "नवीन ERP कामकाज", "FSSAI लायसन्स एक्सपायरी तपासणी"
                        ].map((task) => (
                          <div key={task} className="flex items-center space-x-2 border p-1.5 rounded-md bg-muted/5">
                            <Checkbox checked={selectedReport?.fullData?.officeTasks?.includes(task)} disabled className="h-3 w-3" />
                            <Label className="text-[9px] font-semibold leading-tight">{task}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground">केलेल्या कामाचा संक्षिप्त तपशील</Label>
                        <div className="p-2 border rounded-md text-[11px] min-h-[60px] italic whitespace-pre-wrap">
                          {selectedReport?.fullData?.officeTaskDetail || "तपशील उपलब्ध नाही."}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MEETINGS */}
                  {selectedReport?.fullData?.meetings && selectedReport.fullData.meetings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold flex items-center gap-2 px-1">
                        <FileText className="h-3.5 w-3.5 text-primary" /> महत्वाच्या भेटी / बैठका (Meetings)
                      </h3>
                      {selectedReport.fullData.meetings.map((m: any, index: number) => (
                        <Card key={m.id} className="border shadow-sm bg-white">
                          <CardHeader className="bg-primary/5 border-b py-1 px-3">
                            <CardTitle className="text-[10px] font-bold uppercase">बैठक {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-0.5">
                                <Label className="text-[8px] font-bold uppercase">व्यक्ती / विभाग</Label>
                                <p className="text-xs font-bold border-b">{m.person || "N/A"}</p>
                              </div>
                              <div className="space-y-0.5">
                                <Label className="text-[8px] font-bold uppercase">पद / संस्था</Label>
                                <p className="text-xs font-bold border-b">{m.org || "N/A"}</p>
                              </div>
                              <div className="space-y-0.5">
                                <Label className="text-[8px] font-bold uppercase">वेळ</Label>
                                <p className="text-xs font-bold border-b">{m.from} ते {m.to}</p>
                              </div>
                              <div className="space-y-0.5">
                                <Label className="text-[8px] font-bold uppercase">विषय</Label>
                                <p className="text-xs font-bold border-b">{m.subject || "N/A"}</p>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[8px] font-bold uppercase">निर्णय / पुढील कार्यवाही</Label>
                              <div className="p-2 border rounded-md text-[11px] italic min-h-[40px]">{m.decision || "N/A"}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: FIELD VISIT */}
              {selectedReport?.type === 'Field Visit' && (
                <div className="space-y-4">
                  <Card className="border shadow-sm bg-white overflow-hidden mb-4">
                    <CardHeader className="bg-primary/5 border-b py-1.5 px-3">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-primary no-print" /> रूटवारी / फील्ड विसिट (Field Visit)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-0.5">
                          <Label className="text-[8px] font-bold uppercase">आजचा रूट / क्षेत्र</Label>
                          <p className="text-xs font-bold border-b">{selectedReport?.fullData?.fieldRoute || "N/A"}</p>
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-[8px] font-bold uppercase">वाहन</Label>
                          <p className="text-xs font-bold border-b">{selectedReport?.fullData?.vehicleType} ({selectedReport?.fullData?.vehicleNumber})</p>
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-[8px] font-bold uppercase">वेळ</Label>
                          <p className="text-xs font-bold border-b">{selectedReport?.fullData?.fieldTimeFrom} ते {selectedReport?.fullData?.fieldTimeTo}</p>
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-[8px] font-bold uppercase">एकूण (Total KM)</Label>
                          <p className="text-xs font-bold border-b text-primary">{selectedReport?.fullData?.totalKm || 0} KM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CENTER VISITS */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold px-1">केंद्रांची माहिती (Center Visits)</h3>
                    {selectedReport?.fullData?.centerVisits?.map((visit: any, index: number) => (
                      <Card key={visit.id} className="border border-primary/10 shadow-sm bg-white overflow-hidden mb-4 print:page-break-inside-avoid">
                        <CardHeader className="bg-primary/5 border-b py-1 px-3">
                          <CardTitle className="text-[10px] font-bold uppercase">भेट {index + 1}: {visit.name || "केंद्राचे नाव"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-0.5">
                              <Label className="text-[7px] uppercase font-bold text-muted-foreground">विषय / उद्देश</Label>
                              <p className="text-[10px] font-bold border-b">{visit.topic || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] uppercase font-bold text-muted-foreground">निरीक्षण</Label>
                              <p className="text-[10px] font-bold border-b">{visit.observation || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] uppercase font-bold text-muted-foreground">सूचना</Label>
                              <p className="text-[10px] font-bold border-b">{visit.suggestion || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] uppercase font-bold text-muted-foreground">रूट उद्दिष्ट</Label>
                              <div className="flex flex-wrap gap-1">
                                {visit.objectives?.map((o: string) => <Badge key={o} variant="outline" className="text-[7px] py-0">{o}</Badge>)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-1.5 rounded-md bg-blue-50/40 border border-blue-100">
                              <Label className="text-[7px] font-bold text-blue-700 uppercase mb-1">गुणवत्ता व संकलन</Label>
                              <div className="space-y-1 text-[8px]">
                                <p className="font-bold">Mix: {visit.mixQty}L | F: {visit.mixFat}% | S: {visit.mixSnf}%</p>
                                <p className="font-bold">Cow: {visit.cowQty}L | F: {visit.cowFat}% | S: {visit.cowSnf}%</p>
                              </div>
                            </div>
                            <div className="p-1.5 rounded-md bg-green-50/40 border border-green-100">
                              <Label className="text-[7px] font-bold text-green-700 uppercase mb-1">स्वच्छता</Label>
                              <div className="space-y-0.5 text-[8px] font-bold">
                                {visit.compliance?.map((c: string) => <p key={c}>• {c}: {visit.complianceRemarks?.[c] || "OK"}</p>)}
                              </div>
                            </div>
                            <div className="p-1.5 rounded-md bg-amber-50/40 border border-amber-100">
                              <Label className="text-[7px] font-bold text-amber-700 uppercase mb-1">उपकरणे</Label>
                              <div className="space-y-0.5 text-[8px] font-bold">
                                {visit.equipment?.map((e: string) => <p key={e}>• {e}: {visit.equipmentRemarks?.[e] || "OK"}</p>)}
                              </div>
                            </div>
                          </div>
                          
                          {visit.remark && (
                            <div className="space-y-0.5 border-t pt-1">
                              <Label className="text-[7px] font-bold uppercase text-primary">शेरा / सूचना (Remarks)</Label>
                              <p className="text-[9px] italic">{visit.remark}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* DAY SUMMARY */}
              <Card className="border shadow-sm bg-white overflow-hidden mt-4">
                <CardHeader className="bg-primary/5 border-b py-1.5 px-3">
                  <CardTitle className="text-xs font-bold">दिवसाचा सारांश (Day Summary)</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-[8px] font-bold uppercase text-green-600">आजची प्रमुख कामगिरी</Label>
                      <div className="p-2 border rounded-md text-[10px] min-h-[40px] italic">{selectedReport?.fullData?.achievements || "N/A"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[8px] font-bold uppercase text-red-600">आलेल्या समस्या</Label>
                      <div className="p-2 border rounded-md text-[10px] min-h-[40px] italic">{selectedReport?.fullData?.problems || "N/A"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[8px] font-bold uppercase text-blue-600">केलेली कार्यवाही</Label>
                      <div className="p-2 border rounded-md text-[10px] min-h-[40px] italic">{selectedReport?.fullData?.actionsTaken || "N/A"}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-8 flex justify-end">
                    <div className="text-center min-w-[200px] border-t pt-1">
                      <Label className="text-[8px] font-bold uppercase block mb-6">सुपरवायझरची स्वाक्षरी</Label>
                      <p className="text-xs font-bold font-headline">{selectedReport?.fullData?.supervisorName || "_________________"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t gap-3 no-print shrink-0">
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
