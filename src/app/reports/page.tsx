
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, Hash, User, ChevronRight, Search, Printer, X
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
      case 'Field Visit': return <Search className="h-4 w-4" />
      case 'Route Visit': return <Truck className="h-4 w-4" />
      case 'Daily Office Work': return <Briefcase className="h-4 w-4" />
      case 'Daily Task': return <ListTodo className="h-4 w-4" />
      default: return <ClipboardList className="h-4 w-4" />
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
    <div className="space-y-3 max-w-4xl mx-auto w-full pb-10 animate-in fade-in duration-500 print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
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
          .card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
          body { background: white !important; padding: 0 !important; }
          #printable-report-content { width: 100% !important; padding: 0 !important; margin: 0 !important; border: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print px-2">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" /> अहवाल (Reports)
          </h2>
        </div>
        <div className="bg-primary/5 px-2 py-1 rounded-lg text-primary font-black border border-primary/10 flex items-center gap-2 w-fit">
          <Badge className="bg-primary text-white font-black text-[8px] h-4">{reports.length}</Badge>
          <span className="text-[8px] uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-2 no-print mx-2">
        <ScrollArea className="w-full whitespace-nowrap pb-1">
          <div className="flex gap-1">
            {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
              <Button 
                key={type}
                variant={activeFilter === type ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveFilter(type as any)}
                className={`font-black rounded-lg px-2 text-[8px] h-7 transition-all flex-shrink-0 ${activeFilter === type ? 'shadow-sm' : 'bg-white'}`}
              >
                {type === 'All' ? 'सर्व' : type}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm">
          <Calendar className="h-3 w-3 text-primary shrink-0" />
          <Input 
            type="date" 
            className="h-7 w-full text-[9px] font-black bg-muted/30 border-none rounded-md" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-1.5 no-print px-2">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 bg-white group rounded-lg border-l-4 border-l-primary">
              <CardContent className="p-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1.5 rounded-md ${getTypeColor(report.type)}`}>
                        {getIcon(report.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-[10px] text-foreground truncate max-w-[150px]">{report.type}</h4>
                        <p className="text-[7px] text-muted-foreground font-black uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                          <Calendar className="h-2 w-2" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive rounded-full" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-[9px] text-muted-foreground bg-muted/10 p-1.5 rounded-md italic leading-tight line-clamp-1 border border-dashed">
                    {report.summary}
                  </div>

                  <div className="flex gap-1.5 pt-0.5">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="flex-1 font-black text-[8px] h-7 rounded-md border">
                      <Eye className="h-2.5 w-2.5 mr-1" /> पाहणी
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="flex-1 font-black text-[8px] h-7 rounded-md bg-primary text-white shadow-sm">
                      <Download className="h-2.5 w-2.5 mr-1" /> प्रिंट
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center gap-1">
             <Archive className="h-6 w-6 text-muted-foreground/20" />
             <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">No Reports</h3>
          </div>
        )}
      </div>

      {/* Full Screen Report View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl h-[95vh] sm:h-[85vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-xl border-none">
          <DialogHeader className="p-2 border-b no-print bg-primary/5 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-[10px] font-black flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-primary" /> अहवाल (Report View)
            </DialogTitle>
            <div className="flex gap-1.5 pr-8">
              <Button size="sm" className="gap-1 font-black rounded-md bg-primary h-7 text-[8px] px-2" onClick={handleDownloadPDF}><Printer className="h-2.5 w-2.5" /> प्रिंट</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsViewOpen(false)}><X className="h-3.5 w-3.5" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-3 sm:p-6 space-y-4 bg-white" id="printable-report-content">
                {/* Compact Header */}
                <div className="flex flex-col items-center border-b border-black pb-2 text-center space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-black" />
                    <h1 className="text-sm sm:text-base font-black uppercase tracking-tighter">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-black text-white px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                    DAILY WORK REPORT ({selectedReport.type})
                  </div>
                  <div className="grid grid-cols-3 w-full mt-2 text-[7px] sm:text-[9px] font-black uppercase border-t border-gray-100 pt-1.5">
                    <div className="flex flex-col text-left"><span className="text-gray-400">नाव:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-gray-400">तारीख:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-gray-400">शिफ्ट:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {/* Route Visit Content */}
                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 p-2 border rounded-lg bg-gray-50/50">
                      <div><Label className="text-[6px] font-black uppercase text-gray-500">वाहन</Label><p className="text-[9px] font-black">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div><Label className="text-[6px] font-black uppercase text-gray-500">KM</Label><p className="text-[9px] font-black text-blue-700">{selectedReport.fullData?.totalKm || '0'}</p></div>
                      <div><Label className="text-[6px] font-black uppercase text-gray-500">वेळ</Label><p className="text-[9px] font-black">{selectedReport.fullData?.routeOutTime || '-'}/{selectedReport.fullData?.routeInTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[6px] font-black uppercase text-gray-500">तूट</Label><p className="text-[9px] font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-lg overflow-hidden border-gray-200">
                      <table className="w-full text-[8px] border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr className="uppercase font-black text-[6px] tracking-wider text-gray-600">
                            <th className="p-1.5 text-left w-5">#</th>
                            <th className="p-1.5 text-left">केंद्राचे नाव (Center)</th>
                            <th className="p-1.5 text-center">बर्फ</th>
                            <th className="p-1.5 text-center">Cans (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 odd:bg-white even:bg-gray-50/30">
                              <td className="p-1.5 text-center font-bold text-gray-400">{idx + 1}</td>
                              <td className="p-1.5">
                                <span className="font-black text-primary mr-1">{log.centerCode}</span>
                                <span className="text-[7px] text-gray-500">{log.supplierName}</span>
                              </td>
                              <td className="p-1.5 text-center font-bold">{log.iceAllocated || '0'}</td>
                              <td className="p-1.5 text-center font-black">E:{log.emptyCans} | F:{log.fullCans}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Daily Task Content - Highly Optimized for Space */}
                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-2">
                    <div className="p-2.5 border-2 border-black rounded-lg bg-gray-50 space-y-2">
                      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-1.5">
                        <div><Label className="text-[6px] font-black text-gray-400 uppercase">गवळी (Supplier)</Label><p className="text-[9px] font-black">{selectedReport.fullData?.supplierName || "N/A"}</p></div>
                        <div className="text-right"><Label className="text-[6px] font-black text-gray-400 uppercase">कोड</Label><p className="text-[9px] font-black">#{selectedReport.fullData?.supplierId || "N/A"}</p></div>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <Label className="text-[6px] font-black text-primary uppercase">टास्क नाव (Task)</Label>
                          <h3 className="text-[10px] font-black leading-tight">{selectedReport.fullData?.title}</h3>
                        </div>
                        {selectedReport.fullData?.description && (
                          <div className="bg-white/50 p-1.5 rounded border border-gray-100">
                            <Label className="text-[6px] font-black text-gray-400 uppercase">तपशील (Details)</Label>
                            <p className="text-[8px] text-gray-600 leading-normal">{selectedReport.fullData?.description}</p>
                          </div>
                        )}
                        <div className="p-1.5 bg-blue-50 border-l-2 border-primary rounded-r">
                          <Label className="text-[6px] font-black text-primary uppercase">कार्यवाही / शेरा (Remark)</Label>
                          <p className="text-[9px] font-black text-gray-800 leading-tight">{selectedReport.fullData?.remark || "कोणतीही नोंद नाही."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Visit & Office Work Content */}
                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-2.5 border border-black rounded-lg bg-gray-50/30">
                    <Label className="text-[7px] font-black uppercase mb-1.5 block text-gray-400 tracking-widest">Observations / Work Detail</Label>
                    <div className="bg-white p-2.5 rounded border border-gray-200 min-h-[100px] shadow-sm">
                      <p className="text-[9px] leading-relaxed whitespace-pre-wrap font-medium text-gray-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                          : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Optimized Signature View */}
                <div className="pt-6 pb-2">
                  <div className="flex justify-between items-end gap-10 px-4">
                    <div className="text-center flex-1 space-y-1">
                      <div className="border-b border-black pb-0.5">
                        <span className="text-[9px] font-black">{profileName || '-----------------'}</span>
                      </div>
                      <span className="text-[6px] font-black uppercase text-gray-400 tracking-tighter">प्रतिनिधी स्वाक्षरी (User Sign)</span>
                    </div>
                    <div className="text-center flex-1 space-y-1">
                      <div className="border-b border-black pb-0.5">
                        <span className="text-[9px] font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[6px] font-black uppercase text-gray-400 tracking-tighter">सुपरवायझर स्वाक्षरी (Supervisor)</span>
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
