
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, Trash2, Eye, FileDown, Edit, Search, Filter, X, Printer
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
    
    const confirmDelete = window.confirm("तुम्हाला खात्री आहे की हा अहवाल हटवायचा आहे? (Are you sure you want to delete this report?)")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', id)
      deleteDocumentNonBlocking(docRef)
      
      // If we are currently viewing this report, close the viewer
      if (selectedReport?.id === id) {
        setIsViewOpen(false);
        setSelectedReport(null);
      }
      
      toast({ title: "यशस्वी", description: "अहवाल यशस्वीरित्या हटवला." })
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
    
    return (
      <div className="text-[11px] font-sans text-black bg-white p-4 space-y-4 border border-black shadow-none" id="printable-area">
        {/* Header */}
        <div className="border-b-2 border-black pb-2 text-center bg-gray-50/50">
          <h1 className="text-sm font-black uppercase tracking-widest">{report.type} REPORT</h1>
          <div className="grid grid-cols-2 mt-2 text-left font-bold">
            <div>DATE: {report.date || report.reportDate}</div>
            <div className="text-right">ID: {String(report.id).slice(-8)}</div>
            <div>NAME: {data.name || 'N/A'}</div>
            <div className="text-right">SHIFT: {data.shift || 'N/A'}</div>
          </div>
        </div>

        {/* Dynamic Content based on type */}
        {report.type === 'Route Visit' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 py-1 border-b border-black font-bold">
              <div>VEHICLE: {data.vehicleNumber || '-'}</div>
              <div>DIST: {data.totalKm || '0'} KM</div>
              <div>TIME: {data.routeOutTime || '-'}</div>
              <div className="text-right">SHORT: {data.shortageLiters || '0'} L</div>
            </div>
            
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-100 font-bold uppercase">
                  <th className="border border-black p-1 text-left">#</th>
                  <th className="border border-black p-1 text-left">CENTER</th>
                  <th className="border border-black p-1 text-center">ICE</th>
                  <th className="border border-black p-1 text-center">CANS(E/F)</th>
                </tr>
              </thead>
              <tbody>
                {data.routeVisitLogs?.map((log: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1 text-center">{i + 1}</td>
                    <td className="border border-black p-1 font-medium">{log.centerCode} - {log.supplierName}</td>
                    <td className="border border-black p-1 text-center">{log.iceAllocated || 0}</td>
                    <td className="border border-black p-1 text-center font-bold">{log.emptyCans}/{log.fullCans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Observation Section for all types */}
        <div className="space-y-1">
          <div className="font-bold uppercase text-[10px] border-b border-black bg-gray-50/50 p-1">Observations & Details:</div>
          <p className="whitespace-pre-wrap leading-relaxed py-2 font-medium">
            {report.summary || report.overallSummary || "No detailed notes provided."}
          </p>
        </div>

        {/* Breakdown Losses if available */}
        {data.losses && data.losses.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="font-bold uppercase text-[10px] border-b border-black bg-gray-50/50 p-1">Breakdown Losses:</div>
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-1 text-left">Supplier</th>
                  <th className="border border-black p-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.losses.map((loss: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{loss.supplierName}</td>
                    <td className="border border-black p-1 text-right font-bold">₹{loss.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="pt-12 grid grid-cols-2 gap-10">
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase text-[9px]">Representative Signature</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase text-[9px]">Supervisor Signature</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center italic opacity-50">Loading data...</div>

  return (
    <div className="max-w-full mx-auto w-full pb-10 space-y-4">
      <div className="px-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-2 text-primary">
          <Archive className="h-5 w-5" /> अहवाल व्यवस्थापन (REPORTS)
        </h2>
        <Badge variant="outline" className="font-black bg-primary/5 text-primary border-primary/20">
          {filteredReports.length} अहवाल
        </Badge>
      </div>

      <div className="px-3 grid grid-cols-1 md:grid-cols-2 gap-2">
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

      <div className="px-3 grid grid-cols-1 gap-2">
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
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/5" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/5" onClick={() => { setEditData({id: report.id, summary: report.summary}); setIsEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={(e) => handleDelete(e, report.id)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-2xl p-0 bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>अहवाल तपशील (Report View)</DialogTitle>
            <DialogDescription>निवडलेल्या अहवालाची सविस्तर माहिती आणि प्रिंट पर्याय.</DialogDescription>
          </DialogHeader>
          <div className="p-2 border-b bg-gray-50 flex justify-between items-center no-print">
            <span className="text-[10px] font-black uppercase px-2 text-gray-500">Report View</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => selectedReport && handleDelete(null, selectedReport.id)} className="h-7 text-[10px] font-black uppercase text-destructive border-destructive/20 hover:bg-destructive/5"><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
              <Button type="button" size="sm" onClick={() => window.print()} className="h-7 text-[10px] font-black uppercase"><Printer className="h-3 w-3 mr-1" /> Print</Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-7 w-7"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <ScrollArea className="max-h-[85vh]">
            <div className="p-4 sm:p-8">
              {renderStandardizedReport(selectedReport)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-tight">अहवाल दुरुस्त करा (Edit Report)</DialogTitle>
            <DialogDescription className="sr-only">अहवालाचा सारांश संपादित करा.</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest">सारांश (Summary)</Label>
              <Textarea 
                value={editData.summary} 
                onChange={e => setEditData({...editData, summary: e.target.value})} 
                className="min-h-[150px] text-xs font-bold bg-muted/20 border-none rounded-xl p-3 focus-visible:ring-primary shadow-inner"
              />
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/10 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-9 text-xs font-black uppercase rounded-xl border-primary/20">रद्द</Button>
            <Button type="button" onClick={handleSaveEdit} className="h-9 text-xs font-black uppercase rounded-xl shadow-lg shadow-primary/20">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
