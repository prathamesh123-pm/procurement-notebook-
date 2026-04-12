"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle
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
import { Badge } from "@/components/ui/badge"

const labelMap: Record<string, string> = {
  reportHeading: "अहवाल शीर्षक",
  date: "तारीख",
  reportDate: "तारीख",
  shift: "शिफ्ट",
  slipNo: "SLIP No.",
  idNumber: "अधिकारी ID",
  repId: "कर्मचारी ID",
  supervisorName: "सुपरवायझर",
  centerName: "केंद्राचे नाव",
  centerCode: "केंद्र कोड",
  ownerName: "मालकाचे नाव",
  supplierName: "पुरवठादार किंवा केंद्राचे नाव",
  supplierId: "पुरवठादार किंवा केंद्राचा कोड (CODE)",
  mobile: "मोबाईल",
  address: "पत्ता",
  district: "जिल्हा",
  taluka: "तालुका",
  routeName: "दुध संकलन रूटचे नाव",
  vehicleNo: "गाडीचा नंबर",
  vehicleNumber: "गाडीचा नंबर",
  vehicleType: "गाडीचा प्रकार",
  driverName: "ड्रायव्हरचे नाव",
  breakdownTime: "गाडी बिघाड झाल्याची वेळ",
  location: "बिघाड झालेल्या ठिकाणाचे नाव",
  reason: "बिघाड होण्याचे मुख्य कारण",
  severity: "बिघाडाचे स्वरूप",
  detailedReason: "बिघाडाचे सविस्तर वर्णन",
  estimatedRepairTime: "दुरुस्तीसाठी लागणारा वेळ (तास)",
  estimatedRepairCost: "दुरुस्तीसाठी लागणारा अंदाजे खर्च (₹)",
  recoveryVehicleNo: "दुध वाचवण्यासाठी पाठवलेली दुसरी गाडी",
  recoveryArrivalTime: "दुसरी गाडी पोहोचण्याची वेळ",
  capacity: "गाडीची दूध क्षमता (Liters)",
  morningQty: "सकाळचे दूध संकलन (L)",
  eveningQty: "संध्याकाळचे दूध संकलन (L)",
  fat: "दूध फॅट प्रमाण (%)",
  snf: "दूध SNF प्रमाण (%)",
  result: "अंतिम निकाल (RESULT)",
  milkHot: "दूध गरम झाले होते का?",
  milkSour: "दूध पूर्णपणे खराब झाले का?",
  licenseStatus: "परवाना स्थिती",
  fssaiNo: "FSSAI परवाना क्र.",
  validDate: "वैधता मुदत",
  summary: "सारांश",
  visitPerson: "कोणाची भेट घेतली?",
  visitPurpose: "भेटीचा मुख्य उद्देश",
  visitDiscussion: "झालेली सविस्तर चर्चा",
  officeTaskSubject: "कामाचा मुख्य विषय",
  officeTaskDetails: "कामाचा सविस्तर गोषवारा",
  achievements: "आजची मोठी कामगिरी",
  problems: "महत्त्वाच्या समस्या",
  actionsTaken: "केलेली कार्यवाही",
  actionTaken: "अंतिम कार्यवाही",
  remark: "विशेष शेरा",
  otherInfo: "इतर माहिती",
  notes: "नोंद",
  title: "पूर्ण करावयाच्या कामाचे नाव",
  totalLossAmount: "एकूण आर्थिक नुकसान (₹)",
  dailyProblems: "आजचे प्रॉब्लेम्स / निरीक्षणे"
};

const fieldSequence = [
  "reportHeading", "date", "shift", "repId", "idNumber", "centerName", "centerCode", "ownerName", 
  "supplierName", "supplierId", "mobile", "address", "district", "taluka", "routeName", 
  "vehicleNo", "vehicleNumber", "vehicleType", "driverName", "breakdownTime", "location", 
  "reason", "severity", "detailedReason", "estimatedRepairTime", "estimatedRepairCost", 
  "recoveryVehicleNo", "recoveryArrivalTime", "capacity", "morningQty", "eveningQty", 
  "fat", "snf", "result", "licenseStatus", "fssaiNo", "validDate", "milkHot", "milkSour",
  "visitPerson", "visitPurpose", "visitDiscussion", "officeTaskSubject", "officeTaskDetails",
  "summary", "achievements", "problems", "actionsTaken", "actionTaken", "remark", "otherInfo", "totalLossAmount", "dailyProblems", "supervisorName"
];

