
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle, AlertTriangle, Info, BookOpen, Lightbulb, FileCheck, Clock, Milk, User, IndianRupee, Hash
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const labelMap: Record<string, string> = {
  reportHeading: "अहवाल शीर्षक",
  date: "तारीख",
  reportDate: "तारीख",
  shift: "शिफ्ट",
  idNumber: "अधिकारी ID",
  repId: "कर्मचारी ID",
  centerName: "केंद्राचे नाव",
  centerCode: "केंद्र कोड",
  supplierName: "पुरवठादार नाव",
  supplierId: "पुरवठादार ID",
  mobile: "मोबाईल",
  address: "पत्ता",
  routeName: "रूट नाव",
  vehicleNo: "गाडी नंबर",
  vehicleNumber: "वाहन क्र.",
  driverName: "ड्रायव्हर",
  breakdownTime: "बिघाड वेळ",
  location: "ठिकाण",
  reason: "कारण",
  severity: "स्वरूप",
  detailedReason: "सविस्तर वर्णन",
  estimatedRepairCost: "अंदाजे खर्च (₹)",
  morningQty: "सकाळ दूध (L)",
  eveningQty: "संध्याकाळ दूध (L)",
  fat: "फॅट (%)",
  snf: "SNF (%)",
  result: "निकाल",
  totalLossAmount: "एकूण आर्थिक नुकसान (₹)",
  dailyProblems: "प्रॉब्लेम्स / निरीक्षणे",
  slipNo: "SLIP No.",
  visitPerson: "भेट दिलेली व्यक्ती",
  visitPurpose: "भेटीचा उद्देश",
  officeTaskSubject: "कामाचा विषय",
  fineAmount: "दंडाची रक्कम (₹)",
  seizureQty: "जप्त दूध (L)",
  actionTaken: "केलेली कार्यवाही",
  totalMilk: "एकूण दूध (L)",
  paymentCycle: "पेमेंट सायकल",
  otherInfo: "इतर माहिती",
  estimatedRepairTime: "दुरुस्ती वेळ",
  recoveryVehicleNo: "पर्यायी गाडी",
  recoveryArrivalTime: "पर्यायी गाडी वेळ",
  milkHot: "दूध गरम झाले का",
  milkSour: "दूध खराब झाले का",
  title: "कामाचे नाव",
  description: "कामाचा तपशील",
  remark: "पूर्ण केलेल्या कामाचा शेरा"
};

const ReportHeader = ({ title, date, subName, subId, shift }: any) => (
  <div className="w-full border-b-[3px] border-black pb-4 mb-6 text-center">
    <h1 className="text-[16pt] sm:text-[22pt] font-black uppercase tracking-tight text-slate-900 leading-tight">{title || "अधिकृत अहवाल"}</h1>
    <div className="flex flex-col sm:flex-row justify-between items-center text-[8pt] sm:text-[10pt] font-black uppercase text-slate-700 tracking-wider mt-4 border-t border-black/10 pt-3 gap-2">
      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-left">
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5" /> सादरकर्ता: {subName}</span>
          {subId && <span className="text-[7pt] opacity-70 ml-5">अधिकृत आयडी: {subId}</span>}
        </div>
        {shift && <Badge variant="outline" className="h-5 text-[8px] border-black/20 font-black">{shift}</Badge>}
      </div>
      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> दिनांक: {date}</span>
    </div>
  </div>
)

const SectionTitle = ({ icon: Icon, title, color = "text-slate-900" }: any) => (
  <div className="w-full flex items-center gap-2 border-b-2 border-black pb-1 mb-4 mt-6 break-after-avoid section-title">
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[9pt] sm:text-[11pt] font-black uppercase tracking-widest", color)}>{title}</h3>
  </div>
)

