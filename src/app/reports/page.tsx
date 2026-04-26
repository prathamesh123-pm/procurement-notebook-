"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle, AlertTriangle, Info, BookOpen, Lightbulb, FileCheck, Clock, Milk, User, IndianRupee, Hash, Box, TrendingDown, Sun, Zap, Laptop, ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, query, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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
      <div className="w-full border-2 border-black mb-6 overflow-hidden">
        <table className="w-full text-[9pt]">
          <tbody>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black w-1/3">सेंटर नाव</td><td className="p-2 font-bold">{d.name} (ID: {d.supplierId})</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">सकाळ / सायंकाळ वेळ</td><td className="p-2 font-bold">{details.morning_collection_time || "-"} / {details.evening_collection_time || "-"}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">उत्पादक (एकूण/सक्रिय/निष्क्रिय)</td><td className="p-2 font-bold">{details.total_producers || 0} / {details.active_producers || 0} / {details.inactive_producers || 0}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">जनावरे (गाय/म्हेस/वासरे)</td><td className="p-2 font-bold">{details.cows || 0} गायी | {details.buffalo || 0} म्हशी | {details.calves || 0} वासरे</td></tr>
          </tbody>
        </table>
      </div>

      <SectionTitle icon={Layers} title="२) २+ वर्ष जुने उत्पादक" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-slate-100">
            <tr className="font-black border-b border-black text-center">
              <th className="p-1 border-r border-black">नाव</th>
              <th className="p-1 border-r border-black">जुने दूध</th>
              <th className="p-1 border-r border-black">सध्याचे दूध</th>
              <th className="p-1 border-r border-black">जुनी जनावरे</th>
              <th className="p-1">सध्याची जनावरे</th>
            </tr>
          </thead>
          <tbody>
            {(details.long_term_producers || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-black text-center font-bold">
                <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                <td>{p.previous_milk}L</td>
                <td>{p.current_milk}L</td>
                <td>{p.previous_animals}</td>
                <td>{p.current_animals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle icon={TrendingDown} title="३) दूध घटलेले उत्पादक विश्लेषण" color="text-rose-700" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-rose-50 text-rose-900 font-black">
            <tr className="border-b border-black text-center">
              <th className="p-1 border-r border-black">नाव</th>
              <th className="p-1 border-r border-black">जुने</th>
              <th className="p-1 border-r border-black">नवे</th>
              <th className="p-1 border-r border-black">जुनी जनावरे</th>
              <th className="p-1 border-r border-black">नवी जनावरे</th>
              <th className="p-1">कारण</th>
            </tr>
          </thead>
          <tbody>
            {(details.decreasing_producers || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-black text-center font-bold text-rose-800">
                <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                <td>{p.previous_milk}</td>
                <td>{p.current_milk}</td>
                <td>{p.previous_animals}</td>
                <td>{p.current_animals}</td>
                <td className="text-left pl-2">{p.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle icon={Briefcase} title="४) परिसरातील डेअरी कर्मचारी माहिती" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-slate-50 font-black uppercase">
            <tr className="border-b-2 border-black text-center">
              <th className="p-1 border-r border-black text-left pl-2">नाव</th>
              <th>शेती</th>
              <th>गाई</th>
              <th>म्हशी</th>
              <th>दूध पुरवठा (L)</th>
            </tr>
          </thead>
          <tbody>
            {(details.local_employees || []).map((e: any, i: number) => (
              <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                <td className="p-1 border-r border-black text-left pl-2">{e.name}</td>
                <td>{e.land}</td>
                <td>{e.cows_count}</td>
                <td>{e.buffalo_count}</td>
                <td>{e.total_supply}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6">
        <div className="space-y-4">
          <SectionTitle icon={ShieldCheck} title="५) LSS सुविधा माहिती" />
          <table className="w-full border-2 border-black text-[8pt]">
            <thead className="bg-slate-50 font-black"><tr><th>सुविधा</th><th>स्थिती</th><th>शेरा</th></tr></thead>
            <tbody>
              {(details.lss_details || []).map((l: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center"><td className="text-left pl-2">{l.item}</td><td>{l.status}</td><td>{l.remarks}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <SectionTitle icon={Zap} title="६) इतर डेअरी सुविधा" />
          <table className="w-full border-2 border-black text-[8pt]">
            <thead className="bg-amber-50 font-black"><tr><th>सुविधा</th><th>स्थिती</th><th>शेरा</th></tr></thead>
            <tbody>
              {(details.competitor_dairies || []).map((c: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center"><td className="text-left pl-2">{c.item}</td><td>{c.status}</td><td>{c.remarks}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SectionTitle icon={Truck} title="७) अंतर्गत रूट माहिती (SUB-ROUTES)" color="text-emerald-700" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-emerald-50 font-black uppercase">
            <tr className="border-b-2 border-black text-center">
              <th>गाडी</th><th>किमी</th><th>परिसर</th><th>उत्पादक</th><th>गाई</th><th>म्हशी</th><th>दूध (L)</th>
            </tr>
          </thead>
          <tbody>
            {(details.sub_routes || []).map((r: any, i: number) => (
              <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                <td className="uppercase">{r.vehicleType}</td><td>{r.km}</td><td className="uppercase">{r.area}</td><td>{r.producerCount}</td><td>{r.cowCount}</td><td>{r.buffaloCount}</td><td>{r.milkQty}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'dailyWorkReports'), orderBy('createdAt', 'desc'))
  }, [db, user])

  const { data: reports, isLoading } = useCollection(reportsQuery)
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])
  
  const { data: profile } = useDoc(profileRef)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => setMounted(true), [])

  const filteredReports = useMemo(() => {
    const list = reports || []
    return list.filter(r => 
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullData?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [reports, searchQuery])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!db || !user) return
    if (confirm("हा अहवाल कायमचा हटवायचा आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-20 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय (ARCHIVE)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Historical operational data and logs</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-[10px] border border-primary/10 uppercase">
          <FileText className="h-4 w-4" /> एकूण अहवाल: {reports?.length || 0}
        </div>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
        <input 
          placeholder="अहवाल प्रकार, नाव किंवा मजकूर शोधा..." 
          className="w-full pl-11 h-12 bg-white border-2 border-black rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase tracking-tight"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3 px-1">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border-2 border-black shadow-none hover:shadow-xl transition-all rounded-2xl overflow-hidden group cursor-pointer" onClick={() => setSelectedReport(report)}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl text-white shadow-lg", report.type === 'Collection Center Audit' ? 'bg-indigo-600' : report.type === 'Seizure & Penalty' ? 'bg-rose-600' : 'bg-primary')}>
                        {report.type === 'Collection Center Audit' ? <Microscope className="h-5 w-5" /> : report.type === 'Seizure & Penalty' ? <ShieldAlert className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-black text-[13px] uppercase tracking-tight text-slate-900">{report.type}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                          <Calendar className="h-3 w-3" /> {report.date} | <User className="h-3 w-3" /> {report.fullData?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-black/20">ID: {report.id.slice(0, 8)}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed line-clamp-2 italic uppercase">
                    {report.summary || "No summary available."}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 font-black uppercase text-[9px] border-black rounded-xl h-9" onClick={(e) => handleDelete(report.id, e)}>
                    <Trash2 className="h-3.5 w-3.5" /> हटवा
                  </Button>
                  <Button size="sm" className="flex-1 md:flex-none gap-2 font-black uppercase text-[9px] rounded-xl h-9 bg-primary shadow-md">
                    उघडा <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="p-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-black/20 flex flex-col items-center gap-3 opacity-30">
            <Archive className="h-12 w-12" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">अहवाल सापडले नाहीत</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[210mm] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-slate-100">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-20 flex flex-row items-center justify-between no-print">
            <div>
              <DialogTitle className="text-sm font-black uppercase tracking-widest">अहवाल सविस्तर दर्शन</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">Detailed Professional Report View</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="h-8 rounded-xl font-black uppercase text-[9px]" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट (PRINT)</Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full text-white" onClick={() => setSelectedReport(null)}><X className="h-5 w-5" /></Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] bg-white">
            {selectedReport && (selectedReport.type === 'Milk Procurement Survey' || selectedReport.fullData?.supplierType === 'Center') ? (
               <ProducerCenterLayout report={selectedReport} profileName={profile?.displayName || ""} profileId={profile?.employeeId || ""} />
            ) : selectedReport ? (
              <div className="bg-white p-8 printable-report flex flex-col items-center">
                 <ReportHeader title={selectedReport.fullData?.reportHeading || selectedReport.type} date={selectedReport.date} subName={selectedReport.fullData?.name || profile?.displayName} subId={selectedReport.fullData?.idNumber || profile?.employeeId} shift={selectedReport.fullData?.shift} />
                 
                 <SectionTitle icon={FileText} title="अहवाल माहिती & तपशील" />
                 <div className="w-full border-2 border-black mb-6">
                    <table className="w-full text-[10px] border-collapse">
                      <tbody>
                        {Object.entries(selectedReport.fullData || {}).map(([key, val]: any) => {
                          if (typeof val === 'object' || Array.isArray(val) || key === 'reportHeading' || key === 'name' || key === 'idNumber') return null;
                          return (
                            <tr key={key} className="border-b border-black last:border-0">
                              <td className="p-2 bg-slate-50 font-black border-r border-black uppercase w-1/3 text-[8px]">{key}</td>
                              <td className="p-2 font-bold uppercase">{String(val)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                 </div>

                 {selectedReport.fullData?.summary && <ProfessionalParagraph label="कामाचा सविस्तर गोषवारा" content={selectedReport.fullData.summary} icon={ClipboardCheck} />}
                 {selectedReport.fullData?.problems && <ProfessionalParagraph label="समस्या व अडचणी" content={selectedReport.fullData.problems} icon={AlertTriangle} />}
                 {selectedReport.fullData?.actionTaken && <ProfessionalParagraph label="केलेली कार्यवाही" content={selectedReport.fullData.actionTaken} icon={CheckCircle2} />}

                 <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
                    <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
                    <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
                 </div>
              </div>
            ) : null}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <ReportsPage />
    </Suspense>
  )
}