const ReportHeader = ({ title, date, subName, subId, shift }: any) => (
  <div className="w-full border-b-2 border-black pb-1.5 mb-3 text-center">
    <h1 className="text-[14pt] font-black uppercase tracking-tight">{title || "अहवाल"}</h1>
    <div className="flex justify-between text-[7pt] font-black uppercase text-slate-500 tracking-wider mt-1 border-t pt-1">
      <div className="flex gap-2">
        <span>सादरकर्ता: {subName}</span>
        {subId && <span>| ID: {subId}</span>}
        {shift && <span>| शिफ्ट: {shift}</span>}
      </div>
      <span>दिनांक: {date}</span>
    </div>
  </div>
)

const RouteAllocationLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  
  const renderExcelSection = (title: string, rawData: any[]) => {
    if (!rawData || rawData.length === 0) return null;
    const activeData = rawData.filter(e => e.requested || e.allocated);
    if (activeData.length === 0) return null;

    const mid = Math.ceil(activeData.length / 2);
    const leftCol = activeData.slice(0, mid);
    const rightCol = activeData.slice(mid);

    const TablePart = ({ items, startIdx }: { items: any[], startIdx: number }) => (
      <table className="w-full border-collapse border border-black text-[7pt] table-fixed">
        <thead>
          <tr className="bg-slate-200 font-black uppercase text-center h-6">
            <th className="border border-black p-1 w-6">Sr.</th>
            <th className="border border-black p-1 w-10">Code</th>
            <th className="border border-black p-1 text-left pl-1">Route Name</th>
            <th className="border border-black p-1 w-8">Req</th>
            <th className="border border-black p-1 w-8">Alloc</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="h-6 font-bold uppercase text-center border-b border-black">
              <td className="border border-black p-1">{startIdx + i + 1}</td>
              <td className="border border-black p-1 truncate">{it.routeCode || it.routeId}</td>
              <td className="border border-black p-1 text-left pl-1 truncate text-[6.5pt]">{it.routeName}</td>
              <td className="border border-black p-1 font-black">{it.requested ? '√' : ''}</td>
              <td className="border border-black p-1 font-black">{it.allocated ? '√' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <div className="w-full mb-2 border border-black overflow-hidden">
        <div className="bg-slate-800 text-white p-1 text-[8pt] font-black uppercase text-center border-b border-black">
          प्रकार : {title}
        </div>
        <div className="flex w-full divide-x divide-black">
          <div className="w-1/2"><TablePart items={leftCol} startIdx={0} /></div>
          <div className="w-1/2"><TablePart items={rightCol} startIdx={mid} /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full p-5 printable-report flex flex-col items-center shadow-none mb-4">
      <ReportHeader title={d.reportHeading || "ERP अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <div className="w-full space-y-1">
        {renderExcelSection("Can Route Morning (Internal)", d.morningRoutes)}
        {renderExcelSection("Can Route Evening (Internal)", d.eveningRoutes)}
        {renderExcelSection("Internal Tanker Route", d.tankerRoutes)}
        {renderExcelSection("External Can Route", d.extCanRoutes)}
        {renderExcelSection("External Tanker Route", d.extTankerRoutes)}
      </div>

      {d.dailyProblems && (
        <div className="w-full border border-black rounded-sm overflow-hidden mb-2 mt-2 text-left">
          <div className="bg-rose-50 p-1.5 text-[8pt] font-black uppercase text-rose-700 border-b border-black flex items-center gap-2">
            <AlertCircle className="h-3 w-3" /> आजचे महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे (Daily Text Pad)
          </div>
          <div className="p-3 text-[9pt] font-bold whitespace-pre-wrap leading-relaxed">
            {d.dailyProblems}
          </div>
        </div>
      )}

      <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
        <div className="border-t border-black pt-1.5">अधिकारी स्वाक्षरी</div>
        <div className="border-t border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const RouteVisitLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const logs = d.routeVisitLogs || [];
  
  return (
    <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full p-5 printable-report flex flex-col items-center shadow-none mb-4">
      <ReportHeader title={d.reportHeading || "रूट व्हिजिट अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <div className="w-full grid grid-cols-2 gap-2 mb-3 text-left">
        <div className="border border-black p-1.5 text-[8pt] font-bold uppercase">{labelMap.routeName}: {d.routeName}</div>
        <div className="border border-black p-1.5 text-[8pt] font-bold uppercase">{labelMap.vehicleNumber}: {d.vehicleNumber}</div>
        <div className="border border-black p-1.5 text-[8pt] font-bold uppercase">{labelMap.driverName}: {d.driverName}</div>
        <div className="border border-black p-1.5 text-[8pt] font-bold uppercase">{labelMap.slipNo}: {d.slipNo}</div>
      </div>

      <table className="w-full border-collapse mb-3 table-fixed border border-black">
        <thead>
          <tr className="bg-slate-100 text-[7pt] font-black uppercase text-center h-8">
            <th className="p-1 border border-black w-[35px]">Sr.</th>
            <th className="p-1 border border-black w-[60px]">Code</th>
            <th className="p-1 border border-black text-left pl-2">Center Name</th>
            <th className="p-1 border border-black w-[95px]">In/Out</th>
            <th className="p-1 border border-black w-[55px]">E/F</th>
            <th className="p-1 border border-black w-[65px]">Ice</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any, i: number) => (
            <tr key={i} className="text-[8pt] font-bold uppercase text-center h-8 border-b border-black">
              <td className="p-1 border border-black">{i + 1}</td>
              <td className="p-1 border border-black truncate px-1">{log.centerCode}</td>
              <td className="p-1 border border-black text-left pl-2 overflow-hidden px-1">
                <div className="truncate w-full">{log.supplierName}</div>
              </td>
              <td className="p-1 border border-black">{log.arrivalTime}-{log.departureTime}</td>
              <td className="p-1 border border-black">{log.emptyCans}/{log.fullCans}</td>
              <td className="p-1 border border-black truncate px-1">{log.iceUsed}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="w-full grid grid-cols-1 gap-1 mb-3">
        {d.achievements && <div className="border border-black p-1.5 text-[8pt] text-left"><span className="font-black uppercase">{labelMap.achievements}:</span> {d.achievements}</div>}
        {d.problems && <div className="border border-black p-1.5 text-[8pt] text-rose-700 text-left"><span className="font-black uppercase">{labelMap.problems}:</span> {d.problems}</div>}
        {d.actionsTaken && <div className="border border-black p-1.5 text-[8pt] text-blue-700 text-left"><span className="font-black uppercase">{labelMap.actionsTaken}:</span> {d.actionsTaken}</div>}
      </div>

      <div className="w-full mt-auto pt-6 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
        <div className="border-t border-black pt-1.5">अधिकारी स्वाक्षरी</div>
        <div className="border-t border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const BreakdownLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const losses = d.centerLosses || [];
  
  return (
    <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full p-5 printable-report flex flex-col items-center shadow-none mb-4">
      <ReportHeader title={d.reportHeading || "ब्रेकडाऊन अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <div className="w-full border border-black mb-3 overflow-hidden text-left">
        <div className="bg-slate-100 p-1 text-[8pt] font-black uppercase text-center border-b border-black">१) वाहन व ड्रायव्हर माहिती</div>
        <div className="p-1.5 border-b border-black text-[8pt] font-bold uppercase flex justify-between">
          <span>{labelMap.routeName}: {d.routeName}</span>
          <span>{labelMap.vehicleNo}: {d.vehicleNo}</span>
        </div>
        <div className="grid grid-cols-2 text-[8pt] font-bold uppercase divide-x divide-black border-b border-black">
          <div className="p-1.5">{labelMap.vehicleType}: {d.vehicleType}</div>
          <div className="p-1.5">{labelMap.capacity}: {d.capacity} L</div>
        </div>
        <div className="grid grid-cols-2 text-[8pt] font-bold uppercase divide-x divide-black">
          <div className="p-1.5">{labelMap.driverName}: {d.driverName}</div>
          <div className="p-1.5">{labelMap.mobile}: {d.mobile}</div>
        </div>
      </div>

      <div className="w-full border border-black mb-3 overflow-hidden text-left">
        <div className="bg-rose-50 p-1 text-[8pt] font-black uppercase text-center border-b border-black text-rose-700">२) गाडी बिघाड तपशील</div>
        <div className="grid grid-cols-2 text-[8pt] font-bold uppercase divide-x divide-black">
          <div className="p-1.5">{labelMap.breakdownTime}: {d.breakdownTime}</div>
          <div className="p-1.5">{labelMap.location}: {d.location}</div>
        </div>
        <div className="p-1.5 border-t border-black text-[8pt]"><span className="font-black uppercase">{labelMap.reason}:</span> {d.reason}</div>
        {d.detailedReason && <div className="p-1.5 border-t border-black text-[8pt]"><span className="font-black uppercase">{labelMap.detailedReason}:</span> {d.detailedReason}</div>}
      </div>

      {losses && losses.length > 0 && (
        <div className="w-full border border-black rounded overflow-hidden mb-3">
          <div className="bg-slate-100 p-1 text-[8pt] font-black uppercase text-center border-b border-black">नुकसान तपशील (LOSS LOG)</div>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-black text-white font-black text-[7pt] uppercase text-center">
                <th className="p-1 border border-white/20 text-left pl-2">नाव/कोड</th>
                <th className="p-1 border border-white/20 w-16 text-center">प्रकार</th>
                <th className="p-1 border border-white/20 w-16 text-center">Qty</th>
                <th className="p-1 border border-white/20 w-24 text-center">रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody>
              {losses.map((loss: any, idx: number) => (
                <tr key={idx} className="font-bold text-[8pt] uppercase text-center h-6 border-b border-black">
                  <td className="p-1 border border-black text-left pl-2 truncate">{loss.centerCode} {loss.centerName}</td>
                  <td className="p-1 border border-black text-center">{loss.milkType}</td>
                  <td className="p-1 border border-black text-center">{loss.qtyLiters}</td>
                  <td className="p-1 border border-black text-center">{loss.lossAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-rose-600 text-white p-1.5 text-right font-black text-[9pt]">{labelMap.totalLossAmount}: ₹{d.totalLossAmount}</div>
        </div>
      )}

      <div className="w-full mt-auto pt-6 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
        <div className="border-t border-black pt-1.5">अधिकारी स्वाक्षरी</div>
        <div className="border-t border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const GenericLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  
  if (report.type === 'Official Document') {
    return (
      <div className="bg-white font-sans text-slate-900 border-none w-full p-6 printable-report flex flex-col shadow-none mb-4">
        <div className="w-full text-center mb-8">
           <h1 className="text-[18pt] font-black uppercase tracking-tight border-b-2 border-black pb-2 inline-block min-w-[200px]">
             {d.title || "अधिकृत दस्तऐवज"}
           </h1>
        </div>
        <div 
          className="w-full prose prose-sm max-w-none text-left text-[11pt] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: d.content || "" }} 
        />
      </div>
    );
  }

  const excludeFields = ["reportHeading", "name", "repName", "shift", "idNumber", "repId", "routeVisitLogs", "centerLosses", "morningRoutes", "eveningRoutes", "tankerRoutes", "extCanRoutes", "extTankerRoutes", "points", "remarkPoints", "dailyProblems", "equipment"];

  const orderedEntries = fieldSequence
    .filter(key => d[key] !== undefined && d[key] !== "" && labelMap[key] && !excludeFields.includes(key))
    .map(key => [key, d[key]]);

  const points = d.points || [];
  const remarkPoints = d.remarkPoints || [];
  const inventory = d.equipment || [];

  return (
    <div className="bg-white font-sans text-slate-900 border-[1.2px] border-black rounded-sm w-full p-5 printable-report flex flex-col items-center shadow-none mb-4">
      <ReportHeader 
        title={d.reportHeading || report.type} 
        date={report.date} 
        subName={d.name || d.repName || profileName} 
        subId={d.idNumber || d.repId || profileId}
        shift={d.shift}
      />
      
      <div className="w-full border border-black rounded overflow-hidden mb-3 text-left">
        <table className="w-full border-collapse">
          <tbody>
            {orderedEntries.map(([k, v]: any) => (
              <tr key={k} className="text-[8pt] font-bold border-b border-black last:border-0">
                <td className="p-2 bg-slate-50 uppercase font-black border-r border-black w-[220px]">{labelMap[k]}</td>
                <td className="p-2">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length > 0 && (
        <div className="w-full mb-3 text-left">
          <span className="text-[7pt] font-black uppercase block border-b border-black pb-1 mb-1">साहित्याची यादी (INVENTORY):</span>
          <table className="w-full border-collapse border border-black table-fixed">
            <thead>
              <tr className="bg-slate-100 text-[7pt] font-black uppercase">
                <th className="p-1 border border-black text-left">साहित्य</th>
                <th className="p-1 border border-black text-center w-16">नग</th>
                <th className="p-1 border border-black text-right w-24">मालकी</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((it: any, i: number) => (
                <tr key={i} className="text-[8pt] font-bold border-b border-black">
                  <td className="p-1 border border-black">{it.name}</td>
                  <td className="p-1 border border-black text-center">{it.quantity}</td>
                  <td className="p-1 border border-black text-right uppercase text-[7pt]">{it.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(points.length > 0 || remarkPoints.length > 0) && (
        <div className="w-full p-3 border border-black rounded bg-slate-50 mb-3 text-left">
          <span className="text-[7pt] font-black uppercase block border-b border-black/10 pb-1 mb-2">विशेष निरीक्षणे / मुद्दे:</span>
          <ul className="list-decimal list-inside space-y-1">
            {[...points, ...remarkPoints].map((p: string, i: number) => (
              <li key={i} className="text-[8pt] font-bold">{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full mt-auto pt-6 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest">
        <div className="border-t border-black pt-1.5">अधिकारी स्वाक्षरी</div>
        <div className="border-t border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
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

  const handlePrint = () => {
    window.print();
  }

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

      <div className="w-full space-y-3">
        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-24 text-center">तारीख</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">अहवाल शीर्षक व सारांश</th>
                <th className="p-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest w-24">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] cursor-pointer group transition-colors" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
                  <td className="p-4 font-black text-[10px] text-slate-500 uppercase whitespace-nowrap text-center">
                    <div className="flex flex-col">
                      <span>{report.date?.split('-').reverse().join('/')}</span>
                      <span className="text-[8px] opacity-50">{report.fullData?.shift || ""}</span>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[12px] text-primary uppercase group-hover:translate-x-1 transition-transform truncate max-w-md">
                        {report.fullData?.reportHeading || report.fullData?.title || report.type}
                      </span>
                      <span className="text-[10px] text-slate-400 italic truncate max-w-md">
                        {report.summary}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-4 bg-white border-none shadow-md rounded-2xl relative active:scale-[0.98] transition-all text-left" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date?.split('-').reverse().join('/')}</span>
                    <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black uppercase bg-primary/5 text-primary border-none">{report.fullData?.shift || "All Day"}</Badge>
                  </div>
                  <h4 className="font-black text-[13px] text-primary uppercase tracking-tight line-clamp-1">{report.fullData?.reportHeading || report.fullData?.title || report.type}</h4>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={(e) => handleEditReport(report, e)}><FileEdit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={(e) => handleDeleteReport(report.id, e)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic line-clamp-2 pr-6">{report.summary}</p>
              <div className="absolute bottom-4 right-4 text-slate-300"><ChevronRight className="h-4 w-4" /></div>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-3">
            <Archive className="h-10 w-10 text-slate-200" />
            <p className="text-muted-foreground font-black uppercase text-[11px] opacity-40 tracking-[0.2em] italic">एकही अहवाल सापडल नाही.</p>
          </div>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[850px] w-[98vw] p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-white flex flex-col items-center">
          <DialogHeader className="p-3 bg-white border-b flex flex-row items-center justify-between no-print w-full shrink-0">
            <DialogTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> अहवाल प्रीव्ह्यू
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint} className="h-8 px-3 font-black uppercase rounded-xl bg-black text-white text-[9px]"><Printer className="h-3.5 w-3.5 mr-1.5" /> प्रिंट</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-2 sm:p-4 bg-slate-100 w-full overflow-x-hidden">
            <div className="w-full flex flex-col items-center pb-10">
              {selectedReport && (
                selectedReport.type === 'Route Allocation Report' ? <RouteAllocationLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                selectedReport.type === 'Route Visit' ? <RouteVisitLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                selectedReport.type === 'Transport Breakdown Report' ? <BreakdownLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                <GenericLayout report={selectedReport} profileName={profileName} profileId={profileId} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
