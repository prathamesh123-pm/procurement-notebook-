
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, Trash2, Eye, Edit, Search, X, Printer, FileText, Download, Filter, AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"

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
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState({ id: "", summary: "" })

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesType = activeFilter === 'All' || r.type === activeFilter
      const matchesDate = filterDate === "" || r.date === filterDate
      return matchesType && matchesDate
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, activeFilter, filterDate])

  const handleDelete = (e: React.MouseEvent | null, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!id || !db || !user) return
    
    const confirmDelete = window.confirm("तुम्हाला खात्री आहे की हा अहवाल कायमचा हटवायचा आहे?")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedReport?.id === id) {
        setIsViewOpen(false);
        setSelectedReport(null);
      }
      toast({ title: "यशस्वी", description: "अहवाल यशस्वीरित्या हटवण्यात आला." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "अहवाल हटवता आला नाही.", variant: "destructive" })
    }
  }

  const handleSaveEdit = () => {
    if (!db || !user || !editData.id) return
    const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editData.id)
    updateDocumentNonBlocking(docRef, { summary: editData.summary, overallSummary: editData.summary })
    setIsEditOpen(false)
    toast({ title: "यशस्वी", description: "अहवालात बदल यशस्वीरित्या जतन केला." })
  }

  const renderStandardizedReport = (report: any) => {
    if (!report) return null;
    const data = report.fullData || {};
    const reportType = report.type || 'GENERAL';
    const formTitle = data.formTitle || reportType;
    
    return (
      <div className="text-[10px] font-mono text-black bg-white p-6 border border-black shadow-none w-full max-w-4xl mx-auto" id="printable-area">
        <div className="border-b-2 border-black mb-4 text-center py-2">
          <h1 className="text-lg font-black uppercase tracking-[0.1em]">{formTitle} REPORT</h1>
          <p className="text-[8px] font-bold uppercase opacity-60">संकलन नोंदवही (OFFICIAL REGISTER)</p>
        </div>

        <table className="w-full border-collapse border border-black mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-black uppercase w-[20%]">DATE</td>
              <td className="border border-black p-2 w-[30%] font-bold">{report.date || report.reportDate}</td>
              <td className="border border-black p-2 bg-slate-50 font-black uppercase w-[20%]">ID</td>
              <td className="border border-black p-2 w-[30%] font-bold">{String(report.id).slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-black uppercase">OFFICER</td>
              <td className="border border-black p-2 font-bold">{data.name || user?.displayName || 'SYSTEM USER'}</td>
              <td className="border border-black p-2 bg-slate-50 font-black uppercase">TYPE</td>
              <td className="border border-black p-2 uppercase font-bold">{reportType}</td>
            </tr>
          </tbody>
        </table>

        {reportType === 'Route Visit' && data.routeVisitLogs && (
          <table className="w-full border-collapse border border-black mb-4">
            <thead>
              <tr className="bg-slate-100 font-black uppercase text-[9px] text-center">
                <th className="border border-black p-2 w-8">#</th>
                <th className="border border-black p-2 text-left">CODE</th>
                <th className="border border-black p-2 text-left">CENTER NAME</th>
                <th className="border border-black p-2">ICE</th>
                <th className="border border-black p-2">IN/OUT</th>
                <th className="border border-black p-2">CANS</th>
              </tr>
            </thead>
            <tbody>
              {data.routeVisitLogs.map((log: any, i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-black p-1.5 font-bold">{i + 1}</td>
                  <td className="border border-black p-1.5 text-left font-bold">{log.centerCode || '-'}</td>
                  <td className="border border-black p-1.5 text-left font-bold">{log.supplierName || '-'}</td>
                  <td className="border border-black p-1.5">{log.iceAllocated || 0}</td>
                  <td className="border border-black p-1.5 font-bold">{log.arrivalTime || '-'}/{log.departureTime || '-'}</td>
                  <td className="border border-black p-1.5 font-black">{log.emptyCans}/{log.fullCans}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black text-[9px]">
                <td colSpan={2} className="border border-black p-2 text-right">TOTALS:</td>
                <td className="border border-black p-2">DIST: {data.totalKm || 0} KM</td>
                <td colSpan={2} className="border border-black p-2 text-center">VEHICLE: {data.vehicleNumber || '-'}</td>
                <td className="border border-black p-2 text-center">SHORT: {data.shortageLiters || 0} L</td>
              </tr>
            </tbody>
          </table>
        )}

        {reportType === 'Custom Form' && data.dynamicFields && (
          <table className="w-full border-collapse border border-black mb-4">
            <thead>
              <tr className="bg-slate-100 font-black uppercase text-[9px]">
                <th className="border border-black p-2 text-left w-[40%]">FIELD DESCRIPTION</th>
                <th className="border border-black p-2 text-left">VALUE</th>
              </tr>
            </thead>
            <tbody>
              {data.dynamicFields.map((field: any, i: number) => (
                <tr key={i}>
                  <td className="border border-black p-2 bg-slate-50 font-black uppercase text-[8px]">{field.label}</td>
                  <td className="border border-black p-2 font-bold">{field.value || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-slate-100 font-black text-[9px]">
              <th className="border border-black p-2 text-left uppercase">REMARKS / OBSERVATIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-3 min-h-[80px] align-top whitespace-pre-wrap leading-relaxed font-bold italic text-slate-700">
                {report.summary || report.overallSummary || "NO REMARKS."}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 grid grid-cols-2 gap-16 px-8">
          <div className="text-center">
            <div className="border-t border-black pt-1 font-black uppercase text-[8px]">OFFICER SIGNATURE</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 font-black uppercase text-[8px]">SUPERVISOR SIGNATURE</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse italic font-black uppercase text-xs opacity-50">लोड होत आहे...</div>

  return (
    <div className="max-w-6xl mx-auto w-full pb-20 space-y-8 px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <Archive className="h-6 w-6" />
            </div>
            अहवाल व्यवस्थापन
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 opacity-70">Archive History</p>
        </div>
        <Badge variant="outline" className="font-black bg-primary/5 text-primary border-primary/20 text-xs px-4 py-2 rounded-2xl shadow-sm uppercase">
          {filteredReports.length} एकूण अहवाल
        </Badge>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden p-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar p-2">
            {['All', 'Field Visit', 'Route Visit', 'Daily Task', 'Breakdown', 'Custom Form'].map((type) => (
              <Button 
                key={type} 
                type="button"
                variant={activeFilter === type ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveFilter(type as any)}
                className={cn(
                  "text-[10px] h-9 px-5 font-black uppercase rounded-xl transition-all",
                  activeFilter === type ? "shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                )}
              >
                {type === 'All' ? 'सर्व' : (type === 'Custom Form' ? 'इतर फॉर्म' : type)}
              </Button>
            ))}
          </div>
          <div className="md:col-span-4 relative p-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="date" 
                className="h-10 pl-10 text-xs font-black bg-slate-50 border-none rounded-xl shadow-inner w-full" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 group border-l-8 border-l-primary/10 hover:border-l-primary translate-all">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-slate-50 items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-sm sm:text-base uppercase text-slate-900 group-hover:text-primary transition-colors truncate">
                      {report.fullData?.formTitle || report.type}
                    </h4>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-black text-[8px] rounded-lg border-none uppercase">{report.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {report.date || report.reportDate}</span>
                    <span className="flex items-center gap-1.5"><Archive className="h-3.5 w-3.5" /> ID: {String(report.id).slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] leading-snug line-clamp-1 italic text-slate-400 font-medium mt-3 border-l-2 border-slate-100 pl-3">
                    {report.summary || report.overallSummary}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl group-hover:bg-white transition-colors">
                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}><Eye className="h-5 w-5" /></Button>
                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl" onClick={() => { setEditData({id: report.id, summary: report.summary}); setIsEditOpen(true); }}><Edit className="h-5 w-5" /></Button>
                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl" onClick={(e) => handleDelete(e, report.id)}><Trash2 className="h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && !isLoading && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4 opacity-30">
            <Archive className="h-16 w-16 text-slate-200" />
            <div className="space-y-1">
              <p className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">एकही अहवाल उपलब्ध नाही</p>
              <p className="text-[10px] font-bold">नवीन नोंदी केल्यावर इथे दिसतील.</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl p-0 bg-slate-50 border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <DialogHeader className="p-6 bg-white border-b flex flex-row items-center justify-between no-print sticky top-0 z-20">
            <div className="space-y-1">
              <DialogTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">पहा अहवाल (VIEW REPORT)</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase opacity-50">अधिकृत प्रिंट फॉरमॅट</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => window.print()} className="h-11 px-6 text-xs font-black uppercase bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl transition-all active:scale-95"><Printer className="h-4 w-4 mr-2" /> PRINT</Button>
              <Button type="button" size="icon" variant="ghost" className="h-11 w-11 rounded-xl text-rose-500 hover:bg-rose-50" onClick={(e) => selectedReport && handleDelete(e, selectedReport.id)}><Trash2 className="h-5 w-5" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-11 w-11 rounded-full hover:bg-slate-100"><X className="h-6 w-6 text-slate-400" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] bg-slate-50">
            <div className="p-4 sm:p-12 flex justify-center">
              {renderStandardizedReport(selectedReport)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-6 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">अहवाल दुरुस्त करा</DialogTitle>
            <DialogDescription className="text-[10px] text-white/70 uppercase font-bold mt-1">सारांश संपादित करा.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">अहवाल सारांश (REMARKS)</Label>
              <Textarea 
                value={editData.summary} 
                onChange={e => setEditData({...editData, summary: e.target.value})} 
                className="min-h-[200px] text-sm font-bold bg-slate-50 border-none rounded-2xl p-4 shadow-inner focus-visible:ring-primary"
              />
            </div>
          </div>
          <DialogFooter className="p-6 border-t bg-slate-50 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1 font-black uppercase text-xs h-12 rounded-xl border-slate-200">रद्द करा</Button>
            <Button type="button" onClick={handleSaveEdit} className="flex-1 font-black uppercase text-xs h-12 rounded-xl bg-primary shadow-xl shadow-primary/20">बदल जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
