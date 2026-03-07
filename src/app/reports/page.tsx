
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, Printer, X, Milk
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
  const [activeFilter, setActiveFilter] = useState<ReportType | 'All' | 'Breakdown'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const [profileName, setProfileName] = useState("")
  const { toast } = useToast()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    setReports(stored)
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
      case 'Field Visit': return <Archive className="h-3.5 w-3.5" />
      case 'Route Visit': return <Truck className="h-3.5 w-3.5" />
      case 'Daily Office Work': return <Briefcase className="h-3.5 w-3.5" />
      case 'Daily Task': return <ListTodo className="h-3.5 w-3.5" />
      case 'Breakdown': return <Truck className="h-3.5 w-3.5" />
      default: return <ClipboardList className="h-3.5 w-3.5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Field Visit': return 'bg-purple-500/10 text-purple-600'
      case 'Route Visit': return 'bg-emerald-500/10 text-emerald-600'
      case 'Daily Office Work': return 'bg-blue-500/10 text-blue-600'
      case 'Daily Task': return 'bg-orange-500/10 text-orange-600'
      case 'Breakdown': return 'bg-red-500/10 text-red-600'
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
    <div className="max-w-full mx-auto w-full pb-10 animate-in fade-in duration-500 print:p-0 overflow-x-hidden px-1">
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
          body { background: white !important; padding: 0 !important; }
        }
      `}</style>

      <div className="flex flex-col gap-2 no-print">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" /> अहवाल (Reports)
          </h2>
          <Badge className="bg-primary/10 text-primary font-black text-[9px] h-5 px-2 border-none">
            {reports.length} अहवाल
          </Badge>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5 pb-2 px-1">
            {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task', 'Breakdown'].map((type) => (
              <Button 
                key={type}
                variant={activeFilter === type ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveFilter(type as any)}
                className={`font-black rounded-lg px-2.5 text-[9px] h-7 flex-shrink-0 ${activeFilter === type ? 'shadow-sm' : 'bg-white'}`}
              >
                {type === 'All' ? 'सर्व अहवाल' : type}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm mx-1">
          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
          <Input 
            type="date" 
            className="h-7 w-full text-[10px] font-black bg-muted/20 border-none rounded-md focus-visible:ring-0" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-3 no-print">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border shadow-none overflow-hidden bg-white rounded-xl border-l-4 border-l-primary mx-1">
              <CardContent className="p-2.5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 max-w-[85%]">
                      <div className={`p-1 rounded-lg ${getTypeColor(report.type)}`}>
                        {getIcon(report.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[11px] text-foreground truncate">{report.type}</h4>
                        <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 mt-0.5">
                          <Calendar className="h-2.5 w-2.5" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive rounded-full hover:bg-destructive/5 shrink-0" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground bg-muted/10 p-2 rounded-lg italic leading-tight border border-dashed whitespace-normal break-words">
                    {report.summary}
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="font-black text-[9px] h-7 rounded-lg px-2.5 border-primary/20 text-primary hover:bg-primary/5">
                      <Eye className="h-3 w-3 mr-1" /> पहा
                    </Button>
                    <Button size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="font-black text-[9px] h-7 rounded-lg bg-primary text-white shadow-sm px-2.5">
                      <Download className="h-3 w-3 mr-1" /> प्रिंट
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center gap-3 mx-1">
             <Archive className="h-8 w-8 text-muted-foreground/20" />
             <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">एकही अहवाल सापडला नाही</h3>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-xl border-none">
          <DialogHeader className="p-2 border-b no-print bg-primary/5 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-[10px] font-black flex items-center gap-2 px-2">
              <FileText className="h-3.5 w-3.5 text-primary" /> अहवाल पहा
            </DialogTitle>
            <div className="flex gap-1.5 pr-8">
              <Button size="sm" className="gap-1.5 font-black rounded-lg bg-primary h-7 text-[9px] px-2.5" onClick={handleDownloadPDF}><Printer className="h-3 w-3" /> प्रिंट</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsViewOpen(false)}><X className="h-3.5 w-3.5" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-4 sm:p-6 space-y-4 bg-white" id="printable-report-content">
                <div className="flex flex-col items-center border-b-2 border-black pb-3 text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <Milk className="h-5 w-5 text-black" />
                    <h1 className="text-sm sm:text-base font-black uppercase tracking-tighter">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    WORK REPORT ({selectedReport.type})
                  </div>
                  <div className="grid grid-cols-3 w-full mt-2 text-[9px] font-black uppercase border-t border-gray-100 pt-3">
                    <div className="flex flex-col text-left"><span className="text-gray-400 text-[7px]">नाव:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-gray-400 text-[7px]">तारीख:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-gray-400 text-[7px]">शिफ्ट:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 p-2 border rounded-xl bg-gray-50/50">
                      <div><Label className="text-[7px] font-black uppercase text-gray-500">वाहन</Label><p className="text-[9px] font-black">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-gray-500">KM</Label><p className="text-[9px] font-black text-blue-700">{selectedReport.fullData?.totalKm || '0'}</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-gray-500">वेळ</Label><p className="text-[9px] font-black">{selectedReport.fullData?.routeOutTime || '-'}/{selectedReport.fullData?.routeInTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[7px] font-black uppercase text-gray-500">तूट</Label><p className="text-[9px] font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-xl overflow-hidden border-gray-200">
                      <table className="w-full text-[9px] border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr className="uppercase font-black text-[7px] tracking-wider text-gray-600">
                            <th className="p-2 text-left w-8">#</th>
                            <th className="p-2 text-left">संकलन केंद्र</th>
                            <th className="p-2 text-center">बर्फ</th>
                            <th className="p-2 text-center">कॅन्स (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 odd:bg-white even:bg-gray-50/30">
                              <td className="p-2 text-center font-bold text-gray-400">{idx + 1}</td>
                              <td className="p-2">
                                <p className="font-black text-primary">{log.centerCode}</p>
                                <p className="text-[8px] text-gray-500">{log.supplierName}</p>
                              </td>
                              <td className="p-2 text-center font-bold">{log.iceAllocated || '0'}</td>
                              <td className="p-2 text-center font-black">E:{log.emptyCans} | F:{log.fullCans}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Breakdown' && (
                  <div className="space-y-3">
                    <div className="p-2.5 border-2 border-red-600 rounded-xl bg-red-50/30 space-y-2">
                      <div className="grid grid-cols-2 gap-2 border-b border-red-100 pb-2">
                        <div><Label className="text-[7px] font-black text-gray-400 uppercase">रूट</Label><p className="text-[10px] font-black">{selectedReport.fullData?.routeName}</p></div>
                        <div className="text-right"><Label className="text-[7px] font-black text-gray-400 uppercase">गाडी</Label><p className="text-[10px] font-black">{selectedReport.fullData?.vehicleNumber}</p></div>
                      </div>
                      <div className="p-2 bg-white border rounded-lg">
                        <Label className="text-[7px] font-black text-red-600 uppercase">कारण</Label>
                        <p className="text-[9px] font-medium leading-tight">{selectedReport.fullData?.reason}</p>
                      </div>
                    </div>

                    <div className="border rounded-xl overflow-hidden border-gray-200">
                      <table className="w-full text-[9px] border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr className="uppercase font-black text-[7px] tracking-wider text-gray-600">
                            <th className="p-2 text-left">गवळी</th>
                            <th className="p-2 text-center">म्हेस (L)</th>
                            <th className="p-2 text-center">गाय (L)</th>
                            <th className="p-2 text-right">नुकसान</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.losses?.map((loss: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 odd:bg-white even:bg-gray-50/30">
                              <td className="p-2">
                                <p className="font-black text-[9px]">{loss.supplierName}</p>
                                <p className="text-[7px] text-gray-400">#{loss.supplierCode}</p>
                              </td>
                              <td className="p-2 text-center font-bold">{loss.bufMilkLossLiters || '0'}</td>
                              <td className="p-2 text-center font-bold">{loss.cowMilkLossLiters || '0'}</td>
                              <td className="p-2 text-right font-black text-red-600">₹{loss.lossAmount || '0'}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50">
                            <td className="p-2 font-black text-[9px]">एकूण</td>
                            <td colSpan={3} className="p-2 text-right font-black text-[10px] text-red-700">₹{selectedReport.fullData?.totalLossAmount}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-2">
                    <div className="p-2.5 border-2 border-black rounded-xl bg-gray-50 space-y-2">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                        <div className="min-w-0">
                          <Label className="text-[7px] font-black text-gray-400 uppercase">गवळी</Label>
                          <p className="text-[10px] font-black truncate">{selectedReport.fullData?.supplierName || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <Label className="text-[7px] font-black text-gray-400 uppercase">टास्क</Label>
                          <p className="text-[10px] font-black">{selectedReport.fullData?.title}</p>
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 border-l-4 border-primary rounded-r-lg">
                        <Label className="text-[7px] font-black text-primary uppercase">कार्यवाही / शेरा</Label>
                        <p className="text-[10px] font-black text-gray-800 leading-tight whitespace-pre-wrap">{selectedReport.fullData?.remark || "कोणतीही नोंद नाही."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-2.5 border border-black rounded-xl bg-gray-50/30">
                    <Label className="text-[8px] font-black uppercase mb-2 block text-gray-400 tracking-widest">Observations / Work Detail</Label>
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 min-h-[100px] shadow-sm">
                      <p className="text-[10px] leading-relaxed whitespace-pre-wrap font-medium text-gray-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                          : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6 pb-2">
                  <div className="flex justify-between items-end gap-12 px-4">
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-black pb-1">
                        <span className="text-[10px] font-black">{profileName || '-----------------'}</span>
                      </div>
                      <span className="text-[7px] font-black uppercase text-gray-400 tracking-tighter">प्रतिनिधी स्वाक्षरी</span>
                    </div>
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-black pb-1">
                        <span className="text-[10px] font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[7px] font-black uppercase text-gray-400 tracking-tighter">सुपरवायझर स्वाक्षरी</span>
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
