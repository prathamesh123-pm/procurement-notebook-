
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Eye, Search, X, Printer, Trash2, FileEdit, Truck, ListTodo, 
  ShieldAlert, ChevronRight, Filter, FileText, Milk, MapPin, Briefcase, 
  ClipboardCheck, FileSignature, Plus, Info, AlertTriangle, FileCheck, User, Layers, FileStack
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

  const { data: firestoreReports, isLoading } = useCollection(reportsQuery)
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
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
      const matchesType = !typeFilter || r.type === typeFilter
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
      'Daily Work Report': '/reports/entry/daily',
      'Seizure & Penalty': '/reports/entry/seizure',
      'Daily Task': '/work-log',
      'Official Document': '/form-builder',
      'Milk Procurement Survey': '/reports/entry/survey',
      'Collection Center Audit': '/reports/entry/audit',
      'Chilling Report': '/reports/entry/chilling',
      'FSSAI Center Inspection': '/reports/entry/fssai'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  const labelMap: Record<string, string> = {
    supplierName: "पुरवठादार / गवळी नाव",
    supplierId: "आयडी / कोड नंबर",
    title: "टास्क शीर्षक",
    remark: "शेरा / कार्यवाही",
    actionTaken: "केलेली कार्यवाही",
    actionsTaken: "केलेली कार्यवाही",
    routeName: "रूटचे नाव",
    vehicleNumber: "वाहन क्रमांक",
    vehicleNo: "वाहन क्रमांक",
    vehicleType: "गाडीचा प्रकार",
    driverName: "ड्रायव्हरचे नाव",
    driverMobile: "ड्रायव्हर मोबाईल",
    mobile: "संपर्क क्रमांक",
    repName: "प्रतिनिधी नाव",
    repId: "प्रतिनिधी आयडी",
    shift: "शिफ्ट",
    breakdownTime: "बिघाड वेळ",
    location: "बिघाड ठिकाण",
    reason: "बिघाडाचे मुख्य कारण",
    severity: "बिघाडाचे स्वरूप",
    faultResponsibility: "बिघाडास जबाबदार",
    detailedReason: "सविस्तर माहिती",
    detailedDescription: "सविस्तर वर्णन",
    estimatedRepairTime: "दुरुस्ती वेळ (तास)",
    estimatedRepairCost: "दुरुस्ती खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी क्र.",
    recoveryArrivalTime: "पर्यायी गाडी वेळ",
    milkHot: "दूध गरम झाले का?",
    milkSour: "दूध आंबट झाले का?",
    alternateArrangement: "पर्यायी सोय केली का?",
    workType: "कामाचा प्रकार",
    summary: "कामाचा सारांश",
    problems: "महत्त्वाच्या समस्या",
    achievements: "आजची मोठी कामगिरी",
    supervisorName: "सुपरवायझर",
    lossAmount: "नुकसान रक्कम (₹)",
    totalLossAmount: "एकूण नुकसान (₹)",
    fineAmount: "दंड रक्कम (₹)",
    seizureQty: "जप्ती प्रमाण (L)",
    centerName: "केंद्राचे नाव",
    centerCode: "केंद्र कोड",
    auditDate: "ऑडिट तारीख",
    morningQty: "सकाळ संकलन (L)",
    eveningQty: "संध्याकाळ संकलन (L)",
    fat: "फॅट (%)",
    snf: "SNF (%)",
    result: "अंतिम निकाल",
    ownerName: "मालकाचे नाव",
    capacity: "क्षमता (L)",
    licenseStatus: "परवाना स्थिती",
    district: "जिल्हा",
    taluka: "तालुका",
    tempAtArrival: "आगमनाचे तापमान (°C)",
    tempAfterChilling: "चिलिंग नंतर तापमान (°C)",
    waterSupply: "पाणी पुरवठा",
    powerBackup: "पॉवर बॅकअप",
    hygieneStandard: "स्वच्छता निकष",
    staffUniform: "स्टाफ गणवेश",
    fssaiDisplay: "FSSAI डिस्प्ले",
    iceBankStatus: "आईस बँक स्थिती",
    observations: "विशेष निरीक्षणे",
    type: "प्रकार (Type)",
    facility: "सुविधा (Facility)",
    plantHygiene: "स्वच्छता (Hygiene)",
    milkSource: "दूध स्रोत",
    totalMilk: "एकूण दूध (L)",
    paymentCycle: "पेमेंट सायकल",
    otherInfo: "इतर माहिती",
    computerAvailable: "POP सिस्टम"
  };

  const orderedKeys = [
    "supplierName", 
    "supplierId", 
    "title", 
    "remark", 
    "actionTaken", 
    "actionsTaken",
    "repName", 
    "repId", 
    "shift", 
    "routeName", 
    "vehicleNumber", 
    "vehicleNo", 
    "vehicleType", 
    "driverName", 
    "driverMobile", 
    "mobile", 
    "breakdownTime", 
    "location", 
    "reason", 
    "severity", 
    "faultResponsibility", 
    "detailedReason", 
    "detailedDescription", 
    "estimatedRepairTime", 
    "estimatedRepairCost", 
    "recoveryVehicleNo", 
    "recoveryArrivalTime", 
    "milkHot", 
    "milkSour", 
    "alternateArrangement", 
    "workType", 
    "summary", 
    "achievements", 
    "problems", 
    "lossAmount", 
    "totalLossAmount", 
    "fineAmount", 
    "seizureQty", 
    "centerName", 
    "centerCode", 
    "auditDate", 
    "morningQty", 
    "eveningQty", 
    "fat", 
    "snf", 
    "result", 
    "ownerName", 
    "capacity", 
    "licenseStatus", 
    "district", 
    "taluka", 
    "tempAtArrival", 
    "tempAfterChilling", 
    "waterSupply", 
    "powerBackup", 
    "hygieneStandard", 
    "staffUniform", 
    "fssaiDisplay", 
    "iceBankStatus", 
    "observations", 
    "type", 
    "facility", 
    "plantHygiene", 
    "milkSource", 
    "totalMilk", 
    "paymentCycle", 
    "otherInfo", 
    "computerAvailable",
    "supervisorName"
  ];

  const reportsToRender = useMemo(() => {
    if (isGroupView && selectedReport?.type === 'Daily Task') {
      return (firestoreReports || []).filter(r => 
        r.type === 'Daily Task' && r.date === selectedReport.date
      ).sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return selectedReport ? [selectedReport] : [];
  }, [isGroupView, selectedReport, firestoreReports]);

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIceUsed = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white p-6 font-sans text-slate-900 border-[3px] border-slate-900 rounded-sm shadow-none max-w-full mx-auto print:border-black" id="printable-area">
        <div className="flex justify-between items-center border-b-[3px] border-slate-900 pb-4 mb-6 print:border-black">
          <div className="space-y-1">
            <h1 className="font-black uppercase text-xl tracking-tighter flex items-center gap-2">
              <Milk className="h-6 w-6 text-primary print:text-black" /> संकलन नोंदवही
            </h1>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">अहवाल: रूट व्हिजिट स्लिप</p>
          </div>
          <div className="text-right font-black uppercase text-[10px] leading-tight">
            <div className="bg-slate-900 text-white px-3 py-1 mb-1 print:bg-black">OFFICIAL RECORD</div>
            <p className="mt-1">तारीख: {d.reportDate || '---'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6 font-black text-[11px] uppercase">
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg print:bg-white print:border-black">
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>रूट नाव:</span> <span className="text-primary print:text-black">{d.routeName || '---'}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>ड्रायव्हर:</span> <span>{d.driverName || '---'}</span></div>
            <div className="flex justify-between"><span>वेळ (IN/OUT):</span> <span>{d.routeInTime || '--:--'} / {d.routeOutTime || '--:--'}</span></div>
          </div>
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg print:bg-white print:border-black">
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>वाहन क्रमांक:</span> <span>{d.vehicleNumber || '---'}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>स्लिप नंबर:</span> <span>#{d.slipNo || '---'}</span></div>
            <div className="flex justify-between"><span>शिफ्ट:</span> <Badge className="h-4 text-[8px] uppercase font-black">{d.shift || 'सकाळ'}</Badge></div>
          </div>
        </div>

        <div className="overflow-hidden border-2 border-slate-900 rounded-lg mb-6 print:border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider print:bg-black">
                <th className="p-3 text-center w-10 border-r border-white/20">क्र.</th>
                <th className="p-3 text-left border-r border-white/20">संकलन केंद्र व कोड</th>
                <th className="p-3 text-center border-r border-white/20">बर्फ वापर</th>
                <th className="p-3 text-center border-r border-white/20">आगमन</th>
                <th className="p-3 text-center border-r border-white/20">रिकामे</th>
                <th className="p-3 text-center border-r border-white/20">निर्गमन</th>
                <th className="p-3 text-center">भरलेले</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900 print:divide-black">
              {logs.map((log: any, idx: number) => (
                <tr key={idx} className="font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center border-r-2 border-slate-900 bg-slate-50 print:border-black">{idx + 1}</td>
                  <td className="p-3 border-r-2 border-slate-900 font-black print:border-black">
                    {log.supplierName || '---'} <br/>
                    <span className="text-[8px] text-slate-400">ID: {log.centerCode || '---'}</span>
                  </td>
                  <td className="p-3 text-center border-r-2 border-slate-900 print:border-black">{log.iceUsed || '0'}</td>
                  <td className="p-3 text-center border-r-2 border-slate-900 print:border-black">{log.arrivalTime || '--:--'}</td>
                  <td className="p-3 text-center border-r-2 border-slate-900 font-black print:border-black">{log.emptyCans || '0'}</td>
                  <td className="p-3 text-center border-r-2 border-slate-900 print:border-black">{log.departureTime || '--:--'}</td>
                  <td className="p-3 text-center bg-primary/5 font-black text-primary print:text-black">{log.fullCans || '0'}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white font-black text-[11px] uppercase print:bg-black">
                <td className="p-3 text-center border-r border-white/20" colSpan={2}>एकूण सारांश (GRAND TOTAL)</td>
                <td className="p-3 text-center border-r border-white/20">{totalIceUsed}</td>
                <td className="p-3 text-center border-r border-white/20">-</td>
                <td className="p-3 text-center border-r border-white/20">{totalEmpty}</td>
                <td className="p-3 text-center border-r border-white/20">-</td>
                <td className="p-3 text-center">{totalFull}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 font-black text-[11px] uppercase p-4 border-2 border-dashed border-slate-300 rounded-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-300" /> सुरवात रीडिंग: <span className="text-slate-900">{d.startReading || '0'}</span></div>
            <div className="flex items-center gap-2 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-300" /> शेवट रीडिंग: <span className="text-slate-900">{d.endReading || '0'}</span></div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-lg">एकूण किलोमीटर: <span className="text-primary print:text-black">{d.totalKm || '0'} KM</span></div>
            <div className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block print:bg-white print:border print:border-black">दूध तूट (Shortage): {d.shortageLiters || '0'} L</div>
          </div>
        </div>

        {(d.achievements || d.problems || d.actionsTaken) && (
          <div className="mt-6 space-y-4 border-t-4 border-slate-900 pt-6 print:border-black">
            {d.achievements && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase text-emerald-700">
                  <FileCheck className="h-4 w-4" /> आजची मोठी कामगिरी (ACHIEVEMENTS):
                </div>
                <p className="text-[11px] font-bold bg-emerald-50/50 p-3 rounded-lg border-l-4 border-emerald-500 italic print:bg-white print:border print:border-black">{d.achievements}</p>
              </div>
            )}
            {d.problems && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase text-rose-700">
                  <AlertTriangle className="h-4 w-4" /> महत्त्वाच्या समस्या (PROBLEMS):
                </div>
                <p className="text-[11px] font-bold bg-rose-50/50 p-3 rounded-lg border-l-4 border-rose-500 italic print:bg-white print:border print:border-black">{d.problems}</p>
              </div>
            )}
            {d.actionsTaken && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase text-blue-700">
                  <Info className="h-4 w-4" /> केलेली कार्यवाही (ACTIONS TAKEN):
                </div>
                <p className="text-[11px] font-bold bg-blue-50/50 p-3 rounded-lg border-l-4 border-blue-500 italic print:bg-white print:border print:border-black">{d.actionsTaken}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-20 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10px] tracking-widest text-slate-400">
          <div className="border-t-2 border-slate-900 pt-3 print:border-black print:text-black">अधिकृत अधिकारी स्वाक्षरी</div>
          <div className="border-t-2 border-slate-900 pt-3 print:border-black print:text-black">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  const GenericTableLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const filteredEntries = orderedKeys
      .filter(key => d[key] !== undefined && d[key] !== "" && d[key] !== null)
      .map(key => [key, d[key]]);

    const formatVal = (key: string, val: any): string => {
      if (typeof val === 'boolean') return val ? "हो (YES)" : "नाही (NO)";
      if (Array.isArray(val)) return val.join(' | ');
      return String(val || "-");
    }

    const isBreakdown = report.type === 'Transport Breakdown Report';

    return (
      <div className="bg-white p-8 font-sans text-slate-900 border-[3px] border-slate-900 rounded-sm shadow-none print:border-black mb-8 last:mb-0 break-inside-avoid" id="printable-area">
        <div className="border-b-[4px] border-slate-900 pb-6 mb-8 text-center print:border-black">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary text-white rounded-2xl print:bg-black">
              <ClipboardCheck className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">संकलन नोंदवही (OFFICIAL DAILY REPORT)</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">व्यवस्थापन आणि कार्य अहवाल</p>
          <Badge className={`mt-4 px-6 py-1 text-[10px] font-black uppercase tracking-widest ${isBreakdown ? 'bg-rose-600' : 'bg-slate-900'} print:bg-black`}>
            {report.type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 font-black text-[11px] uppercase border-b-2 border-dashed border-slate-300 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">तारीख (DATE):</span>
            <span className="text-lg">{report.date}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-slate-400">अहवाल आयडी (REPORT ID):</span>
            <span className="text-lg">#{report.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-slate-900 rounded-xl overflow-hidden print:border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest print:bg-black">
                  <th className="p-4 text-left w-1/3 border-r border-white/20">तपशील (FIELD)</th>
                  <th className="p-4 text-left">माहिती (DETAILS)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900 print:divide-black">
                {filteredEntries.map(([key, val]) => {
                  const isCrucial = ["supplierName", "supplierId", "title", "remark"].includes(key);
                  return (
                    <tr key={key} className={`font-bold text-[11px] hover:bg-slate-50 transition-colors ${isCrucial ? 'bg-primary/5 print:bg-white' : ''}`}>
                      <td className="p-4 bg-slate-50 uppercase text-[10px] font-black border-r-2 border-slate-900 print:bg-white print:border-black">
                        {labelMap[key] || key.toUpperCase()}
                      </td>
                      <td className={`p-4 whitespace-pre-wrap ${isCrucial ? 'text-primary font-black print:text-black' : ''}`}>
                        {formatVal(key, val)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {((d.losses && d.losses.length > 0) || (d.centerLosses && d.centerLosses.length > 0)) && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-[12px] font-black uppercase text-rose-700">
                <AlertTriangle className="h-5 w-5" /> नुकसान तपशील (MILK LOSS LOG):
              </div>
              <div className="border-2 border-rose-600 rounded-xl overflow-hidden shadow-sm print:border-black">
                <table className="w-full border-collapse text-[10px]">
                  <thead className="bg-rose-600 text-white font-black uppercase tracking-wider print:bg-black">
                    <tr>
                      <th className="p-3 text-left border-r border-white/20">कोड / सप्लायर नाव</th>
                      <th className="p-3 text-center w-20 border-r border-white/20">प्रकार</th>
                      <th className="p-3 text-center w-20 border-r border-white/20">लिटर (L)</th>
                      <th className="p-3 text-right w-32">रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 print:divide-black">
                    {(d.losses || d.centerLosses).map((l: any, i: number) => (
                      <tr key={i} className="text-center font-bold hover:bg-rose-50 transition-colors">
                        <td className="p-3 text-left uppercase border-r border-rose-100 font-black print:border-black">
                          {l.supplierName || l.centerName || '---'} <span className="text-[8px] text-slate-400">({l.supplierCode || l.centerCode || '-'})</span>
                        </td>
                        <td className="p-3 border-r border-rose-100 print:border-black">{l.milkType || '-'}</td>
                        <td className="p-3 border-r border-rose-100 font-black print:border-black">{l.qtyLiters || '0'}</td>
                        <td className="p-3 text-right font-black text-rose-600 print:text-black">₹{l.lossAmount || '0'}</td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50 font-black text-[11px] print:bg-white print:border-t-2 print:border-black">
                      <td className="p-3 text-right uppercase border-r border-rose-100 print:border-black" colSpan={3}>एकूण नुकसान (TOTAL LOSS):</td>
                      <td className="p-3 text-right text-rose-700 text-lg print:text-black">₹{d.totalLossAmount || d.lossAmount || '0'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {d.fieldVisitPoints && d.fieldVisitPoints.length > 0 && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-[12px] font-black uppercase text-emerald-700">
                <MapPin className="h-5 w-5" /> क्षेत्र भेट मुद्दे (FIELD OBSERVATIONS):
              </div>
              <div className="grid grid-cols-1 gap-2">
                {d.fieldVisitPoints.map((p: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group print:bg-white print:border-black">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 print:bg-black">{i + 1}</div>
                    <p className="font-bold text-[11px] leading-relaxed pt-1">{p.text}</p>
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 print:bg-black" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10px] tracking-widest text-slate-400">
          <div className="border-t-2 border-slate-900 pt-4 print:border-black print:text-black">अधिकारी स्वाक्षरी (AUTHORITY)</div>
          <div className="border-t-2 border-slate-900 pt-4 print:border-black print:text-black">सुपरवायझर स्वाक्षरी (SUPERVISOR)</div>
        </div>
      </div>
    );
  };

  return (
    <div className="compact-form-container pb-20 max-w-[650px] mx-auto px-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive & Record Management</p>
        </div>
        <Button asChild size="sm" className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
          <Link href="/reports/entry/seizure"><Plus className="h-4 w-4 mr-2" /> जप्ती नोंद</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {reportTypes.map((rt) => (
          <button 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={`h-20 flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all hover:shadow-lg active:scale-95 ${typeFilter === rt.type ? 'bg-primary text-white border-primary shadow-primary/20 scale-105' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}
          >
            <rt.icon className={`h-5 w-5 mb-2 ${typeFilter === rt.type ? 'text-white' : rt.color}`} />
            <span className="text-[9px] font-black leading-tight text-center uppercase tracking-tighter">{rt.title}</span>
          </button>
        ))}
      </div>

      <Card className="p-3 mb-6 bg-white border-none shadow-2xl rounded-3xl ring-1 ring-slate-100">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="h-11 pl-10 text-[12px] bg-slate-50 border-none rounded-2xl font-bold focus-visible:ring-primary shadow-inner" placeholder="नाव किंवा सारांश शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <Input type="date" className="h-11 text-[11px] bg-slate-50 border-none rounded-2xl font-black w-36 shadow-inner" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {typeFilter && (
            <Button variant="ghost" size="icon" onClick={() => setTypeFilter(null)} className="h-11 w-11 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">तारीख आणि प्रकार</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">क्रिया</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); setIsGroupView(false); }}>
                <td className="p-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-slate-900 truncate max-w-[160px] group-hover:text-primary transition-colors">
                        {report.type === 'Official Document' ? 'वर्ड दस्तऐवज' : report.type}
                      </span>
                      <Badge variant="outline" className="h-4 px-2 text-[8px] font-black bg-slate-50 text-slate-500 border-none rounded-md">{report.date}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary/20 rounded-full" />
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic font-bold opacity-80">{report.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 sm:translate-x-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl" onClick={(e) => handleEditReport(report, e)}>
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl" onClick={(e) => handleDeleteReport(report.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="h-9 w-9 flex items-center justify-center text-slate-200">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={2} className="py-32 text-center">
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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[800px] p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl bg-slate-100">
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between space-y-0 no-print">
            <div className="flex items-center gap-3 px-4">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                {isGroupView ? <FileStack className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em]">{isGroupView ? 'एकत्रित कार्य अहवाल' : 'अहवाल तपशील'}</DialogTitle>
                <DialogDescription className="text-[9px] font-bold uppercase text-slate-400">{isGroupView ? 'All Daily Tasks' : 'Official Report Preview'}</DialogDescription>
              </div>
            </div>
            <div className="flex gap-2 pr-4">
              {selectedReport?.type === 'Daily Task' && (
                <Button 
                  variant={isGroupView ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setIsGroupView(!isGroupView)} 
                  className="h-10 px-4 font-black uppercase rounded-xl border-primary/20"
                >
                  {isGroupView ? <Layers className="h-4 w-4 mr-2" /> : <FileStack className="h-4 w-4 mr-2" />}
                  {isGroupView ? 'सिंगल टास्क' : 'पूर्ण दिवसाचे टास्क'}
                </Button>
              )}
              <Button size="sm" onClick={() => window.print()} className="h-10 px-6 font-black uppercase rounded-xl shadow-lg shadow-primary/20"><Printer className="h-4 w-4 mr-2" /> प्रिंट करा</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-6 w-6" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-6 bg-slate-100">
            <div className="max-w-[210mm] mx-auto transition-all animate-in zoom-in-95 duration-300 space-y-8">
              {reportsToRender.map((report, idx) => (
                <div key={report.id} className={idx > 0 ? "print:page-break-before-always" : ""}>
                  {report.type === 'Route Visit' ? (
                    <RouteSlipLayout report={report} />
                  ) : report.fullData?.isWordDoc ? (
                    <div className="prose prose-sm max-w-none px-12 py-10 bg-white border-[3px] border-slate-900 rounded-sm shadow-2xl min-h-[600px] print:shadow-none print:border-black" id="printable-area" dangerouslySetInnerHTML={{ __html: report.fullData.content }} />
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
            margin: 15mm;
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
          }

          [role="dialog"] header,
          [role="dialog"] button,
          [data-state="open"] > div:first-child {
            display: none !important;
          }

          #printable-area {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 3px solid black !important;
            background: white !important;
            box-shadow: none !important;
            min-height: auto !important;
          }

          #printable-area * {
            visibility: visible !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            border: 2px solid black !important;
          }

          th, td {
            border: 1px solid black !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            padding: 8px !important;
            font-size: 11px !important;
          }

          tr {
            page-break-inside: avoid !important;
          }

          h1, h2, h3, h4 {
            color: black !important;
            text-transform: uppercase !important;
          }

          .bg-primary, .bg-slate-900, .bg-rose-600 {
            background-color: black !important;
            color: white !important;
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
