
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, ListTodo, 
  ShieldAlert, ClipboardCheck, FileSignature, Plus, Info, AlertTriangle, FileCheck, User, Layers, FileStack, ClipboardList, Thermometer, ShieldCheck as ShieldIcon, Briefcase, Milk, MapPin, FileText, AlertCircle, Car, Navigation
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
  const [isGroupView, setIsGroupView] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const reportTypes = [
    { title: "रूट व्हिजिट", type: "Route Visit", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "क्षेत्र भेट", type: "Field Visit", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "ऑफिस काम", type: "Daily Office Work", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "ब्रेकडाऊन", type: "Transport Breakdown Report", icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "कामकाज नोंद", type: "Daily Task", icon: ListTodo, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "जप्ती व दंड", type: "Seizure & Penalty", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "दैनिक कामकाज", type: "Daily Work Report", icon: ClipboardCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "वर्ड फॉर्म", type: "Official Document", icon: FileSignature, color: "text-slate-600", bg: "bg-slate-50" },
  ]

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesDate = filterDate === "" || r.date === filterDate
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q) || r.overallSummary?.toLowerCase().includes(q)
      
      let matchesType = !typeFilter || r.type === typeFilter;
      if (typeFilter === "Transport Breakdown Report" && (r.type === "Breakdown" || r.type === "Transport Breakdown Report")) {
        matchesType = true;
      }

      return matchesDate && matchesSearch && matchesType
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [firestoreReports, filterDate, searchQuery, typeFilter])

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
      'Breakdown': '/reports/entry/breakdown',
      'Daily Work Report': '/reports/entry/daily',
      'Seizure & Penalty': '/reports/entry/seizure',
      'Daily Task': '/work-log',
      'Official Document': '/form-builder'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  const labelMap: Record<string, string> = {
    supplierName: "पुरवठादार किंवा केंद्राचे नाव",
    supplierId: "पुरवठादार कोड (ID)",
    centerCode: "केंद्र कोड (ID)",
    centerName: "केंद्राचे नाव",
    route: "संकलन रूट",
    routeName: "रूट नाव",
    seizureQty: "जप्त दूध (Liters)",
    reason: "जप्तीचे कारण",
    fineAmount: "दंडाची रक्कम (₹)",
    actionTaken: "केलेली कार्यवाही",
    actionsTaken: "केलेली कार्यवाही",
    vehicleNo: "वाहन क्र.",
    vehicleNumber: "वाहन क्र.",
    driverName: "ड्रायव्हर",
    mobile: "मोबाईल",
    location: "ठिकाण",
    breakdownTime: "बिघाड वेळ",
    severity: "बिघाड स्वरूप",
    detailedReason: "बिघाड सविस्तर",
    estimatedRepairTime: "दुरुस्ती वेळ",
    estimatedRepairCost: "दुरुस्ती खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी",
    recoveryArrivalTime: "पोहोच वेळ",
    milkHot: "दूध गरम झाले?",
    milkSour: "दूध खराब झाले?",
    visitPerson: "भेटलेली व्यक्ती",
    visitPurpose: "भेटीचा उद्देश",
    visitDiscussion: "झालेली चर्चा",
    travelVehicle: "वाहन प्रकार",
    travelTotalKm: "एकूण KM",
    officeTaskSubject: "कामाचा विषय",
    officeTaskDetails: "कामाचा गोषवारा",
    pendingOfficeWork: "उद्याची कामे",
    achievements: "आजची कामगिरी",
    problems: "समस्या",
    supervisorName: "सुपरवायझर",
    totalLossAmount: "आर्थिक नुकसान (₹)",
    tempAfterChilling: "तापमान (°C)",
    result: "तपासणी निकाल"
  };

  const orderedKeys = [
    "supplierName", "centerName", "supplierId", "centerCode", "route", "routeName",
    "visitPerson", "visitPurpose", "visitDiscussion", "travelVehicle", 
    "officeTaskSubject", "officeTaskDetails", "pendingOfficeWork",
    "achievements", "problems", "actionsTaken", "actionTaken", "supervisorName",
    "vehicleNumber", "vehicleNo", "driverName", "mobile", "breakdownTime", "location", 
    "severity", "detailedReason", "estimatedRepairTime", "estimatedRepairCost", 
    "recoveryVehicleNo", "recoveryArrivalTime", "milkHot", "milkSour", 
    "totalLossAmount", "fineAmount", "seizureQty", "reason",
    "tempAfterChilling", "result"
  ];

  const reportsToRender = useMemo(() => {
    if (isGroupView && selectedReport?.type === 'Daily Task') {
      return (firestoreReports || []).filter(r => 
        r.type === 'Daily Task' && r.date === selectedReport.date
      ).sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return selectedReport ? [selectedReport] : [];
  }, [isGroupView, selectedReport, firestoreReports]);

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIceAllocated = logs.reduce((sum: number, l: any) => sum + (Number(l.iceAllocated) || 0), 0);
    const totalIceUsed = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-slate-900 rounded-sm shadow-none w-full max-w-[210mm] mx-auto print:border-black printable-report p-4 sm:p-5 mb-2 overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b-[1.5px] border-slate-900 pb-1.5 mb-2 print:border-black gap-1 text-center sm:text-left">
          <div className="space-y-0">
            <h1 className="font-black uppercase text-[11pt] sm:text-[14pt] leading-tight tracking-tight">{d.reportHeading || 'अहवाल'}</h1>
            <p className="text-[6pt] sm:text-[7pt] font-black uppercase text-slate-500 tracking-widest">सादरकर्ता: {profileName} (ID: {profileId})</p>
          </div>
          <div className="text-right font-black uppercase text-[7pt] sm:text-[8pt]">तारीख: {report.date}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 mb-2 font-black text-[7pt] uppercase">
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md print:bg-white print:border-black flex justify-between gap-2">
            <span>रूट: {d.routeName || '---'}</span>
            <span>ड्रायव्हर: {d.driverName || '---'}</span>
          </div>
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md print:bg-white print:border-black flex justify-between gap-2">
            <span>वाहन क्र.: {d.vehicleNumber || '---'}</span>
            <span>स्लिप: #{d.slipNo || '---'}</span>
          </div>
        </div>

        <div className="border border-slate-900 rounded-md overflow-hidden mb-2 print:border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[6pt] sm:text-[7pt] uppercase tracking-wider print:bg-black">
                <th className="p-1 text-center w-5 border-r border-white/20">क्र.</th>
                <th className="p-1 text-left border-r border-white/20">केंद्र व कोड</th>
                <th className="p-1 text-center border-r border-white/20">वेळ</th>
                <th className="p-1 text-center border-r border-white/20">कॅन (E/F)</th>
                <th className="p-1 text-center border-r border-white/20">बर्फ (Kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 print:divide-black">
              {logs.map((log: any, idx: number) => (
                <tr key={idx} className="font-bold text-[6pt] sm:text-[7pt] uppercase">
                  <td className="p-1 text-center border-r border-slate-900 bg-slate-50 print:border-black">{idx + 1}</td>
                  <td className="p-1 border-r border-slate-900 font-black print:border-black text-left">
                    {log.supplierName || '---'} <span className="text-[5pt] text-slate-500">({log.centerCode || '---'})</span>
                  </td>
                  <td className="p-1 text-center border-r border-slate-900 print:border-black">{log.arrivalTime || '--'}-{log.departureTime || '--'}</td>
                  <td className="p-1 text-center border-r border-slate-900 print:border-black">{log.emptyCans || '0'}/<span className="font-black text-primary print:text-black">{log.fullCans || '0'}</span></td>
                  <td className="p-1 text-center border-r border-slate-900 print:border-black">{log.iceAllocated || '0'}/{log.iceUsed || '0'}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black text-[7pt] uppercase print:bg-white print:border-t-2 print:border-black">
                <td className="p-1.5 text-right border-r border-slate-900 print:border-black" colSpan={3}>एकूण सारांश:</td>
                <td className="p-1.5 text-center border-r border-slate-900 print:border-black">{totalEmpty} / {totalFull}</td>
                <td className="p-1.5 text-center">{totalIceAllocated} / {totalIceUsed}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left mb-4">
          {d.achievements && (
            <div className="p-1.5 border border-slate-300 rounded-md print:border-black">
              <span className="text-[6pt] font-black uppercase text-primary print:text-black block border-b mb-0.5">कामगिरी:</span>
              <p className="text-[7pt] font-bold leading-tight line-clamp-2">{d.achievements}</p>
            </div>
          )}
          {d.problems && (
            <div className="p-1.5 border border-slate-300 rounded-md print:border-black">
              <span className="text-[6pt] font-black uppercase text-rose-600 print:text-black block border-b mb-0.5">समस्या:</span>
              <p className="text-[7pt] font-bold leading-tight line-clamp-2">{d.problems}</p>
            </div>
          )}
          {d.actionsTaken && (
            <div className="p-1.5 border border-slate-300 rounded-md print:border-black">
              <span className="text-[6pt] font-black uppercase text-blue-600 print:text-black block border-b mb-0.5">कार्यवाही:</span>
              <p className="text-[7pt] font-bold leading-tight line-clamp-2">{d.actionsTaken}</p>
            </div>
          )}
          {d.supervisorName && (
            <div className="p-1.5 flex items-end justify-end">
              <p className="text-[7pt] font-black uppercase">सुपरवायझर: {d.supervisorName}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-10 text-center uppercase font-black text-[7pt] tracking-widest text-slate-400">
          <div className="border-t-[1px] border-slate-900 pt-1 print:border-black print:text-black">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1px] border-slate-900 pt-1 print:border-black print:text-black">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  const GenericTableLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const mainHeading = d.reportHeading || d.title || report.type;
    
    const entriesToShow = orderedKeys.filter(key => {
      const val = d[key];
      return val !== undefined && val !== "" && val !== null;
    });

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.5px] border-slate-900 rounded-sm shadow-none print:border-black mb-2 last:mb-0 break-inside-avoid w-full max-w-[210mm] mx-auto p-4 sm:p-5 printable-report overflow-visible">
        <div className="border-b-[1.5px] border-slate-900 text-center pb-1.5 mb-2 print:border-black">
          <h1 className="text-[11pt] sm:text-[14pt] font-black uppercase tracking-tight leading-tight">{mainHeading}</h1>
          <div className="mt-0.5 text-[6pt] sm:text-[7pt] font-black uppercase tracking-widest text-slate-500">सादरकर्ता: {profileName} (ID: {profileId}) | तारीख: {report.date}</div>
        </div>
        
        <div className="border border-slate-900 rounded-md overflow-hidden print:border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[6pt] sm:text-[8pt] uppercase tracking-widest print:bg-black">
                <th className="p-1.5 text-left w-[40%] border-r border-white/20">तपशील (QUESTION)</th>
                <th className="p-1.5 text-left">माहिती (DETAILS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 print:divide-black">
              {entriesToShow.map((key) => {
                const val = d[key];
                return (
                  <tr key={key} className="font-bold text-[7pt] sm:text-[8.5pt] text-left">
                    <td className="p-1.5 bg-slate-50 uppercase text-[6pt] sm:text-[7.5pt] font-black border-r border-slate-900 print:bg-white print:border-black">{labelMap[key] || key.toUpperCase()}</td>
                    <td className="p-1.5 whitespace-pre-wrap leading-snug">{typeof val === 'boolean' ? (val ? "हो" : "नाही") : (Array.isArray(val) ? val.join(' | ') : String(val || "-"))}</td>
                  </tr>
                );
              })}
              
              {(d.travelStartKm || d.travelEndKm || d.travelTotalKm) && (
                <tr className="font-bold text-[7pt] sm:text-[8.5pt] text-left">
                  <td className="p-1.5 bg-slate-50 uppercase text-[6pt] sm:text-[7.5pt] font-black border-r border-slate-900 print:bg-white print:border-black">प्रवास किमी (START/END/TOTAL)</td>
                  <td className="p-1.5">
                    <div className="flex gap-4 font-black uppercase text-[7pt] sm:text-[8pt]">
                      <span>सुरुवात: {d.travelStartKm || '0'}</span>
                      <span>शेवट: {d.travelEndKm || '0'}</span>
                      <span className="text-primary print:text-black">एकूण: {d.travelTotalKm || '0'} KM</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {((d.losses && d.losses.length > 0) || (d.centerLosses && d.centerLosses.length > 0)) && (
          <div className="mt-2 space-y-1 text-left">
            <div className="text-[7pt] font-black uppercase text-rose-700">नुकसानीचा तपशील:</div>
            <div className="border border-slate-900 rounded-md overflow-hidden shadow-none print:border-black">
              <table className="w-full border-collapse text-[6pt] sm:text-[7.5pt]">
                <thead className="bg-slate-900 text-white font-black uppercase tracking-wider print:bg-black">
                  <tr>
                    <th className="p-1 text-left border-r border-white/20">नाव/कोड</th>
                    <th className="p-1 text-center w-10 border-r border-white/20">प्रकार</th>
                    <th className="p-1 text-center w-10 border-r border-white/20">Ltr</th>
                    <th className="p-1 text-right w-16">रक्कम (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black">
                  {(d.losses || d.centerLosses).map((l: any, i: number) => (
                    <tr key={i} className="text-center font-bold">
                      <td className="p-1 text-left uppercase border-r border-slate-200 font-black print:border-black">{l.supplierName || l.centerName || l.centerCode || '---'}</td>
                      <td className="p-1 border-r border-slate-200 print:border-black">{l.milkType || '-'}</td>
                      <td className="p-1 border-r border-slate-200 font-black print:border-black">{l.qtyLiters || '0'}</td>
                      <td className="p-1 text-right font-black print:text-black">₹{l.lossAmount || '0'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-[7pt] print:bg-white print:border-t-[1.5px] print:border-black">
                    <td className="p-1.5 text-right uppercase border-r border-slate-200 print:border-black" colSpan={3}>एकूण आर्थिक नुकसान:</td>
                    <td className="p-1.5 text-right text-[8pt] print:text-black">₹{d.totalLossAmount || d.lossAmount || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-2 gap-10 text-center uppercase font-black text-[7pt] tracking-widest text-slate-400">
          <div className="border-t-[1px] border-slate-900 pt-1 print:border-black print:text-black">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1px] border-slate-900 pt-1 print:border-black print:text-black">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="compact-form-container pb-20 max-w-4xl mx-auto px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight"><Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive & Record Management</p>
        </div>
        <Button asChild size="sm" className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto">
          <Link href="/reports/entry/seizure"><Plus className="h-4 w-4 mr-2" /> जप्ती नोंद</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        {reportTypes.map((rt) => (
          <button key={rt.title} onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)} className={`h-16 flex flex-col items-center justify-center p-1 rounded-xl border transition-all hover:shadow-md active:scale-95 ${typeFilter === rt.type ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
            <rt.icon className={`h-4 w-4 mb-1 ${typeFilter === rt.type ? 'text-white' : rt.color}`} />
            <span className="text-[8px] font-black leading-tight text-center uppercase tracking-tighter">{rt.title}</span>
          </button>
        ))}
      </div>

      <Card className="p-3 mb-6 bg-white border-none shadow-2xl rounded-3xl ring-1 ring-slate-100">
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="relative flex-1 min-w-[180px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="h-11 pl-10 text-[12px] bg-slate-50 border-none rounded-2xl font-bold focus-visible:ring-primary shadow-inner" placeholder="नाव किंवा सारांश शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative w-full sm:w-auto">
            <Input type="date" className="h-11 text-[11px] bg-slate-50 border-none rounded-2xl font-black w-full sm:w-36 shadow-inner" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {typeFilter && <Button variant="ghost" size="icon" onClick={() => setTypeFilter(null)} className="h-11 w-11 text-rose-500 bg-rose-50 rounded-2xl"><X className="h-5 w-5" /></Button>}
        </div>
      </Card>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-32">तारीख</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">अहवाल शीर्षक व सारांश</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right w-32">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); setIsGroupView(false); }}>
                  <td className="p-4 font-black text-[11px] text-slate-500 uppercase">{report.date}</td>
                  <td className="p-4 text-left">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[11px] font-black uppercase text-primary group-hover:underline">{report.fullData?.reportHeading || report.type}</span>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic font-bold opacity-80">{report.summary}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl" onClick={(e) => handleEditReport(report, e)}><FileEdit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl" onClick={(e) => handleDeleteReport(report.id, e)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr><td colSpan={3} className="py-32 text-center opacity-20"><Archive className="h-16 w-16 mx-auto mb-4" /><p className="font-black uppercase text-[11px] tracking-[0.4em] italic">कोणतीही नोंद उपलब्ध नाही</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[95vw] sm:w-[90vw] p-0 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-2xl bg-slate-100">
          <DialogHeader className="p-3 sm:p-4 bg-white border-b flex flex-col sm:flex-row items-center justify-between no-print gap-3">
            <div className="flex items-center gap-3 px-2 w-full sm:w-auto">
              <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">{isGroupView ? <FileStack className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</div>
              <div className="text-left min-w-0">
                <DialogTitle className="text-[10px] sm:text-[11px] font-black uppercase text-slate-900 tracking-[0.1em] sm:tracking-[0.2em] truncate">{isGroupView ? 'एकत्रित कार्य अहवाल' : 'अहवाल तपशील'}</DialogTitle>
                <DialogDescription className="text-[8px] sm:text-[9px] font-bold uppercase text-slate-400">Preview</DialogDescription>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end sm:pr-2">
              {selectedReport?.type === 'Daily Task' && <Button variant={isGroupView ? "secondary" : "outline"} size="sm" onClick={() => setIsGroupView(!isGroupView)} className="h-8 sm:h-9 px-2 sm:px-3 font-black uppercase rounded-xl border-primary/20 text-[8px] sm:text-[9px]">{isGroupView ? <Layers className="h-3.5 w-3.5 mr-1.5" /> : <FileStack className="h-3.5 w-3.5 mr-1.5" />} {isGroupView ? 'सिंगल' : 'दिवसाचे टास्क'}</Button>}
              <Button size="sm" onClick={() => window.print()} className="h-8 sm:h-9 px-3 sm:px-4 font-black uppercase rounded-xl shadow-lg shadow-primary/20 text-[8px] sm:text-[9px] bg-primary text-white"><Printer className="h-3.5 w-3.5 mr-1.5" /> प्रिंट</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 sm:h-6 sm:w-6" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] sm:max-h-[85vh] p-2 sm:p-6 bg-slate-100">
            <div className="w-full flex flex-col items-center gap-4 py-2 sm:py-4 print:py-0 print:gap-0">
              {reportsToRender.map((report, idx) => (
                <div key={report.id} className={`${idx > 0 ? "print:page-break-before-always" : ""} w-full flex justify-center`}>
                  {report.type === 'Route Visit' ? (
                    <RouteSlipLayout report={report} />
                  ) : (report.fullData?.isWordDoc ? (
                    <div className="prose prose-sm max-w-none px-4 sm:px-12 py-6 sm:py-10 bg-white border-[1.5px] border-slate-900 rounded-sm shadow-2xl min-h-[600px] print:shadow-none print:border-black printable-report w-full mx-auto" dangerouslySetInnerHTML={{ __html: report.fullData.content }} />
                  ) : (
                    <GenericTableLayout report={report} />
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0mm;
          }
          
          html, body {
            visibility: hidden !important;
            height: auto !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .printable-report, .printable-report * {
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
          }

          .printable-report {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: 1.5px solid black !important;
            background: white !important;
            z-index: 99999 !important;
            display: block !important;
          }

          .no-print, button, header, nav, footer, .sidebar, .sidebar-trigger, [role="dialog"] > button, [data-radix-collection-item], [role="dialog"], .bg-slate-100 {
            display: none !important;
            background: none !important;
          }

          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            border: 1.5px solid black !important;
          }

          th, td { 
            border: 1px solid black !important; 
            padding: 4pt !important; 
            font-size: 8pt !important;
            color: black !important;
          }

          h1 { font-size: 14pt !important; text-align: center !important; margin-bottom: 2pt !important; }
          h3, h4 { font-size: 10pt !important; }
        }
      `}</style>
    </div>
  )
}
