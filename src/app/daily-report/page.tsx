
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ClipboardCheck, Truck, Plus, Trash2, MapPin, Briefcase, Save, ArrowLeft, ListPlus
} from "lucide-react"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"

interface RouteVisitEntry {
  id: string;
  centerCode: string;
  supplierName: string;
  iceAllocated: string;
  arrivalTime: string;
  departureTime: string;
  emptyCans: string;
  fullCans: string;
}

interface ReportPoint {
  id: string;
  text: string;
}

export default function DailyReportPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [reportType, setReportType] = useState<string>("route-visit")

  const createId = () => typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  const createEmptyRouteEntry = (): RouteVisitEntry => ({
    id: createId(),
    centerCode: "", supplierName: "", iceAllocated: "", arrivalTime: "",
    departureTime: "", emptyCans: "", fullCans: ""
  });

  const createEmptyPoint = (): ReportPoint => ({
    id: createId(),
    text: ""
  });

  const [formData, setFormData] = useState({
    name: "", idNumber: "", reportDate: "", shift: "Sakal", slipNo: "",
    driverName: "", vehicleNumber: "", routeOutTime: "", routeInTime: "",
    startReading: "", endReading: "", totalKm: "0", shortageLiters: "0",
    excessLiters: "0", routeVisitLogs: [] as RouteVisitEntry[],
    fieldVisitPoints: [] as ReportPoint[],
    officeWorkPoints: [] as ReportPoint[],
    achievements: "", problems: "",
    actionsTaken: "", supervisorName: ""
  })

  useEffect(() => {
    setMounted(true)
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    const savedId = localStorage.getItem('procurenote_user_id') || ""
    setFormData(prev => ({ 
      ...prev, 
      name: savedName, 
      idNumber: savedId, 
      reportDate: new Date().toISOString().split('T')[0], 
      routeVisitLogs: [createEmptyRouteEntry()],
      fieldVisitPoints: [createEmptyPoint()],
      officeWorkPoints: [createEmptyPoint()]
    }))
  }, [])

  useEffect(() => {
    if (formData.startReading && formData.endReading) {
      const total = Number(formData.endReading) - Number(formData.startReading);
      if (total >= 0) setFormData(prev => ({ ...prev, totalKm: total.toString() }));
    }
  }, [formData.startReading, formData.endReading]);

  const addRouteEntry = () => setFormData(prev => ({ ...prev, routeVisitLogs: [...prev.routeVisitLogs, createEmptyRouteEntry()] }))
  const removeRouteEntry = (id: string) => { 
    if (formData.routeVisitLogs.length > 1) {
      setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.filter(e => e.id !== id) })) 
    }
  }
  const updateRouteEntry = (id: string, updates: Partial<RouteVisitEntry>) => setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.map(e => e.id === id ? { ...e, ...updates } : e) }))

  const addFieldPoint = () => setFormData(prev => ({ ...prev, fieldVisitPoints: [...prev.fieldVisitPoints, createEmptyPoint()] }))
  const removeFieldPoint = (id: string) => { if (formData.fieldVisitPoints.length > 1) setFormData(prev => ({ ...prev, fieldVisitPoints: prev.fieldVisitPoints.filter(p => p.id !== id) })) }
  const updateFieldPoint = (id: string, text: string) => setFormData(prev => ({ ...prev, fieldVisitPoints: prev.fieldVisitPoints.map(p => p.id === id ? { ...p, text } : p) }))

  const addOfficePoint = () => setFormData(prev => ({ ...prev, officeWorkPoints: [...prev.officeWorkPoints, createEmptyPoint()] }))
  const removeOfficePoint = (id: string) => { if (formData.officeWorkPoints.length > 1) setFormData(prev => ({ ...prev, officeWorkPoints: prev.officeWorkPoints.filter(p => p.id !== id) })) }
  const updateOfficePoint = (id: string, text: string) => setFormData(prev => ({ ...prev, officeWorkPoints: prev.officeWorkPoints.map(p => p.id === id ? { ...p, text } : p) }))

  const handleSave = () => {
    if (!db || !user) {
      toast({ title: "त्रुटी", description: "डेटाबेसशी कनेक्शन नाही.", variant: "destructive" });
      return;
    }

    let reportSummary = ""
    let reportCategory = ""
    
    if (reportType === "route-visit") {
      reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} केंद्र. वाहन: ${formData.vehicleNumber}. KM: ${formData.totalKm}.`
      reportCategory = "Route Visit"
    } else if (reportType === "field-visit") {
      const pointsText = formData.fieldVisitPoints.filter(p => p.text).map((p, i) => `${i+1}. ${p.text}`).join(' | ')
      reportSummary = `क्षेत्र भेट: ${pointsText || "निरीक्षणे नोंदवली नाहीत."}`
      reportCategory = "Field Visit"
    } else {
      const pointsText = formData.officeWorkPoints.filter(p => p.text).map((p, i) => `${i+1}. ${p.text}`).join(' | ')
      reportSummary = `ऑफिस काम: ${pointsText || "काम नोंदवले नाही."}`
      reportCategory = "Daily Office Work"
    }
    
    const newReport = {
      type: reportCategory,
      date: formData.reportDate,
      reportDate: formData.reportDate,
      generatedByUserId: user.uid,
      summary: reportSummary,
      overallSummary: reportSummary,
      fullData: { ...formData, reportType },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const colRef = collection(db, 'users', user.uid, 'dailyWorkReports');
    addDocumentNonBlocking(colRef, newReport);
    
    toast({ title: "अहवाल जतन केला", description: "माहिती यशस्वीरित्या सेव्ह झाली." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-20 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100 h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" /> दैनिक अहवाल
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Daily Submission</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">तुमचे नाव</Label>
            <Input className="h-11 text-sm bg-slate-50 border-none rounded-2xl font-bold shadow-inner" value={formData.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">आजची तारीख</Label>
            <Input className="h-11 text-sm bg-slate-50 border-none rounded-2xl font-bold shadow-inner" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">शिफ्ट (Shift)</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-6 mt-2">
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md cursor-pointer">
                <RadioGroupItem value="Sakal" id="sakal" />
                <Label htmlFor="sakal" className="text-sm font-bold cursor-pointer">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md cursor-pointer">
                <RadioGroupItem value="Sandhya" id="sandhya" />
                <Label htmlFor="sandhya" className="text-sm font-bold cursor-pointer">संध्याकाळ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6 bg-slate-100 p-1.5 h-12 rounded-2xl shadow-inner">
          <TabsTrigger value="route-visit" className="text-[11px] font-black gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all"><Truck className="h-4 w-4" /> रूट व्हिजिट</TabsTrigger>
          <TabsTrigger value="field-visit" className="text-[11px] font-black gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all"><MapPin className="h-4 w-4" /> क्षेत्र भेट</TabsTrigger>
          <TabsTrigger value="office-work" className="text-[11px] font-black gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all"><Briefcase className="h-4 w-4" /> ऑफिस काम</TabsTrigger>
        </TabsList>

        <TabsContent value="route-visit" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">वाहन क्र.</Label><Input className="h-10 text-xs bg-slate-50 border-none rounded-xl font-bold" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">ड्रायव्हर</Label><Input className="h-10 text-xs bg-slate-50 border-none rounded-xl font-bold" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="नाव" /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-blue-600">OUT</Label><Input className="h-10 text-xs bg-blue-50/50 border-none rounded-xl font-black text-blue-700" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-blue-600">IN</Label><Input className="h-10 text-xs bg-blue-50/50 border-none rounded-xl font-black text-blue-700" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">START RD</Label><Input className="h-10 text-xs bg-slate-50 border-none rounded-xl font-bold" type="number" value={formData.startReading} onChange={e => setFormData({...formData, startReading: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">END RD</Label><Input className="h-10 text-xs bg-slate-50 border-none rounded-xl font-bold" type="number" value={formData.endReading} onChange={e => setFormData({...formData, endReading: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-indigo-600">KM</Label><Input className="h-10 text-xs bg-indigo-50 border-none font-black text-indigo-700 rounded-xl" value={formData.totalKm} readOnly /></div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-rose-600">तूट (L)</Label><Input className="h-10 text-xs bg-rose-50 border-none rounded-xl font-black text-rose-700" type="number" value={formData.shortageLiters} onChange={e => setFormData({...formData, shortageLiters: e.target.value})} /></div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <div className="bg-slate-50/80 p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">व्हिजिट लॉग (Visit Details)</span>
              </div>
              <Button type="button" size="sm" onClick={addRouteEntry} className="h-9 px-4 rounded-xl shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-2" /> केंद्र जोडा</Button>
            </div>
            <div className="responsive-table-container">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                    <th className="p-4 text-center w-12">#</th>
                    <th className="p-4 text-left">कोड</th>
                    <th className="p-4 text-left">केंद्राचे नाव</th>
                    <th className="p-4 text-center">बर्फ</th>
                    <th className="p-4 text-center">वेळ (IN/OUT)</th>
                    <th className="p-4 text-center bg-slate-100/50">रिकामे कॅन</th>
                    <th className="p-4 text-center bg-primary/5">भरलेले कॅन</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {formData.routeVisitLogs.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 text-center font-black text-slate-300">{index + 1}</td>
                      <td className="p-2"><Input className="h-9 text-xs border-none bg-slate-50 rounded-lg text-center font-bold" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} placeholder="Code" /></td>
                      <td className="p-2"><Input className="h-9 text-xs border-none bg-slate-50 rounded-lg font-bold" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} placeholder="Center Name" /></td>
                      <td className="p-2"><Input className="h-9 text-xs border-none bg-slate-50 rounded-lg text-center" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} placeholder="Ice" /></td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input className="h-9 text-[10px] border-none bg-slate-50 rounded-lg text-center p-1" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} />
                          <Input className="h-9 text-[10px] border-none bg-slate-50 rounded-lg text-center p-1" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} />
                        </div>
                      </td>
                      <td className="p-2 bg-slate-50/30">
                        <Input className="h-9 text-xs border-none bg-white shadow-sm rounded-lg text-center font-bold text-slate-600" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} placeholder="रिकामे" />
                      </td>
                      <td className="p-2 bg-primary/5">
                        <Input className="h-9 text-xs border-none bg-white shadow-sm rounded-lg text-center font-black text-primary" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} placeholder="भरलेले" />
                      </td>
                      <td className="p-4">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="field-visit" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="p-4 bg-slate-50/80 border-b flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> क्षेत्र भेटीचे मुद्दे (Field Points)</span>
              <Button type="button" size="sm" onClick={addFieldPoint} className="h-8 rounded-xl font-black text-[10px]"><ListPlus className="h-3.5 w-3.5 mr-1.5" /> मुद्दा जोडा</Button>
            </div>
            <CardContent className="p-4 space-y-3">
              {formData.fieldVisitPoints.map((point, index) => (
                <div key={point.id} className="flex gap-2 items-start group">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 shrink-0 border border-slate-100">{index + 1}</div>
                  <Textarea 
                    value={point.text} 
                    onChange={e => updateFieldPoint(point.id, e.target.value)} 
                    placeholder="मुद्दा लिहा..." 
                    className="min-h-[60px] text-sm rounded-xl bg-slate-50 border-none font-medium shadow-inner p-3 focus-visible:ring-primary" 
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFieldPoint(point.id)} className="h-10 w-10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <AIGuidanceCard context={formData.fieldVisitPoints.map(p => p.text).join(' ')} formType="daily-report" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office-work" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="p-4 bg-slate-50/80 border-b flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> ऑफिस कामाचे मुद्दे (Work Points)</span>
              <Button type="button" size="sm" onClick={addOfficePoint} className="h-8 rounded-xl font-black text-[10px]"><ListPlus className="h-3.5 w-3.5 mr-1.5" /> मुद्दा जोडा</Button>
            </div>
            <CardContent className="p-4 space-y-3">
              {formData.officeWorkPoints.map((point, index) => (
                <div key={point.id} className="flex gap-2 items-start group">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 shrink-0 border border-slate-100">{index + 1}</div>
                  <Textarea 
                    value={point.text} 
                    onChange={e => updateOfficePoint(point.id, e.target.value)} 
                    placeholder="कामाचा तपशील..." 
                    className="min-h-[60px] text-sm rounded-xl bg-slate-50 border-none font-medium shadow-inner p-3 focus-visible:ring-primary" 
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOfficePoint(point.id)} className="h-10 w-10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden mt-8">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">आजची मोठी कामगिरी (Achievements)</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} className="min-h-[60px] text-xs rounded-xl bg-white/10 border-none font-bold p-3 text-white placeholder:text-white/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-rose-400 tracking-widest">महत्त्वाच्या समस्या (Problems)</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} className="min-h-[60px] text-xs rounded-xl bg-white/10 border-none font-bold p-3 text-white placeholder:text-white/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">केलेली कार्यवाही (Actions Taken)</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} className="min-h-[60px] text-xs rounded-xl bg-white/10 border-none font-bold p-3 text-white placeholder:text-white/20" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/10 items-end">
            <div className="flex-1 w-full space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">सुपरवायझरचे नाव (Supervisor)</Label>
              <Input className="h-11 text-sm bg-white/10 border-none rounded-2xl font-bold text-white" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} />
            </div>
            <Button type="button" onClick={handleSave} className="w-full sm:w-auto font-black h-14 px-10 rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 text-white text-sm uppercase tracking-widest">
              <Save className="h-5 w-5 mr-3" /> अहवाल जतन करा
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
