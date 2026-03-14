
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, Trash2, Eye, Edit, Search, X, Printer
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
    
    const confirmDelete = window.confirm("तुम्हाला खात्री आहे की हा अहवाल हटवायचा आहे?")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedReport?.id === id) {
        setIsViewOpen(false);
        setSelectedReport(null);
      }
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "अहवाल हटवता आला नाही.", variant: "destructive" })
    }
  }

  const handleSaveEdit = () => {
    if (!db || !user || !editData.id) return
    const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editData.id)
    updateDocumentNonBlocking(docRef, { summary: editData.summary, overallSummary: editData.summary })
    setIsEditOpen(false)
    toast({ title: "अपडेट झाले", description: "अहवालात बदल केला आहे." })
  }

  const renderStandardizedReport = (report: any) => {
    if (!report) return null;
    const data = report.fullData || {};
    const reportType = report.type || 'General';
    
    return (
      <div className="text-[10px] font-mono text-black bg-white p-2 border border-black shadow-none w-full max-w-full" id="printable-area">
        {/* Report Header */}
        <div className="border-b border-black mb-2 text-center py-1 bg-gray-50">
          <h1 className="text-xs font-bold uppercase tracking-widest">{reportType} REPORT</h1>
        </div>

        {/* Metadata Excel Table */}
        <table className="w-full border-collapse border border-black mb-3">
          <tbody>
            <tr>
              <td className="border border-black p-1 bg-gray-100 font-bold w-[20%]">DATE</td>
              <td className="border border-black p-1 w-[30%]">{report.date || report.reportDate}</td>
              <td className="border border-black p-1 bg-gray-100 font-bold w-[20%]">ID</td>
              <td className="border border-black p-1 w-[30%]">{String(report.id).slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-100 font-bold">NAME</td>
              <td className="border border-black p-1">{data.name || 'N/A'}</td>
              <td className="border border-black p-1 bg-gray-100 font-bold">SHIFT/STATUS</td>
              <td className="border border-black p-1">{data.shift || data.status || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        {/* Type-Specific Data Tables */}
        {reportType === 'Route Visit' && data.routeVisitLogs && (
          <table className="w-full border-collapse border border-black mb-3">
            <thead>
              <tr className="bg-gray-100 font-bold uppercase text-center">
                <th className="border border-black p-1 w-8">#</th>
                <th className="border border-black p-1 text-left">CENTER / CODE</th>
                <th className="border border-black p-1">SUPPLIER</th>
                <th className="border border-black p-1">ICE</th>
                <th className="border border-black p-1">ARR/DEP</th>
                <th className="border border-black p-1">CANS(E/F)</th>
              </tr>
            </thead>
            <tbody>
              {data.routeVisitLogs.map((log: any, i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-black p-1">{i + 1}</td>
                  <td className="border border-black p-1 text-left">{log.centerCode || '-'}</td>
                  <td className="border border-black p-1 text-left">{log.supplierName || '-'}</td>
                  <td className="border border-black p-1">{log.iceAllocated || 0}</td>
                  <td className="border border-black p-1">{log.arrivalTime || '-'}/{log.departureTime || '-'}</td>
                  <td className="border border-black p-1 font-bold">{log.emptyCans}/{log.fullCans}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-black p-1 text-right">TOTALS:</td>
                <td className="border border-black p-1">DIST: {data.totalKm || 0} KM</td>
                <td className="border border-black p-1">VEHICLE: {data.vehicleNumber || '-'}</td>
                <td colSpan={2} className="border border-black p-1 text-center">SHORTAGE: {data.shortageLiters || 0} L</td>
              </tr>
            </tbody>
          </table>
        )}

        {reportType === 'Breakdown' && data.losses && (
          <table className="w-full border-collapse border border-black mb-3">
            <thead>
              <tr className="bg-gray-100 font-bold uppercase">
                <th className="border border-black p-1 text-left">SUPPLIER CODE/NAME</th>
                <th className="border border-black p-1 text-center">COW LOSS</th>
                <th className="border border-black p-1 text-center">BUF LOSS</th>
                <th className="border border-black p-1 text-right">LOSS AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {data.losses.map((loss: any, i: number) => (
                <tr key={i}>
                  <td className="border border-black p-1">{loss.supplierCode} - {loss.supplierName}</td>
                  <td className="border border-black p-1 text-center">{loss.cowMilkLossLiters || 0}L</td>
                  <td className="border border-black p-1 text-center">{loss.bufMilkLossLiters || 0}L</td>
                  <td className="border border-black p-1 text-right">₹{loss.lossAmount || 0}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="border border-black p-1 text-right uppercase">TOTAL FINANCIAL LOSS:</td>
                <td className="border border-black p-1 text-right">₹{data.totalLossAmount || 0}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Observations Table */}
        <table className="w-full border-collapse border border-black mb-3">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th className="border border-black p-1 text-left uppercase">DETAILED OBSERVATIONS / REMARKS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 min-h-[50px] align-top whitespace-pre-wrap leading-tight">
                {report.summary || report.overallSummary || data.fieldObservations || data.officeTasks || "NO FURTHER REMARKS."}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div className="mt-6 grid grid-cols-2 gap-8 px-4">
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase text-[8px]">REPRESENTATIVE SIGNATURE</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase text-[8px]">VERIFYING OFFICER</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center italic opacity-50">Loading reports...</div>

  return (
    <div className="max-w-full mx-auto w-full pb-10 space-y-4 px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-2 text-primary">
          <Archive className="h-5 w-5" /> अहवाल व्यवस्थापन (REPORTS)
        </h2>
        <Badge variant="outline" className="font-black bg-primary/5 text-primary border-primary/20">
          {filteredReports.length} अहवाल
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Field Visit', 'Route Visit', 'Daily Task', 'Breakdown'].map((type) => (
            <Button 
              key={type} 
              type="button"
              variant={activeFilter === type ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className="text-[10px] h-8 px-3 font-black uppercase rounded-lg shrink-0"
            >
              {type === 'All' ? 'सर्व' : type}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            type="date" 
            className="h-8 pl-8 text-[11px] font-bold bg-white rounded-lg border-none shadow-sm" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border shadow-none rounded-xl overflow-hidden bg-white hover:shadow-md transition-all group">
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="min-w-0" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <h4 className="font-black text-[12px] uppercase text-primary group-hover:underline cursor-pointer">{report.type}</h4>
                  <p className="text-[10px] text-muted-foreground font-black uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {report.date || report.reportDate}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => { setEditData({id: report.id, summary: report.summary}); setIsEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={(e) => handleDelete(e, report.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="text-[11px] leading-snug line-clamp-2 italic border-l-2 border-primary/20 pl-2 text-muted-foreground">
                {report.summary || report.overallSummary}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && !isLoading && (
          <div className="text-center py-20 opacity-30 flex flex-col items-center gap-2">
            <Archive className="h-12 w-12" />
            <p className="font-black uppercase text-xs">एकही अहवाल उपलब्ध नाही</p>
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl p-0 bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="p-3 bg-gray-50 border-b flex flex-row items-center justify-between no-print">
            <div>
              <DialogTitle className="text-xs font-black uppercase text-gray-500">REPORT VIEW</DialogTitle>
              <DialogDescription className="sr-only">अहवालाची सविस्तर माहिती.</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => window.print()} className="h-7 text-[10px] font-black uppercase"><Printer className="h-3 w-3 mr-1" /> PRINT</Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-7 w-7"><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh]">
            <div className="p-4 sm:p-6 flex justify-center">
              {renderStandardizedReport(selectedReport)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase">अहवाल दुरुस्त करा</DialogTitle>
            <DialogDescription className="sr-only">सारांश संपादित करा.</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary">सारांश (Summary)</Label>
              <Textarea 
                value={editData.summary} 
                onChange={e => setEditData({...editData, summary: e.target.value})} 
                className="min-h-[150px] text-xs font-bold bg-muted/20 border-none rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/10 flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1 font-black uppercase text-xs">रद्द</Button>
            <Button type="button" onClick={handleSaveEdit} className="flex-1 font-black uppercase text-xs">जतन करा</Button>
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
