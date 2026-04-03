
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Microscope, Milk
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

  const profileName = userData?.displayName || user?.displayName || "सुपरवायझर";
  const profileId = userData?.employeeId || "---";

  const [filterDate, setFilterDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const reportTypes = [
    { title: "रूट व्हिजिट", type: "Route Visit", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "ब्रेकडाऊन", type: "Transport Breakdown Report", icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "जप्ती व दंड", type: "Seizure & Penalty", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "केंद्र ऑडिट", type: "Collection Center Audit", icon: Microscope, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  const labelMap: Record<string, string> = {
    reportHeading: "अहवाल शीर्षक",
    date: "तारीख",
    shift: "शिफ्ट",
    slipNo: "स्लिप नंबर",
    idNumber: "अधिकारी आयडी",
    supervisorName: "सुपरवायझर नाव",
    supplierName: "नाव",
    supplierId: "कोड (ID)",
    centerName: "केंद्राचे नाव",
    centerCode: "केंद्राचा कोड",
    ownerName: "मालकाचे नाव",
    mobile: "मोबाईल",
    address: "पत्ता",
    routeName: "रूट नाव",
    vehicleNumber: "वाहन क्र.",
    vehicleNo: "वाहन क्र.",
    driverName: "ड्रायव्हर नाव",
    location: "बिघाड ठिकाण",
    reason: "बिघाड कारण",
    severity: "बिघाड स्वरूप",
    detailedReason: "सविस्तर कारण",
    estimatedRepairTime: "दुरुस्ती वेळ",
    estimatedRepairCost: "दुरुस्ती खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी",
    recoveryArrivalTime: "पोहोच वेळ",
    milkHot: "दूध गरम झाले?",
    milkSour: "दूध खराब झाले?",
    achievements: "आजची कामगिरी",
    problems: "महत्त्वाच्या समस्या",
    actionTaken: "केलेली कार्यवाही",
    actionsTaken: "केलेली कार्यवाही",
    totalLossAmount: "आर्थिक नुकसान (₹)",
    fineAmount: "दंड रक्कम (₹)",
    seizureQty: "जप्त दूध (L)",
    tempAfterChilling: "तापमान (°C)",
    result: "तपासणी निकाल",
    morningQty: "सकाळ दूध (L)",
    eveningQty: "संध्याकाळ दूध (L)",
    fat: "फॅट (%)",
    snf: "SNF (%)",
    observations: "निरीक्षणे",
    remark: "सविस्तर शेरा"
  };

  const orderedKeys = [
    "reportHeading", "date", "shift", "idNumber", "repId", "repName",
    "supplierName", "centerName", "supplierId", "centerCode", "ownerName", "mobile", "address",
    "visitPerson", "visitPurpose", "visitDiscussion", "vehicleNumber", "vehicleNo", "driverName", "routeName", "slipNo",
    "location", "reason", "severity", "detailedReason", "estimatedRepairTime", "estimatedRepairCost", 
    "recoveryVehicleNo", "recoveryArrivalTime", "milkHot", "milkSour", 
    "totalLossAmount", "fineAmount", "seizureQty",
    "tempAfterChilling", "morningQty", "eveningQty", "fat", "snf", "result", "observations", "remark"
  ];

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesDate = filterDate === "" || r.date === filterDate
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q) || r.overallSummary?.toLowerCase().includes(q)
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
      'Seizure & Penalty': '/reports/entry/seizure', 'Daily Task': '/work-log', 'Official Document': '/form-builder',
      'Collection Center Audit': '/reports/entry/audit', 'Chilling Report': '/reports/entry/chilling'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  const ReportHeader = ({ title, date, profileName, profileId }: any) => (
    <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
          <Milk className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-[18pt] font-black uppercase tracking-tight leading-none">संकलन नोंदवही</h1>
      </div>
      <h2 className="text-[12pt] font-black uppercase text-slate-700 tracking-widest border-y border-slate-200 py-1 mb-2">{title}</h2>
      <div className="flex justify-between text-[8pt] font-black uppercase text-slate-500 tracking-wider">
        <span>सादरकर्ता: {profileName} ({profileId})</span>
        <span>तारीख: {date}</span>
      </div>
    </div>
  )

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIce = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm shadow-none w-full max-w-[210mm] mx-auto print:border-black printable-report p-6 mb-4 flex flex-col items-center">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} profileName={profileName} profileId={profileId} />
        
        <div className="w-full grid grid-cols-2 gap-2 mb-4 font-black text-[9pt] uppercase">
          <div className="p-2 border border-black rounded flex justify-between bg-slate-50"><span>रूट: {d.routeName || '---'}</span><span>ड्रायव्हर: {d.driverName || '---'}</span></div>
          <div className="p-2 border border-black rounded flex justify-between bg-slate-50"><span>वाहन: {d.vehicleNumber || '---'}</span><span>स्लिप: #{d.slipNo || '---'}</span></div>
        </div>

        <div className="w-full border border-black rounded overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white font-black text-[7pt] uppercase tracking-wider">
                <th className="p-1 border-r border-white/20 w-6">क्र.</th>
                <th className="p-1 border-r border-white/20 text-left">केंद्राचे नाव</th>
                <th className="p-1 border-r border-white/20 w-10">कोड</th>
                <th className="p-1 border-r border-white/20 w-12">IN वेळ</th>
                <th className="p-1 border-r border-white/20 w-12">OUT वेळ</th>
                <th className="p-1 border-r border-white/20 w-8">E</th>
                <th className="p-1 border-r border-white/20 w-8">F</th>
                <th className="p-1 w-12">बर्फ वापर</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, idx: number) => (
                <tr key={idx} className="font-bold text-[7.5pt] uppercase border-b border-black last:border-0">
                  <td className="p-1 text-center border-r border-black bg-slate-50">{idx + 1}</td>
                  <td className="p-1 border-r border-black text-left truncate max-w-[100px]">{log.supplierName || '---'}</td>
                  <td className="p-1 border-r border-black text-center">{log.centerCode || '---'}</td>
                  <td className="p-1 border-r border-black text-center">{log.arrivalTime || '--:--'}</td>
                  <td className="p-1 border-r border-black text-center">{log.departureTime || '--:--'}</td>
                  <td className="p-1 border-r border-black text-center">{log.emptyCans || '0'}</td>
                  <td className="p-1 border-r border-black text-center">{log.fullCans || '0'}</td>
                  <td className="p-1 text-center">{log.iceUsed || '0'}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black text-[8pt] uppercase border-t-[1.5px] border-black">
                <td className="p-1 text-right border-r border-black" colSpan={5}>एकूण सारांश:</td>
                <td className="p-1 text-center border-r border-black">{totalEmpty}</td>
                <td className="p-1 text-center border-r border-black">{totalFull}</td>
                <td className="p-1 text-center">{totalIce}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-full grid grid-cols-1 gap-2 text-left mb-6">
          {["achievements", "problems", "actionsTaken", "actionTaken"].map(key => d[key] && (
            <div key={key} className="p-2 border border-black rounded bg-slate-50/50">
              <span className="text-[7pt] font-black uppercase text-slate-500 block mb-0.5">{labelMap[key] || key.toUpperCase()}:</span>
              <p className="text-[9pt] font-bold leading-tight">{d[key]}</p>
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

  const GenericTableLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const entriesToShow = orderedKeys.filter(key => {
      const val = d[key];
      return val !== undefined && val !== "" && val !== null;
    });

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm shadow-none mb-4 last:mb-0 w-full max-w-[210mm] mx-auto p-6 printable-report flex flex-col items-center">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} profileName={profileName} profileId={profileId} />
        
        <div className="w-full border border-black rounded overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <tbody>
              {entriesToShow.map((key) => {
                const val = d[key];
                return (
                  <tr key={key} className="font-bold text-[9pt] text-left border-b border-black last:border-0">
                    <td className="p-1.5 bg-slate-50 uppercase text-[8pt] font-black border-r border-black w-[35%]">{labelMap[key] || key.toUpperCase()}</td>
                    <td className="p-1.5 whitespace-pre-wrap leading-tight">{typeof val === 'boolean' ? (val ? "हो" : "नाही") : (Array.isArray(val) ? val.join(' | ') : String(val || "-"))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {["achievements", "problems", "actionsTaken", "actionTaken"].some(k => d[k]) && (
          <div className="w-full grid grid-cols-1 gap-2 mb-4">
            {["achievements", "problems", "actionsTaken", "actionTaken"].map(key => d[key] && (
              <div key={key} className="p-2 border border-black rounded bg-slate-50/50">
                <span className="text-[7pt] font-black uppercase text-slate-500 block mb-0.5">{labelMap[key] || key.toUpperCase()}:</span>
                <p className="text-[9pt] font-bold leading-tight">{d[key]}</p>
              </div>
            ))}
          </div>
        )}

        {((d.losses && d.losses.length > 0) || (d.centerLosses && d.centerLosses.length > 0) || (d.points && d.points.length > 0)) && (
          <div className="w-full mb-4">
            <div className="text-[8pt] font-black uppercase text-rose-700 mb-1 tracking-widest">विशेष तपशील / नोंदी:</div>
            <div className="border border-black rounded overflow-hidden p-2 bg-slate-50">
              {d.points?.map((p: string, i: number) => <p key={i} className="text-[9pt] font-bold border-b border-slate-200 last:border-0 py-1">{i+1}. {p}</p>)}
              {(d.losses || d.centerLosses)?.map((l: any, i: number) => (
                <div key={i} className="flex justify-between text-[8pt] font-bold border-b border-slate-200 py-1">
                  <span>{l.centerName || l.supplierName} ({l.milkType})</span>
                  <span>{l.qtyLiters}L | ₹{l.lossAmount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest">
          <div className="border-t-[1.5px] border-black pt-2">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1.5px] border-black pt-2">सुपरवायझर: {d.supervisorName || '---'}</div>
        </div>
      </div>
    );
  };

  if (!mounted) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="compact-form-container pb-20 max-w-4xl mx-auto px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="flex flex-col gap-1 items-center sm:items-start">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight"><Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive Management</p>
        </div>
        <Button asChild size="sm" className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto">
          <Link href="/daily-report"><Plus className="h-4 w-4 mr-2" /> नवीन अहवाल</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {reportTypes.map((rt) => (
          <button key={rt.title} onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)} className={`h-16 flex flex-col items-center justify-center p-1 rounded-xl border transition-all ${typeFilter === rt.type ? 'bg-primary text-white border-primary' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
            <rt.icon className={`h-4 w-4 mb-1 ${typeFilter === rt.type ? 'text-white' : rt.color}`} />
            <span className="text-[8px] font-black leading-tight text-center uppercase">{rt.title}</span>
          </button>
        ))}
      </div>

      <Card className="p-3 mb-6 bg-white border-none shadow-2xl rounded-3xl">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="h-11 pl-10 text-[12px] bg-slate-50 border-none rounded-2xl font-bold shadow-inner" placeholder="नाव किंवा सारांश शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Input type="date" className="h-11 text-[11px] bg-slate-50 border-none rounded-2xl font-black w-full sm:w-36 shadow-inner" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          {typeFilter && <Button variant="ghost" size="icon" onClick={() => setTypeFilter(null)} className="h-11 w-11 text-rose-500 bg-rose-50 rounded-2xl"><X className="h-5 w-5" /></Button>}
        </div>
      </Card>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 w-32">तारीख</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400">अहवाल सारांश</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right w-24">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <td className="p-4 font-black text-[11px] text-slate-500 uppercase">{report.date}</td>
                  <td className="p-4"><span className="text-[11px] font-black uppercase text-primary block">{report.fullData?.reportHeading || report.type}</span><p className="text-[10px] text-slate-500 line-clamp-1 italic font-bold">{report.summary}</p></td>
                  <td className="p-4 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all"><Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => handleEditReport(report, e)}><FileEdit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg" onClick={(e) => handleDeleteReport(report.id, e)}><Trash2 className="h-4 w-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[95vw] p-0 rounded-[1.5rem] overflow-hidden border-none shadow-2xl bg-slate-100">
          <DialogHeader className="sr-only">
            <DialogTitle>अहवाल तपशील</DialogTitle>
            <DialogDescription>अहवालाची सविस्तर माहिती आणि प्रिंट पर्याय.</DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-white border-b flex flex-row items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText className="h-5 w-5" /></div>
              <span className="text-[11px] font-black uppercase tracking-widest">अहवाल तपशील</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-9 px-4 font-black uppercase rounded-xl bg-primary text-white"><Printer className="h-3.5 w-3.5 mr-1.5" /> प्रिंट</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
            </div>
          </div>
          <ScrollArea className="max-h-[85vh] p-4 bg-slate-100">
            <div className="w-full flex flex-col items-center">
              {selectedReport && (selectedReport.type === 'Route Visit' ? <RouteSlipLayout report={selectedReport} /> : <GenericTableLayout report={selectedReport} />)}
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
            border: 1.5px solid black !important; padding: 10mm !important; display: flex !important;
            flex-direction: column !important; align-items: center !important;
          }
          .no-print, button, header, nav, footer, .sidebar, [role="dialog"] > button { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1.2px solid black !important; }
          th, td { border: 1.2px solid black !important; padding: 4pt 6pt !important; font-size: 9pt !important; }
        }
      `}</style>
    </div>
  )
}
