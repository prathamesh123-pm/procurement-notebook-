
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle, AlertTriangle, Info, BookOpen, Lightbulb, FileCheck, Clock, Milk, User, IndianRupee, Hash, Box, TrendingDown
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

const ProducerCenterLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const details = d.producer_center?.additional_details || {};

  return (
    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
      <ReportHeader title={d.reportHeading || "उत्पादक सेंटर सविस्तर अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />

      <SectionTitle icon={Info} title="१) प्राथमिक माहिती & संकलन वेळ" />
      <div className="w-full border-2 border-black mb-6">
        <table className="w-full text-[9pt]">
          <tbody>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black w-1/3">सेंटर नाव</td><td className="p-2 font-bold">{d.name} (ID: {d.supplierId})</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">सकाळ / सायंकाळ वेळ</td><td className="p-2 font-bold">{details.morning_collection_time} / {details.evening_collection_time}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">उत्पादक (एकूण/सक्रिय/निष्क्रिय)</td><td className="p-2 font-bold">{details.total_producers} / {details.active_producers} / {details.inactive_producers}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">जनावरे (गाय/म्हेस/वासरे)</td><td className="p-2 font-bold">{details.cows} गायी | {details.buffalo} म्हशी | {details.calves} वासरे</td></tr>
          </tbody>
        </table>
      </div>

      {details.long_term_producers?.length > 0 && (
        <>
          <SectionTitle icon={Layers} title="२) २+ वर्ष जुने उत्पादक" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100">
              <tr className="font-black uppercase text-center border-b border-black">
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">जुने दूध</th>
                <th className="p-1 border-r border-black">सध्याचे दूध</th>
                <th className="p-1 border-r border-black">जुनी जनावरे</th>
                <th className="p-1">सध्याची जनावरे</th>
              </tr>
            </thead>
            <tbody>
              {details.long_term_producers.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold">
                  <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                  <td className="p-1 border-r border-black">{p.previous_milk} L</td>
                  <td className="p-1 border-r border-black">{p.current_milk} L</td>
                  <td className="p-1 border-r border-black">{p.previous_animals}</td>
                  <td className="p-1">{p.current_animals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.decreasing_producers?.length > 0 && (
        <>
          <SectionTitle icon={TrendingDown} title="३) दूध घटलेले उत्पादक विश्लेषण" color="text-rose-700" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-rose-50">
              <tr className="font-black uppercase text-center border-b border-black text-rose-900">
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">जुने दूध</th>
                <th className="p-1 border-r border-black">नवे दूध</th>
                <th className="p-1 border-r border-black">जुनी जनावरे</th>
                <th className="p-1 border-r border-black">सध्याची जनावरे</th>
                <th className="p-1">कारण</th>
              </tr>
            </thead>
            <tbody>
              {details.decreasing_producers.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold text-rose-800">
                  <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                  <td className="p-1 border-r border-black">{p.previous_milk} L</td>
                  <td className="p-1 border-r border-black">{p.current_milk} L</td>
                  <td className="p-1 border-r border-black">{p.previous_animals}</td>
                  <td className="p-1 border-r border-black">{p.current_animals}</td>
                  <td className="p-1 text-left pl-2">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.high_capacity_producer_list?.length > 0 && (
        <>
          <SectionTitle icon={Layers} title="४) ८-१० गाईंचा गोठा सक्षम उत्पादक" />
          <table className="w-full border-2 border-black text-[7pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black text-center">
                <th>नाव</th><th>दूध</th><th>वर्षे</th><th>जनावरे</th><th>शेती</th><th>चारा</th><th>शेड</th>
              </tr>
            </thead>
            <tbody>
              {details.high_capacity_producer_list.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                  <td className="text-left pl-1">{p.name}</td><td>{p.current_milk}</td><td>{p.puravtha_varsh}</td><td>{p.current_animals}</td><td>{p.land}</td><td>{p.fodder_available}</td><td>{p.shed_available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.high_milk_producer_list?.length > 0 && (
        <>
          <SectionTitle icon={Milk} title="५) ३० ते १००+ लिटर दूध उत्पादक" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-blue-50/50 font-black text-blue-900">
              <tr className="border-b border-black text-center">
                <th className="text-left pl-2">उत्पादक नाव</th><th>गाई संख्या</th><th>म्हशी संख्या</th><th>सध्याचे दूध</th>
              </tr>
            </thead>
            <tbody>
              {details.high_milk_producer_list.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                  <td className="text-left pl-2">{p.name}</td><td>{p.cows_count}</td><td>{p.buffalo_count}</td><td>{p.current_milk} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.local_employees?.length > 0 && (
        <>
          <SectionTitle icon={Briefcase} title="६) परिसरातील डेअरी कर्मचारी माहिती" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black text-left">कर्मचारी नाव</th>
                <th className="p-1 border-r border-black">शेती</th>
                <th className="p-1 border-r border-black">गाई संख्या</th>
                <th className="p-1 border-r border-black">म्हशी संख्या</th>
                <th className="p-1">एकूण दूध पुरवठा</th>
              </tr>
            </thead>
            <tbody>
              {details.local_employees.map((e: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold">
                  <td className="p-1 border-r border-black text-left pl-2">{e.name}</td>
                  <td className="p-1 border-r border-black">{e.land}</td>
                  <td className="p-1 border-r border-black">{e.cows_count}</td>
                  <td className="p-1 border-r border-black">{e.buffalo_count}</td>
                  <td className="p-1 text-center">{e.total_supply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.milkman_gavali_details?.length > 0 && (
        <>
          <SectionTitle icon={User} title="७) स्थानिक गवळी माहिती (आपल्या डेअरीचे)" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">कोड</th>
                <th className="p-1 border-r border-black">गाय दूध</th>
                <th className="p-1 border-r border-black">म्हेस दूध</th>
                <th className="p-1 border-r border-black">एकूण दूध</th>
                <th className="p-1">उत्पादक संख्या</th>
              </tr>
            </thead>
            <tbody>
              {details.milkman_gavali_details.map((g: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 font-bold text-center">
                  <td className="p-1 border-r border-black text-left pl-2">{g.name}</td>
                  <td className="p-1 border-r border-black">{g.code}</td>
                  <td className="p-1 border-r border-black">{g.gay_dudh} L</td>
                  <td className="p-1 border-r border-black">{g.mhais_dudh} L</td>
                  <td className="p-1 border-r border-black">{(Number(g.gay_dudh) + Number(g.mhais_dudh)).toFixed(1)} L</td>
                  <td className="p-1">{g.producers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <SectionTitle icon={Lightbulb} title="८) विश्लेषण & उपाययोजना" />
      <div className="w-full text-left space-y-4">
        <ProfessionalParagraph label="दूध कमी होण्याची कारणे" content={details.milk_decrease_reasons} />
        <ProfessionalParagraph label="सेंटरने केलेले प्रयत्न" content={details.efforts_taken} />
        <ProfessionalParagraph label="दूध वाढवण्यासाठी उपाय" content={details.required_actions} />
      </div>

      <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  )
}
