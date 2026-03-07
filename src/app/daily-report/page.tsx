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
  ClipboardCheck, Truck, Plus, Trash2, MapPin, Briefcase, Save, ChevronRight
} from "lucide-react"

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

export default function DailyReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [reportType, setReportType] = useState<string>("route-visit")

  const createEmptyRouteEntry = (): RouteVisitEntry => ({
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    centerCode: "", supplierName: "", iceAllocated: "", arrivalTime: "",
    departureTime: "", emptyCans: "", fullCans: ""
  });

  const [formData, setFormData] = useState({
    name: "", idNumber: "", reportDate: "", shift: "Sakal", slipNo: "",
    driverName: "", vehicleNumber: "", routeOutTime: "", routeInTime: "",
    startReading: "", endReading: "", totalKm: "0", shortageLiters: "0",
    excessLiters: "0", routeVisitLogs: [] as RouteVisitEntry[],
    fieldObservations: "", officeTasks: "", achievements: "", problems: "",
    actionsTaken: "", supervisorName: ""
  })

  useEffect(() => {
    setMounted(true)
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    const savedId = localStorage.getItem('procurenote_user_id') || ""
    setFormData(prev => ({ ...prev, name: savedName, idNumber: savedId, reportDate: new Date().toISOString().split('T')[0], routeVisitLogs: [createEmptyRouteEntry()] }))
  }, [])

  useEffect(() => {
    if (formData.startReading && formData.endReading) {
      const total = Number(formData.endReading) - Number(formData.startReading);
      if (total >= 0) setFormData(prev => ({ ...prev, totalKm: total.toString() }));
    }
  }, [formData.startReading, formData.endReading]);

  const addRouteEntry = () => setFormData(prev => ({ ...prev, routeVisitLogs: [...prev.routeVisitLogs, createEmptyRouteEntry()] }))
  const removeRouteEntry = (id: string) => { if (formData.routeVisitLogs.length > 1) setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.filter(e => e.id !== id) })) }
  const updateRouteEntry = (id: string, updates: Partial<RouteVisitEntry>) => setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.map(e => e.id === id ? { ...e, ...updates } : e) }))

  const handleSave = () => {
    let reportSummary = ""
    if (reportType === "route-visit") reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} केंद्र. वाहन: ${formData.vehicleNumber}. KM: ${formData.totalKm}.`
    else if (reportType === "field-visit") reportSummary = `क्षेत्र भेट: ${formData.fieldObservations.substring(0, 50)}...`
    else reportSummary = `ऑफिस काम: ${formData.officeTasks.substring(0, 50)}...`
    
    const newReport = {
      id: crypto.randomUUID(), type: reportType === "route-visit" ? "Route Visit" : reportType === "field-visit" ? "Field Visit" : "Daily Office Work",
      date: formData.reportDate, workItemsCount: formData.routeVisitLogs.length, summary: reportSummary, fullData: { ...formData, reportType }
    }

    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...stored]))
    toast({ title: "अहवाल जतन केला", description: "यशस्वीरित्या सेव्ह झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1 sm:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-1.5 px-1">
        <h2 className="text-lg font-headline font-black text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> दैनिक अहवाल (Daily Report)
        </h2>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">Work Details & Logs</p>
      </div>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">नाव (Name)</Label>
            <Input className="h-8 text-xs bg-muted/20 border-none rounded-lg font-bold" value={formData.name} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">तारीख (Date)</Label>
            <Input className="h-8 text-xs bg-muted/20 border-none rounded-lg font-bold" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">शिफ्ट (Shift)</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-4 mt-1">
              <div className="flex items-center space-x-1.5"><RadioGroupItem value="Sakal" id="sakal" className="h-3.5 w-3.5" /><Label htmlFor="sakal" className="text-xs font-bold">सकाळ</Label></div>
              <div className="flex items-center space-x-1.5"><RadioGroupItem value="Sandhya" id="sandhya" className="h-3.5 w-3.5" /><Label htmlFor="sandhya" className="text-xs font-bold">संध्याकाळ</Label></div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mb-3 bg-muted/30 p-1 h-9 rounded-xl">
          <TabsTrigger value="route-visit" className="text-[10px] font-black gap-1.5 py-1 rounded-lg"><Truck className="h-3.5 w-3.5" /> रूट</TabsTrigger>
          <TabsTrigger value="field-visit" className="text-[10px] font-black gap-1.5 py-1 rounded-lg"><MapPin className="h-3.5 w-3.5" /> क्षेत्र</TabsTrigger>
          <TabsTrigger value="office-work" className="text-[10px] font-black gap-1.5 py-1 rounded-lg"><Briefcase className="h-3.5 w-3.5" /> ऑफिस</TabsTrigger>
        </TabsList>

        <TabsContent value="route-visit" className="space-y-3">
          <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
            <CardContent className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase">वाहन क्र.</Label><Input className="h-8 text-[11px] bg-muted/10 rounded-md font-bold" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase">ड्रायव्हर</Label><Input className="h-8 text-[11px] bg-muted/10 rounded-md font-bold" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="नाव" /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-blue-600">Out Time</Label><Input className="h-8 text-[11px] bg-blue-50 border-none rounded-md font-bold" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-blue-600">In Time</Label><Input className="h-8 text-[11px] bg-blue-50 border-none rounded-md font-bold" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase">Start RD</Label><Input className="h-8 text-[11px] bg-muted/10 rounded-md font-bold" type="number" value={formData.startReading} onChange={e => setFormData({...formData, startReading: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase">End RD</Label><Input className="h-8 text-[11px] bg-muted/10 rounded-md font-bold" type="number" value={formData.endReading} onChange={e => setFormData({...formData, endReading: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-indigo-800">Total KM</Label><Input className="h-8 text-[11px] bg-indigo-50 border-none font-black rounded-md" value={formData.totalKm} readOnly /></div>
              <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-red-600">तूट (L)</Label><Input className="h-8 text-[11px] bg-red-50 border-none rounded-md font-bold" type="number" value={formData.shortageLiters} onChange={e => setFormData({...formData, shortageLiters: e.target.value})} /></div>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
            <div className="bg-primary/5 p-2 flex items-center justify-between border-b">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">व्हिजिट लॉग (Log)</span>
              <Button size="sm" onClick={addRouteEntry} className="h-7 text-[10px] font-black gap-1 px-3 rounded-lg"><Plus className="h-3.5 w-3.5" /> जोडा</Button>
            </div>
            <div className="responsive-table-container">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-muted/50 text-[9px] font-black uppercase text-muted-foreground border-b">
                    <th className="p-2 border-r w-8">Sr.</th>
                    <th className="p-2 border-r min-w-[60px]">कोड</th>
                    <th className="p-2 border-r min-w-[100px]">नाव</th>
                    <th className="p-2 border-r">बर्फ</th>
                    <th className="p-2 border-r">पोहोचली</th>
                    <th className="p-2 border-r">निघाली</th>
                    <th className="p-2 border-r w-10">E</th>
                    <th className="p-2 border-r w-10">F</th>
                    <th className="p-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.routeVisitLogs.map((entry, index) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="p-2 border-r text-center font-black text-muted-foreground">{index + 1}</td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center font-bold px-1" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none font-bold px-2" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center px-1" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center px-1" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center px-1" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center px-1" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} /></td>
                      <td className="p-0 border-r"><Input className="h-8 text-[11px] border-none text-center font-black text-primary px-1" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} /></td>
                      <td className="p-1 flex justify-center"><Button variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-7 w-7 text-destructive rounded-full"><Trash2 className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="field-visit"><Card className="border shadow-none rounded-xl overflow-hidden"><CardContent className="p-3"><Textarea value={formData.fieldObservations} onChange={e => setFormData({...formData, fieldObservations: e.target.value})} placeholder="क्षेत्र भेटीची निरीक्षणे..." className="min-h-[120px] text-xs rounded-lg bg-muted/10 border-none font-bold" /></CardContent></Card></TabsContent>
        <TabsContent value="office-work"><Card className="border shadow-none rounded-xl overflow-hidden"><CardContent className="p-3"><Textarea value={formData.officeTasks} onChange={e => setFormData({...formData, officeTasks: e.target.value})} placeholder="ऑफिस कामाचा तपशील..." className="min-h-[120px] text-xs rounded-lg bg-muted/10 border-none font-bold" /></CardContent></Card></TabsContent>
      </Tabs>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden mt-2">
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-green-600">कामगिरी (Achievements)</Label><Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} className="min-h-[50px] text-xs rounded-lg bg-green-50/30 border-none font-bold" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-red-600">समस्या (Problems)</Label><Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} className="min-h-[50px] text-xs rounded-lg bg-red-50/30 border-none font-bold" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-blue-600">कार्यवाही (Actions)</Label><Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} className="min-h-[50px] text-xs rounded-lg bg-blue-50/30 border-none font-bold" /></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t items-end">
            <div className="flex-1 w-full"><Label className="text-[10px] font-black uppercase text-muted-foreground">सुपरवायझर नाव (Supervisor Name)</Label><Input className="h-9 text-xs bg-muted/20 border-none rounded-lg font-bold" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full sm:w-auto font-black h-10 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all text-xs"><Save className="h-4 w-4 mr-2" /> जतन करा (Save)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
