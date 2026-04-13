"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle, Info, BookOpen, Lightbulb, FileCheck
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
  <div className="w-full border-b-[4px] border-black pb-4 mb-8 text-center">
    <h1 className="text-[24pt] font-black uppercase tracking-tight text-slate-900">{title || "अधिकृत अहवाल"}</h1>
    <div className="flex justify-between items-center text-[11pt] font-black uppercase text-slate-700 tracking-wider mt-4 border-t-2 border-black/10 pt-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <span className="flex items-center gap-1.5"><FileCheck className="h-4 w-4" /> सादरकर्ता: {subName}</span>
        {subId && <span className="opacity-70">ID: {subId}</span>}
        {shift && <span className="opacity-70">शिफ्ट: {shift}</span>}
      </div>
      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> दिनांक: {date}</span>
    </div>
  </div>
)

const SectionTitle = ({ icon: Icon, title, color = "text-slate-900" }: any) => (
  <div className="w-full flex items-center gap-2 border-b-2 border-black pb-1.5 mb-4 mt-6">
    <Icon className={cn("h-5 w-5", color)} />
    <h3 className={cn("text-[12pt] font-black uppercase tracking-[0.1em]", color)}>{title}</h3>
  </div>
)

const ProfessionalParagraph = ({ label, content, icon: Icon }: { label: string, content: string, icon?: any }) => {
  if (!content) return null;
  return (
    <div className="mb-6 text-left w-full animate-in fade-in slide-in-from-left-2 duration-500">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <span className="text-[10pt] font-black uppercase text-primary tracking-widest">{label}</span>
      </div>
      <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg shadow-sm">
        <p className="text-[12pt] font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

const RouteAllocationLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  
  const renderExcelSection = (title: string, rawData: any[]) => {
    if (!rawData || rawData.length === 0) return null;
    
    const mid = Math.ceil(rawData.length / 2);
    const leftCol = rawData.slice(0, mid);
    const rightCol = rawData.slice(mid);

    const TablePart = ({ items, startIdx }: { items: any[], startIdx: number }) => (
      <table className="w-full border-collapse border border-black text-[9px] table-auto">
        <thead>
          <tr className="bg-slate-100 font-black uppercase text-center h-9 border-b-2 border-black">
            <th className="border-r border-black p-1 w-[30px]">SR</th>
            <th className="border-r border-black p-1 w-[50px]">CODE</th>
            <th className="border-r border-black p-1 text-left pl-3">ROUTE NAME</th>
            <th className="border-r border-black p-1 w-[35px]">REQ</th>
            <th className="p-1 w-[35px]">ALOC</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="h-8 font-bold uppercase text-center border-b border-black last:border-b-0 hover:bg-slate-50">
              <td className="border-r border-black p-1 bg-slate-100/50">{startIdx + i + 1}</td>
              <td className="border-r border-black truncate px-1 bg-slate-50 font-black">{it.routeCode || it.routeId}</td>
              <td className="border-r border-black text-left pl-3 truncate max-w-[120px]">{it.routeName}</td>
              <td className="border-r border-black font-black text-[12pt] text-primary">{it.requested ? '√' : ''}</td>
              <td className="p-1 font-black text-[12pt] text-emerald-600">{it.allocated ? '√' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <div className="w-full mb-6 border-2 border-black overflow-hidden bg-white shadow-md">
        <div className="bg-slate-900 text-white p-2 text-[11pt] font-black uppercase text-center border-b-2 border-black tracking-widest">
          {title}
        </div>
        <div className="print-excel-grid flex w-full divide-x divide-black">
          <div className="w-1/2 flex-1"><TablePart items={leftCol} startIdx={0} /></div>
          <div className="w-1/2 flex-1"><TablePart items={rightCol} startIdx={mid} /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white font-sans text-slate-900 border-none w-full p-8 printable-report flex flex-col items-center">
      <ReportHeader title={d.reportHeading || "ERP दैनिक वाटप अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <SectionTitle icon={Layers} title="मुख्य वाटप तपशील (DATA ALLOCATION)" />
      
      <div className="w-full space-y-2">
        {renderExcelSection("Can Route Morning (Internal)", d.morningRoutes)}
        {renderExcelSection("Can Route Evening (Internal)", d.eveningRoutes)}
        {renderExcelSection("Internal Tanker Route", d.tankerRoutes)}
        {renderExcelSection("External Can Route", d.extCanRoutes)}
        {renderExcelSection("External Tanker Route", d.extTankerRoutes)}
      </div>

      <ProfessionalParagraph 
        label="आजचे महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे" 
        content={d.dailyProblems} 
        icon={AlertCircle} 
      />

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-32 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const RouteVisitLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const logs = d.routeVisitLogs || [];
  
  return (
    <div className="bg-white font-sans text-slate-900 border-none w-full p-8 printable-report flex flex-col items-center shadow-none">
      <ReportHeader title={d.reportHeading || "रूट व्हिजिट सविस्तर अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <SectionTitle icon={Info} title="१) प्राथमिक रूट माहिती (INTRODUCTION)" />
      <table className="w-full border-collapse border-2 border-black mb-8 text-left">
        <tbody>
          <tr className="border-b border-black h-12">
            <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black w-1/4">रूटचे नाव</td>
            <td className="p-3 font-bold text-[12pt] w-1/4">{d.routeName}</td>
            <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black w-1/4">वाहन क्रमांक</td>
            <td className="p-3 font-bold text-[12pt] w-1/4">{d.vehicleNumber}</td>
          </tr>
          <tr className="h-12">
            <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black">ड्रायव्हर</td>
            <td className="p-3 font-bold text-[12pt]">{d.driverName}</td>
            <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black">SLIP No.</td>
            <td className="p-3 font-bold text-[12pt]">{d.slipNo}</td>
          </tr>
        </tbody>
      </table>

      <SectionTitle icon={Truck} title="२) व्हिजिट लॉग तपशील (LOG DETAILS)" />
      <table className="w-full border-collapse border-2 border-black mb-10 table-auto">
        <thead>
          <tr className="bg-slate-900 text-white text-[10pt] font-black uppercase text-center h-11">
            <th className="border-r border-white/20 w-[40px]">SR</th>
            <th className="border-r border-white/20 w-[70px]">CODE</th>
            <th className="border-r border-white/20 text-left pl-4">CENTER NAME</th>
            <th className="border-r border-white/20 w-[120px]">IN/OUT TIME</th>
            <th className="border-r border-white/20 w-[80px]">CANS</th>
            <th className="w-[70px]">ICE</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any, i: number) => (
            <tr key={i} className="text-[11pt] font-bold uppercase text-center h-10 border-b border-black hover:bg-slate-50">
              <td className="border-r border-black bg-slate-100 font-black">{i + 1}</td>
              <td className="border-r border-black truncate px-1">{log.centerCode}</td>
              <td className="border-r border-black text-left pl-4 font-black text-[12pt] text-slate-900">{log.supplierName}</td>
              <td className="border-r border-black">{log.arrivalTime} - {log.departureTime}</td>
              <td className="border-r border-black">{log.emptyCans} E / {log.fullCans} F</td>
              <td className="font-black text-primary">{log.iceUsed}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SectionTitle icon={BookOpen} title="३) निरीक्षणे व कारवाई (OBSERVATIONS)" />
      <div className="w-full text-left space-y-4">
        <ProfessionalParagraph label="आजची मुख्य कामगिरी" content={d.achievements} icon={CheckCircle2} />
        <ProfessionalParagraph label="महत्त्वाच्या समस्या" content={d.problems} icon={AlertCircle} />
        <ProfessionalParagraph label="केलेली त्वरित कार्यवाही" content={d.actionsTaken} icon={Lightbulb} />
      </div>

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-32 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}

const BreakdownLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const losses = d.centerLosses || [];
  
  return (
    <div className="bg-white font-sans text-slate-900 border-none w-full p-8 printable-report flex flex-col items-center">
      <ReportHeader title={d.reportHeading || "वाहन बिघाड (BREAKDOWN) अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />
      
      <SectionTitle icon={Info} title="१) वाहन व बिघाड तपशील (PRIMARY INFO)" />
      <div className="w-full border-2 border-black overflow-hidden mb-8 text-left rounded-lg">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-black h-12">
              <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black w-1/4">रूट नेम</td>
              <td className="p-3 font-bold text-[12pt] w-1/4">{d.routeName}</td>
              <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black w-1/4">वाहन नंबर</td>
              <td className="p-3 font-bold text-[12pt] w-1/4 text-rose-600">{d.vehicleNo}</td>
            </tr>
            <tr className="border-b border-black h-12">
              <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black">बिघाड वेळ</td>
              <td className="p-3 font-bold text-[12pt]">{d.breakdownTime}</td>
              <td className="p-3 bg-slate-100 font-black uppercase text-[10pt] border-r border-black">ठिकाण</td>
              <td className="p-3 font-bold text-[12pt]">{d.location}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionTitle icon={BookOpen} title="२) बिघाडाचे सविस्तर वर्णन (NARRATIVE)" />
      <div className="w-full text-left mb-8">
        <ProfessionalParagraph label="बिघाडाचे कारण" content={d.reason} icon={AlertCircle} />
        <ProfessionalParagraph label="सविस्तर स्पष्टीकरण" content={d.detailedReason} />
      </div>

      {losses && losses.length > 0 && (
        <div className="w-full mb-10 text-left">
          <SectionTitle icon={Layers} title="३) आर्थिक नुकसान तपशील (LOSS LOG)" />
          <div className="w-full border-2 border-black rounded-lg overflow-hidden shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black text-[10pt] uppercase text-center h-11">
                  <th className="border-r border-white/20 text-left pl-4">सेंटर/गवळी नाव</th>
                  <th className="border-r border-white/20 w-32">प्रकार</th>
                  <th className="border-r border-white/20 w-32">QTY (L)</th>
                  <th className="w-40">रक्कम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {losses.map((loss: any, idx: number) => (
                  <tr key={idx} className="font-bold text-[11pt] uppercase text-center h-11 border-b border-black last:border-0">
                    <td className="border-r border-black text-left pl-4">{loss.centerCode} {loss.centerName}</td>
                    <td className="border-r border-black">{loss.milkType}</td>
                    <td className="border-r border-black font-black">{loss.qtyLiters} L</td>
                    <td className="font-black text-rose-600">₹ {loss.lossAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-rose-600 text-white p-4 text-right font-black text-[14pt] tracking-widest uppercase">
              एकूण आर्थिक नुकसान: ₹ {d.totalLossAmount}
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-32 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
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
      <div className="bg-white font-sans text-slate-900 border-none w-full p-10 printable-report flex flex-col shadow-none">
        <div className="w-full text-center mb-16">
           <h1 className="text-[28pt] font-black uppercase tracking-tight border-b-4 border-black pb-4 inline-block min-w-[400px]">
             {d.title || "अधिकृत दस्तऐवज"}
           </h1>
        </div>
        <div 
          className="w-full prose prose-lg max-w-none text-left text-[14pt] leading-relaxed text-slate-900"
          dangerouslySetInnerHTML={{ __html: d.content || "" }} 
        />
      </div>
    );
  }

  const excludeFields = ["reportHeading", "name", "repName", "shift", "idNumber", "repId", "routeVisitLogs", "centerLosses", "morningRoutes", "eveningRoutes", "tankerRoutes", "extCanRoutes", "extTankerRoutes", "points", "remarkPoints", "dailyProblems", "equipment", "cowMilk", "buffaloMilk", "cowQty", "cowFat", "cowSnf", "bufQty", "bufFat", "bufSnf", "summary", "achievements", "problems", "actionsTaken", "actionTaken"];

  const orderedEntries = fieldSequence
    .filter(key => d[key] !== undefined && d[key] !== "" && labelMap[key] && !excludeFields.includes(key))
    .map(key => [key, d[key]]);

  const points = d.points || [];
  const remarkPoints = d.remarkPoints || [];
  const inventory = d.equipment || [];

  return (
    <div className="bg-white font-sans text-slate-900 border-none w-full p-8 printable-report flex flex-col items-center shadow-none">
      <ReportHeader 
        title={d.reportHeading || report.type} 
        date={report.date} 
        subName={d.name || d.repName || profileName} 
        subId={d.idNumber || d.repId || profileId}
        shift={d.shift}
      />
      
      <SectionTitle icon={Info} title="१) मुख्य माहिती (DETAILS)" />
      <div className="w-full border-2 border-black rounded-lg overflow-hidden mb-10 text-left shadow-sm">
        <table className="w-full border-collapse">
          <tbody>
            {orderedEntries.map(([k, v]: any) => (
              <tr key={k} className="text-[11pt] font-bold border-b border-black last:border-0 h-12 hover:bg-slate-50">
                <td className="p-3 bg-slate-100 uppercase font-black border-r border-black w-[300px] text-[10pt] text-slate-700">{labelMap[k]}</td>
                <td className="p-3 whitespace-pre-wrap leading-snug">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(d.cowMilk || d.buffaloMilk || d.cowQty || d.bufQty) && (
        <div className="w-full mb-10 text-left">
          <SectionTitle icon={Milk} title="२) दूध संकलन मॅट्रिक्स (MILK SUMMARY)" />
          <table className="w-full border-collapse border-2 border-black shadow-md">
            <thead>
              <tr className="bg-slate-900 text-white text-[10pt] font-black uppercase text-center h-11">
                <th className="text-left pl-4">दूध प्रकार</th>
                <th className="w-40">प्रमाण (L)</th>
                <th className="w-32">FAT %</th>
                <th className="w-32">SNF %</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[13pt] font-black border-b border-black text-center h-12">
                <td className="text-left pl-4 bg-slate-100 uppercase text-[10pt] border-r border-black">गाय (COW MILK)</td>
                <td className="border-r border-black text-primary">{d.cowMilk?.quantity || d.cowQty || "0"} L</td>
                <td className="border-r border-black">{d.cowMilk?.fat || d.cowFat || "-"} %</td>
                <td className="">{d.cowMilk?.snf || d.cowSnf || "-"} %</td>
              </tr>
              <tr className="text-[13pt] font-black text-center h-12">
                <td className="text-left pl-4 bg-slate-100 uppercase text-[10pt] border-r border-black">म्हेस (BUF MILK)</td>
                <td className="border-r border-black text-amber-700">{d.buffaloMilk?.quantity || d.bufQty || "0"} L</td>
                <td className="border-r border-black">{d.buffaloMilk?.fat || d.bufFat || "-"} %</td>
                <td className="">{d.buffaloMilk?.snf || d.bufSnf || "-"} %</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {inventory.length > 0 && (
        <div className="w-full mb-10 text-left">
          <SectionTitle icon={Briefcase} title="३) साहित्याची यादी (INVENTORY)" />
          <table className="w-full border-collapse border-2 border-black shadow-md">
            <thead>
              <tr className="bg-slate-900 text-white text-[10pt] font-black uppercase h-11 text-center">
                <th className="text-left pl-4 border-r border-white/20">साहित्य नाव (Item Name)</th>
                <th className="w-28 border-r border-white/20">नग (Qty)</th>
                <th className="w-48">मालकी (Ownership)</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((it: any, i: number) => (
                <tr key={i} className="text-[11pt] font-bold border-b border-black h-11 text-center hover:bg-slate-50">
                  <td className="text-left pl-4 border-r border-black truncate uppercase">{it.name}</td>
                  <td className="border-r border-black font-black">{it.quantity}</td>
                  <td className="uppercase text-[9pt] font-black">{it.ownership === 'Self' ? 'स्वतःची' : 'डेअरीची'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionTitle icon={BookOpen} title="४) सविस्तर अहवाल व शिफारसी (NARRATIVE)" />
      <div className="w-full text-left space-y-2">
        <ProfessionalParagraph label="प्रस्तावना / सारांश" content={d.summary} icon={Info} />
        <ProfessionalParagraph label="महत्त्वाची कामगिरी / निरीक्षणे" content={d.achievements} icon={CheckCircle2} />
        <ProfessionalParagraph label="समस्या व अडथळे" content={d.problems} icon={AlertCircle} />
        <ProfessionalParagraph label="केलेली कार्यवाही / शिफारसी" content={d.actionsTaken || d.actionTaken} icon={Lightbulb} />
      </div>

      {(points.length > 0 || remarkPoints.length > 0) && (
        <div className="w-full p-6 border-2 border-black rounded-lg bg-slate-50 mb-10 text-left shadow-inner">
          <span className="text-[11pt] font-black uppercase block border-b-2 border-black/20 pb-2 mb-5">विशेष मुद्दे व टिपणी (POINTS):</span>
          <ul className="space-y-3">
            {[...points, ...remarkPoints].map((p: string, i: number) => (
              <li key={i} className="flex gap-3 text-[12pt] font-bold leading-snug">
                <span className="h-6 w-6 bg-slate-900 text-white rounded flex items-center justify-center text-[10pt] shrink-0">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-32 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
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
          <div className="overflow-x-auto">
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
                      <div className="flex justify-end gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
        <DialogContent className="max-w-[900px] w-[98vw] p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-white flex flex-col items-center">
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between no-print w-full shrink-0">
            <DialogTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> अहवाल प्रिव्ह्यू (OFFICIAL PREVIEW)
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint} className="h-9 px-4 font-black uppercase rounded-xl bg-slate-900 text-white text-[10px] shadow-lg"><Printer className="h-4 w-4 mr-2" /> प्रिंट करा</Button>
              <Button size="icon" variant="ghost" onClick={() => setIsViewOpen(false)} className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-2 sm:p-6 bg-slate-100 w-full overflow-x-hidden">
            <div className="w-full flex flex-col items-center pb-16">
              {selectedReport && (
                <div className="w-full shadow-2xl">
                  {selectedReport.type === 'Route Allocation Report' ? <RouteAllocationLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                  selectedReport.type === 'Route Visit' ? <RouteVisitLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                  selectedReport.type === 'Transport Breakdown Report' ? <BreakdownLayout report={selectedReport} profileName={profileName} profileId={profileId} /> :
                  <GenericLayout report={selectedReport} profileName={profileName} profileId={profileId} />}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}