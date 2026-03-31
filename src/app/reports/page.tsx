
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Eye, Search, X, Printer, Trash2, FileEdit, Truck, ListTodo, 
  ShieldAlert, ChevronRight, Filter, FileText, Milk, MapPin, Briefcase, 
  ClipboardCheck, FileSignature, Plus
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

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIceUsed = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white p-4 font-mono text-[10px] text-black border-2 border-black rounded shadow-none max-w-full mx-auto" id="printable-area">
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
          <div className="font-black uppercase text-[12px]">रूट व्हिजिट अहवाल (ROUTE VISIT SLIP)</div>
          <div className="text-right font-black leading-tight text-[10px]">
            <p>बाहेर: {d.routeOutTime || '--:--'} | आत: {d.routeInTime || '--:--'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 mb-4 font-black text-[10px] uppercase">
          <div className="space-y-1">
            <p>रूट: {d.routeName || '---'}</p>
            <p>ड्रायव्हर: {d.driverName || '---'}</p>
            <p>तारीख: {d.reportDate || '---'}</p>
          </div>
          <div className="text-right space-y-1">
            <p>वाहन: {d.vehicleNumber || '---'}</p>
            <p>स्लिप क्र: {d.slipNo || '---'}</p>
          </div>
        </div>

        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-slate-100 font-black text-[10px]">
              <th className="border-2 border-black p-2 text-center w-8">क्र.</th>
              <th className="border-2 border-black p-2 text-left">केंद्राचे नाव व कोड</th>
              <th className="border-2 border-black p-2 text-center">बर्फ वापर</th>
              <th className="border-2 border-black p-2 text-center">आगमन</th>
              <th className="border-2 border-black p-2 text-center">रिकामे</th>
              <th className="border-2 border-black p-2 text-center">निर्गमन</th>
              <th className="border-2 border-black p-2 text-center">भरलेले</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any, idx: number) => (
              <tr key={idx} className="font-bold text-[10px] border-b border-black">
                <td className="border-2 border-black p-2 text-center">{idx + 1}</td>
                <td className="border-2 border-black p-2 text-left uppercase">
                  {log.supplierName || '---'} , {log.centerCode || '---'}
                </td>
                <td className="border-2 border-black p-2 text-center">{log.iceUsed || '0'}</td>
                <td className="border-2 border-black p-2 text-center">{log.arrivalTime || '--:--'}</td>
                <td className="border-2 border-black p-2 text-center">{log.emptyCans || '0'}</td>
                <td className="border-2 border-black p-2 text-center">{log.departureTime || '--:--'}</td>
                <td className="border-2 border-black p-2 text-center">{log.fullCans || '0'}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-black text-[10px]">
              <td className="border-2 border-black p-2 text-center" colSpan={2}>एकूण (TOTAL)</td>
              <td className="border-2 border-black p-2 text-center">{totalIceUsed}</td>
              <td className="border-2 border-black p-2 text-center">-</td>
              <td className="border-2 border-black p-2 text-center">{totalEmpty}</td>
              <td className="border-2 border-black p-2 text-center">-</td>
              <td className="border-2 border-black p-2 text-center">{totalFull}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 grid grid-cols-2 font-black text-[10px] uppercase border-t-2 border-dashed border-black pt-2">
          <div>
            <p>सुरवात RD: {d.startReading || '0'}</p>
            <p>शेवट RD: {d.endReading || '0'}</p>
          </div>
          <div className="text-right">
            <p>एकूण KM: {d.totalKm || '0'}</p>
            <p className="text-rose-600">दूध तूट: {d.shortageLiters || '0'} L</p>
          </div>
        </div>

        {(d.achievements || d.problems || d.actionsTaken) && (
          <div className="mt-4 space-y-2 border-t-2 border-black pt-4 uppercase text-[10px] font-black">
            {d.achievements && (
              <div className="flex flex-col">
                <span className="text-emerald-700 underline">आजची मोठी कामगिरी:</span>
                <p className="font-bold normal-case text-[11px] mt-1 whitespace-pre-wrap pl-2 border-l-4 border-emerald-100">{d.achievements}</p>
              </div>
            )}
            {d.problems && (
              <div className="flex flex-col">
                <span className="text-rose-700 underline">महत्त्वाच्या समस्या:</span>
                <p className="font-bold normal-case text-[11px] mt-1 whitespace-pre-wrap pl-2 border-l-4 border-rose-100">{d.problems}</p>
              </div>
            )}
            {d.actionsTaken && (
              <div className="flex flex-col">
                <span className="text-blue-700 underline">केलेली कार्यवाही:</span>
                <p className="font-bold normal-case text-[11px] mt-1 whitespace-pre-wrap pl-2 border-l-4 border-blue-100">{d.actionsTaken}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 gap-12 text-center uppercase font-black text-[10px] opacity-80">
          <div className="border-t-2 border-black pt-2">अधिकारी सही</div>
          <div className="border-t-2 border-black pt-2">सुपरवायझर सही</div>
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
      if (typeof val === 'boolean') return val ? "हो" : "नाही";
      if (Array.isArray(val)) return val.join(' | ');
      return String(val || "-");
    }

    return (
      <div className="bg-white p-6 font-mono text-[11px] text-black border-2 border-black rounded shadow-none" id="printable-area">
        <div className="border-b-4 border-black pb-3 mb-4 text-center">
          <h1 className="text-[16px] font-black uppercase tracking-tight">संकलन नोंदवही (OFFICIAL DAILY REPORT)</h1>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">{report.type}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 font-black text-[10px] uppercase border-b-2 border-dashed border-black pb-2">
          <p>तारीख: {report.date}</p>
          <p className="text-right">अहवाल क्र: #{report.id.slice(-8).toUpperCase()}</p>
        </div>

        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-slate-100 font-black text-[11px] uppercase">
              <th className="border-2 border-black p-3 text-left w-1/3">विषय (FIELD)</th>
              <th className="border-2 border-black p-3 text-left">माहिती (DETAILS)</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(([key, val]) => (
              <tr key={key} className="font-bold text-[11px] border-b border-black">
                <td className="border-2 border-black p-3 bg-slate-50 uppercase text-[10px] font-black">{labelMap[key] || key.toUpperCase()}</td>
                <td className="border-2 border-black p-3 whitespace-pre-wrap">{formatVal(key, val)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {d.centerLosses && d.centerLosses.length > 0 && (
          <div className="mt-6">
            <p className="font-black text-[11px] uppercase mb-2 border-b-2 border-black w-fit">नुकसान तपशील (LOSS LOG):</p>
            <table className="w-full border-collapse border-2 border-black text-[10px]">
              <thead className="bg-slate-100 font-black uppercase">
                <tr>
                  <th className="border-2 border-black p-2 text-left">केंद्राचे नाव व कोड</th>
                  <th className="border-2 border-black p-2 text-center w-24">दूध (Ltr)</th>
                  <th className="border-2 border-black p-2 text-right w-32">नुकसान रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {d.centerLosses.map((l: any, i: number) => (
                  <tr key={i} className="text-center font-bold border-b border-black">
                    <td className="border-2 border-black p-2 text-left uppercase">{l.centerName} ({l.centerCode || '-'})</td>
                    <td className="border-2 border-black p-2">{l.qtyLiters}</td>
                    <td className="border-2 border-black p-2 text-right font-black">₹{l.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-16 grid grid-cols-2 gap-12 text-center uppercase font-black text-[10px] opacity-80">
          <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
          <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  return (
    <div className="compact-form-container pb-20 max-w-[600px] mx-auto px-2">
      <div className="flex items-center justify-between border-b-2 pb-3 mb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Archive className="h-5 w-5 text-primary" /> अहवाल व्यवस्थापन
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">Archive & Management</p>
        </div>
        <Button asChild size="sm" className="h-9 text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Link href="/reports/entry/seizure"><Plus className="h-4 w-4 mr-1.5" /> नवीन जप्ती</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {reportTypes.map((rt) => (
          <div 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={`h-16 flex flex-col items-center justify-center p-1.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${typeFilter === rt.type ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-lg' : rt.bg + ' border-muted-foreground/10 shadow-sm'}`}
          >
            <rt.icon className={`h-4 w-4 ${rt.color} mb-1.5`} />
            <span className="text-[9px] font-black text-slate-900 leading-tight text-center uppercase tracking-tighter">{rt.title}</span>
          </div>
        ))}
      </div>

      <Card className="p-2.5 mb-4 bg-white border-muted-foreground/15 shadow-sm rounded-2xl">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input className="h-9 pl-8 text-[11px] bg-muted/20 border-none rounded-xl font-bold" placeholder="नाव किंवा सारांश शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <Input type="date" className="h-9 text-[10px] bg-muted/20 border-none rounded-xl font-bold w-32" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {typeFilter && (
            <Button variant="ghost" size="icon" onClick={() => setTypeFilter(null)} className="h-9 w-9 text-rose-500 bg-rose-50 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      <div className="bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="p-3 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em]">तारीख / प्रकार</th>
              <th className="p-3 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] text-right">क्रिया</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted-foreground/5">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                <td className="p-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-900 truncate max-w-[140px]">{report.type === 'Official Document' ? 'वर्ड दस्तऐवज' : report.type}</span>
                      <Badge className="h-4 px-1.5 text-[7px] font-black bg-primary/10 text-primary border-none rounded-md">{report.date}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground line-clamp-1 italic font-bold opacity-70">{report.summary}</p>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => handleEditReport(report, e)}>
                      <FileEdit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg" onClick={(e) => handleDeleteReport(report.id, e)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={2} className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-[0.3em] italic">एकही नोंद उपलब्ध नाही</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[750px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-3 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-3 truncate">अहवाल तपशील (REPORT DETAILS)</DialogTitle>
            <div className="flex gap-2 shrink-0 pr-2">
              <Button size="icon" variant="outline" onClick={() => window.print()} className="h-8 w-8 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-xl shadow-sm no-print"><Printer className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl no-print"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            {selectedReport && (
              <div className="space-y-4">
                {selectedReport.type === 'Route Visit' ? (
                  <RouteSlipLayout report={selectedReport} />
                ) : selectedReport.fullData?.isWordDoc ? (
                  <div className="prose prose-sm max-w-none px-8 py-6 bg-white border-2 border-black rounded-sm shadow-none min-h-[500px]" id="printable-area" dangerouslySetInnerHTML={{ __html: selectedReport.fullData.content }} />
                ) : (
                  <GenericTableLayout report={selectedReport} />
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          /* Hide all UI elements except the printable area */
          body * { 
            visibility: hidden; 
          }
          #printable-area, #printable-area * { 
            visibility: visible; 
          }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important;
            border: 2px solid black !important;
            box-shadow: none !important;
            background: white !important;
            z-index: 9999;
          }
          /* Ensure Dialog components don't interfere with full-page visibility */
          .fixed, .sticky, button, .no-print, header, nav, .sidebar, [role="dialog"] > button { 
            display: none !important; 
          }
          /* Layout adjustments for table printing */
          table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed; }
          th, td { border: 1px solid black !important; word-wrap: break-word; overflow-wrap: break-word; }
          
          /* Prevent page breaks inside rows */
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
    </div>
  )
}
