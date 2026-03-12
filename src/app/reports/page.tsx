
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
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!id || !db || !user) return
    if (!window.confirm("हा अहवाल हटवायचा आहे का?")) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedReport?.id === id) { setIsViewOpen(false); setSelectedReport(null); }
      toast({ title: "हटवले", description: "अहवाल यशस्वीरित्या हटवला." })
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
      <div className="text-[11px] font-sans text-black bg-white p-4 space-y-4" id="printable-area">
        {/* Header */}
        <div className="border-b-2 border-black pb-2 text-center">
          <h1 className="text-sm font-bold uppercase tracking-widest">{report.type} REPORT</h1>
          <div className="grid grid-cols-2 mt-2 text-left">
            <div><span className="font-bold">DATE:</span> {report.date || report.reportDate}</div>
            <div className="text-right"><span className="font-bold">ID:</span> {String(report.id).slice(-8)}</div>
            <div><span className="font-bold">NAME:</span> {data.name || 'N/A'}</div>
            <div className="text-right"><span className="font-bold">SHIFT:</span> {data.shift || 'N/A'}</div>
          </div>
        </div>

        {/* Dynamic Content based on type */}
        {report.type === 'Route Visit' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 py-1 border-b border-black">
              <div><span className="font-bold">VEHICLE:</span> {data.vehicleNumber || '-'}</div>
              <div><span className="font-bold">DIST:</span> {data.totalKm || '0'} KM</div>
              <div><span className="font-bold">TIME:</span> {data.routeOutTime || '-'}</div>
              <div className="text-right"><span className="font-bold">SHORT:</span> {data.shortageLiters || '0'} L</div>
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
                    <td className="border border-black p-1">{log.centerCode} - {log.supplierName}</td>
                    <td className="border border-black p-1 text-center">{log.iceAllocated || 0}</td>
                    <td className="border border-black p-1 text-center">{log.emptyCans}/{log.fullCans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Observation Section for all types */}
        <div className="space-y-1">
          <div className="font-bold uppercase text-[10px] border-b border-black">Observations & Details:</div>
          <p className="whitespace-pre-wrap leading-tight py-1">
            {report.summary || report.overallSummary || "No detailed notes provided."}
          </p>
        </div>

        {/* Additional data for breakdowns if available */}
        {data.losses && data.losses.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="font-bold uppercase text-[10px] border-b border-black">Breakdown Losses:</div>
            <table className="w-full border-collapse border border-black text-[10px]">
              <tbody>
                {data.losses.map((loss: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{loss.supplierName}</td>
                    <td className="border border-black p-1 text-right">{loss.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-10">
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase">Representative</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 font-bold uppercase">Supervisor</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center italic opacity-50">Loading data...</div>

  return (
    <div className="max-w-full mx-auto w-full pb-10 space-y-4">
      <div className="px-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl font-bold tracking-tight uppercase">अहवाल व्यवस्थापन (REPORTS)</h2>
        <Badge variant="outline" className="font-bold">{filteredReports.length} अहवाल</Badge>
      </div>

      <div className="px-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {['All', 'Field Visit', 'Route Visit', 'Daily Task', 'Breakdown'].map((type) => (
            <Button 
              key={type} 
              variant={activeFilter === type ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveFilter(type as any)}
              className="text-[10px] h-8 px-3 font-bold uppercase"
            >
              {type === 'All' ? 'सर्व' : type}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            type="date" 
            className="h-8 pl-8 text-[11px] font-bold bg-white" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="px-3 grid grid-cols-1 gap-2">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border shadow-none rounded-none overflow-hidden bg-white">
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h4 className="font-bold text-[12px] uppercase">{report.type}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{report.date || report.reportDate}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => { setEditData({id: report.id, summary: report.summary}); setIsEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => handleDelete(e, report.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="text-[11px] leading-snug line-clamp-2 italic border-l-2 border-gray-200 pl-2">
                {report.summary || report.overallSummary}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog - Standardized Compact Report */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl p-0 bg-white border-none shadow-2xl rounded-none">
          <div className="p-2 border-b bg-gray-50 flex justify-between items-center no-print">
            <span className="text-[10px] font-bold uppercase px-2 text-gray-500">Report View</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-7 text-[10px] font-bold uppercase"><Printer className="h-3 w-3 mr-1" /> Print</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-7 w-7"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <ScrollArea className="max-h-[85vh]">
            <div className="p-2">
              {renderStandardizedReport(selectedReport)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-4 bg-white rounded-none">
          <DialogHeader>
            <DialogTitle className="text-[12px] font-bold uppercase">अहवाल दुरुस्त करा</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label className="text-[10px] font-bold uppercase">सारांश (Summary)</Label>
            <Textarea 
              value={editData.summary} 
              onChange={e => setEditData({...editData, summary: e.target.value})} 
              className="min-h-[150px] text-xs font-bold bg-gray-50 border-gray-200 rounded-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="h-9 text-xs font-bold uppercase rounded-none">रद्द</Button>
            <Button onClick={handleSaveEdit} className="h-9 text-xs font-bold uppercase rounded-none">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
