"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, FileText, ClipboardList, 
  Briefcase, ListTodo, Truck, Trash2, 
  Eye, Printer, X, Milk, FileDown, Edit, AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'dailyWorkReports')
  }, [db, user])

  const { data: firestoreReports, isLoading } = useCollection(reportsQuery)
  
  const [activeFilter, setActiveFilter] = useState<string | 'All'>('All')
  const [filterDate, setFilterDate] = useState<string>("")
  const [profileName, setProfileName] = useState("")

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState({ id: "", summary: "" })

  useEffect(() => {
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    setProfileName(savedName)
  }, [])

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesType = activeFilter === 'All' || r.type === activeFilter
      const matchesDate = filterDate === "" || r.date === filterDate
      return matchesType && matchesDate
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, activeFilter, filterDate])

  const getIcon = (type: string) => {
    switch (type) {
      case 'Field Visit': return <Truck className="h-4 w-4" />
      case 'Route Visit': return <Truck className="h-4 w-4" />
      case 'Daily Office Work': return <Briefcase className="h-4 w-4" />
      case 'Daily Task': return <ListTodo className="h-4 w-4" />
      case 'Breakdown': return <AlertCircle className="h-4 w-4" />
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

  const handleDelete = (e: React.MouseEvent | null, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!id || !db || !user) return
    const confirmDelete = window.confirm("तुम्हाला हा अहवाल कायमचा हटवायचा आहे का?")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', id)
      deleteDocumentNonBlocking(docRef)
      
      if (selectedReport && selectedReport.id === id) {
        setIsViewOpen(false)
        setSelectedReport(null)
      }
      
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला आहे." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "अहवाल हटवताना अडचण आली.", variant: "destructive" })
    }
  }

  const handleEditClick = (report: any) => {
    setEditData({ id: report.id, summary: report.summary || report.overallSummary })
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!db || !user || !editData.id) return
    const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editData.id)
    updateDocumentNonBlocking(docRef, { summary: editData.summary, overallSummary: editData.summary })
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

  if (isLoading) return <div className="p-10 text-center italic text-muted-foreground">लोड होत आहे...</div>

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

      <div className="px-3 space-y-1 no-print">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">अहवाल व्यवस्थापन (Reports)</h2>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">View and Manage Reports</p>
      </div>

      <div className="mt-4 px-3 no-print">
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Archive className="h-4 w-4 text-white" />
          </div>
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">{filteredReports.length} अहवाल सापडले</span>
        </div>
      </div>

      <div className="mt-4 px-3 no-print">
        <Card className="border shadow-none rounded-xl overflow-hidden bg-white">
          <CardContent className="p-2.5 space-y-3">
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
                    {type === 'All' ? 'सर्व' : type === 'Field Visit' ? 'क्षेत्र भेट' : type === 'Route Visit' ? 'रूट भेट' : type === 'Daily Task' ? 'टास्क' : 'ब्रेकडाऊन'}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">तारीख:</span>
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

      <div className="grid grid-cols-1 gap-3 mt-4 no-print px-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="border shadow-none overflow-hidden bg-white rounded-2xl transition-all relative">
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
                          <Calendar className="h-3 w-3" /> {report.date || report.reportDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 relative z-30">
                      <Badge variant="outline" className="text-[8px] font-mono text-slate-400 border-slate-200 h-5 px-1.5 rounded-md bg-slate-50">
                        ID: {String(report.id)?.slice(-6)}
                      </Badge>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive rounded-full hover:bg-red-50" 
                        onClick={(e) => handleDelete(e, report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-[11px] text-slate-500 bg-slate-50/50 p-3 rounded-xl italic leading-relaxed border border-slate-100 whitespace-normal break-words shadow-inner">
                    {report.summary || report.overallSummary}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewReport(report)} 
                      className="w-full font-black text-[10px] h-8 rounded-lg border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex gap-1 px-1"
                    >
                      <Eye className="h-3 w-3" /> पहा
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditClick(report)}
                      className="w-full font-black text-[10px] h-8 rounded-lg border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex gap-1 px-1"
                    >
                      <Edit className="h-3 w-3" /> एडिट
                    </Button>
                    <Button 
                      onClick={() => { setSelectedReport(report); setTimeout(handleDownloadPDF, 100); }} 
                      className="w-full font-black text-[10px] h-8 rounded-lg bg-primary text-white shadow-sm flex gap-1 px-1"
                    >
                      <FileDown className="h-3 w-3" /> प्रिंट
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-3 opacity-50">
             <Archive className="h-8 w-8 text-slate-200" />
             <div className="space-y-0.5">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No reports found</h3>
               <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">कृपया फिल्टर तपासा</p>
             </div>
          </div>
        )}
      </div>

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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl h-[95vh] sm:h-[90vh] flex flex-col p-0 bg-white overflow-hidden rounded-none sm:rounded-xl border-none">
          <DialogHeader className="p-2 border-b no-print bg-slate-100 flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-[10px] font-black flex items-center gap-2 px-2 uppercase tracking-widest text-slate-600">
              <FileText className="h-3.5 w-3.5 text-primary" /> अहवाल पाहणी
            </DialogTitle>
            <div className="flex gap-1.5 pr-8">
              <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black text-destructive" onClick={() => selectedReport && handleDelete(null, selectedReport.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
              <Button size="sm" className="gap-1.5 font-black rounded-lg bg-primary h-8 text-[10px] px-3 shadow-md" onClick={handleDownloadPDF}><Printer className="h-3.5 w-3.5" /> प्रिंट</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsViewOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-grow bg-slate-50/30">
            {selectedReport && (
              <div className="p-4 sm:p-8 space-y-5 bg-white" id="printable-report-content">
                <div className="flex flex-col items-center border-b-4 border-primary pb-4 text-center space-y-2 bg-gradient-to-b from-primary/5 to-white pt-2 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl shadow-lg">
                      <Milk className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900">अधिनिर्णय अहवाल</h1>
                  </div>
                  <div className="bg-primary text-white px-8 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-md">
                    OFFICIAL REPORT
                  </div>
                  <div className="grid grid-cols-3 w-full mt-4 text-[10px] font-black uppercase px-4">
                    <div className="flex flex-col text-left border-l-2 border-primary/20 pl-2"><span className="text-slate-400 text-[8px] tracking-widest">प्रतिनिधी:</span> <span className="text-primary truncate">{profileName || selectedReport.fullData?.name || 'N/A'}</span></div>
                    <div className="flex flex-col text-center border-l-2 border-primary/20"><span className="text-slate-400 text-[8px] tracking-widest">तारीख:</span> <span className="text-slate-900">{selectedReport.date || selectedReport.reportDate}</span></div>
                    <div className="flex flex-col text-right border-l-2 border-primary/20"><span className="text-slate-400 text-[8px] tracking-widest">शिफ्ट:</span> <span className="text-orange-600">{selectedReport.fullData?.shift || 'N/A'}</span></div>
                  </div>
                </div>

                {selectedReport.type === 'Route Visit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 p-4 border rounded-xl bg-blue-600 text-white shadow-lg">
                      <div><Label className="text-[8px] font-black uppercase text-blue-100">वाहन</Label><p className="text-[12px] font-black">{selectedReport.fullData?.vehicleNumber || '-'}</p></div>
                      <div><Label className="text-[8px] font-black uppercase text-blue-100">अंतर</Label><p className="text-[12px] font-black">{selectedReport.fullData?.totalKm || '0'} KM</p></div>
                      <div><Label className="text-[8px] font-black uppercase text-blue-100">वेळ</Label><p className="text-[12px] font-black">{selectedReport.fullData?.routeOutTime || '-'}</p></div>
                      <div className="text-right"><Label className="text-[8px] font-black uppercase text-blue-100">तूट</Label><p className="text-[12px] font-black text-red-200">{selectedReport.fullData?.shortageLiters || '0'} L</p></div>
                    </div>

                    <div className="border rounded-xl overflow-hidden border-slate-200 shadow-lg bg-white">
                      <table className="w-full text-[11px] border-collapse min-w-[300px]">
                        <thead className="bg-slate-900 text-white">
                          <tr className="uppercase font-black text-[9px] tracking-widest">
                            <th className="p-3 text-left w-10">#</th>
                            <th className="p-3 text-left">केंद्र (Center)</th>
                            <th className="p-3 text-center">बर्फ (Ice)</th>
                            <th className="p-3 text-center">कॅन (E/F)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.fullData?.routeVisitLogs?.map((log: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/50 hover:bg-primary/5 transition-colors">
                              <td className="p-3 text-center font-black text-slate-300">{idx + 1}</td>
                              <td className="p-3">
                                <p className="font-black text-slate-900 text-[12px]">{log.centerCode}</p>
                                <p className="text-[9px] text-primary font-black uppercase truncate max-w-[120px]">{log.supplierName}</p>
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant="outline" className="font-black text-slate-700 border-slate-300">{log.iceAllocated || '0'}</Badge>
                              </td>
                              <td className="p-3 text-center font-black">
                                <span className="text-slate-400">E:</span>{log.emptyCans} <span className="mx-1 text-slate-200">|</span> <span className="text-emerald-600 font-bold">F:</span>{log.fullCans}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(selectedReport.type === 'Field Visit' || selectedReport.type === 'Daily Office Work' || selectedReport.type === 'Daily Task' || selectedReport.type === 'Breakdown') && (
                  <div className="p-5 border-2 border-primary/10 rounded-2xl bg-gradient-to-br from-white to-primary/5 space-y-3 shadow-md">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] block border-b-2 border-primary/10 pb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> निरीक्षण आणि टिप्पणी (OBSERVATIONS)
                    </Label>
                    <div className="bg-white p-4 rounded-xl border border-primary/5 min-h-[150px] shadow-inner">
                      <p className="text-[12px] leading-relaxed whitespace-pre-wrap font-bold text-slate-800 italic">
                        {selectedReport.summary || selectedReport.overallSummary || "माहिती उपलब्ध नाही."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-12 pb-4">
                  <div className="flex justify-between items-end gap-12 px-6">
                    <div className="text-center flex-1 space-y-3">
                      <div className="border-b-2 border-slate-900 pb-1 h-10 flex items-end justify-center">
                        <span className="text-[11px] font-black text-primary">{profileName || '_________________'}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">प्रतिनिधी स्वाक्षरी</span>
                    </div>
                    <div className="text-center flex-1 space-y-3">
                      <div className="border-b-2 border-slate-900 pb-1 h-10"></div>
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">पर्यवेक्षक स्वाक्षरी</span>
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