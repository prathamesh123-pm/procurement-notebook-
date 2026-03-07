
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Download, Trash2, 
  Eye, User, Printer, X, Milk, ChevronDown, FileDown, Edit
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ReportType | 'All' | 'Breakdown'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const [profileName, setProfileName] = useState("")
  const { toast } = useToast()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState({ id: "", summary: "" })

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
      case 'Field Visit': return <Truck className="h-4 w-4" />
      case 'Route Visit': return <Truck className="h-4 w-4" />
      case 'Daily Office Work': return <Briefcase className="h-4 w-4" />
      case 'Daily Task': return <ListTodo className="h-4 w-4" />
      case 'Breakdown': return <Truck className="h-4 w-4" />
      default: return <ClipboardList className="h-4 w-4" />
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
    if (!confirm("तुम्हाला हा रिपोर्ट कायमचा हटवायचा आहे का?")) return
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('procurepal_reports', JSON.stringify(updated))
    toast({ title: "अहवाल हटवला", description: "माहिती यशस्वीरित्या काढून टाकली आहे." })
  }

  const handleEditClick = (report: any) => {
    setEditData({ id: report.id, summary: report.summary })
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    const updated = reports.map(r => r.id === editData.id ? { ...r, summary: editData.summary } : r)
    setReports(updated)
    localStorage.setItem('procurepal_reports', JSON.stringify(updated))
    setIsEditOpen(false)
    toast({ title: "अद्ययावत केले", description: "अहवालाचा सारांश बदलला आहे." })
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
      <div className="px-3 space-y-1 no-print">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">View Reports</h2>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-none">Management Dashboard</p>
      </div>

      {/* Stats Badge Box */}
      <div className="mt-4 px-3 no-print">
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Archive className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">{reports.length} Reports Archived</span>
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="mt-4 px-3 no-print">
        <Card className="border shadow-none rounded-xl overflow-hidden bg-white">
          <CardContent className="p-3 space-y-3">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-1.5 pb-1">
                {['All', 'Field Visit', 'Route Visit', 'Daily Task', 'Breakdown'].map((type) => (
                  <Button 
                    key={type}
                    variant={activeFilter === type ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveFilter(type as any)}
                    className={`font-black rounded-lg px-3 h-8 text-[10px] transition-all ${activeFilter === type ? 'bg-primary text-white' : 'text-slate-600'}`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date:</span>
              <Input 
                type="date" 
                className="h-8 w-full text-[11px] font-bold bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-primary py-0" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-3 mt-4 no-print px-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border shadow-none overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-3.5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${getIconBg(report.type)}`}>
                        {getIcon(report.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[13px] text-slate-900 truncate">{report.type}</h4>
                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                          <Calendar className="h-3 w-3" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[8px] font-mono text-slate-400 border-slate-200 h-5 px-1.5 rounded-md bg-slate-50">
                        ID: {report.id?.slice(0, 6)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-full hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-[11px] text-slate-500 bg-slate-50/50 p-3 rounded-xl italic leading-relaxed border border-slate-100 whitespace-normal break-words shadow-inner">
                    {report.summary}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewReport(report)} 
                      className="w-full font-black text-[10px] h-8 rounded-lg border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex gap-1.5 px-1"
                    >
                      <Eye className="h-3 w-3" /> पहा
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditClick(report)}
                      className="w-full font-black text-[10px] h-8 rounded-lg border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex gap-1.5 px-1"
                    >
                      <Edit className="h-3 w-3" /> एडिट
                    </Button>
                    <Button 
                      onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} 
                      className="w-full font-black text-[10px] h-8 rounded-lg bg-primary text-white shadow-sm flex gap-1.5 px-1"
                    >
                      <FileDown className="h-3 w-3" /> प्रिंट
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-3">
             <Archive className="h-8 w-8 text-slate-200" />
             <div className="space-y-0.5">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No reports found</h3>
               <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">Try adjusting filters</p>
             </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-4 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase">रिपोर्ट एडिट करा</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label className="text-[10px] font-black uppercase">सारांश / टिप (Summary)</Label>
            <Textarea 
              value={editData.summary} 
              onChange={e => setEditData({...editData, summary: e.target.value})} 
              className="min-h-[120px] text-xs font-bold bg-muted/20"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="h-9 text-xs font-black">रद्द</Button>
            <Button onClick={handleSaveEdit} className="h-9 text-xs font-black px-8">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal View */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl h-[95vh] sm:h-[90vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-xl border-none">
          <DialogHeader className="p-2 border-b no-print bg-slate-50 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-[10px] font-black flex items-center gap-2 px-2 uppercase tracking-widest text-slate-500">
              <FileText className="h-3.5 w-3.5 text-primary" /> Document View
            </DialogTitle>
            <div className="flex gap-1.5 pr-8">
              <Button size="sm" className="gap-1.5 font-black rounded-lg bg-primary h-8 text-[10px] px-3" onClick={handleDownloadPDF}><Printer className="h-3.5 w-3.5" /> Print</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsViewOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow">
            {selectedReport && (
              <div className="p-4 sm:p-8 space-y-5 bg-white" id="printable-report-content">
                <div className="flex flex-col items-center border-b-2 border-slate-900 pb-4 text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <Milk className="h-6 w-6 text-primary" />
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-slate-900">PROCUREMENT NOTEBOOK</h1>
                  </div>
                  <div className="bg-slate-900 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                    OFFICIAL WORK REPORT
                  </div>
                  <div className="grid grid-cols-3 w-full mt-3 text-[9px] font-black uppercase border-t border-slate-100 pt-4">
                    <div className="flex flex-col text-left"><span className="text-slate-400 text-[7px] tracking-widest">AGENT:</span> {profileName || selectedReport.fullData?.name || 'N/A'}</div>
                    <div className="flex flex-col text-center"><span className="text-slate-400 text-[7px] tracking-widest">DATE:</span> {selectedReport.date}</div>
                    <div className="flex flex-col text-right"><span className="text-slate-400 text-[7px] tracking-widest">SHIFT:</span> {selectedReport.fullData?.shift || 'N/A'}</div>
                  </div>
                </div>

                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 p-3 border rounded-xl bg-slate-50/50">
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">VEHICLE</Label><p className="text-[11px] font-black text-slate-900">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">DISTANCE</Label><p className="text-[11px] font-black text-primary">{selectedReport.fullData?.totalKm || '0'} KM</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">TIME</Label><p className="text-[11px] font-black text-slate-900">{selectedReport.fullData?.routeOutTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[7px] font-black uppercase text-slate-400">SHORTAGE</Label><p className="text-[11px] font-black text-red-600">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-xl overflow-hidden border-slate-200 overflow-x-auto">
                      <table className="w-full text-[10px] border-collapse min-w-[300px]">
                        <thead className="bg-slate-900 text-white">
                          <tr className="uppercase font-black text-[8px] tracking-widest">
                            <th className="p-2 text-left w-8">#</th>
                            <th className="p-2 text-left">CENTER</th>
                            <th className="p-2 text-center">ICE</th>
                            <th className="p-2 text-center">CANS (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/30">
                              <td className="p-2 text-center font-bold text-slate-300">{idx + 1}</td>
                              <td className="p-2">
                                <p className="font-black text-slate-900">{log.centerCode}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase truncate max-w-[80px]">{log.supplierName}</p>
                              </td>
                              <td className="p-2 text-center font-black text-slate-700">{log.iceAllocated || '0'}</td>
                              <td className="p-2 text-center font-black">
                                <span className="text-slate-400">E:</span>{log.emptyCans} <span className="mx-0.5 text-slate-200">|</span> <span className="text-primary">F:</span>{log.fullCans}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReport.type === 'Breakdown' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-3 border rounded-xl bg-red-50/30">
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">ROUTE</Label><p className="text-[11px] font-black">{selectedReport.fullData?.routeName}</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">VEHICLE</Label><p className="text-[11px] font-black">{selectedReport.fullData?.vehicleNumber} ({selectedReport.fullData?.vehicleType})</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">LOCATION</Label><p className="text-[11px] font-black">{selectedReport.fullData?.location}</p></div>
                      <div><Label className="text-[7px] font-black uppercase text-slate-400">TOTAL LOSS</Label><p className="text-[11px] font-black text-red-600">₹{selectedReport.fullData?.totalLossAmount}</p></div>
                    </div>
                    <div className="border rounded-xl overflow-hidden border-slate-200">
                      <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-slate-900 text-white">
                          <tr className="uppercase font-black text-[8px] tracking-widest">
                            <th className="p-2 text-left">SUPPLIER</th>
                            <th className="p-2 text-center">BUF</th>
                            <th className="p-2 text-center">COW</th>
                            <th className="p-2 text-right">AMT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.losses?.map((loss: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/30">
                              <td className="p-2">
                                <p className="font-black text-slate-900">{loss.supplierCode}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">{loss.supplierName}</p>
                              </td>
                              <td className="p-2 text-center font-black">{loss.bufMilkLossLiters}L</td>
                              <td className="p-2 text-center font-black">{loss.cowMilkLossLiters}L</td>
                              <td className="p-2 text-right font-black text-red-600">₹{loss.lossAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work' || selectedReport.type === 'Daily Task') && (
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-2">
                    <Label className="text-[8px] font-black uppercase text-slate-400 tracking-widest block border-b pb-1">OBSERVATIONS & NOTES</Label>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 min-h-[100px]">
                      <p className="text-[11px] leading-relaxed whitespace-pre-wrap font-medium text-slate-800">
                        {selectedReport.summary || "No data available."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-8 pb-2">
                  <div className="flex justify-between items-end gap-10 px-4">
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-slate-900 pb-1">
                        <span className="text-[10px] font-black text-slate-900">{profileName || '_________________'}</span>
                      </div>
                      <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">AGENT SIGNATURE</span>
                    </div>
                    <div className="text-center flex-1 space-y-2">
                      <div className="border-b border-slate-900 pb-1">
                        <span className="text-[10px] font-black text-transparent">SIGNATURE</span>
                      </div>
                      <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">SUPERVISOR SIGNATURE</span>
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
