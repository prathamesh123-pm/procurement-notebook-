
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, Hash, User, ChevronRight, Search, Printer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
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
    
    // Get profile name for signature
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
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-20 animate-in fade-in duration-500 print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .sidebar-inset header, .dialog-header { display: none !important; }
          .dialog-content { 
            position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; 
            max-width: none !important; border: none !important; transform: none !important; 
            margin: 0 !important; padding: 0 !important; height: auto !important;
            overflow: visible !important; background: white !important; box-shadow: none !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; break-inside: avoid; }
          body { background: white !important; padding: 0 !important; }
          #printable-report-content { width: 100% !important; padding: 0 !important; margin: 0 !important; border: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Archive className="h-7 w-7 text-primary" /> अहवाल व्यवस्थापन (Reports)
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Archive & Documentation</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-xl text-primary font-black border border-primary/10 flex items-center gap-3 w-fit">
          <Badge className="bg-primary text-white font-black text-[10px]">{reports.length}</Badge>
          <span className="text-[10px] uppercase tracking-wider">Reports</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 no-print bg-white p-2 rounded-2xl shadow-sm border items-center mx-2">
        <div className="flex flex-wrap gap-1.5 flex-1 justify-center md:justify-start">
          {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className={`font-black rounded-lg px-3 text-[10px] h-8 transition-all ${activeFilter === type ? 'shadow-md shadow-primary/20' : 'hover:bg-primary/5 hover:text-primary'}`}
            >
              {type === 'All' ? 'सर्व' : type}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2 border-t md:border-t-0 pt-2 md:pt-0">
          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
          <Input 
            type="date" 
            className="h-8 w-full md:w-[140px] text-[10px] font-black bg-muted/50 border-none rounded-lg" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 no-print px-2">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 bg-white group rounded-2xl border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${getTypeColor(report.type)} transition-transform group-hover:scale-110`}>
                          {getIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-black text-sm leading-none text-foreground group-hover:text-primary transition-colors">{report.type}</h4>
                          <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 mt-1.5 font-black uppercase tracking-wider">
                            <Calendar className="h-3 w-3 text-primary" /> {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[8px] font-black uppercase bg-muted/50">ID: {report.id.slice(0, 6)}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground bg-muted/20 p-3 rounded-xl italic leading-relaxed border border-dashed border-muted-foreground/10 line-clamp-2">
                      {report.summary}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="flex-1 font-black text-[10px] h-9 rounded-xl hover:bg-primary hover:text-white border-2">
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> पाहणी
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="flex-1 font-black text-[10px] h-9 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md">
                      <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center gap-3">
             <Archive className="h-10 w-10 text-muted-foreground/20" />
             <h3 className="text-sm font-black text-muted-foreground">एकही अहवाल सापडला नाही.</h3>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col p-0 bg-white overflow-hidden dialog-content rounded-none sm:rounded-3xl border-none">
          <DialogHeader className="p-4 border-b no-print bg-primary/5 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-sm font-black flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> अहवाल पाहणी (Report View)
            </DialogTitle>
            <div className="flex gap-2 mr-6">
              <Button variant="outline" size="sm" className="font-black rounded-xl h-8 text-[10px]" onClick={() => setIsViewOpen(false)}>बंद करा</Button>
              <Button size="sm" className="gap-1.5 font-black rounded-xl bg-primary h-8 text-[10px] px-4" onClick={handleDownloadPDF}><Printer className="h-3.5 w-3.5" /> प्रिंट / PDF</Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-6 sm:p-12 space-y-8 bg-white" id="printable-report-content">
                {/* Document Header */}
                <div className="flex flex-col items-center border-b-4 border-black pb-6 text-center space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <Truck className="h-8 w-8 text-black" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-black text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    संकलन विभाग - दैनिक कामकाज अहवाल ({selectedReport.type})
                  </div>
                  <div className="grid grid-cols-3 w-full mt-8 text-[10px] font-black uppercase pt-4 text-left">
                    <div className="flex flex-col border-l-2 border-black pl-3"><span className="text-gray-500">प्रतिनिधी:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center border-x-2 border-black"><span className="text-gray-500">दिनांक:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right border-r-2 border-black pr-3"><span className="text-gray-500">शिफ्ट:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {/* Route Visit Specific Section */}
                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-2 border-black rounded-2xl bg-gray-50/50">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-gray-500">वाहन क्र.</Label>
                        <p className="text-sm font-black">{selectedReport.fullData?.vehicleNumber || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-gray-500">Out / In Time</Label>
                        <p className="text-sm font-black">{selectedReport.fullData?.routeOutTime || '-'} / {selectedReport.fullData?.routeInTime || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-blue-700">एकूण KM</Label>
                        <p className="text-xl font-black text-blue-700">{selectedReport.fullData?.totalKm || '0'} KM</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-red-600">दूध तूट (L)</Label>
                        <p className="text-sm font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p>
                      </div>
                    </div>

                    <div className="border-2 border-black rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse">
                          <thead className="bg-black text-white">
                            <tr className="uppercase font-black text-[9px] tracking-widest">
                              <th className="p-3 border-r border-white/20 text-left w-10">Sr.</th>
                              <th className="p-3 border-r border-white/20 text-left">Code</th>
                              <th className="p-3 border-r border-white/20 text-left">Supplier / Center</th>
                              <th className="p-3 border-r border-white/20 text-center">Ice</th>
                              <th className="p-3 border-r border-white/20 text-center">Time</th>
                              <th className="p-3 text-center">Cans (E/F)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-300 odd:bg-white even:bg-gray-50">
                                <td className="p-3 border-r border-gray-300 text-center font-black">{idx + 1}</td>
                                <td className="p-3 border-r border-gray-300 text-center font-black text-primary">{log.centerCode}</td>
                                <td className="p-3 border-r border-gray-300 font-black">{log.supplierName}</td>
                                <td className="p-3 border-r border-gray-300 text-center font-black">{log.iceAllocated || '0'}</td>
                                <td className="p-3 border-r border-gray-300 text-center font-bold text-gray-600">{log.arrivalTime || '-'} - {log.departureTime || '-'}</td>
                                <td className="p-3 text-center font-black">E:{log.emptyCans || '0'} | F:{log.fullCans || '0'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Task Specific Section */}
                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-6">
                    <div className="p-8 border-2 border-black rounded-3xl bg-gray-50 space-y-8">
                      <div className="grid grid-cols-2 gap-8 border-b-2 border-gray-200 pb-6">
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-500">पुरवठादार / केंद्र</Label>
                          <p className="text-xl font-black flex items-center gap-2 mt-1 text-primary"><User className="h-5 w-5" /> {selectedReport.fullData?.supplierName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-500">कोड (Code)</Label>
                          <p className="text-xl font-black mt-1"><Hash className="h-5 w-5 inline text-primary mr-1" /> {selectedReport.fullData?.supplierId || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest">टास्क तपशील (Work Description)</Label>
                          <h3 className="text-2xl font-black mt-2 leading-tight">{selectedReport.fullData?.title}</h3>
                          <p className="text-sm text-gray-600 mt-4 italic leading-relaxed whitespace-pre-wrap font-medium">{selectedReport.fullData?.description || "तपशील उपलब्ध नाही."}</p>
                        </div>
                        
                        <div className="p-8 bg-blue-50 border-l-8 border-primary rounded-r-2xl">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest">कार्यवाही / शेरा (Action & Remark)</Label>
                          <p className="text-lg font-black mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedReport.fullData?.remark || "शेरा दिलेला नाही."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Visit & Office Work */}
                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-8 border-2 border-black rounded-3xl bg-gray-50/50 min-h-[400px]">
                    <Label className="text-[11px] font-black uppercase mb-6 block text-gray-500 tracking-widest text-center">सविस्तर अहवाल माहिती (Detailed Report Content)</Label>
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 min-h-[300px] shadow-sm">
                      <p className="text-lg leading-loose whitespace-pre-wrap font-black text-gray-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                          : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Signature Section */}
                <div className="pt-24 pb-10">
                  <div className="flex justify-between items-end px-10">
                    <div className="text-center min-w-[220px] space-y-4">
                      <div className="border-b-2 border-black pb-2 flex items-end justify-center">
                        <span className="text-base font-black">{profileName || '-----------------'}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">प्रतिनिधी स्वाक्षरी (REPRESENTATIVE)</span>
                    </div>
                    <div className="text-center min-w-[220px] space-y-4">
                      <div className="border-b-2 border-black pb-2 flex items-end justify-center">
                        <span className="text-base font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">सुपरवायझर स्वाक्षरी (SUPERVISOR)</span>
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
