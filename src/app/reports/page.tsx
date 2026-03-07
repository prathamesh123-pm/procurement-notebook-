
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, Hash, User, ChevronRight, Search
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ReportType | 'All'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const [profileName, setProfileName] = useState("")
  const { toast } = useToast()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    setReports(stored)
    
    // Get profile name for signature from correctly stored key
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    setProfileName(savedName)
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesType = activeFilter === 'All' || r.type === activeFilter
      const matchesDate = filterDate === "" || r.date === filterDate
      return matchesType && matchesDate
    })
  }, [reports, activeFilter, filterDate])

  const getIcon = (type: string) => {
    switch (type) {
      case 'Field Visit': return <Search className="h-5 w-5" />
      case 'Route Visit': return <Truck className="h-5 w-5" />
      case 'Daily Office Work': return <Briefcase className="h-5 w-5" />
      case 'Daily Task': return <ListTodo className="h-5 w-5" />
      default: return <ClipboardList className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Field Visit': return 'bg-purple-500/10 text-purple-600'
      case 'Route Visit': return 'bg-emerald-500/10 text-emerald-600'
      case 'Daily Office Work': return 'bg-blue-500/10 text-blue-600'
      case 'Daily Task': return 'bg-orange-500/10 text-orange-600'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm("तुम्हाला हा रिपोर्ट हटवायचा आहे का?")) return
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('procurepal_reports', JSON.stringify(updated))
    toast({ title: "अहवाल हटवला", description: "माहिती यशस्वीरित्या काढून टाकली आहे." })
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
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20 animate-in fade-in duration-500 print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .sidebar-inset header { display: none !important; }
          .dialog-content { 
            position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; 
            max-width: none !important; border: none !important; transform: none !important; 
            margin: 0 !important; padding: 0 !important; height: auto !important;
            overflow: visible !important; background: white !important; box-shadow: none !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .card { border: 1px solid #000 !important; box-shadow: none !important; break-inside: avoid; }
          body { background: white !important; padding: 0 !important; }
          #printable-report-content { width: 100% !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Archive className="h-8 w-8 text-primary" /> अहवाल व्यवस्थापन
          </h2>
          <p className="text-muted-foreground font-medium text-sm">दैनंदिन कामकाजाचे अहवाल तपासा आणि पीडीएफ डाउनलोड करा.</p>
        </div>
        <div className="bg-primary/5 px-5 py-2.5 rounded-2xl text-primary font-black border border-primary/10 flex items-center gap-3">
          <Badge className="bg-primary text-white font-black">{reports.length}</Badge>
          <span className="text-[11px] uppercase tracking-wider">Reports Stored</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print bg-white p-3 rounded-2xl shadow-sm border items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className={`font-bold rounded-xl px-4 text-xs h-9 transition-all ${activeFilter === type ? 'shadow-lg shadow-primary/20' : 'hover:bg-primary/5 hover:text-primary'}`}
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <Input 
            type="date" 
            className="h-9 w-full md:w-[160px] text-xs font-bold bg-muted/50 border-none rounded-xl" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 no-print">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group rounded-2xl border-l-4 border-l-primary">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${getTypeColor(report.type)} transition-transform group-hover:scale-110`}>
                          {getIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-none text-foreground group-hover:text-primary transition-colors">{report.type}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-2 font-bold uppercase tracking-wider">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px] font-black uppercase bg-muted/50">ID: {report.id.slice(0, 8)}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[13px] text-muted-foreground bg-muted/20 p-4 rounded-2xl italic leading-relaxed border border-dashed border-muted-foreground/10">
                      {report.summary}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2 min-w-[120px]">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="font-bold text-xs h-10 rounded-xl hover:bg-primary hover:text-white border-2">
                      <Eye className="h-4 w-4 mr-2" /> View Full
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="font-bold text-xs h-10 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                <Archive className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <h3 className="text-xl font-bold text-muted-foreground">कोणताही अहवाल सापडला नाही.</h3>
             <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">फिल्टर बदला किंवा नवीन अहवाल तयार करा.</p>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[210mm] h-[95vh] flex flex-col p-0 bg-white overflow-hidden dialog-content rounded-none border-none">
          <DialogHeader className="p-4 border-b no-print bg-primary/5 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {selectedReport?.type} Report - {selectedReport?.date}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-bold rounded-xl" onClick={() => setIsViewOpen(false)}>Close</Button>
              <Button size="sm" className="gap-2 font-bold rounded-xl bg-primary px-6" onClick={handleDownloadPDF}><Download className="h-4 w-4" /> Save PDF</Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-10 space-y-8 bg-white" id="printable-report-content">
                <div className="flex flex-col items-center border-b-4 border-black pb-6 text-center space-y-2">
                  <h1 className="text-2xl font-black uppercase tracking-tighter">PROCUREMENT NOTEBOOK</h1>
                  <h2 className="text-lg font-bold text-gray-800">संकलन विभाग - दैनिक कामकाज अहवाल ({selectedReport.type})</h2>
                  <div className="grid grid-cols-3 w-full mt-6 text-[11px] font-black uppercase border-t-2 border-gray-200 pt-4 text-left">
                    <div className="flex flex-col"><span className="text-gray-500 font-bold">प्रतिनिधी:</span> {profileName || selectedReport.fullData?.name || selectedReport.fullData?.userName || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-gray-500 font-bold">दिनांक:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-gray-500 font-bold">शिफ्ट:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 p-5 border-2 border-black rounded-2xl bg-gray-50/50">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-gray-500">स्लिप नंबर</Label>
                        <p className="text-sm font-bold">{selectedReport.fullData?.slipNo || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-gray-500">वाहन क्र.</Label>
                        <p className="text-sm font-bold">{selectedReport.fullData?.vehicleNumber || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-gray-500">Out / In Time</Label>
                        <p className="text-sm font-bold">{selectedReport.fullData?.routeOutTime || '-'} / {selectedReport.fullData?.routeInTime || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-blue-700">एकूण KM</Label>
                        <p className="text-lg font-black text-blue-700">{selectedReport.fullData?.totalKm || '0'} KM</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-red-600">दूध तूट (L)</Label>
                        <p className="text-sm font-bold text-red-600">{selectedReport.fullData?.shortageLiters || '0'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-green-600">दूध वाढ (L)</Label>
                        <p className="text-sm font-bold text-green-600">{selectedReport.fullData?.excessLiters || '0'}</p>
                      </div>
                    </div>

                    <div className="border-2 border-black rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-black text-white">
                          <tr className="uppercase font-black text-[9px] tracking-widest">
                            <th className="p-3 border border-black text-left">Sr.</th>
                            <th className="p-3 border border-black text-left">Code</th>
                            <th className="p-3 border border-black text-left">Supplier / Point Name</th>
                            <th className="p-3 border border-black text-center">Ice</th>
                            <th className="p-3 border border-black text-center">Arr. / Dep.</th>
                            <th className="p-3 border border-black text-center">Cans (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                              <td className="p-3 border-r border-gray-300 text-center font-bold">{idx + 1}</td>
                              <td className="p-3 border-r border-gray-300 text-center font-black text-primary">{log.centerCode}</td>
                              <td className="p-3 border-r border-gray-300 font-bold">{log.supplierName}</td>
                              <td className="p-3 border-r border-gray-300 text-center font-bold">{log.iceAllocated || '0'}</td>
                              <td className="p-3 border-r border-gray-300 text-center font-medium">{log.arrivalTime || '-'} / {log.departureTime || '-'}</td>
                              <td className="p-3 border-r border-gray-300 text-center font-black">E:{log.emptyCans || '0'} F:{log.fullCans || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-black rounded-3xl bg-gray-50 space-y-6">
                      <div className="grid grid-cols-2 gap-6 border-b-2 border-gray-200 pb-6">
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-500">गवळी / संकलन केंद्र</Label>
                          <p className="text-lg font-black flex items-center gap-2 mt-1 text-primary"><User className="h-5 w-5" /> {selectedReport.fullData?.supplierName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-500">कोड नंबर</Label>
                          <p className="text-lg font-black flex items-center gap-2 mt-1"><Hash className="h-5 w-5 text-primary" /> {selectedReport.fullData?.supplierId || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest">टास्क तपशील (Action Description)</Label>
                          <h3 className="text-xl font-black mt-2 leading-tight">{selectedReport.fullData?.title}</h3>
                          <p className="text-sm text-gray-600 mt-3 italic leading-relaxed whitespace-pre-wrap">{selectedReport.fullData?.description || "तपशील उपलब्ध नाही."}</p>
                        </div>
                        
                        <div className="p-6 bg-primary/5 border-l-8 border-primary rounded-r-2xl">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest">कार्यवाही / शेरा (Action Plan & Result)</Label>
                          <p className="text-base font-bold mt-2 text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedReport.fullData?.remark || "शेरा दिलेला नाही."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-8 border-2 border-black rounded-3xl bg-gray-50/50 min-h-[300px] shadow-inner">
                    <Label className="text-[11px] font-black uppercase mb-4 block text-gray-500 tracking-widest">अहवाल सविस्तर माहिती (Detailed Report)</Label>
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 min-h-[200px]">
                      <p className="text-base leading-loose whitespace-pre-wrap font-medium text-gray-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                          : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-24 pb-10">
                  <div className="flex justify-between items-end">
                    <div className="text-center min-w-[200px] space-y-3">
                      <div className="border-b-2 border-black h-12 flex items-end justify-center">
                        <span className="text-sm font-black mb-1">{profileName || '-----------------'}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">प्रतिनिधी स्वाक्षरी (REPRESENTATIVE)</span>
                    </div>
                    <div className="text-center min-w-[200px] space-y-3">
                      <div className="border-b-2 border-black h-12 flex items-end justify-center">
                        <span className="text-sm font-black mb-1 text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">सुपरवायझर स्वाक्षरी (SUPERVISOR)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
