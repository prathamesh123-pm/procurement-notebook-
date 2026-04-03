
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Microscope, Milk, User, Calendar, ClipboardList, Briefcase, ListTodo, LayoutGrid, FileCheck, FileSignature
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'dailyWorkReports')
  }, [db, user])

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: firestoreReports, isLoading } = useCollection(reportsQuery)
  const { data: userData } = useDoc(userDocRef)

  const profileName = userData?.displayName || user?.displayName || "सादरकर्ता";
  const profileId = userData?.employeeId || "---";

  const [filterDate, setFilterDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const reportTypes = [
    { title: "रूट व्हिजिट", type: "Route Visit", icon: Truck, color: "text-blue-600" },
    { title: "क्षेत्र भेट", type: "Field Visit", icon: MapPin, color: "text-emerald-600" },
    { title: "ऑफिस काम", type: "Daily Office Work", icon: Briefcase, color: "text-purple-600" },
    { title: "ब्रेकडाऊन", type: "Transport Breakdown Report", icon: Truck, color: "text-rose-600" },
    { title: "कामकाज नोंद", type: "Daily Task", icon: ListTodo, color: "text-orange-600" },
    { title: "जप्ती व दंड", type: "Seizure & Penalty", icon: ShieldAlert, color: "text-amber-600" },
    { title: "दैनिक कामकाज", type: "Daily Work Report", icon: ClipboardCheck, color: "text-indigo-600" },
    { title: "वर्ड फॉर्म", type: "Official Document", icon: FileSignature, color: "text-slate-600" },
  ]

  const labelMap: Record<string, string> = {
    reportHeading: "अहवाल शीर्षक",
    date: "तारीख",
    shift: "शिफ्ट",
    slipNo: "स्लिप नंबर",
    idNumber: "अधिकारी आयडी",
    supervisorName: "सुपरवायझर नाव",
    supplierName: "पुरवठादार नाव",
    supplierId: "कोड (ID)",
    centerName: "केंद्राचे नाव",
    centerCode: "केंद्राचा कोड",
    ownerName: "मालकाचे नाव",
    mobile: "मोबाईल",
    address: "पत्ता",
    routeName: "रूट नाव",
    vehicleNumber: "वाहन क्र.",
    driverName: "ड्रायव्हर नाव",
    visitPerson: "कोणाची भेट घेतली?",
    visitPurpose: "भेटीचा मुख्य उद्देश",
    visitDiscussion: "सविस्तर चर्चा",
    officeTaskSubject: "कामाचा विषय",
    officeTaskDetails: "कामाचा गोषवारा",
    location: "बिघाड ठिकाण",
    reason: "बिघाड कारण",
    severity: "स्वरूप",
    estimatedRepairTime: "वेळ",
    estimatedRepairCost: "खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी",
    milkHot: "दूध गरम?",
    milkSour: "दूध खराब?",
    achievements: "आजची मोठी कामगिरी",
    problems: "महत्त्वाच्या समस्या",
    actionsTaken: "केलेली कार्यवाही",
    totalLossAmount: "एकूण आर्थिक नुकसान",
    fineAmount: "दंड (₹)",
    seizureQty: "जप्त दूध (L)",
    morningQty: "सकाळ (L)",
    eveningQty: "संध्याकाळ (L)",
    fat: "फॅट (%)",
    snf: "SNF (%)"
  };

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesDate = filterDate === "" || r.date === filterDate
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
      const matchesType = !typeFilter || r.type === typeFilter;
      return matchesDate && matchesSearch && matchesType
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, filterDate, searchQuery, typeFilter])

  const handleDeleteReport = (id: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा अहवाल हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      setIsViewOpen(false)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  const handleEditReport = (report: any, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const typeMap: Record<string, string> = {
      'Route Visit': '/daily-report', 'Field Visit': '/daily-report', 'Daily Office Work': '/daily-report',
      'Transport Breakdown Report': '/reports/entry/breakdown', 'Daily Work Report': '/reports/entry/daily',
      'Seizure & Penalty': '/reports/entry/seizure', 'Collection Center Audit': '/reports/entry/audit',
      'Daily Task': '/work-log', 'Official Document': '/form-builder'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  const ReportHeader = ({ title, date, subName, subId }: any) => (
    <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
          <Milk className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-[18pt] font-black uppercase tracking-tight leading-none">संकलन नोंदवही</h1>
      </div>
      <h2 className="text-[12pt] font-black uppercase text-slate-700 tracking-widest border-y border-slate-200 py-1 mb-2">{title}</h2>
      <div className="flex justify-between text-[8pt] font-black uppercase text-slate-500 tracking-wider">
        <span>सादरकर्ता: {subName} ({subId})</span>
        <span>तारीख: {date}</span>
      </div>
    </div>
  )

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm shadow-none w-full max-w-[210mm] mx-auto p-6 printable-report flex flex-col items-center">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} />
        <div className="w-full grid grid-cols-2 gap-2 mb-4 font-black text-[9pt] uppercase">
          <div className="p-2 border border-black rounded bg-slate-50 text-left">रूट: {d.routeName || '---'} | वाहन: {d.vehicleNumber || '---'}</div>
          <div className="p-2 border border-black rounded bg-slate-50 text-right">ड्रायव्हर: {d.driverName || '---'} | शिफ्ट: {d.shift || '---'}</div>
        </div>
        <div className="w-full border border-black rounded overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white font-black text-[7pt] uppercase text-center">
                <th className="p-1 border-r border-white/20">क्र.</th>
                <th className="p-1 border-r border-white/20 text-left">केंद्र नाव</th>
                <th className="p-1 border-r border-white/20">कोड</th>
                <th className="p-1 border-r border-white/20">IN</th>
                <th className="p-1 border-r border-white/20">OUT</th>
                <th className="p-1 border-r border-white/20">E-Cans</th>
                <th className="p-1 border-r border-white/20">F-Cans</th>
                <th className="p-1">बर्फ वापर</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, idx: number) => (
                <tr key={idx} className="font-bold text-[8pt] uppercase border-b border-black last:border-0 text-center">
                  <td className="p-1 border-r border-black">{idx + 1}</td>
                  <td className="p-1 border-r border-black text-left">{log.supplierName}</td>
                  <td className="p-1 border-r border-black">{log.centerCode}</td>
                  <td className="p-1 border-r border-black">{log.arrivalTime}</td>
                  <td className="p-1 border-r border-black">{log.departureTime}</td>
                  <td className="p-1 border-r border-black">{log.emptyCans}</td>
                  <td className="p-1 border-r border-black">{log.fullCans}</td>
                  <td className="p-1">{log.iceUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full grid grid-cols-1 gap-2 text-left mb-6">
          {["achievements", "problems", "actionsTaken", "visitDiscussion"].map(key => d[key] && (
            <div key={key} className="p-2 border border-black rounded bg-slate-50/50">
              <span className="text-[7pt] font-black uppercase text-slate-500 block">{labelMap[key] || key.toUpperCase()}</span>
              <p className="text-[9pt] font-bold">{d[key]}</p>
            </div>
          ))}
        </div>
        <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest">
          <div className="border-t-[1.5px] border-black pt-2">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1.5px] border-black pt-2">सुपरवायझर: {d.supervisorName || '---'}</div>
        </div>
      </div>
    );
  };

  const BreakdownLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const entries = Object.entries(d).filter(([k, v]) => labelMap[k] && v && !['centerLosses', 'reportHeading', 'name', 'idNumber'].includes(k));
    const losses = d.centerLosses || [];
    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-6 printable-report flex flex-col items-center">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} />
        <div className="w-full border border-black rounded overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <tbody>
              {entries.map(([k, v]: any) => (
                <tr key={k} className="border-b border-black last:border-0 text-[9pt] font-bold">
                  <td className="p-2 bg-slate-50 uppercase text-[8pt] font-black border-r border-black w-1/3">{labelMap[k]}</td>
                  <td className="p-2">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {losses.length > 0 && (
          <div className="w-full border border-black rounded overflow-hidden mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white font-black text-[7pt] uppercase text-center">
                  <th className="p-1 border-r border-white/20 text-left">कोड/गवळी नाव</th>
                  <th className="p-1 border-r border-white/20">प्रकार</th>
                  <th className="p-1 border-r border-white/20">Ltr</th>
                  <th className="p-1">रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {losses.map((loss: any, idx: number) => (
                  <tr key={idx} className="font-bold text-[8pt] uppercase border-b border-black last:border-0 text-center">
                    <td className="p-1 border-r border-black text-left">{loss.centerCode} {loss.centerName}</td>
                    <td className="p-1 border-r border-black">{loss.milkType}</td>
                    <td className="p-1 border-r border-black">{loss.qtyLiters}</td>
                    <td className="p-1">{loss.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest">
          <div className="border-t-[1.5px] border-black pt-2">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1.5px] border-black pt-2">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  const GenericLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const entries = Object.entries(d).filter(([k, v]) => labelMap[k] && v && !['routeVisitLogs', 'reportHeading', 'name', 'idNumber', 'remarkPoints'].includes(k));
    const remarkPoints = d.remarkPoints || [];
    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-6 printable-report flex flex-col items-center">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} subName={d.name || d.repName || profileName} subId={d.idNumber || d.repId || profileId} />
        <div className="w-full border border-black rounded overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <tbody>
              {entries.map(([k, v]: any) => (
                <tr key={k} className="border-b border-black last:border-0 text-[9pt] font-bold">
                  <td className="p-2 bg-slate-50 uppercase text-[8pt] font-black border-r border-black w-1/3">{labelMap[k]}</td>
                  <td className="p-2">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {remarkPoints.length > 0 && (
          <div className="w-full p-3 border border-black rounded bg-slate-50 mb-4">
            <span className="text-[8pt] font-black uppercase block border-b border-black/10 pb-1 mb-2">केलेल्या कामाचा सविस्तर शेरा:</span>
            <ul className="list-decimal list-inside space-y-1">
              {remarkPoints.map((p: string, i: number) => (
                <li key={i} className="text-[9pt] font-bold">{p}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest">
          <div className="border-t-[1.5px] border-black pt-2">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1.5px] border-black pt-2">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  if (!mounted) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="max-w-4xl mx-auto px-2 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h2 className="text-xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">ARCHIVE & RECORD MANAGEMENT</p>
        </div>
        <Button asChild className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto">
          <Link href="/daily-report"><Plus className="h-4 w-4 mr-2" /> नवीन अहवाल</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {reportTypes.map((rt) => (
          <button 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={`h-24 flex flex-col items-center justify-center rounded-2xl border transition-all ${typeFilter === rt.type ? 'bg-primary text-white border-primary shadow-xl scale-[0.98]' : 'bg-white text-slate-900 border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md'}`}
          >
            <rt.icon className={`h-6 w-6 mb-2 ${typeFilter === rt.type ? 'text-white' : rt.color}`} />
            <span className="text-[10px] font-black text-center uppercase tracking-tighter px-1">{rt.title}</span>
          </button>
        ))}
      </div>

      <Card className="p-4 mb-6 bg-white border-none shadow-2xl rounded-3xl">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="h-12 pl-10 text-[13px] bg-slate-50 border-none rounded-2xl font-bold shadow-inner" placeholder="नाव किंवा सारांश शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Input type="date" className="h-12 text-[12px] bg-slate-50 border-none rounded-2xl font-black w-full sm:w-40 shadow-inner" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
      </Card>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">तारीख</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">अहवाल शीर्षक व सारांश</th>
              <th className="p-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">क्रिया</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-primary/[0.02] cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                <td className="p-4 font-black text-[11px] text-slate-500 uppercase">{report.date}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-black text-[12px] text-primary uppercase group-hover:translate-x-1 transition-transform">{report.fullData?.reportHeading || report.type}</span>
                    <span className="text-[10px] text-slate-400 italic truncate max-w-[250px]">{report.summary}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl" onClick={(e) => handleEditReport(report, e)}><FileEdit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl" onClick={(e) => handleDeleteReport(report.id, e)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[95vw] p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-slate-100">
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between no-print">
            <DialogTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> अहवाल प्रीव्ह्यू
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-9 px-4 font-black uppercase rounded-xl bg-black text-white hover:bg-black/90"><Printer className="h-3.5 w-3.5 mr-1.5" /> प्रिंट अहवाल</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-slate-100">
            <div className="w-full flex flex-col items-center">
              {selectedReport && (
                selectedReport.type === 'Route Visit' ? <RouteSlipLayout report={selectedReport} /> :
                selectedReport.type === 'Transport Breakdown Report' ? <BreakdownLayout report={selectedReport} /> :
                <GenericLayout report={selectedReport} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body * { visibility: hidden !important; background: white !important; }
          .printable-report, .printable-report * { visibility: visible !important; opacity: 1 !important; color: black !important; }
          .printable-report { 
            position: absolute !important; left: 0 !important; right: 0 !important; top: 0 !important;
            margin: 0 auto !important; width: 100% !important; max-width: 210mm !important; 
            border: 1.5px solid black !important; padding: 8mm !important; display: block !important;
            box-shadow: none !important;
          }
          .no-print, button, header, nav, footer, .sidebar, [role="dialog"] [class*="Close"] { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1.5px solid black !important; }
          th, td { border: 1px solid black !important; padding: 3pt 5pt !important; font-size: 8.5pt !important; line-height: 1.2 !important; }
          th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
