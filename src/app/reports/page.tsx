
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
      case 'Field Visit': return <Search className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'Route Visit': return <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'Daily Office Work': return <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'Daily Task': return <ListTodo className="h-4 w-4 sm:h-5 sm:w-5" />
      default: return <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
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
    <div className="space-y-4 max-w-5xl mx-auto w-full pb-20 animate-in fade-in duration-500 print:p-0 print:m-0">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print px-2">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल (Reports)
          </h2>
          <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest">Archive & Documentation</p>
        </div>
        <div className="bg-primary/5 px-3 py-1.5 rounded-xl text-primary font-black border border-primary/10 flex items-center gap-2 w-fit">
          <Badge className="bg-primary text-white font-black text-[9px] h-5">{reports.length}</Badge>
          <span className="text-[9px] uppercase tracking-wider">Total Reports</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-2 no-print mx-2">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-1.5">
            {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
              <Button 
                key={type}
                variant={activeFilter === type ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveFilter(type as any)}
                className={`font-black rounded-lg px-3 text-[9px] h-8 transition-all flex-shrink-0 ${activeFilter === type ? 'shadow-md' : 'bg-white'}`}
              >
                {type === 'All' ? 'सर्व' : type}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
          <Input 
            type="date" 
            className="h-8 w-full text-[10px] font-black bg-muted/30 border-none rounded-lg" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-2 no-print px-2">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 bg-white group rounded-xl border-l-4 border-l-primary">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                        {getIcon(report.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-foreground truncate max-w-[150px] sm:max-w-none">{report.type}</h4>
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wider flex items-center gap-1 mt-0.5">
                          <Calendar className="h-2.5 w-2.5" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-full" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded-lg italic leading-relaxed line-clamp-1 border border-dashed">
                    {report.summary}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="flex-1 font-black text-[9px] h-8 rounded-lg border-2">
                      <Eye className="h-3 w-3 mr-1" /> पाहणी (View)
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="flex-1 font-black text-[9px] h-8 rounded-lg bg-primary text-white shadow-sm">
                      <Download className="h-3 w-3 mr-1" /> PDF / प्रिंट
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center gap-2">
             <Archive className="h-8 w-8 text-muted-foreground/20" />
             <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Reports Found</h3>
          </div>
        )}
      </div>

      {/* Full Screen Report View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl h-[98vh] sm:h-[90vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-2xl border-none">
          <DialogHeader className="p-3 border-b no-print bg-primary/5 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-xs font-black flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" /> अहवाल तपशील (Report Details)
            </DialogTitle>
            <div className="flex gap-2 pr-8">
              <Button size="sm" className="gap-1 font-black rounded-lg bg-primary h-8 text-[9px] px-3" onClick={handleDownloadPDF}><Printer className="h-3 w-3" /> प्रिंट (Print)</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsViewOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-4 sm:p-10 space-y-6 bg-white" id="printable-report-content">
                {/* Header Style */}
                <div className="flex flex-col items-center border-b-2 border-black pb-4 text-center space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-6 w-6 text-black" />
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-black text-white px-4 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                    DAILY WORK REPORT ({selectedReport.type})
                  </div>
                  <div className="grid grid-cols-3 w-full mt-4 text-[8px] sm:text-[10px] font-black uppercase border-t pt-3">
                    <div className="flex flex-col text-left"><span className="text-gray-500">प्रतिनिधी:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-gray-500">दिनांक:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-gray-500">शिफ्ट:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {/* Route Visit Content */}
                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-3 border rounded-xl bg-gray-50/50">
                      <div><Label className="text-[8px] font-black uppercase text-gray-500">वाहन क्र.</Label><p className="text-[10px] font-black">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div className="text-right"><Label className="text-[8px] font-black uppercase text-gray-500">एकूण अंतर</Label><p className="text-[10px] font-black text-blue-700">{selectedReport.fullData?.totalKm || '0'} KM</p></div>
                      <div><Label className="text-[8px] font-black uppercase text-gray-500">वेळ (Out/In)</Label><p className="text-[10px] font-black">{selectedReport.fullData?.routeOutTime || '-'} / {selectedReport.fullData?.routeInTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[8px] font-black uppercase text-gray-500">दूध तूट</Label><p className="text-[10px] font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-[9px] border-collapse">
                          <thead className="bg-black text-white">
                            <tr className="uppercase font-black text-[8px] tracking-widest">
                              <th className="p-2 text-left w-6">Sr.</th>
                              <th className="p-2 text-left">कोड/नाव (Center)</th>
                              <th className="p-2 text-center">बर्फ</th>
                              <th className="p-2 text-center">Cans (E/F)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-200 odd:bg-white even:bg-gray-50/50">
                                <td className="p-2 text-center font-black">{idx + 1}</td>
                                <td className="p-2">
                                  <div className="font-black text-primary">{log.centerCode}</div>
                                  <div className="text-[8px] font-bold text-gray-600">{log.supplierName}</div>
                                </td>
                                <td className="p-2 text-center font-black">{log.iceAllocated || '0'}</td>
                                <td className="p-2 text-center font-black">E:{log.emptyCans} | F:{log.fullCans}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Task Content */}
                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-black rounded-xl bg-gray-50 space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div><Label className="text-[8px] font-black text-gray-500 uppercase">पुरवठादार</Label><p className="text-xs font-black text-primary">{selectedReport.fullData?.supplierName || "N/A"}</p></div>
                        <div className="text-right"><Label className="text-[8px] font-black text-gray-500 uppercase">कोड</Label><p className="text-xs font-black">#{selectedReport.fullData?.supplierId || "N/A"}</p></div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border shadow-sm">
                          <Label className="text-[8px] font-black text-primary uppercase">टास्क (Work Title)</Label>
                          <h3 className="text-sm font-black mt-1">{selectedReport.fullData?.title}</h3>
                          <p className="text-[10px] text-gray-600 mt-2 italic leading-relaxed whitespace-pre-wrap">{selectedReport.fullData?.description}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border-l-4 border-primary rounded-r-lg">
                          <Label className="text-[8px] font-black text-primary uppercase">कार्यवाही (Remark)</Label>
                          <p className="text-xs font-black mt-1 text-gray-800 whitespace-pre-wrap">{selectedReport.fullData?.remark || "कोणताही शेरा नाही."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field Visit & Office Work Content */}
                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-4 border-2 border-black rounded-xl bg-gray-50/50">
                    <Label className="text-[9px] font-black uppercase mb-3 block text-gray-500 text-center tracking-widest">Detailed Content</Label>
                    <div className="bg-white p-4 rounded-lg border min-h-[200px] shadow-sm">
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-black text-gray-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                          : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Signature View */}
                <div className="pt-12 pb-6">
                  <div className="flex justify-between items-end gap-4">
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-black pb-1">
                        <span className="text-[10px] font-black">{profileName || '-----------------'}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">प्रतिनिधी स्वाक्षरी</span>
                    </div>
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-black pb-1">
                        <span className="text-[10px] font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">सुपरवायझर स्वाक्षरी</span>
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
