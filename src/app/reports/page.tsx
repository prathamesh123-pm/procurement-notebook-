"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Calendar, Eye, Edit, Search, X, Printer, FileText, Plus, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesType = activeFilter === 'All' || r.type === activeFilter
      const matchesDate = filterDate === "" || r.date === filterDate
      return matchesType && matchesDate
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, activeFilter, filterDate])

  const handleDeleteReport = (id: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!db || !user) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      setIsViewOpen(false)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  const renderStandardizedReport = (report: any) => {
    if (!report) return null;
    const data = report.fullData || {};
    return (
      <div className="text-[10px] font-mono text-black bg-white p-4 border border-black w-full" id="printable-area">
        <div className="border-b-2 border-black mb-2 text-center py-1">
          <h1 className="text-sm font-black uppercase">{report.type} REPORT</h1>
          <p className="text-[8px] font-bold uppercase opacity-60">संकलन नोंदवही (OFFICIAL REGISTER)</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2 border-b border-black pb-2">
          <div><span className="font-black">DATE:</span> {report.date}</div>
          <div className="text-right"><span className="font-black">OFFICER:</span> {data.name || 'USER'}</div>
        </div>
        <div className="space-y-2">
          <div className="font-black uppercase border-b border-black">अहवाल सारांश (SUMMARY):</div>
          <p className="italic leading-tight">{report.summary || report.overallSummary}</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8 text-center pt-2 border-t border-black">
          <div className="text-[8px] font-black uppercase">OFFICER SIGN</div>
          <div className="text-[8px] font-black uppercase">SUPERVISOR SIGN</div>
        </div>
      </div>
    );
  };

  if (!mounted || isLoading) return <div className="p-20 text-center animate-pulse italic font-black uppercase text-xs opacity-50">लोड होत आहे...</div>

  const reportTypes = [
    { title: "जप्ती व दंड", sub: "Seizure", type: "Seizure Report", color: "bg-rose-500" },
    { title: "दूध संकलन सर्व्हे", sub: "Survey", type: "Survey Report", color: "bg-blue-500" },
    { title: "चिलिंग सेंटर", sub: "Chilling", type: "Chilling Report", color: "bg-cyan-500" },
    { title: "वाहन ब्रेकडाऊन", sub: "Breakdown", type: "Breakdown Report", color: "bg-orange-500" },
    { title: "दैनिक कामकाज", sub: "Daily", type: "Daily Work", color: "bg-indigo-500" },
    { title: "केंद्र ऑडिट", sub: "Audit", type: "Center Audit", color: "bg-emerald-500" },
  ]

  return (
    <div className="max-w-[600px] mx-auto w-full pb-20 space-y-4 px-2">
      <div className="flex flex-col gap-1 border-b pb-2">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" /> अहवाल व्यवस्थापन
        </h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Archive History</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {reportTypes.map((rt) => (
          <Button key={rt.sub} asChild variant="outline" className="compact-button h-14 bg-white hover:bg-slate-50 border-slate-100 flex flex-col items-center justify-center gap-0.5 group">
            <Link href={`/reports/entry/${rt.sub.toLowerCase()}`}>
              <span className="text-[11px] font-black text-slate-900 group-hover:text-primary">{rt.title}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">{rt.sub} Report</span>
            </Link>
          </Button>
        ))}
      </div>

      <Card className="compact-card p-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input className="compact-input h-8 pl-8 text-[11px]" placeholder="शोधा..." />
          </div>
          <Input type="date" className="compact-input h-8 w-32 text-[11px]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
      </Card>

      <div className="space-y-2">
        {filteredReports.map((report) => (
          <Card key={report.id} className="compact-card p-3 border-l-4 border-l-primary/30 hover:border-l-primary cursor-pointer transition-all" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-black text-[12px] truncate uppercase">{report.type}</h4>
                  <Badge className="h-3.5 px-1 text-[8px] font-black">{report.date}</Badge>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 italic font-medium">{report.summary}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-primary"><Eye className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[500px] p-0 rounded-2xl overflow-hidden">
          <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">अहवाल तपशील</span>
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => window.print()} className="h-8 px-3 text-[10px] font-black uppercase"><Printer className="h-3.5 w-3.5 mr-1" /> PRINT</Button>
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteReport(selectedReport?.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <ScrollArea className="max-h-[70vh] p-4">
            {renderStandardizedReport(selectedReport)}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
        }
      `}</style>
    </div>
  )
}
