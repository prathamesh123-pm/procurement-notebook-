"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Milk, User, Briefcase, ListTodo, FileSignature, CheckCircle2, Microscope, Layers, Calendar
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
    { title: "ERP रिपोर्ट", type: "Route Allocation Report", icon: Layers, color: "text-indigo-600" },
    { title: "जप्ती व दंड", type: "Seizure & Penalty", icon: ShieldAlert, color: "text-amber-600" },
    { title: "दैनिक कामकाज", type: "Daily Work Report", icon: ClipboardCheck, color: "text-indigo-600" },
    { title: "वर्ड फॉर्म", type: "Official Document", icon: FileSignature, color: "text-slate-600" },
  ]

  const labelMap: Record<string, string> = {
    reportHeading: "अहवाल शीर्षक",
    date: "अहवाल तारीख",
    reportDate: "अहवाल तारीख",
    shift: "कामाची शिफ्ट",
    slipNo: "स्लिप नंबर",
    idNumber: "अधिकारी आयडी",
    repId: "कर्मचारी आयडी",
    supervisorName: "सुपरवायझरचे नाव",
    centerName: "केंद्राचे पूर्ण नाव",
    centerCode: "केंद्राचा कोड (ID)",
    ownerName: "मालकाचे नाव",
    supplierName: "पुरवठादार / केंद्राचे नाव",
    supplierId: "पुरवठादार कोड",
    mobile: "संपर्क मोबाईल नंबर",
    address: "पूर्ण पत्ता / लोकेशन",
    district: "जिल्हा",
    taluka: "तालुका",
    routeName: "दुध संकलन रूटचे नाव",
    vehicleNumber: "गाडीचा नंबर (MH...)",
    vehicleNo: "गाडीचा नंबर (MH...)",
    vehicleType: "गाडीचा प्रकार",
    driverName: "ड्रायव्हरचे नाव",
    breakdownTime: "गाडी बिघाड झाल्याची वेळ",
    location: "बिघाड झालेले ठिकाण",
    reason: "बिघाड होण्याचे मुख्य कारण",
    severity: "बिघाडाचे स्वरूप",
    detailedReason: "बिघाडाचे सविस्तर वर्णन",
    estimatedRepairTime: "दुरुस्तीसाठी लागणारा वेळ",
    estimatedRepairCost: "अंदाजे खर्च (₹)",
    recoveryVehicleNo: "पर्यायी गाडी नंबर",
    recoveryArrivalTime: "पर्यायी गाडी पोहोचण्याची वेळ",
    capacity: "गाडीची दूध क्षमता (L)",
    morningQty: "सकाळचे दूध संकलन (L)",
    eveningQty: "संध्याकाळचे दूध संकलन (L)",
    fat: "दूध फॅट प्रमाण (%)",
    snf: "दूध SNF प्रमाण (%)",
    result: "तपासणीचा अंतिम निकाल",
    milkHot: "दूध गरम झाले होते का?",
    milkSour: "दूध पूर्णपणे खराब झाले का?",
    licenseStatus: "परवाना स्थिती",
    fssaiNo: "FSSAI परवाना क्रमांक",
    validDate: "परवाना मुदत संपण्याची तारीख",
    summary: "कामाचा सविस्तर सारांश",
    visitPerson: "कोणाची भेट घेतली?",
    visitPurpose: "भेटीचा मुख्य उद्देश",
    visitDiscussion: "झालेली सविस्तर चर्चा",
    officeTaskSubject: "ऑफिस कामाचा मुख्य विषय",
    officeTaskDetails: "कामाचा सविस्तर गोषवारा",
    achievements: "आजची मोठी कामगिरी",
    problems: "कामात आलेल्या समस्या",
    actionsTaken: "केलेली कार्यवाही",
    actionTaken: "केलेली अंतिम कार्यवाही",
    remark: "विशेष शेरा",
    otherInfo: "इतर माहिती",
    notes: "महत्त्वाची नोंद",
    title: "दस्तऐवज शीर्षक",
    totalLossAmount: "एकूण आर्थिक नुकसान (₹)"
  };

  const fieldSequence = [
    "reportHeading", "date", "shift", "repId", "idNumber", "centerName", "centerCode", "ownerName", 
    "supplierName", "supplierId", "mobile", "address", "district", "taluka", "routeName", 
    "vehicleNo", "vehicleNumber", "vehicleType", "driverName", "breakdownTime", "location", 
    "reason", "severity", "detailedReason", "estimatedRepairTime", "estimatedRepairCost", 
    "recoveryVehicleNo", "recoveryArrivalTime", "capacity", "morningQty", "eveningQty", 
    "fat", "snf", "result", "licenseStatus", "fssaiNo", "validDate", "milkHot", "milkSour",
    "visitPerson", "visitPurpose", "visitDiscussion", "officeTaskSubject", "officeTaskDetails",
    "summary", "achievements", "problems", "actionsTaken", "actionTaken", "remark", "otherInfo", "totalLossAmount", "supervisorName"
  ];

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
      'Daily Task': '/work-log', 'Official Document': '/form-builder', 'Route Allocation Report': '/reports/entry/route-allocation'
    }
    const path = typeMap[report.type] || '/reports'
    router.push(`${path}?edit=${report.id}`)
  }

  const ReportHeader = ({ title, date, subName, subId }: any) => (
    <div className="w-full border-b-2 border-black pb-1.5 mb-3 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="h-7 w-7 bg-black rounded flex items-center justify-center">
          <Milk className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-[11pt] font-black uppercase tracking-tight leading-none">संकलन नोंदवही (Management Report)</h1>
          <p className="text-[7pt] font-bold uppercase">{title || "अहवाल तपशील"}</p>
        </div>
      </div>
      <div className="flex justify-between text-[7pt] font-black uppercase text-slate-500 tracking-wider mt-1.5 border-t pt-1">
        <span>सादरकर्ता: {subName} ({subId})</span>
        <span>दिनांक: {date}</span>
      </div>
    </div>
  )

  const RouteAllocationLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    const TableSection = ({ title, data }: { title: string, data: any[] }) => (
      <div className="w-full mb-3">
        <div className="bg-slate-100 p-0.5 text-[8pt] font-black uppercase text-center border border-black">{title}</div>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-slate-50 text-[6pt] font-black uppercase">
              <th className="p-0.5 border border-black w-8">Sr.No</th>
              <th className="p-0.5 border border-black w-20">Route ID</th>
              <th className="p-0.5 border border-black text-left">Route Name</th>
              <th className="p-0.5 border border-black w-16">Req</th>
              <th className="p-0.5 border border-black w-16">Alloc</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((entry, idx) => (
              <tr key={idx} className="text-[7pt] font-bold uppercase text-center h-6">
                <td className="p-0.5 border border-black">{idx + 1}</td>
                <td className="p-0.5 border border-black">{entry.routeId}</td>
                <td className="p-0.5 border border-black text-left">{entry.routeName}</td>
                <td className="p-0.5 border border-black font-black">{entry.requested ? 'YES' : '-'}</td>
                <td className="p-0.5 border border-black font-black">{entry.allocated ? 'YES' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-5 printable-report flex flex-col items-center shadow-none mb-4">
        <ReportHeader title={d.reportHeading} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} />
        
        <TableSection title="Type : Can Route Morning (Internal)" data={d.morningRoutes} />
        <TableSection title="Type : Can Route Evening (Internal)" data={d.eveningRoutes} />
        <TableSection title="Type : Internal Tanker Route" data={d.tankerRoutes} />
        <TableSection title="Type : External Can Route" data={d.extCanRoutes} />
        <TableSection title="Type : External Tanker Route" data={d.extTankerRoutes} />

        <div className="w-full mt-auto pt-6 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
          <div className="border-t-[1.2px] border-black pt-1.5">1) Supervisor Sign :</div>
          <div className="border-t-[1.2px] border-black pt-1.5">2) Manager Sign :</div>
        </div>
      </div>
    )
  }

  const GenericLayout = ({ report }: { report: any }) => {
    const d = report.fullData || {};
    
    if (report.type === 'Official Document') {
      return (
        <div className="bg-white font-sans text-slate-900 border-none w-full max-w-[210mm] mx-auto p-0 printable-report flex flex-col shadow-none mb-4">
          <div className="w-full text-center mb-8">
             <h1 className="text-[18pt] font-black uppercase tracking-tight border-b-2 border-black pb-2 inline-block min-w-[200px]">
               {d.title || "अधिकृत दस्तऐवज"}
             </h1>
          </div>
          <div 
            className="w-full prose prose-sm max-w-none text-left text-[10pt] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: d.content || "" }} 
          />
        </div>
      );
    }

    const orderedEntries = fieldSequence
      .filter(key => d[key] !== undefined && d[key] !== "" && labelMap[key])
      .map(key => [key, d[key]]);

    const losses = d.centerLosses || [];
    const points = d.points || [];
    const remarkPoints = d.remarkPoints || [];

    return (
      <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-5 printable-report flex flex-col items-center shadow-none mb-4">
        <ReportHeader title={d.reportHeading || report.type} date={report.date} subName={d.name || d.repName || profileName} subId={d.idNumber || d.repId || profileId} />
        
        <div className="w-full border border-black rounded overflow-hidden mb-3">
          <table className="w-full border-collapse">
            <tbody>
              {orderedEntries.map(([k, v]: any) => (
                <tr key={k} className="border-b border-black last:border-0 text-[8pt] font-bold">
                  <td className="p-1.5 bg-slate-50 uppercase text-[7pt] font-black border-r border-black w-1/3">{labelMap[k]}</td>
                  <td className="p-1.5">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {losses.length > 0 && (
          <div className="w-full border border-black rounded overflow-hidden mb-3">
            <div className="bg-slate-100 p-0.5 text-[7pt] font-black uppercase text-center border-b border-black">नुकसान तपशील (LOSS LOG)</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white font-black text-[6pt] uppercase text-center">
                  <th className="p-1 border-r border-white/20 text-left">कोड/गवळी नाव</th>
                  <th className="p-1 border-r border-white/20">प्रकार</th>
                  <th className="p-1 border-r border-white/20">Ltr</th>
                  <th className="p-1">रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {losses.map((loss: any, idx: number) => (
                  <tr key={idx} className="font-bold text-[7pt] uppercase border-b border-black last:border-0 text-center">
                    <td className="p-1 border-r border-black text-left">{loss.centerCode} {loss.centerName}</td>
                    <td className="p-1 border-r border-black">{loss.milkType}</td>
                    <td className="p-1 border-r border-black">{loss.qtyLiters}</td>
                    <td className="p-1">{loss.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.totalLossAmount !== undefined && (
              <div className="bg-slate-50 p-1.5 text-right border-t border-black font-black text-[8pt]">
                एकूण नुकसान: ₹{d.totalLossAmount}
              </div>
            )}
          </div>
        )}

        {(points.length > 0 || remarkPoints.length > 0) && (
          <div className="w-full p-2.5 border border-black rounded bg-slate-50 mb-3 text-left">
            <span className="text-[7pt] font-black uppercase block border-b border-black/10 pb-0.5 mb-1.5">सविस्तर निरीक्षणे / मुद्दे:</span>
            <ul className="list-decimal list-inside space-y-0.5">
              {[...points, ...remarkPoints].map((p: string, i: number) => (
                <li key={i} className="text-[8pt] font-bold">{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="w-full mt-auto pt-6 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
          <div className="border-t-[1.2px] border-black pt-1.5">अधिकारी स्वाक्षरी</div>
          <div className="border-t-[1.2px] border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
        </div>
      </div>
    );
  };

  if (!mounted) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="max-w-5xl mx-auto px-2 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h2 className="text-xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">ARCHIVE & RECORD MANAGEMENT</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="h-10 px-4 font-black uppercase rounded-2xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex-1 sm:flex-none">
            <Link href="/reports/entry/route-allocation"><Layers className="h-4 w-4 mr-2" /> ERP रिपोर्ट</Link>
          </Button>
          <Button asChild className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 flex-1 sm:flex-none">
            <Link href="/daily-report"><Plus className="h-4 w-4 mr-2" /> नवीन अहवाल</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8">
        {reportTypes.map((rt) => (
          <button 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={cn(
              "h-20 flex flex-col items-center justify-center rounded-2xl border transition-all",
              typeFilter === rt.type 
                ? "bg-primary text-white border-primary shadow-lg scale-[0.98]" 
                : "bg-white text-slate-900 border-slate-100 shadow-sm hover:border-primary/20"
            )}
          >
            <rt.icon className={cn("h-5 w-5 mb-1.5", typeFilter === rt.type ? "text-white" : rt.color)} />
            <span className="text-[9px] font-black text-center uppercase tracking-tighter px-1 leading-tight">{rt.title}</span>
          </button>
        ))}
      </div>

      <Card className="p-3 mb-6 bg-white border-none shadow-xl rounded-2xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              className="h-11 pl-10 text-[13px] bg-slate-50 border-none rounded-xl font-bold shadow-inner" 
              placeholder="नाव किंवा सारांश शोधा..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-40">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input 
                type="date" 
                className="h-11 pl-10 text-[12px] bg-slate-50 border-none rounded-xl font-black shadow-inner w-full" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)} 
              />
            </div>
            { (filterDate || searchQuery || typeFilter) && (
              <Button variant="ghost" size="icon" onClick={() => { setFilterDate(""); setSearchQuery(""); setTypeFilter(null); }} className="h-11 w-11 rounded-xl bg-slate-100 text-slate-500">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xl w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-24">तारीख</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">अहवाल शीर्षक व सारांश</th>
                <th className="p-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest w-24">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] cursor-pointer group transition-colors" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <td className="p-4 font-black text-[10px] text-slate-500 uppercase whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{report.date?.split('-').reverse().join('/')}</span>
                      <span className="text-[8px] opacity-50">{report.fullData?.shift || ""}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[12px] text-primary uppercase group-hover:translate-x-1 transition-transform truncate max-w-[200px] md:max-w-md">
                        {report.fullData?.reportHeading || report.fullData?.title || report.type}
                      </span>
                      <span className="text-[10px] text-slate-400 italic truncate max-w-[200px] md:max-w-md">
                        {report.summary}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => handleEditReport(report, e)}>
                        <FileEdit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg" onClick={(e) => handleDeleteReport(report.id, e)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-muted-foreground font-black uppercase text-[11px] opacity-20 tracking-[0.3em] italic">
                    एकही अहवाल सापडला नाही.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[98vw] p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-slate-100 flex flex-col items-center">
          <DialogHeader className="p-3 bg-white border-b flex flex-row items-center justify-between no-print w-full shrink-0">
            <DialogTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> अहवाल प्रीव्ह्यू
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-8 px-3 font-black uppercase rounded-xl bg-black text-white text-[9px]"><Printer className="h-3.5 w-3.5 mr-1.5" /> प्रिंट</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-2 sm:p-4 bg-slate-100 w-full">
            <div className="w-full flex flex-col items-center pb-10">
              {selectedReport && (
                selectedReport.type === 'Route Allocation Report' ? <RouteAllocationLayout report={selectedReport} /> :
                <GenericLayout report={selectedReport} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body { visibility: hidden !important; background: white !important; margin: 0 !important; padding: 0 !important; }
          .printable-report, .printable-report * { visibility: visible !important; opacity: 1 !important; color: black !important; }
          .printable-report { 
            position: absolute !important; 
            top: 0 !important; 
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 100% !important; 
            max-width: 190mm !important; 
            border: 1.2px solid black !important; 
            padding: 8mm !important; 
            display: block !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            background: white !important;
            margin: 0 !important;
          }
          [role="dialog"] { position: absolute !important; top: 0 !important; left: 0 !important; transform: none !important; width: 100% !important; max-width: none !important; background: transparent !important; box-shadow: none !important; }
          .no-print, button, header, nav, footer, .sidebar, [role="dialog"] [class*="Close"], .h-14, .h-6 { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid black !important; margin-bottom: 8pt; }
          th, td { border: 1px solid black !important; padding: 2pt 4pt !important; font-size: 7.5pt !important; line-height: 1.1 !important; }
          th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
