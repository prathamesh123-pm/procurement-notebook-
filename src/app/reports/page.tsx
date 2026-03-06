"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, Activity, ShieldCheck, Settings, MessageSquare, Hash, Info, Clock, IceCream, Package
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const MOCK_REPORTS: any[] = []

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
    setReports(stored)
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

  const relatedReports = useMemo(() => {
    if (!selectedReport || selectedReport.type !== 'Daily Task') return [selectedReport];
    return reports.filter(r => r.type === 'Daily Task' && r.date === selectedReport.date);
  }, [selectedReport, reports]);

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20 print:p-0" id="printable-reports">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          .no-print { display: none !important; }
          header, sidebar, nav, .sidebar-trigger, button, .tabs-list { display: none !important; }
          .dialog-content { 
            position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; 
            max-width: none !important; border: none !important; transform: none !important; 
            margin: 0 !important; padding: 0 !important; height: auto !important;
            overflow: visible !important; background: white !important; box-shadow: none !important;
          }
          .dialog-overlay { display: none !important; }
          .scroll-area-viewport { overflow: visible !important; height: auto !important; }
          .card { border: 1px solid #000 !important; box-shadow: none !important; margin-bottom: 10px !important; break-inside: avoid; }
          body { background: white !important; font-family: 'Inter', sans-serif; }
          .print-header { border-bottom: 1.5px solid #000 !important; margin-bottom: 8px !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">View Reports</h2>
          <p className="text-muted-foreground mt-1 text-sm">Review and download your daily work documentation.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold border border-primary/5 text-sm">
          <Archive className="h-4 w-4" /> {reports.length} Reports Archived
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print bg-card p-2 rounded-xl shadow-sm border items-center">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {['All', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className="font-bold rounded-lg px-3 text-xs"
            >
              {type === 'All' ? 'All' : type}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Date:</label>
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
                          <p className="text-[9px] text-muted-foreground flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-wider">
                            <Calendar className="h-3 w-3 text-primary" /> {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] px-2 py-0.5">ID: {report.id.slice(0, 8)}</Badge>
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
        <DialogContent className="max-w-[210mm] h-[95vh] flex flex-col p-0 dialog-content bg-white overflow-hidden shadow-2xl">
          <DialogHeader className="p-3 border-b no-print shrink-0 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  {selectedReport && getIcon(selectedReport.type)}
                  {selectedReport?.type} Report
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Date: {selectedReport?.date}
                </DialogDescription>
              </div>
              <div className="flex gap-2 no-print">
                <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button size="sm" className="h-8 text-xs font-bold gap-1.5" onClick={handleDownloadPDF}><Download className="h-3 w-3" /> PDF</Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            <div className="p-[5mm] space-y-3 max-w-full mx-auto bg-white" id="printable-report-content">
              <div className="flex flex-col items-center border-b-[1.5px] border-black pb-1 mb-2 text-center print-header">
                <h1 className="text-sm font-bold uppercase">Procurement Notebook - Operations</h1>
                <h2 className="text-xs font-bold">संकलन विभाग - दैनिक कामकाज अहवाल (DWR)</h2>
                <p className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground">Collection Department - Daily Work Report</p>
              </div>

              {selectedReport?.type === 'Field Visit' ? (
                <>
                  <div className="grid grid-cols-4 gap-2 border p-2 rounded-md bg-muted/5 mb-3">
                    <div className="space-y-0.5">
                      <Label className="text-[7px] font-bold uppercase">स्लिप नंबर</Label>
                      <p className="text-[10px] font-bold">{selectedReport.fullData?.slipNo || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[7px] font-bold uppercase">वाहन</Label>
                      <p className="text-[10px] font-bold">{selectedReport.fullData?.vehicleNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[7px] font-bold uppercase">निघण्याची वेळ</Label>
                      <p className="text-[10px] font-bold">{selectedReport.fullData?.routeOutTime || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[7px] font-bold uppercase">परतण्याची वेळ</Label>
                      <p className="text-[10px] font-bold">{selectedReport.fullData?.routeInTime || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[9px] font-bold uppercase border-l-4 border-black pl-2 mb-1.5 bg-muted/20 py-1">केंद्रांची माहिती (Visit & Logistics Logs)</h3>
                    {selectedReport?.fullData?.centerVisits?.map((visit: any, index: number) => (
                      <div key={visit.id} className="border-2 border-black rounded-lg overflow-hidden break-inside-avoid mb-3 bg-white shadow-sm">
                        <div className="bg-black text-white px-2 py-1 flex justify-between items-center">
                          <span className="text-[8px] font-bold uppercase">Visit #{index + 1}: {visit.name}</span>
                          <span className="text-[7px] font-bold">In: {visit.arrivalTime} | Out: {visit.departureTime}</span>
                        </div>
                        <div className="p-2 space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-1.5 border border-black/10 rounded bg-blue-50/5">
                              <span className="text-[6px] font-bold text-blue-700 block uppercase">Ice Usage</span>
                              <p className="text-[8px] font-bold">Allo: {visit.iceAllocated} | Used: {visit.iceUsed}</p>
                            </div>
                            <div className="p-1.5 border border-black/10 rounded bg-amber-50/5">
                              <span className="text-[6px] font-bold text-amber-700 block uppercase">Cans Tracking</span>
                              <p className="text-[8px] font-bold">Empty: {visit.emptyCansUnloaded} | Full: {visit.fullCansLoaded}</p>
                            </div>
                            <div className="p-1.5 border border-black/10 rounded bg-red-50/5">
                              <span className="text-[6px] font-bold text-red-700 block uppercase">Inspection</span>
                              <p className="text-[8px] font-bold">Seized: {visit.seizedMilk}L</p>
                              <p className="text-[7px] italic">{visit.inspectionResult}</p>
                            </div>
                            <div className="p-1.5 border border-black/10 rounded bg-green-50/5">
                              <span className="text-[6px] font-bold text-green-700 block uppercase">Quality</span>
                              <p className="text-[7px] font-bold">M: {visit.mixQty}L / {visit.mixFat}%</p>
                              <p className="text-[7px] font-bold">C: {visit.cowQty}L / {visit.cowFat}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase text-muted-foreground">दिलेल्या सूचना / शेरा</Label>
                              <p className="text-[8px] italic leading-tight">{visit.remark || "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[7px] font-bold uppercase text-muted-foreground">निरीक्षण</Label>
                              <p className="text-[8px] italic leading-tight">{visit.observation || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-center py-10 text-muted-foreground">
                  Detailed view for this report type is under development.
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-black/10">
                <h3 className="text-[9px] font-bold uppercase border-l-4 border-black pl-2 mb-1.5 bg-muted/20 py-1">दिवसाचा सारांश (Day Summary)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[7px] font-bold uppercase text-green-700">कामगिरी</Label>
                    <div className="p-2 border rounded-md text-[8px] min-h-[40px] italic bg-green-50/5">{selectedReport?.fullData?.achievements || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[7px] font-bold uppercase text-red-700">समस्या</Label>
                    <div className="p-2 border rounded-md text-[8px] min-h-[40px] italic bg-red-50/5">{selectedReport?.fullData?.problems || "N/A"}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[7px] font-bold uppercase text-blue-700">कार्यवाही</Label>
                    <div className="p-2 border rounded-md text-[8px] min-h-[40px] italic bg-blue-50/5">{selectedReport?.fullData?.actionsTaken || "N/A"}</div>
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <div className="text-center min-w-[150px]">
                    <div className="border-b border-black mb-1 h-[25px] flex items-end justify-center">
                       <span className="text-[10px] font-bold mb-0.5">{selectedReport?.fullData?.supervisorName}</span>
                    </div>
                    <Label className="text-[8px] font-bold uppercase block">Supervisor Signature</Label>
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
