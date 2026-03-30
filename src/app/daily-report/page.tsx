
"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  ClipboardCheck, Truck, Plus, Trash2, MapPin, Briefcase, Save, ArrowLeft, ListPlus, Clock, Box, RefreshCw
} from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
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

function DailyReportForm() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

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

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading: isReportLoading } = useDoc(reportRef)

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
    if (existingReport && existingReport.fullData) {
      setFormData(existingReport.fullData)
      if (existingReport.fullData.reportType) {
        setReportType(existingReport.fullData.reportType)
      }
    }
  }, [existingReport])

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
      reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} केंद्र. वाहन: ${formData.vehicleNumber}. किलोमीटर: ${formData.totalKm}. तूट: ${formData.shortageLiters}L.`
      reportCategory = "Route Visit"
    } else if (reportType === "field-visit") {
      const pointsText = formData.fieldVisitPoints.filter(p => p.text).map((p, i) => `${i+1}. ${p.text}`).join(' | ')
      reportSummary = `क्षेत्र भेट: ${pointsText || "कोणतीही माहिती नाही."}`
      reportCategory = "Field Visit"
    } else {
      const pointsText = formData.officeWorkPoints.filter(p => p.text).map((p, i) => `${i+1}. ${p.text}`).join(' | ')
      reportSummary = `ऑफिस काम: ${pointsText || "काम नोंदवले नाही."}`
      reportCategory = "Daily Office Work"
    }
    
    const reportData = {
      type: reportCategory,
      date: formData.reportDate,
      reportDate: formData.reportDate,
      generatedByUserId: user.uid,
      summary: reportSummary,
      overallSummary: reportSummary,
      fullData: { ...formData, reportType },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId);
      updateDocumentNonBlocking(docRef, reportData);
      toast({ title: "यशस्वी", description: "अहवाल अद्ययावत झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports');
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() });
      toast({ title: "यशस्वी", description: "अहवाल जतन केला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isReportLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-[500px] mx-auto w-full pb-20 px-1 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-2 px-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-primary" /> {editId ? 'अहवाल बदला' : 'दैनिक अहवाल'}
            </h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">{editId ? 'Update Report' : 'Daily Submission'}</p>
          </div>
        </div>
      </div>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10">
        <CardContent className="p-3 grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">तुमचे नाव</Label>
            <Input className="h-8 text-[11px] bg-muted/20 border-none rounded-lg font-black shadow-inner" value={formData.name} readOnly />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">आजची तारीख</Label>
            <Input className="h-8 text-[11px] bg-muted/20 border-none rounded-lg font-black shadow-inner" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">शिफ्ट (SHIFT)</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-3">
              <div className="flex items-center space-x-1.5 bg-muted/10 px-3 py-1.5 rounded-lg border border-muted-foreground/5 cursor-pointer">
                <RadioGroupItem value="Sakal" id="sakal" className="h-3 w-3" />
                <Label htmlFor="sakal" className="text-[10px] font-black cursor-pointer uppercase">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-1.5 bg-muted/10 px-3 py-1.5 rounded-lg border border-muted-foreground/5 cursor-pointer">
                <RadioGroupItem value="Sandhya" id="sandhya" className="h-3 w-3" />
                <Label htmlFor="sandhya" className="text-[10px] font-black cursor-pointer uppercase">संध्याकाळ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-3 bg-muted/30 p-1 h-9 rounded-xl">
          <TabsTrigger value="route-visit" className="text-[9px] font-black gap-1.5 data-[state=active]:bg-white rounded-lg"><Truck className="h-3 w-3" /> रूट व्हिजिट</TabsTrigger>
          <TabsTrigger value="field-visit" className="text-[9px] font-black gap-1.5 data-[state=active]:bg-white rounded-lg"><MapPin className="h-3 w-3" /> क्षेत्र भेट</TabsTrigger>
          <TabsTrigger value="office-work" className="text-[9px] font-black gap-1.5 data-[state=active]:bg-white rounded-lg"><Briefcase className="h-3 w-3" /> ऑफिस काम</TabsTrigger>
        </TabsList>

        <TabsContent value="route-visit" className="space-y-3">
          <Card className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10">
            <CardContent className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">वाहन क्र.</Label><Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">ड्रायव्हर</Label><Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="..." /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-blue-600">बाहेर वेळ</Label><Input className="h-8 text-[10px] bg-blue-50/50 border-none rounded-lg font-black text-blue-700" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-blue-600">येण्याची वेळ</Label><Input className="h-8 text-[10px] bg-blue-50/50 border-none rounded-lg font-black text-blue-700" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सुरुवात RD</Label><Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black" type="number" value={formData.startReading} onChange={e => setFormData({...formData, startReading: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">शेवट RD</Label><Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black" type="number" value={formData.endReading} onChange={e => setFormData({...formData, endReading: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-primary">एकूण KM</Label><Input className="h-8 text-[10px] bg-primary/10 border-none font-black text-primary rounded-lg" value={formData.totalKm} readOnly /></div>
              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-rose-600">तूट (L)</Label><Input className="h-8 text-[10px] bg-rose-50 border-none rounded-lg font-black text-rose-700" type="number" value={formData.shortageLiters} onChange={e => setFormData({...formData, shortageLiters: e.target.value})} /></div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><ListPlus className="h-3 w-3" /> व्हिजिट लॉग</span>
              <Button type="button" size="sm" onClick={addRouteEntry} className="h-7 text-[9px] px-3 rounded-lg shadow-md font-black uppercase tracking-widest"><Plus className="h-3 w-3 mr-1" /> केंद्र जोडा</Button>
            </div>

            <div className="space-y-2">
              {formData.routeVisitLogs.map((entry, index) => (
                <Card key={entry.id} className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10 relative p-2.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">व्हिजिट #{index + 1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-6 w-6 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">कोड/नाव</Label>
                      <div className="flex gap-1">
                        <Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black w-14 p-1 text-center" placeholder="ID" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} />
                        <Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-black flex-1" placeholder="नाव" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">बर्फ</Label><Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg text-center" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-blue-600 flex items-center gap-1"><Clock className="h-2 w-2" /> वेळ (IN / OUT)</Label>
                      <div className="flex gap-1">
                        <Input className="h-8 text-[9px] bg-blue-50/50 border-none rounded-lg p-1 text-center font-black" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} />
                        <Input className="h-8 text-[9px] bg-blue-50/50 border-none rounded-lg p-1 text-center font-black" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60 flex items-center gap-1"><Box className="h-2 w-2" /> कॅन (रिका / भर)</Label>
                      <div className="flex gap-1">
                        <Input className="h-8 text-[10px] bg-muted/20 border-none rounded-lg text-center font-black" placeholder="E" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} />
                        <Input className="h-8 text-[10px] bg-primary/10 border-none rounded-lg text-center font-black text-primary" placeholder="F" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="field-visit" className="space-y-3">
          <Card className="border shadow-none rounded-xl overflow-hidden bg-white border-muted-foreground/10">
            <div className="p-3 bg-muted/5 border-b flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3 text-primary" /> क्षेत्र भेट मुद्दे</span>
              <Button type="button" size="sm" onClick={addFieldPoint} className="h-7 rounded-lg font-black text-[9px]"><ListPlus className="h-3 w-3 mr-1" /> जोडा</Button>
            </div>
            <CardContent className="p-3 space-y-2">
              {formData.fieldVisitPoints.map((point, index) => (
                <div key={point.id} className="flex gap-2 items-start group">
                  <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center font-black text-[10px] text-muted-foreground shrink-0 border border-muted-foreground/5">{index + 1}</div>
                  <Textarea 
                    value={point.text} 
                    onChange={e => updateFieldPoint(point.id, e.target.value)} 
                    placeholder="..." 
                    className="min-h-[50px] text-[11px] rounded-lg bg-muted/10 border-none font-medium shadow-inner p-2" 
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFieldPoint(point.id)} className="h-8 w-8 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <AIGuidanceCard context={formData.fieldVisitPoints.map(p => p.text).join(' ')} formType="daily-report" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office-work" className="space-y-3">
          <Card className="border shadow-none rounded-xl overflow-hidden bg-white border-muted-foreground/10">
            <div className="p-3 bg-muted/5 border-b flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Briefcase className="h-3 w-3 text-primary" /> ऑफिस काम मुद्दे</span>
              <Button type="button" size="sm" onClick={addOfficePoint} className="h-7 rounded-lg font-black text-[9px]"><ListPlus className="h-3 w-3 mr-1" /> जोडा</Button>
            </div>
            <CardContent className="p-3 space-y-2">
              {formData.officeWorkPoints.map((point, index) => (
                <div key={point.id} className="flex gap-2 items-start group">
                  <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center font-black text-[10px] text-muted-foreground shrink-0 border border-muted-foreground/5">{index + 1}</div>
                  <Textarea 
                    value={point.text} 
                    onChange={e => updateOfficePoint(point.id, e.target.value)} 
                    placeholder="..." 
                    className="min-h-[50px] text-[11px] rounded-lg bg-muted/10 border-none font-medium shadow-inner p-2" 
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOfficePoint(point.id)} className="h-8 w-8 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-xl bg-slate-900 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">आजची मोठी कामगिरी</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none font-bold p-2 text-white" placeholder="..." />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-rose-400 tracking-widest">महत्त्वाच्या समस्या</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none font-bold p-2 text-white" placeholder="..." />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-blue-400 tracking-widest">केलेली कार्यवाही</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none font-bold p-2 text-white" placeholder="..." />
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">सुपरवायझरचे नाव</Label>
              <Input className="h-9 text-[11px] bg-white/10 border-none rounded-xl font-bold text-white" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} />
            </div>
            <Button type="button" onClick={handleSave} className="w-full font-black h-12 rounded-xl shadow-2xl bg-primary text-white text-xs uppercase tracking-widest transition-all active:scale-95">
              {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
              {editId ? 'अहवाल अपडेट करा' : 'अहवाल जतन करा'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DailyReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <DailyReportForm />
    </Suspense>
  )
}
