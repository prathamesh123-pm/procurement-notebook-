
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

  if (!mounted || isLoading) return <div className="p-20 text-center animate-pulse italic font-black uppercase text-[9px] opacity-50">लोड होत आहे...</div>

  const labelMap: Record<string, string> = {
    achievements: "आजची मोठी कामगिरी",
    problems: "महत्त्वाच्या समस्या",
    actionsTaken: "केलेली कार्यवाही",
    actionTaken: "केलेली कार्यवाही",
    supervisorName: "सुपरवायझर",
    repName: "प्रतिनिधी नाव",
    repId: "आयडी",
    shift: "शिफ्ट",
    workType: "कामाचा प्रकार",
    summary: "तपशील / सारांश",
    vehicleNo: "वाहन क्रमांक",
    vehicleNumber: "वाहन क्रमांक",
    vehicleType: "गाडीचा प्रकार",
    driverName: "ड्रायव्हरचे नाव",
    driverMobile: "ड्रायव्हर मोबाईल",
    mobile: "संपर्क क्रमांक",
    routeName: "रूटचे नाव",
    breakdownTime: "बिघाड वेळ",
    location: "बिघाड ठिकाण",
    reason: "बिघाडाचे मुख्य कारण",
    severity: "बिघाडाचे स्वरूप",
    faultResponsibility: "बिघाडास जबाबदार",
    detailedReason: "सविस्तर माहिती",
    detailedDescription: "सविस्तर वर्णन",
    estimatedRepairTime: "दुरुस्ती वेळ",
    estimatedRepairCost: "दुरुस्ती खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी क्र.",
    recoveryArrivalTime: "पर्यायी गाडी वेळ",
    milkHot: "दूध गरम झाले?",
    milkSour: "दूध आंबट झाले?",
    alternateArrangement: "पर्यायी सोय?",
    lossAmount: "नुकसान रक्कम (₹)",
    totalLossAmount: "एकूण नुकसान (₹)",
    supplierName: "पुरवठादार नाव",
    supplierId: "आयडी / कोड",
    seizureQty: "जप्ती प्रमाण (L)",
    fineAmount: "दंड रक्कम (₹)",
    notes: "विशेष नोंदी",
    title: "शीर्षक",
    remark: "शेरा / कार्यवाही",
    status: "स्थिती",
    morningQty: "सकाळ संकलन (L)",
    eveningQty: "संध्याकाळ संकलन (L)",
    fat: "फॅट (%)",
    snf: "SNF (%)",
    result: "अंतिम निकाल",
    centerName: "केंद्राचे नाव",
    centerCode: "केंद्र कोड",
    auditDate: "ऑडिट तारीख",
    capacity: "क्षमता (L)",
    licenseStatus: "परवाना स्थिती",
    ownerName: "मालकाचे नाव",
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
    observations: "निरीक्षणे",
    type: "प्रकार (Type)",
    facility: "सुविधा (Facility)",
    plantHygiene: "स्वच्छता (Hygiene)",
    milkSource: "दूध स्रोत",
    totalMilk: "एकूण दूध (L)",
    paymentCycle: "पेमेंट सायकल",
    otherInfo: "इतर माहिती"
  };

  const RouteSlipLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const logs = d.routeVisitLogs || [];
    
    const totalEmpty = logs.reduce((sum: number, l: any) => sum + (Number(l.emptyCans) || 0), 0);
    const totalFull = logs.reduce((sum: number, l: any) => sum + (Number(l.fullCans) || 0), 0);
    const totalIceUsed = logs.reduce((sum: number, l: any) => sum + (Number(l.iceUsed) || 0), 0);

    return (
      <div className="bg-white p-2 font-mono text-[8px] text-black border border-black/40 rounded shadow-sm max-w-full mx-auto" id="printable-area">
        <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-2">
          <div className="font-black uppercase text-[10px]">रूट व्हिजिट अहवाल (ROUTE VISIT)</div>
          <div className="text-right font-black leading-tight text-[8px]">
            <p>OUT: {d.routeOutTime || '--:--'} | IN: {d.routeInTime || '--:--'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 mb-2 font-black text-[8px] uppercase">
          <div className="space-y-0.5">
            <p>रूट: {d.routeName || '---'}</p>
            <p>ड्रायव्हर: {d.driverName || '---'}</p>
            <p>तारीख: {d.reportDate || '---'}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p>वाहन: {d.vehicleNumber || '---'}</p>
            <p>स्लिप क्र: {d.slipNo || '---'}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-black text-[8px]">
              <th className="border border-black p-1 text-center w-6">क्र.</th>
              <th className="border border-black p-1 text-left">केंद्राचे नाव व कोड</th>
              <th className="border border-black p-1 text-center">बर्फ वापर</th>
              <th className="border border-black p-1 text-center">आगमन</th>
              <th className="border border-black p-1 text-center">रिकामे</th>
              <th className="border border-black p-1 text-center">निर्गमन</th>
              <th className="border border-black p-1 text-center">भरलेले</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any, idx: number) => (
              <tr key={idx} className="font-bold text-[8px] border-b border-black/10">
                <td className="border border-black p-1 text-center">{idx + 1}</td>
                <td className="border border-black p-1 text-left uppercase truncate max-w-[120px]">
                  {log.supplierName || '---'} , {log.centerCode || '---'}
                </td>
                <td className="border border-black p-1 text-center">{log.iceUsed || '0'}</td>
                <td className="border border-black p-1 text-center">{log.arrivalTime || '--:--'}</td>
                <td className="border border-black p-1 text-center">{log.emptyCans || '0'}</td>
                <td className="border border-black p-1 text-center">{log.departureTime || '--:--'}</td>
                <td className="border border-black p-1 text-center">{log.fullCans || '0'}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-black text-[8px]">
              <td className="border border-black p-1 text-center" colSpan={2}>एकूण (TOTAL)</td>
              <td className="border border-black p-1 text-center">{totalIceUsed}</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalEmpty}</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalFull}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-2 font-black text-[8px] uppercase border-t border-dashed border-black/40 pt-1">
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
          <div className="mt-2 space-y-1 border-t border-black/20 pt-2 uppercase text-[8px] font-black">
            {d.achievements && (
              <div className="flex flex-col">
                <span className="text-emerald-700">१) आजची मोठी कामगिरी:</span>
                <p className="font-bold normal-case text-[9px] mt-0 whitespace-pre-wrap pl-2 border-l-2 border-emerald-100">{d.achievements}</p>
              </div>
            )}
            {d.problems && (
              <div className="flex flex-col">
                <span className="text-rose-700">२) महत्त्वाच्या समस्या:</span>
                <p className="font-bold normal-case text-[9px] mt-0 whitespace-pre-wrap pl-2 border-l-2 border-rose-100">{d.problems}</p>
              </div>
            )}
            {d.actionsTaken && (
              <div className="flex flex-col">
                <span className="text-blue-700">३) केलेली कार्यवाही:</span>
                <p className="font-bold normal-case text-[9px] mt-0 whitespace-pre-wrap pl-2 border-l-2 border-blue-100">{d.actionsTaken}</p>
              </div>
            )}
          </div>
        )}

        {d.supervisorName && (
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-[7px] opacity-50 uppercase">सुपरवायझर:</p>
              <p className="font-black text-[9px] border-b border-black inline-block min-w-[100px] uppercase text-center">{d.supervisorName}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const GenericTableLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    
    const entries = Object.entries(d).filter(([key, val]) => {
      return typeof val !== 'object' && 
             key !== 'routeVisitLogs' && 
             key !== 'losses' &&
             key !== 'centerLosses' && 
             key !== 'fieldVisitPoints' &&
             key !== 'officeWorkPoints' &&
             key !== 'reportType' && 
             key !== 'isWordDoc' && 
             key !== 'content' &&
             key !== 'name' &&
             key !== 'date' &&
             key !== 'reportDate' &&
             key !== 'id';
    });

    const formatVal = (key: string, val: any): string => {
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return String(val || "-");
    }

    return (
      <div className="bg-white p-2 font-mono text-[8px] text-black border border-black/40 rounded shadow-sm" id="printable-area">
        <div className="border-b-2 border-black pb-1 mb-2 text-center">
          <h1 className="text-[11px] font-black uppercase tracking-tight">संकलन नोंदवही (OFFICIAL REPORT)</h1>
          <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{report.type}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2 font-black text-[8px] uppercase border-b border-dashed border-black/40 pb-1">
          <p>तारीख: {report.date}</p>
          <p className="text-right">अहवाल क्र: #{report.id.slice(-8).toUpperCase()}</p>
        </div>

        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-black text-[8px] uppercase">
              <th className="border border-black p-1.5 text-left w-1/3">विषय (FIELD)</th>
              <th className="border border-black p-1.5 text-left">माहिती (DETAILS)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, val]) => (
              <tr key={key} className="font-bold text-[9px] border-b border-black/10">
                <td className="border border-black p-1.5 bg-slate-50 uppercase text-[8px]">{labelMap[key] || key.toUpperCase()}</td>
                <td className="border border-black p-1.5 whitespace-pre-wrap">{formatVal(key, val)}</td>
              </tr>
            ))}
            {d.infrastructure && Object.entries(d.infrastructure).map(([k, v]) => (
              <tr key={k} className="font-bold text-[9px] border-b border-black/10">
                <td className="border border-black p-1.5 bg-slate-50 uppercase text-[8px]">{labelMap[k] || `INFRA: ${k.toUpperCase()}`}</td>
                <td className="border border-black p-1.5">{String(v || "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(d.losses && d.losses.length > 0) || (d.centerLosses && d.centerLosses.length > 0) ? (
          <div className="mt-3">
            <p className="font-black text-[8px] uppercase mb-1 border-b border-black w-fit">नुकसान तपशील (LOSS LOG):</p>
            <table className="w-full border-collapse border border-black text-[8px]">
              <thead className="bg-slate-50 font-black uppercase">
                <tr>
                  <th className="border border-black p-1 text-left">ID/नाव</th>
                  <th className="border border-black p-1 text-center">प्रकार</th>
                  <th className="border border-black p-1 text-center">लिटर (L)</th>
                  <th className="border border-black p-1 text-right">रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(d.losses || d.centerLosses).map((l: any, i: number) => (
                  <tr key={i} className="text-center font-bold border-b border-black/10">
                    <td className="border border-black p-1 text-left truncate">{l.supplierCode || l.centerCode} {l.supplierName || l.centerName}</td>
                    <td className="border border-black p-1">{l.milkType || '-'}</td>
                    <td className="border border-black p-1">{l.qtyLiters}</td>
                    <td className="border border-black p-1 text-right text-rose-600">₹{l.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8px] opacity-70">
          <div className="border-t border-black/60 pt-1.5">अधिकारी सही</div>
          <div className="border-t border-black/60 pt-1.5">सुपरवायझर सही</div>
        </div>
      </div>
    );
  };

  return (
    <div className="compact-form-container pb-20 max-w-[500px] mx-auto px-2">
      <div className="flex items-center justify-between border-b-2 pb-2 mb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Archive className="h-5 w-5 text-primary" /> अहवाल व्यवस्थापन (REPORTS)
          </h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">Archive & Management</p>
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
        <div className="flex gap-2">
          <div className="relative flex-1">
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
        <DialogContent className="max-w-[650px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-3 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-3 truncate">अहवाल तपशील (REPORT DETAILS)</DialogTitle>
            <div className="flex gap-2 shrink-0 pr-2">
              <Button size="icon" variant="outline" onClick={() => window.print()} className="h-8 w-8 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-xl shadow-sm"><Printer className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-3 bg-white">
            {selectedReport && (
              <div className="space-y-4">
                {selectedReport.type === 'Route Visit' ? (
                  <RouteSlipLayout report={selectedReport} />
                ) : selectedReport.fullData?.isWordDoc ? (
                  <div className="prose prose-sm max-w-none px-6 py-4 bg-white border rounded-2xl shadow-inner min-h-[400px]" dangerouslySetInnerHTML={{ __html: selectedReport.fullData.content }} />
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
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 10px; 
            margin: 0;
            border: none;
            box-shadow: none;
          }
          .dialog-content, .scroll-area { overflow: visible !important; height: auto !important; max-height: none !important; }
          .fixed, .sticky, button, .tabs, header, nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
