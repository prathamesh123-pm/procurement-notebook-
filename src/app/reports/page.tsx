
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

  const profileName = userData?.displayName || user?.displayName || "संकलन सुपरवायझर";
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
    // Seizure
    supplierName: "पुरवठादार किंवा केंद्राचे पूर्ण नाव",
    supplierId: "पुरवठादार किंवा केंद्राचा आयडी कोड",
    route: "संबंधित संकलन रूटचे नाव",
    seizureQty: "जप्त केलेल्या दुधाचे एकूण प्रमाण (Liters)",
    reason: "दूध जप्त करण्याचे कारण",
    fineAmount: "आकारलेली दंडाची रक्कम (₹)",
    actionTaken: "जप्त केलेल्या दुधावर केलेली कारवाई",
    
    // Breakdown
    routeName: "दुध संकलन रूटचे नाव",
    vehicleNo: "गाडीचा नंबर (MH...)",
    vehicleNumber: "गाडीचा नंबर (MH...)",
    vehicleType: "गाडीचा प्रकार (उदा. पिकअप)",
    capacity: "गाडीची एकूण दूध क्षमता (L)",
    driverName: "ड्रायव्हरचे नाव",
    mobile: "ड्रायव्हरचा मोबाईल नंबर",
    breakdownTime: "गाडी बिघाड झाल्याची वेळ",
    location: "बिघाड झालेल्या ठिकाणाचे नाव",
    severity: "बिघाडाचे स्वरूप (छोटा/मोठा)",
    detailedReason: "बिघाडाचे सविस्तर वर्णन",
    estimatedRepairTime: "दुरुस्तीसाठी लागणारा वेळ (तास)",
    estimatedRepairCost: "दुरुस्तीसाठी लागणारा खर्च (₹)",
    recoveryVehicleNo: "दुध वाचवण्यासाठी पाठवलेली दुसरी गाडी",
    recoveryArrivalTime: "दुसरी गाडी पोहोचण्याची वेळ",
    milkHot: "दूध गरम झाले होते का?",
    milkSour: "दूध पूर्णपणे खराब झाले का?",
    
    // Structured Field Visit
    visitPerson: "कोणाची भेट घेतली? (नाव व पद)",
    visitPurpose: "भेटीचा मुख्य उद्देश",
    visitDiscussion: "झालेली सविस्तर चर्चा व मुद्दे",
    travelVehicle: "वापरलेले वाहन (Travel Mode)",
    travelStartKm: "प्रवास सुरुवात किलोमीटर (Start KM)",
    travelEndKm: "प्रवास शेवट किलोमीटर (End KM)",
    travelTotalKm: "प्रवास केलेले एकूण किलोमीटर",

    // Structured Office Work
    officeTaskSubject: "ऑफिस कामाचा मुख्य विषय",
    officeTaskDetails: "केलेल्या कामाचा सविस्तर गोषवारा",
    pendingOfficeWork: "प्रलंबित कामे (उद्यासाठी)",
    
    // Daily Work / Task Generic
    title: "कामाचा विषय किंवा टास्क",
    remark: "सविस्तर शेरा/नोंद",
    achievements: "आजची मोठी कामगिरी",
    problems: "कामात आलेले अडथळे/समस्या",
    actionsTaken: "केलेली कार्यवाही",
    supervisorName: "सुपरवायझरचे नाव",
    
    // Chilling
    centerName: "चिलिंग केंद्राचे नाव",
    tempAtArrival: "सुरुवातीचे तापमान (°C)",
    tempAfterChilling: "चिलिंग नंतरचे तापमान (°C)",
    waterSupply: "पाणी पुरवठ्याची स्थिती",
    powerBackup: "पॉवर बॅकअप सुविधा उपलब्ध आहे का?",
    hygieneStandard: "स्वच्छतेचा दर्जा",
    staffUniform: "स्टाफने गणवेश घातला होता का?",
    fssaiDisplay: "FSSAI परवाना लावला आहे का?",
    iceBankStatus: "आईस बँकची सद्यस्थिती",
    
    // Generic
    summary: "कामाचा संक्षिप्त सारांश",
    totalLossAmount: "या घटनेमुळे झालेले एकूण आर्थिक नुकसान (₹)"
  };

  const orderedKeys = [
    "supplierName", "supplierId", "route",
    "visitPerson", "visitPurpose", "visitDiscussion", "travelVehicle", "travelStartKm", "travelEndKm", "travelTotalKm",
    "officeTaskSubject", "officeTaskDetails", "pendingOfficeWork",
    "title", "remark", "actionTaken", "actionsTaken", "achievements", "problems",
    "summary",
    "routeName", "vehicleNumber", "vehicleNo", "vehicleType", "driverName", "mobile",
    "breakdownTime", "location", "reason", "severity", "detailedReason",
    "estimatedRepairTime", "estimatedRepairCost", "recoveryVehicleNo", "recoveryArrivalTime",
    "milkHot", "milkSour", "totalLossAmount", "fineAmount", "seizureQty",
    "centerName", "tempAtArrival", "tempAfterChilling", "waterSupply", "powerBackup", "hygieneStandard", "staffUniform", "fssaiDisplay", "iceBankStatus"
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

    return (
      <div className="bg-white p-4 font-sans text-slate-900 border-[2px] border-slate-900 rounded-sm shadow-none w-full max-w-full mx-auto print:border-black printable-report">
        <div className="flex justify-between items-center border-b-[2px] border-slate-900 pb-2 mb-4 print:border-black">
          <div className="space-y-0.5 text-left">
            <h1 className="font-black uppercase text-lg tracking-tighter">
              {d.reportHeading || 'रूट व्हिजिट रिपोर्ट'}
            </h1>
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">सादरकर्ता: {profileName} (ID: {profileId})</p>
          </div>
          <div className="text-right font-black uppercase text-[9px] leading-tight">
            <p>तारीख: {d.reportDate || '---'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 font-black text-[10px] uppercase text-left">
          <div className="space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-lg print:bg-white print:border-black">
            <div className="flex justify-between border-b border-slate-200 pb-0.5"><span>रूट नाव:</span> <span>{d.routeName || '---'}</span></div>
            <div className="flex justify-between"><span>ड्रायव्हर:</span> <span>{d.driverName || '---'}</span></div>
          </div>
          <div className="space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-lg print:bg-white print:border-black">
            <div className="flex justify-between border-b border-slate-200 pb-0.5"><span>वाहन क्रमांक:</span> <span>{d.vehicleNumber || '---'}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5"><span>स्लिप नंबर:</span> <span>#{d.slipNo || '---'}</span></div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-900 rounded-lg mb-4 print:border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider print:bg-black">
                <th className="p-2 text-center w-8 border-r border-white/20">क्र.</th>
                <th className="p-2 text-left border-r border-white/20">केंद्र व कोड</th>
                <th className="p-2 text-center border-r border-white/20">आगमन</th>
                <th className="p-2 text-center border-r border-white/20">रिकामे</th>
                <th className="p-2 text-center border-r border-white/20">निर्गमन</th>
                <th className="p-2 text-center">भरलेले</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 print:divide-black">
              {logs.map((log: any, idx: number) => (
                <tr key={idx} className="font-bold text-[9px] uppercase hover:bg-slate-50 transition-colors">
                  <td className="p-2 text-center border-r border-slate-900 bg-slate-50 print:border-black">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-900 font-black print:border-black text-left">
                    {log.supplierName || '---'} <br/>
                    <span className="text-[7px] text-slate-400">ID: {log.centerCode || '---'}</span>
                  </td>
                  <td className="p-2 text-center border-r border-slate-900 print:border-black">{log.arrivalTime || '--:--'}</td>
                  <td className="p-2 text-center border-r border-slate-900 font-black print:border-black">{log.emptyCans || '0'}</td>
                  <td className="p-2 text-center border-r border-slate-900 print:border-black">{log.departureTime || '--:--'}</td>
                  <td className="p-2 text-center bg-primary/5 font-black text-primary print:text-black">{log.fullCans || '0'}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white font-black text-[10px] uppercase print:bg-black">
                <td className="p-2 text-center border-r border-white/20" colSpan={3}>एकूण सारांश</td>
                <td className="p-2 text-center border-r border-white/20">{totalEmpty}</td>
                <td className="p-2 text-center border-r border-white/20">-</td>
                <td className="p-2 text-center">{totalFull}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 text-center uppercase font-black text-[8px] tracking-widest text-slate-400">
          <div className="border-t border-slate-900 pt-2 print:border-black print:text-black">अधिकारी स्वाक्षरी</div>
          <div className="border-t border-slate-900 pt-2 print:border-black print:text-black">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  const GenericTableLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const mainHeading = d.reportHeading || d.title || report.type;

    const filteredEntries = orderedKeys
      .filter(key => {
        const val = d[key];
        return val !== undefined && val !== "" && val !== null;
      })
      .map(key => [key, d[key]]);

    const formatVal = (key: string, val: any): string => {
      if (typeof val === 'boolean') return val ? "हो (YES)" : "नाही (NO)";
      if (Array.isArray(val)) return val.join(' | ');
      return String(val || "-");
    }

    return (
      <div className="bg-white font-sans text-slate-900 border-[2px] border-slate-900 rounded-sm shadow-none print:border-black mb-4 last:mb-0 break-inside-avoid w-full max-w-full mx-auto p-6 printable-report">
        <div className="border-b-[2px] border-slate-900 text-center pb-4 mb-4 print:border-black">
          <h1 className="text-xl font-black uppercase tracking-tight">{mainHeading}</h1>
          <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
            सादरकर्ता: {profileName} (ID: {profileId}) | तारीख: {report.date}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-slate-900 rounded-lg overflow-hidden print:border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest print:bg-black">
                  <th className="p-2 text-left w-1/3 border-r border-white/20">तपशील (QUESTION)</th>
                  <th className="p-2 text-left">माहिती (DETAILS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 print:divide-black">
                {filteredEntries.map(([key, val]) => (
                  <tr key={key} className="font-bold text-[10px] hover:bg-slate-50 transition-colors text-left">
                    <td className="p-2 bg-slate-50 uppercase text-[9px] font-black border-r border-slate-900 print:bg-white print:border-black">
                      {labelMap[key] || key.toUpperCase()}
                    </td>
                    <td className="p-2 whitespace-pre-wrap">
                      {formatVal(key, val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(d.points && d.points.length > 0) && (
            <div className="mt-4 space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary">
                <AlertCircle className="h-4 w-4" /> विशेष निरीक्षणे:
              </div>
              <div className="border border-slate-900 rounded-lg p-3 print:border-black">
                <ul className="space-y-1.5">
                  {d.points.map((p: string, i: number) => (
                    <li key={i} className="text-[10px] font-bold flex gap-2">
                      <span className="text-primary font-black shrink-0">{i + 1}.</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {((d.losses && d.losses.length > 0) || (d.centerLosses && d.centerLosses.length > 0)) && (
            <div className="mt-4 space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-700">
                <AlertTriangle className="h-4 w-4" /> नुकसानीचा सविस्तर तक्ता:
              </div>
              <div className="border border-slate-900 rounded-lg overflow-hidden shadow-sm print:border-black overflow-x-auto">
                <table className="w-full border-collapse text-[9px]">
                  <thead className="bg-slate-900 text-white font-black uppercase tracking-wider print:bg-black">
                    <tr>
                      <th className="p-2 text-left border-r border-white/20">नाव</th>
                      <th className="p-2 text-center w-16 border-r border-white/20">प्रकार</th>
                      <th className="p-2 text-center w-16 border-r border-white/20">Ltr</th>
                      <th className="p-2 text-right w-24">रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-black">
                    {(d.losses || d.centerLosses).map((l: any, i: number) => (
                      <tr key={i} className="text-center font-bold hover:bg-slate-50 transition-colors">
                        <td className="p-2 text-left uppercase border-r border-slate-200 font-black print:border-black">{l.supplierName || l.centerName || '---'}</td>
                        <td className="p-2 border-r border-slate-200 print:border-black">{l.milkType || '-'}</td>
                        <td className="p-2 border-r border-slate-200 font-black print:border-black">{l.qtyLiters || '0'}</td>
                        <td className="p-2 text-right font-black print:text-black">₹{l.lossAmount || '0'}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black text-[10px] print:bg-white print:border-t-2 print:border-black">
                      <td className="p-2 text-right uppercase border-r border-slate-200 print:border-black" colSpan={3}>एकूण आर्थिक नुकसान:</td>
                      <td className="p-2 text-right text-base print:text-black">₹{d.totalLossAmount || d.lossAmount || '0'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-20 grid grid-cols-2 gap-10 text-center uppercase font-black text-[8px] tracking-widest text-slate-400">
          <div className="border-t border-slate-900 pt-2 print:border-black print:text-black">अधिकारी स्वाक्षरी</div>
          <div className="border-t border-slate-900 pt-2 print:border-black print:text-black">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="compact-form-container pb-20 max-w-4xl mx-auto px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive & Record Management</p>
        </div>
        <Button asChild size="sm" className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 w-full sm:w-auto">
          <Link href="/reports/entry/seizure"><Plus className="h-4 w-4 mr-2" /> जप्ती नोंद</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        {reportTypes.map((rt) => (
          <button 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={`h-16 flex flex-col items-center justify-center p-1 rounded-xl border transition-all hover:shadow-md active:scale-95 ${typeFilter === rt.type ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}
          >
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
          {typeFilter && (
            <Button variant="ghost" size="icon" onClick={() => setTypeFilter(null)} className="h-11 w-11 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100">
              <X className="h-5 w-5" />
            </Button>
          )}
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
                      <span className="text-[11px] font-black uppercase text-primary group-hover:underline">
                        {report.fullData?.reportHeading || report.type}
                      </span>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic font-bold opacity-80">{report.summary}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl" onClick={(e) => handleEditReport(report, e)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl" onClick={(e) => handleDeleteReport(report.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Archive className="h-16 w-16" />
                      <p className="font-black uppercase text-[11px] tracking-[0.4em] italic">कोणतीही नोंद उपलब्ध नाही</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[95vw] p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl bg-slate-100 sm:w-full">
          <DialogHeader className="p-4 bg-white border-b flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 no-print">
            <div className="flex items-center gap-3 px-2 sm:px-4">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                {isGroupView ? <FileStack className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em]">{isGroupView ? 'एकत्रित कार्य अहवाल' : 'अहवाल तपशील'}</DialogTitle>
                <DialogDescription className="text-[9px] font-bold uppercase text-slate-400">{isGroupView ? 'All Daily Tasks' : 'Preview'}</DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pr-2 sm:pr-4 justify-center">
              {selectedReport?.type === 'Daily Task' && (
                <Button 
                  variant={isGroupView ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setIsGroupView(!isGroupView)} 
                  className="h-9 sm:h-10 px-3 sm:px-4 font-black uppercase rounded-xl border-primary/20 text-[9px] sm:text-[10px]"
                >
                  {isGroupView ? <Layers className="h-4 w-4 mr-2" /> : <FileStack className="h-4 w-4 mr-2" />}
                  {isGroupView ? 'सिंगल टास्क' : 'पूर्ण दिवसाचे टास्क'}
                </Button>
              )}
              <Button size="sm" onClick={() => window.print()} className="h-9 sm:h-10 px-4 sm:px-6 font-black uppercase rounded-xl shadow-lg shadow-primary/20 text-[9px] sm:text-[10px]"><Printer className="h-4 w-4 mr-2" /> प्रिंट करा</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-9 sm:h-10 w-9 sm:w-10 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-6 w-6" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] sm:max-h-[85vh] p-3 sm:p-6 bg-slate-100">
            <div className="max-w-full sm:max-w-[210mm] mx-auto transition-all animate-in zoom-in-95 duration-300 space-y-4">
              {reportsToRender.map((report, idx) => (
                <div key={report.id} className={idx > 0 ? "print:page-break-before-always" : ""}>
                  {report.type === 'Route Visit' ? (
                    <RouteSlipLayout report={report} />
                  ) : report.fullData?.isWordDoc ? (
                    <div className="prose prose-sm max-w-none px-6 sm:px-12 py-6 sm:py-10 bg-white border-[2px] border-slate-900 rounded-sm shadow-2xl min-h-[400px] sm:min-h-[600px] print:shadow-none print:border-black overflow-hidden printable-report" dangerouslySetInnerHTML={{ __html: report.fullData.content }} />
                  ) : (
                    <GenericTableLayout report={report} />
                  )}
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
            margin: 5mm;
          }
          
          body > *:not([role="dialog"]), 
          header, nav, aside, footer, .sidebar, .no-print, button {
            display: none !important;
          }

          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          [role="dialog"] {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            display: block !important;
            visibility: visible !important;
          }

          [role="dialog"] header,
          [role="dialog"] button,
          [data-state="open"] > div:first-child {
            display: none !important;
          }

          .printable-report {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            border: 2px solid black !important;
            background: white !important;
            box-shadow: none !important;
            min-height: auto !important;
            color: black !important;
          }

          .printable-report * {
            visibility: visible !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            border: 1.5px solid black !important;
          }

          th, td {
            border: 1px solid black !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            padding: 4px !important;
            font-size: 10px !important;
          }

          h1, h2, h3, h4 {
            color: black !important;
            text-transform: uppercase !important;
          }

          .bg-primary, .bg-slate-900, .bg-rose-600 {
            background-color: transparent !important;
            color: black !important;
            border: 1px solid black !important;
          }

          .text-primary, .text-rose-600, .text-emerald-700 {
            color: black !important;
            font-weight: 900 !important;
          }
        }
      `}</style>
    </div>
  )
}
