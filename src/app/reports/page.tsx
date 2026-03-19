"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Eye, Search, X, Printer, Plus, Trash2, FileEdit
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
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
  const [filterDate, setFilterDate] = useState<string>("")
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => filterDate === "" || r.date === filterDate)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, filterDate])

  const handleDeleteReport = (id: string) => {
    if (!db || !user) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      setIsViewOpen(false)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  if (!mounted || isLoading) return <div className="p-20 text-center animate-pulse italic font-black uppercase text-[9px] opacity-50">लोड होत आहे...</div>

  const reportTypes = [
    { title: "जप्ती व दंड", sub: "Seizure", type: "seizure" },
    { title: "दूध सर्व्हे", sub: "Survey", type: "survey" },
    { title: "चिलिंग सेंटर", sub: "Chilling", type: "chilling" },
    { title: "ब्रेकडाऊन", sub: "Breakdown", type: "breakdown" },
    { title: "दैनिक कामकाज", sub: "Daily", type: "daily" },
    { title: "केंद्र ऑडिट", sub: "Audit", type: "audit" },
  ]

  return (
    <div className="compact-form-container pb-20">
      <div className="flex flex-col gap-0.5 border-b pb-2 mb-3">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase">
          <Archive className="h-4 w-4 text-primary" /> अहवाल व्यवस्थापन
        </h2>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Archive History</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {reportTypes.map((rt) => (
          <Button key={rt.sub} asChild variant="outline" className="h-12 flex flex-col items-center justify-center p-1 rounded-xl hover:border-primary group transition-all">
            <Link href={`/reports/entry/${rt.type}`}>
              <span className="text-[9px] font-black text-slate-900 group-hover:text-primary leading-tight text-center">{rt.title}</span>
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">{rt.sub}</span>
            </Link>
          </Button>
        ))}
        <Button asChild variant="outline" className="h-12 flex flex-col items-center justify-center p-1 rounded-xl bg-primary/5 border-primary/20 hover:bg-primary/10">
          <Link href="/form-builder">
            <FileEdit className="h-3 w-3 text-primary mb-0.5" />
            <span className="text-[8px] font-black text-primary uppercase">बिल्डर</span>
          </Link>
        </Button>
      </div>

      <Card className="compact-card p-1.5 mb-3 bg-slate-50">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input className="compact-input h-7 pl-6 text-[10px]" placeholder="शोधा..." />
          </div>
          <Input type="date" className="compact-input h-7 w-28 text-[10px]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
      </Card>

      <div className="space-y-1.5">
        {filteredReports.map((report) => (
          <Card key={report.id} className="compact-card p-2 border-l-2 border-l-primary/30 hover:border-l-primary cursor-pointer active:scale-[0.98] transition-all" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="font-black text-[11px] truncate uppercase">{report.type}</h4>
                  <Badge className="h-3 px-1 text-[7px] font-black bg-primary/10 text-primary border-none">{report.date}</Badge>
                </div>
                <p className="text-[9px] text-slate-500 line-clamp-1 italic font-medium">{report.summary}</p>
              </div>
              <Eye className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[450px] p-0 rounded-2xl overflow-hidden border-none shadow-2xl">
          <div className="p-2 bg-slate-50 border-b flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-2">अहवाल तपशील</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => window.print()} className="h-7 w-7"><Printer className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDeleteReport(selectedReport?.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <ScrollArea className="max-h-[70vh] p-4 bg-white">
            {selectedReport && (
              <div className="text-[9px] font-mono text-black space-y-3" id="printable-area">
                <div className="border-b pb-2 text-center">
                  <h1 className="text-xs font-black uppercase">{selectedReport.type} REPORT</h1>
                  <p className="text-[7px] font-bold opacity-50 uppercase">संकलन नोंदवही (OFFICIAL)</p>
                </div>
                <div className="grid grid-cols-2 gap-2 uppercase font-black text-[8px] opacity-70">
                  <div>DATE: {selectedReport.date}</div>
                  <div className="text-right">ID: {selectedReport.id.slice(-6)}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-black uppercase border-b pb-0.5">अहवाल सारांश (SUMMARY):</div>
                  <p className="italic leading-relaxed whitespace-pre-wrap">{selectedReport.summary || selectedReport.overallSummary}</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 text-center pt-2 border-t opacity-40 uppercase font-black text-[7px]">
                  <div>OFFICER SIGN</div><div>SUPERVISOR SIGN</div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