const ProfessionalParagraph = ({ label, content, icon: Icon }: { label: string, content: string, icon?: any }) => {
  if (!content) return null;
  return (
    <div className="mb-6 text-left w-full break-inside-avoid">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span className="text-[8pt] sm:text-[9pt] font-black uppercase text-primary tracking-widest">{label}</span>
      </div>
      <div className="p-3 sm:p-4 bg-slate-50 border-l-4 border-primary rounded-r-lg shadow-sm print:shadow-none print:border-slate-300">
        <p className="text-[9pt] sm:text-[11pt] font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

const RouteAllocationLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  
  const renderRegisterTable = (title: string, rawData: any[], tableKey: string) => {
    if (!rawData || rawData.length === 0) return null;
    
    return (
      <div key={tableKey} className="w-full mb-4 break-inside-avoid">
        <div className="bg-slate-100 border-[1.5px] border-black border-b-0 p-1.5 font-black text-[8pt] uppercase text-left tracking-wider">
          Type : {title}
        </div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[7.5pt]">
          <thead>
            <tr className="bg-slate-50 font-black uppercase text-center border-b-[1.5px] border-black">
              <th className="border-r border-black p-1 w-[25px]">SR</th>
              <th className="border-r border-black p-1 w-[45px]">ID</th>
              <th className="border-r border-black p-1 text-left pl-2">ROUTE NAME</th>
              <th className="border-r border-black p-1 w-[35px]">REQ</th>
              <th className="p-1 w-[35px]">ALLOC</th>
            </tr>
          </thead>
          <tbody>
            {rawData.map((it, i) => (
              <tr key={it.id || `${tableKey}-${i}`} className="font-bold uppercase text-center border-b border-black last:border-b-0 h-7">
                <td className="border-r border-black p-0.5">{i + 1}</td>
                <td className="border-r border-black p-0.5 text-slate-600">{it.routeCode || it.routeId || "-"}</td>
                <td className="border-r border-black p-0.5 text-left pl-2 truncate">{it.routeName}</td>
                <td className="border-r border-black p-0.5 text-[11pt] text-rose-600 font-serif leading-none">
                  {it.requested ? '✓' : ''}
                </td>
                <td className="p-0.5 text-[11pt] text-blue-700 font-serif leading-none">
                  {it.allocated ? '✓' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const sections = [
    { label: "Morning (Internal)", data: d.morningRoutes, key: "morn" },
    { label: "Evening (Internal)", data: d.eveningRoutes, key: "eve" },
    { label: "Internal Tanker", data: d.tankerRoutes, key: "tank" },
    { label: "External Can", data: d.extCanRoutes, key: "extcan" },
    { label: "External Tanker", data: d.extTankerRoutes, key: "exttank" }
  ].filter(s => s.data && s.data.length > 0);

  return (
    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-8 printable-report flex flex-col items-center min-h-screen">
      <ReportHeader title={d.reportHeading || "ERP Daily Route Allocation Register"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-4 items-start print:grid-cols-2">
        <div className="flex flex-col gap-1">
          {sections.filter((_, idx) => idx % 2 === 0).map(s => renderRegisterTable(s.label, s.data, s.key))}
        </div>
        <div className="flex flex-col gap-1">
          {sections.filter((_, idx) => idx % 2 !== 0).map(s => renderRegisterTable(s.label, s.data, s.key))}
        </div>
      </div>

      {d.dailyProblems && (
        <div className="w-full mt-4 break-inside-avoid">
          <div className="bg-rose-50 border-[1.5px] border-black p-3 rounded shadow-sm">
            <h4 className="text-[9pt] font-black uppercase text-rose-700 flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" /> महत्त्वाच्या नोंदी / प्रॉब्लेम्स (Daily Text Pad)
            </h4>
            <div className="font-bold text-[9pt] text-slate-800 leading-relaxed whitespace-pre-wrap border-t border-rose-200 pt-2">
              {d.dailyProblems}
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const GenericLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  
  if (report.type === 'Official Document') {
    return (
      <div className="bg-white font-sans text-slate-900 w-full p-6 sm:p-12 printable-report flex flex-col min-h-screen">
        <div className="w-full text-center mb-12"><h1 className="text-[20pt] font-black uppercase tracking-tight border-b-4 border-black pb-2 inline-block">{d.title || "अधिकृत दस्तऐवज"}</h1></div>
        <div className="w-full prose prose-sm sm:prose-lg max-w-none text-left text-[11pt] leading-relaxed text-slate-900" dangerouslySetInnerHTML={{ __html: d.content || "" }} />
      </div>
    );
  }

  const excludeFields = ["reportHeading", "name", "repName", "shift", "idNumber", "repId", "routeVisitLogs", "centerLosses", "morningRoutes", "eveningRoutes", "tankerRoutes", "extCanRoutes", "extTankerRoutes", "points", "remarkPoints", "dailyProblems", "equipment", "cowMilk", "buffaloMilk", "cowQty", "cowFat", "cowSnf", "bufQty", "bufFat", "bufSnf", "summary", "achievements", "problems", "actionsTaken", "actionTaken", "isWordDoc", "content", "title", "type", "visitDiscussion", "officeTaskDetails", "remark", "supplierName", "supplierId"];

  const orderedEntries = Object.keys(d)
    .filter(key => d[key] && labelMap[key] && !excludeFields.includes(key))
    .map(key => [key, d[key]]);

  const renderLogsTable = () => {
    if (d.routeVisitLogs && d.routeVisitLogs.length > 0) {
      return (
        <div className="w-full mb-8 border-2 border-black overflow-hidden shadow-sm break-inside-avoid">
          <div className="bg-slate-800 text-white p-2 text-[9pt] font-black uppercase text-center tracking-widest">व्हिजिट लॉग (VISIT LOG)</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[8.5pt]">
              <thead>
                <tr className="bg-slate-100 font-black uppercase border-b-2 border-black">
                  <th className="border-r border-black p-2 w-[35px]">SR</th>
                  <th className="border-r border-black p-2 w-[55px]">CODE</th>
                  <th className="border-r border-black p-2 text-left pl-3">CENTER NAME</th>
                  <th className="border-r border-black p-2 w-[90px]">IN / OUT</th>
                  <th className="border-r border-black p-2 w-[70px]">CANS</th>
                  <th className="p-2">ICE USED</th>
                </tr>
              </thead>
              <tbody>
                {d.routeVisitLogs.map((it: any, i: number) => (
                  <tr key={it.id || `visit-${i}`} className="font-bold uppercase border-b border-black last:border-0 hover:bg-slate-50">
                    <td className="border-r border-black p-2 text-center bg-slate-50">{i + 1}</td>
                    <td className="border-r border-black p-2 text-center font-black">{it.centerCode}</td>
                    <td className="border-r border-black p-2 text-left pl-3">{it.supplierName}</td>
                    <td className="border-r border-black p-2 text-center">{it.arrivalTime} - {it.departureTime}</td>
                    <td className="border-r border-black p-2 text-center">{it.emptyCans} / {it.fullCans}</td>
                    <td className="p-2 text-center">{it.iceUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    return null;
  }

  const renderLossLogTable = () => {
    if (d.centerLosses && d.centerLosses.length > 0) {
      const totalLoss = d.centerLosses.reduce((acc: number, curr: any) => acc + (Number(curr.lossAmount) || 0), 0);
      return (
        <div className="w-full mb-8 border-2 border-black overflow-hidden shadow-sm break-inside-avoid">
          <div className="bg-rose-800 text-white p-2 text-[9pt] font-black uppercase text-center tracking-widest">नुकसान तपशील (LOSS LOG)</div>
          <table className="w-full border-collapse text-[8.5pt]">
            <thead>
              <tr className="bg-slate-100 font-black uppercase border-b-2 border-black">
                <th className="border-r border-black p-2">केंद्राचे नाव / कोड</th>
                <th className="border-r border-black p-2 w-20">प्रकार</th>
                <th className="border-r border-black p-2 w-20">लिटर</th>
                <th className="p-2 w-32">रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody>
              {d.centerLosses.map((it: any, i: number) => (
                <tr key={it.id || `loss-${i}`} className="font-bold uppercase border-b border-black last:border-0">
                  <td className="border-r border-black p-2 pl-3">{it.centerName} {it.centerCode ? `(${it.centerCode})` : ""}</td>
                  <td className="border-r border-black p-2 text-center">{it.milkType}</td>
                  <td className="border-r border-black p-2 text-center">{it.qtyLiters}</td>
                  <td className="p-2 text-right pr-3 font-black text-rose-600">₹{it.lossAmount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-rose-50 font-black border-t-2 border-black">
                <td colSpan={3} className="p-2 text-right uppercase tracking-widest pr-4">एकूण आर्थिक नुकसान:</td>
                <td className="p-2 text-right pr-3 text-rose-700 text-[11pt]">₹{totalLoss}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )
    }
    return null;
  }

  return (
    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
      <ReportHeader title={d.reportHeading || report.type} date={report.date} subName={d.name || d.repName || profileName} subId={d.idNumber || d.repId || profileId} shift={d.shift} />
      
      <div className="w-full text-left mb-6 text-[10pt] font-bold leading-relaxed italic text-slate-600 border-l-4 border-slate-200 pl-4">
        सदर अहवाल {d.name || d.repName || profileName} (आयडी: {d.idNumber || d.repId || profileId}) यांच्याद्वारे अधिकृतपणे {report.date} रोजी सादर करण्यात येत आहे.
      </div>

      <SectionTitle icon={Info} title="१) मुख्य माहिती तपशील (DETAILS)" />
      <div className="w-full border-2 border-black mb-8 overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            {d.supplierName && (
              <tr className="text-[9pt] sm:text-[10pt] font-bold border-b border-black hover:bg-slate-50">
                <td className="p-2.5 bg-slate-100 uppercase font-black border-r border-black w-1/3 text-slate-700 pl-3 flex items-center gap-2"><User className="h-3.5 w-3.5" /> पुरवठादार / केंद्राचे नाव</td>
                <td className="p-2.5 pl-3 font-black text-primary uppercase">{d.supplierName}</td>
              </tr>
            )}
            {d.supplierId && (
              <tr className="text-[9pt] sm:text-[10pt] font-bold border-b border-black hover:bg-slate-50">
                <td className="p-2.5 bg-slate-100 uppercase font-black border-r border-black w-1/3 text-slate-700 pl-3 flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> पुरवठादार कोड (CODE)</td>
                <td className="p-2.5 pl-3 font-black">{d.supplierId}</td>
              </tr>
            )}
            {d.title && (
              <tr className="text-[9pt] sm:text-[10pt] font-bold border-b border-black hover:bg-slate-50">
                <td className="p-2.5 bg-slate-100 uppercase font-black border-r border-black w-1/3 text-slate-700 pl-3 flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> पूर्ण करावयाच्या कामाचे नाव</td>
                <td className="p-2.5 pl-3 font-black text-rose-600 uppercase">{d.title}</td>
              </tr>
            )}
            {orderedEntries.map(([k, v]: any) => (
              <tr key={k} className="text-[9pt] sm:text-[10pt] font-bold border-b border-black last:border-0 hover:bg-slate-50">
                <td className="p-2.5 bg-slate-100 uppercase font-black border-r border-black w-1/3 text-[8pt] sm:text-[9pt] text-slate-700 pl-3">{labelMap[k]}</td>
                <td className="p-2.5 pl-3 whitespace-pre-wrap">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderLogsTable()}
      {renderLossLogTable()}

      {(d.summary || d.achievements || d.problems || d.actionsTaken || d.actionTaken || d.visitDiscussion || d.officeTaskDetails || d.remark) && (
        <>
          <SectionTitle icon={BookOpen} title="२) सविस्तर अहवाल व कामकाज (NARRATIVE)" />
          <div className="w-full text-left space-y-2">
            <ProfessionalParagraph label="प्रस्तावना / सारांश" content={d.summary} icon={Info} />
            <ProfessionalParagraph label="झालेली चर्चा / तपशील" content={d.visitDiscussion || d.officeTaskDetails} icon={FileText} />
            <ProfessionalParagraph label="कामाबद्दल सविस्तर शेरा" content={d.remark} icon={FileEdit} />
            <ProfessionalParagraph label="महत्त्वाची कामगिरी" content={d.achievements} icon={CheckCircle2} />
            <ProfessionalParagraph label="समस्येचे स्वरूप" content={d.problems} icon={AlertTriangle} />
            <ProfessionalParagraph label="केलेली कार्यवाही / शिफारसी" content={d.actionsTaken || d.actionTaken} icon={Lightbulb} />
          </div>
        </>
      )}

      { (d.remarkPoints || d.points) && (
        <div className="w-full mt-6 text-left break-inside-avoid">
          <SectionTitle icon={Layers} title="३) विशेष निरीक्षणे (POINTS)" />
          <div className="p-4 bg-slate-50 border-2 border-black rounded-lg space-y-2">
            {(d.remarkPoints || d.points).map((p: string, i: number) => (
              <div key={i} className="flex gap-3 text-[9pt] sm:text-[10pt] font-bold text-slate-800">
                <span className="text-primary font-black">{i + 1}.</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {d.fineAmount && (
        <div className="w-full mt-6 break-inside-avoid">
          <div className="bg-rose-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6" />
              <span className="text-[10pt] font-black uppercase tracking-widest">आकारलेला एकूण दंड:</span>
            </div>
            <span className="text-xl font-black">₹{d.fineAmount}</span>
          </div>
        </div>
      )}

      <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest border-t border-slate-100 break-inside-avoid">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  );
};

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

  const filteredReports = useMemo(() => {
    const list = firestoreReports || []
    return list.filter(r => {
      const matchesDate = filterDate === "" || r.date === filterDate
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.type?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q) || r.fullData?.reportHeading?.toLowerCase().includes(q)
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

  if (!mounted) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="max-w-6xl mx-auto px-2 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary/20 pb-4 mb-6 gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h2 className="text-xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Archive Management System</p>
        </div>
        <Button asChild className="h-10 px-6 font-black uppercase rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto">
          <Link href="/daily-report"><Plus className="h-4 w-4 mr-2" /> नवीन अहवाल</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
        {reportTypes.map((rt) => (
          <button 
            key={rt.title} 
            onClick={() => setTypeFilter(typeFilter === rt.type ? null : rt.type)}
            className={cn(
              "h-16 flex flex-col items-center justify-center rounded-xl border transition-all",
              typeFilter === rt.type 
                ? "bg-primary text-white border-primary shadow-lg" 
                : "bg-white text-slate-900 border-slate-100 hover:border-primary/20"
            )}
          >
            <rt.icon className={cn("h-4 w-4 mb-1", typeFilter === rt.type ? "text-white" : rt.color)} />
            <span className="text-[8px] font-black text-center uppercase leading-tight px-1">{rt.title}</span>
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
            <div className="relative flex-1 md:w-48">
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

      <div className="grid gap-3 grid-cols-1">
        {filteredReports.map((report) => (
          <Card key={report.id} className="p-4 bg-white border-none shadow-md hover:shadow-xl rounded-2xl transition-all cursor-pointer group text-left" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg">{report.type}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{report.date?.split('-').reverse().join('/')}</span>
                </div>
                <h4 className="font-black text-[14px] text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {report.fullData?.reportHeading || report.fullData?.title || report.summary}
                </h4>
                <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-1 opacity-70">
                  {report.summary}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={(e) => handleEditReport(report, e)}><FileEdit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg" onClick={(e) => handleDeleteReport(report.id, e)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-3">
            <Archive className="h-10 w-10 text-slate-200" />
            <p className="text-muted-foreground font-black uppercase text-[11px] opacity-40 tracking-[0.2em] italic">एकही अहवाल सापडले नाहीत.</p>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className={cn(
          "p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-white flex flex-col h-full max-h-screen md:max-h-[98vh]",
          selectedReport?.type === 'Route Allocation Report' ? "max-w-[1100px] w-full" : "max-w-[950px] w-full"
        )}>
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between no-print w-full shrink-0">
            <DialogTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> अहवाल प्रिव्ह्यू (OFFICIAL PREVIEW)
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-9 px-4 font-black uppercase rounded-xl bg-slate-900 text-white text-[10px] shadow-lg"><Printer className="h-4 w-4 mr-2" /> प्रिंट</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 bg-slate-100 w-full overflow-auto">
            <div className="report-preview-container p-2 sm:p-6 overflow-visible flex flex-col items-center">
              {selectedReport && (
                <div className={cn(
                  "bg-white shadow-2xl overflow-visible rounded-sm origin-top transform-gpu mb-10 transition-all",
                  selectedReport.type === 'Route Allocation Report' 
                    ? "w-full max-w-[297mm] min-h-screen landscape-mode" 
                    : "w-full max-w-[210mm] min-h-screen"
                )}>
                  {selectedReport.type === 'Route Allocation Report' ? 
                    <RouteAllocationLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                    <GenericLayout report={selectedReport} profileName={profileName} profileId={profileId} />
                  }
                </div>
              )}
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
