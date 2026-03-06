
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, Hash, Clock, MapPin, Gauge, User
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
      case 'Field Visit': return <MapPin className="h-5 w-5" />
      case 'Route Visit': return <Truck className="h-5 w-5" />
      case 'Daily Office Work': return <Briefcase className="h-5 w-5" />
      case 'Daily Task': return <ListTodo className="h-5 w-5" />
      default: return <ClipboardList className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Field Visit': return 'bg-purple-100 text-purple-600'
      case 'Route Visit': return 'bg-green-100 text-green-600'
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
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20 print:p-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button { display: none !important; }
          .dialog-content { 
            position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; 
            max-width: none !important; border: none !important; transform: none !important; 
            margin: 0 !important; padding: 0 !important; height: auto !important;
            overflow: visible !important; background: white !important; box-shadow: none !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .card { border: 1.5px solid #000 !important; box-shadow: none !important; break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">अहवाल तपासा (View Reports)</h2>
          <p className="text-muted-foreground mt-1 text-sm">दैनंदिन कामकाजाचे अहवाल तपासा आणि पीडीएफ डाउनलोड करा.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold border border-primary/5 text-sm">
          <Archive className="h-4 w-4" /> {reports.length} Reports Archived
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print bg-card p-2 rounded-xl shadow-sm border items-center">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {['All', 'Route Visit', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className="font-bold rounded-lg px-3 text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            className="h-8 w-full md:w-[150px] text-xs font-bold" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 no-print">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden border-l-4 border-primary hover:shadow-md transition-all bg-white">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                          {getIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base leading-none text-foreground">{report.type}</h4>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1.5 font-bold">
                            <Calendar className="h-3 w-3 text-primary" /> {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">ID: {report.id.slice(0, 8)}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/5 p-3 rounded-lg border-l-2 border-muted italic line-clamp-2">
                      {report.summary}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="font-bold text-xs h-9">
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} className="font-bold text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed flex flex-col items-center gap-2">
             <Archive className="h-12 w-12 text-muted-foreground/20" />
             <h3 className="text-base font-bold text-muted-foreground">No reports found.</h3>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[210mm] h-[95vh] flex flex-col p-0 bg-white overflow-hidden dialog-content">
          <DialogHeader className="p-4 border-b no-print bg-primary/5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                {selectedReport?.type} Report - {selectedReport?.date}
              </DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button size="sm" className="gap-1.5" onClick={handleDownloadPDF}><Download className="h-3.5 w-3.5" /> PDF</Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-8 space-y-6 bg-white" id="printable-report-content">
                <div className="flex flex-col items-center border-b-2 border-black pb-4 text-center">
                  <h1 className="text-xl font-bold uppercase tracking-tight">Procurement Notebook - Collection Report</h1>
                  <h2 className="text-md font-bold">संकलन विभाग - दैनिक अहवाल ({selectedReport.type})</h2>
                  <div className="grid grid-cols-3 w-full mt-4 text-[10px] font-bold uppercase border-t pt-2">
                    <span>प्रतिनिधी: {profileName || selectedReport.fullData?.name || selectedReport.fullData?.userName}</span>
                    <span>दिनांक: {selectedReport.date}</span>
                    <span>शिफ्ट: {selectedReport.fullData?.shift || 'N/A'}</span>
                  </div>
                </div>

                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 p-3 border-2 border-black rounded-lg bg-muted/5">
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">स्लिप नंबर</Label>
                        <p className="text-[10px] font-bold">{selectedReport.fullData?.slipNo}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">वाहन क्र.</Label>
                        <p className="text-[10px] font-bold">{selectedReport.fullData?.vehicleNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">Out Time</Label>
                        <p className="text-[10px] font-bold">{selectedReport.fullData?.routeOutTime}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">In Time</Label>
                        <p className="text-[10px] font-bold">{selectedReport.fullData?.routeInTime}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase text-blue-700">Total KM</Label>
                        <p className="text-[11px] font-bold text-blue-700">{selectedReport.fullData?.totalKm} KM</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">Reading (S/E)</Label>
                        <p className="text-[10px] font-bold">{selectedReport.fullData?.startReading} / {selectedReport.fullData?.endReading}</p>
                      </div>
                    </div>

                    <div className="border-2 border-black rounded-lg overflow-hidden">
                      <table className="w-full text-[8px] border-collapse">
                        <thead className="bg-black text-white">
                          <tr className="uppercase">
                            <th className="p-1 border border-white">Sr.</th>
                            <th className="p-1 border border-white">Code</th>
                            <th className="p-1 border border-white">Supplier</th>
                            <th className="p-1 border border-white">Ice</th>
                            <th className="p-1 border border-white">Arr.</th>
                            <th className="p-1 border border-white">Dep.</th>
                            <th className="p-1 border border-white">Cans</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-black">
                              <td className="p-1 border-r border-black text-center">{idx + 1}</td>
                              <td className="p-1 border-r border-black text-center font-bold">{log.centerCode}</td>
                              <td className="p-1 border-r border-black font-bold">{log.supplierName}</td>
                              <td className="p-1 border-r border-black text-center">{log.iceAllocated}</td>
                              <td className="p-1 border-r border-black text-center">{log.arrivalTime}</td>
                              <td className="p-1 border-r border-black text-center">{log.departureTime}</td>
                              <td className="p-1 border-r border-black text-center">E:{log.emptyCans} F:{log.fullCans}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Daily Task' && (
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-black rounded-lg bg-muted/5">
                      <div className="grid grid-cols-2 gap-4 mb-4 border-b pb-2 border-black/10">
                        <div>
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">गवळ्याचे नाव</Label>
                          <p className="text-sm font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {selectedReport.fullData?.supplierName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">कोड नंबर</Label>
                          <p className="text-sm font-bold flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> {selectedReport.fullData?.supplierId || "N/A"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">टास्क</Label>
                          <p className="text-sm font-bold">{selectedReport.fullData?.title}</p>
                        </div>
                        <div>
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">तपशील</Label>
                          <p className="text-xs italic leading-relaxed whitespace-pre-wrap">{selectedReport.fullData?.description || "तपशील नाही."}</p>
                        </div>
                        <div className="p-3 bg-primary/5 border-l-4 border-primary rounded-r-md">
                          <Label className="text-[9px] font-bold uppercase text-primary">शेरा (Action Plan)</Label>
                          <p className="text-sm font-bold mt-1 whitespace-pre-wrap">{selectedReport.fullData?.remark || "शेरा दिलेला नाही."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-4 border-2 border-black rounded-lg bg-muted/5 min-h-[200px]">
                    <Label className="text-[10px] font-bold uppercase mb-2 block">अहवाल तपशील (Report Details)</Label>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedReport.type === 'Field Visit' 
                        ? (selectedReport.fullData?.fieldObservations || "माहिती उपलब्ध नाही.") 
                        : (selectedReport.fullData?.officeTasks || "माहिती उपलब्ध नाही.")}
                    </p>
                  </div>
                )}

                <div className="pt-20">
                  <div className="flex justify-between items-end">
                    <div className="text-center min-w-[150px]">
                      <div className="border-b-2 border-black mb-1 h-8 flex items-end justify-center">
                        <span className="text-[10px] font-bold mb-1">{profileName || selectedReport.fullData?.name || selectedReport.fullData?.userName}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase">प्रतिनिधी स्वाक्षरी</span>
                    </div>
                    <div className="text-center min-w-[150px]">
                      <div className="border-b-2 border-black mb-1 h-8 flex items-end justify-center">
                        <span className="text-[10px] font-bold mb-1">{selectedReport.fullData?.supervisorName || "N/A"}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase">सुपरवायझर स्वाक्षरी</span>
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
