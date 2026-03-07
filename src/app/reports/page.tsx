
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, Printer, X, Milk, ChevronDown, FileDown
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
      case 'Field Visit': return <Truck className="h-5 w-5" />
      case 'Route Visit': return <Truck className="h-5 w-5" />
      case 'Daily Office Work': return <Briefcase className="h-5 w-5" />
      case 'Daily Task': return <ListTodo className="h-5 w-5" />
      case 'Breakdown': return <Truck className="h-5 w-5" />
      default: return <ClipboardList className="h-5 w-5" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'Field Visit': return 'bg-purple-100 text-purple-600'
      case 'Route Visit': return 'bg-emerald-100 text-emerald-600'
      case 'Daily Office Work': return 'bg-blue-100 text-blue-600'
      case 'Daily Task': return 'bg-orange-100 text-orange-600'
      case 'Breakdown': return 'bg-red-100 text-red-600'
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
    <div className="max-w-full mx-auto w-full pb-10 animate-in fade-in duration-500 print:p-0 overflow-x-hidden">
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

      {/* Header Section */}
      <div className="px-4 space-y-1 no-print">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">View Reports</h2>
        <p className="text-sm font-medium text-slate-500 leading-none">Review and download your daily work documentation.</p>
      </div>

      {/* Stats Badge Box */}
      <div className="mt-6 px-4 no-print">
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-blue-100/50 rounded-lg">
            <Archive className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-black text-blue-700 uppercase tracking-tight">{reports.length} Reports Archived</span>
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="mt-6 px-4 no-print">
        <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-4 space-y-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-1">
                {['All', 'Field Visit', 'Daily Office Work', 'Daily Task'].map((type) => (
                  <Button 
                    key={type}
                    variant={activeFilter === type ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveFilter(type as any)}
                    className={`font-black rounded-xl px-4 text-xs h-9 transition-all ${activeFilter === type ? 'bg-primary text-white shadow-md' : 'text-slate-600'}`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-3 pt-2 border-t">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date:</span>
              <div className="relative flex-1">
                <Input 
                  type="date" 
                  className="h-10 w-full text-xs font-bold bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary pl-3 pr-10" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4 mt-6 no-print px-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${getIconBg(report.type)}`}>
                        {getIcon(report.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900">{report.type}</h4>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-tight">
                          <Calendar className="h-3.5 w-3.5" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono text-slate-400 border-slate-200 h-6 px-2 rounded-lg bg-slate-50">
                        ID: {report.id?.slice(0, 8)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Summary Box */}
                  <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl italic leading-relaxed border border-slate-100 whitespace-normal break-words shadow-inner">
                    {report.summary}
                  </div>

                  {/* Actions Column (Stacked Full Width per Screenshot) */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewReport(report)} 
                      className="w-full font-black text-xs h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex gap-2"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button 
                      onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} 
                      className="w-full font-black text-xs h-11 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex gap-2"
                    >
                      <FileDown className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
             <div className="p-4 bg-slate-50 rounded-full">
               <Archive className="h-10 w-10 text-slate-200" />
             </div>
             <div className="space-y-1">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No reports found</h3>
               <p className="text-xs text-slate-300 font-bold uppercase tracking-tight">Try adjusting your filters</p>
             </div>
          </div>
        )}
      </div>

      {/* Report Modal View (Same logic as before, but ensure it prints well) */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-xl border-none">
          <DialogHeader className="p-3 border-b no-print bg-slate-50 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-xs font-black flex items-center gap-2 px-2 uppercase tracking-widest text-slate-500">
              <FileText className="h-4 w-4 text-primary" /> Review Document
            </DialogTitle>
            <div className="flex gap-2 pr-10">
              <Button size="sm" className="gap-2 font-black rounded-xl bg-primary h-9 text-xs px-4" onClick={handleDownloadPDF}><Printer className="h-4 w-4" /> Print</Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setIsViewOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-6 sm:p-10 space-y-6 bg-white" id="printable-report-content">
                {/* PDF Header Branding */}
                <div className="flex flex-col items-center border-b-2 border-slate-900 pb-6 text-center space-y-3">
                  <div className="flex items-center gap-3">
                    <Milk className="h-8 w-8 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-slate-900">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                    OFFICIAL WORK REPORT
                  </div>
                  <div className="grid grid-cols-3 w-full mt-4 text-[10px] font-black uppercase border-t border-slate-100 pt-6">
                    <div className="flex flex-col text-left"><span className="text-slate-400 text-[8px] tracking-widest">AGENT NAME:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-slate-400 text-[8px] tracking-widest">DATE:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-slate-400 text-[8px] tracking-widest">SHIFT:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {/* Specific Report Sections (Route Visit, Breakdown, etc.) */}
                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3 p-4 border rounded-2xl bg-slate-50/50 shadow-sm">
                      <div><Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">VEHICLE</Label><p className="text-sm font-black text-slate-900">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div><Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">DISTANCE</Label><p className="text-sm font-black text-primary">{selectedReport.fullData?.totalKm || '0'} KM</p></div>
                      <div><Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">TIME (IN/OUT)</Label><p className="text-sm font-black text-slate-900">{selectedReport.fullData?.routeOutTime || '-'}/{selectedReport.fullData?.routeInTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">SHORTAGE</Label><p className="text-sm font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-2xl overflow-hidden border-slate-200">
                      <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-900 text-white border-b border-slate-900">
                          <tr className="uppercase font-black text-[9px] tracking-[0.2em]">
                            <th className="p-3 text-left w-10">#</th>
                            <th className="p-3 text-left">COLLECTION CENTER</th>
                            <th className="p-3 text-center">ICE</th>
                            <th className="p-3 text-center">CANS (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/30">
                              <td className="p-3 text-center font-bold text-slate-300">{idx + 1}</td>
                              <td className="p-3">
                                <p className="font-black text-slate-900 text-sm">{log.centerCode}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{log.supplierName}</p>
                              </td>
                              <td className="p-3 text-center font-black text-slate-700">{log.iceAllocated || '0'}</td>
                              <td className="p-3 text-center font-black">
                                <span className="text-slate-400">E:</span>{log.emptyCans} <span className="mx-1 text-slate-200">|</span> <span className="text-primary">F:</span>{log.fullCans}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Other report types (Briefly) */}
                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work') && (
                  <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/30 shadow-sm space-y-4">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] block border-b pb-2">DETAILED OBSERVATIONS & NOTES</Label>
                    <div className="bg-white p-5 rounded-xl border border-slate-100 min-h-[150px] shadow-inner">
                      <p className="text-sm leading-loose whitespace-pre-wrap font-medium text-slate-800">
                        {selectedReport.type === 'Field Visit' 
                          ? (selectedReport.fullData?.fieldObservations || "No data available.") 
                          : (selectedReport.fullData?.officeTasks || "No data available.")}
                      </p>
                    </div>
                  </div>
                )}

                {/* PDF Footer Signatures */}
                <div className="pt-12 pb-4">
                  <div className="flex justify-between items-end gap-20 px-6">
                    <div className="text-center flex-1 space-y-3">
                      <div className="border-b-2 border-slate-900 pb-2">
                        <span className="text-xs font-black text-slate-900">{profileName || '_________________'}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">REPRESENTATIVE SIGNATURE</span>
                    </div>
                    <div className="text-center flex-1 space-y-3">
                      <div className="border-b-2 border-slate-900 pb-2">
                        <span className="text-xs font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SUPERVISOR SIGNATURE</span>
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
