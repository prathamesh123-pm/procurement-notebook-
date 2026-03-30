
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Eye, Search, X, Printer, Trash2, FileEdit, Truck, ListTodo, ShieldAlert, ChevronRight, Filter, FileText, Milk
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'dailyWorkReports')
  }, [db, user])

  const { data: firestoreReports, isLoading } = useCollection(reportsQuery)
  const [filterDate, setFilterDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesDate = filterDate === "" || r.date === filterDate
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
      return matchesDate && matchesSearch
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, filterDate, searchQuery])

  const handleDeleteReport = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा अहवाल हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      setIsViewOpen(false)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  const handleEditReport = (report: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const typeMap: Record<string, string> = {
      'Route Visit': '/daily-report',
      'Field Visit': '/daily-report',
      'Daily Office Work': '/daily-report',
      'Transport Breakdown Report': '/reports/entry/breakdown',
      'Daily Work Report': '/reports/entry/daily',
      'Seizure & Penalty': '/reports/entry/seizure',
      'Daily Task': '/work-log',
      'Official Document': '/form-builder'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  if (!mounted || isLoading) return <div className="p-20 text-center animate-pulse italic font-black uppercase text-[9px] opacity-50">लोड होत आहे...</div>

  const reportTypes = [
    { title: "ब्रेकडाऊन", sub: "Breakdown", type: "breakdown", icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "दैनिक कामकाज", sub: "Daily", type: "daily", icon: ListTodo, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "जप्ती व दंड", sub: "Seizure", type: "seizure", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    
    // Calculations
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIceUsed = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white p-2 font-mono text-[9px] text-black border border-black/10 rounded shadow-sm max-w-[800px] mx-auto overflow-x-auto" id="printable-area">
        {/* Header Section - Stripped Down */}
        <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
          <div className="font-black uppercase text-[10px]">रूट व्हिजिट अहवाल (ROUTE VISIT)</div>
          <div className="text-right font-black leading-tight text-[8px]">
            <p>OUT: {d.routeOutTime || '--:--'} | IN: {d.routeInTime || '--:--'}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-x-4 mb-2 font-black text-[8px] uppercase">
          <div className="space-y-0.5">
            <p>रूट: {d.routeName || '---'}</p>
            <p>ड्रायव्हर: {d.driverName || '---'}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p>तारीख: {d.reportDate || '---'}</p>
            <p>गाडी: {d.vehicleNumber || '---'}</p>
            <p>स्लिप नं: {d.slipNo || '---'}</p>
          </div>
        </div>

        {/* Main Table - Simplified */}
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-slate-50 font-black text-[8px]">
              <th className="border border-black p-1 text-center w-6">क्र.</th>
              <th className="border border-black p-1 text-center">सेंटर कोड</th>
              <th className="border border-black p-1 text-center">मेंबर</th>
              <th className="border border-black p-1 text-center">बर्फ वापर</th>
              <th className="border border-black p-1 text-center">आगमन</th>
              <th className="border border-black p-1 text-center">रिकामे</th>
              <th className="border border-black p-1 text-center">निर्गमन</th>
              <th className="border border-black p-1 text-center">भरलेले</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any, idx: number) => (
              <tr key={idx} className="font-bold text-[8px]">
                <td className="border border-black p-1 text-center">{idx + 1}</td>
                <td className="border border-black p-1 text-center uppercase">{log.centerCode || '---'}</td>
                <td className="border border-black p-1 text-center">{log.memberCount || '0'}</td>
                <td className="border border-black p-1 text-center">{log.iceUsed || '-'}</td>
                <td className="border border-black p-1 text-center">{log.arrivalTime || '--:--'}</td>
                <td className="border border-black p-1 text-center">{log.emptyCans || '0'}</td>
                <td className="border border-black p-1 text-center">{log.departureTime || '--:--'}</td>
                <td className="border border-black p-1 text-center">{log.fullCans || '0'}</td>
              </tr>
            ))}
            {/* Summary Row */}
            <tr className="bg-slate-100 font-black text-[8px]">
              <td className="border border-black p-1 text-center" colSpan={2}>एकूण (TOTAL)</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalIceUsed}</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalEmpty}</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalFull}</td>
            </tr>
          </tbody>
        </table>

        {/* Reading and KM Info */}
        <div className="mt-2 flex justify-between font-black text-[8px] uppercase border-t border-dashed border-black/20 pt-1">
          <div className="flex gap-4">
            <p>सुरुवात: {d.startReading || '0'}</p>
            <p>शेवट: {d.endReading || '0'}</p>
            <p>एकूण: {d.totalKm || '0'} KM</p>
          </div>
          <p className="text-rose-600">तूट: {d.shortageLiters || '0'} L</p>
        </div>
      </div>
    );
  };

  return (
    <div className="compact-form-container pb-20">
      <div className="flex flex-col gap-0.5 border-b pb-2 mb-3 px-1">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
          <Archive className="h-4 w-4 text-primary" /> अहवाल व्यवस्थापन (REPORTS)
        </h2>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">Archive & Management</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 px-1">
        {reportTypes.map((rt) => (
          <Link key={rt.sub} href={`/reports/entry/${rt.type}`} className="block">
            <div className={`h-16 flex flex-col items-center justify-center p-1 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 ${rt.bg} border-muted-foreground/5 shadow-sm`}>
              <rt.icon className={`h-4 w-4 ${rt.color} mb-1`} />
              <span className="text-[8px] font-black text-slate-900 leading-tight text-center uppercase">{rt.title}</span>
            </div>
          </Link>
        ))}
      </div>

      <Card className="compact-card p-2 mb-3 bg-white border-muted-foreground/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input className="h-9 pl-8 text-[11px] bg-muted/20 border-none rounded-xl font-bold" placeholder="शोधा (Search)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input type="date" className="h-9 pl-7 w-32 text-[10px] bg-muted/20 border-none rounded-xl font-bold" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="p-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest">तारीख / प्रकार</th>
                <th className="p-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-right">क्रिया (ACTIONS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted-foreground/5">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-900 truncate max-w-[150px]">{report.type === 'Official Document' ? 'वर्ड दस्तऐवज' : report.type}</span>
                        <Badge className="h-3.5 px-1.5 text-[7px] font-black bg-primary/10 text-primary border-none rounded-md">{report.date}</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground line-clamp-1 italic font-medium">{report.summary}</p>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => handleEditReport(report, e)}>
                        <FileEdit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg" onClick={(e) => handleDeleteReport(report.id, e)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 ml-1 mt-1.5" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-[0.3em]">नोंदी उपलब्ध नाहीत</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-3 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
            <div className="min-w-0">
              <DialogTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 truncate">अहवाल तपशील (REPORT DETAILS)</DialogTitle>
              <DialogDescription className="sr-only">अहवालाची सविस्तर माहिती</DialogDescription>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => handleEditReport(selectedReport)} className="h-8 w-8 text-primary hover:bg-primary/5 rounded-full"><FileEdit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => window.print()} className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-full"><Printer className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDeleteReport(selectedReport?.id)} className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full"><Trash2 className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 text-slate-400 rounded-full"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            {selectedReport && (
              <div className="space-y-5">
                {selectedReport.type === 'Route Visit' ? (
                  <RouteSlipLayout report={selectedReport} />
                ) : selectedReport.fullData?.isWordDoc ? (
                  <div className="prose prose-sm max-w-none px-4" dangerouslySetInnerHTML={{ __html: selectedReport.fullData.content }} />
                ) : (
                  <div className="text-[10px] font-mono text-black space-y-5 p-4 border border-slate-100 rounded-xl" id="printable-area">
                    <div className="border-b-2 border-black pb-3 text-center space-y-1">
                      <h1 className="text-sm font-black uppercase tracking-tighter">संकलन नोंदवही (OFFICIAL REPORT)</h1>
                      <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Digital Procurement Management System</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 uppercase font-black text-[9px]">
                      <div className="space-y-1">
                        <p className="opacity-50">DATE:</p>
                        <p className="text-black">{selectedReport.date}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="opacity-50">REPORT ID:</p>
                        <p className="text-black">#{selectedReport.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 py-2 border-y border-dashed border-black/20">
                      <p className="text-[9px] font-black opacity-50 uppercase">प्रकार (TYPE):</p>
                      <p className="text-[11px] font-black uppercase text-primary">{selectedReport.type}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="font-black uppercase border-b border-black/10 pb-1 text-[9px] opacity-50">अहवाल सारांश (SUMMARY):</div>
                      <p className="leading-relaxed whitespace-pre-wrap font-medium text-slate-800 text-[11px]">
                        {selectedReport.summary || selectedReport.overallSummary}
                      </p>
                    </div>

                    {selectedReport.fullData && (
                      <div className="space-y-3 pt-2">
                        <div className="font-black uppercase border-b border-black/10 pb-1 text-[9px] opacity-50">अतिरिक्त तपशील (DETAILS):</div>
                        <div className="grid grid-cols-1 gap-2 bg-muted/10 p-3 rounded-xl">
                          {Object.entries(selectedReport.fullData).map(([key, val]: [string, any]) => {
                            if (typeof val === 'object' || key === 'routeVisitLogs' || key === 'centerLosses' || key === 'reportType') return null;
                            return (
                              <div key={key} className="flex justify-between border-b border-black/5 pb-1 last:border-0">
                                <span className="opacity-50 uppercase text-[8px] font-black">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-right font-bold">{String(val)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-12 grid grid-cols-2 gap-10 text-center pt-6 border-t border-black/10 opacity-60 uppercase font-black text-[8px]">
                      <div className="space-y-10">
                        <div className="h-1 bg-black/10 w-full" />
                        <p>OFFICER SIGN</p>
                      </div>
                      <div className="space-y-10">
                        <div className="h-1 bg-black/10 w-full" />
                        <p>SUPERVISOR SIGN</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0; 
            margin: 0;
            border: none;
            box-shadow: none;
          }
          .dialog-content, .scroll-area { overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </div>
  )
}
