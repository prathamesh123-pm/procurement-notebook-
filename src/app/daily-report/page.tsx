"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ClipboardCheck, User, Truck, Plus, Trash2, Hash, MapPin, Briefcase, Save, RefreshCw
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
    centerCode: "",
    supplierName: "",
    iceAllocated: "",
    arrivalTime: "",
    departureTime: "",
    emptyCans: "",
    fullCans: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    reportDate: "",
    shift: "Sakal",
    slipNo: "",
    driverName: "",
    vehicleNumber: "",
    routeOutTime: "",
    routeInTime: "",
    startReading: "",
    endReading: "",
    totalKm: "0",
    shortageLiters: "0",
    excessLiters: "0",
    routeVisitLogs: [] as RouteVisitEntry[],
    fieldObservations: "",
    officeTasks: "",
    achievements: "",
    problems: "",
    actionsTaken: "",
    supervisorName: ""
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
      routeVisitLogs: [createEmptyRouteEntry()]
    }))
  }, [])

  useEffect(() => {
    if (formData.startReading && formData.endReading) {
      const total = Number(formData.endReading) - Number(formData.startReading);
      if (total >= 0) {
        setFormData(prev => ({ ...prev, totalKm: total.toString() }));
      }
    }
  }, [formData.startReading, formData.endReading]);

  const addRouteEntry = () => {
    setFormData(prev => ({
      ...prev,
      routeVisitLogs: [...prev.routeVisitLogs, createEmptyRouteEntry()]
    }))
  }

  const removeRouteEntry = (id: string) => {
    if (formData.routeVisitLogs.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      routeVisitLogs: prev.routeVisitLogs.filter(e => e.id !== id)
    }))
  }

  const updateRouteEntry = (id: string, updates: Partial<RouteVisitEntry>) => {
    setFormData(prev => ({
      ...prev,
      routeVisitLogs: prev.routeVisitLogs.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const handleUpdate = () => {
    if (formData.startReading && formData.endReading) {
      const total = Number(formData.endReading) - Number(formData.startReading);
      if (total >= 0) {
        setFormData(prev => ({ ...prev, totalKm: total.toString() }));
      }
    }
    toast({ 
      title: "माहिती अपडेट केली", 
      description: "किलोमीटर आणि आकडेमोड तपासून पाहिली आहे." 
    })
  }

  const handleSave = () => {
    let typeDisplay = "Route Visit"
    let reportSummary = ""

    if (reportType === "route-visit") {
      typeDisplay = "Route Visit"
      reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} केंद्र. वाहन: ${formData.vehicleNumber}. किमी: ${formData.totalKm}. तूट: ${formData.shortageLiters}L.`
    } else if (reportType === "field-visit") {
      typeDisplay = "Field Visit"
      reportSummary = `क्षेत्र भेट अहवाल: ${formData.fieldObservations.substring(0, 50)}...`
    } else {
      typeDisplay = "Daily Office Work"
      reportSummary = `ऑफिस काम अहवाल: ${formData.officeTasks.substring(0, 50)}...`
    }
    
    const newReport = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      type: typeDisplay,
      date: formData.reportDate,
      workItemsCount: reportType === "route-visit" ? formData.routeVisitLogs.length : 1,
      interactionsCount: reportType === "route-visit" ? formData.routeVisitLogs.length : 1,
      summary: reportSummary,
      fullData: { ...formData, reportType: reportType }
    }

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    
    toast({ title: "अहवाल जतन केला", description: `${typeDisplay} यशस्वीरित्या सेव्ह झाला आहे.` })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1 border-b pb-2 px-2 sm:px-0">
        <h2 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> 
          दैनिक कामकाज अहवाल (Daily Report)
        </h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">आजच्या कामकाजाचा सविस्तर तपशील भरा (Enter daily work details)</p>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
            <User className="h-3.5 w-3.5" /> १) प्रतिनिधी माहिती (Representative Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">नाव (Name)</Label>
            <Input className="h-9 text-[11px] px-3 bg-muted/20 border-none rounded-xl font-bold" value={formData.name} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">आयडी (ID)</Label>
            <Input className="h-9 text-[11px] px-3 bg-muted/20 border-none rounded-xl font-bold" value={formData.idNumber} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">तारीख (Date)</Label>
            <Input className="h-9 text-[11px] px-3 bg-muted/20 border-none rounded-xl font-bold" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">शिफ्ट (Shift)</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-4 mt-1.5">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="Sakal" id="sakal" className="h-3 w-3" />
                <Label htmlFor="sakal" className="text-[10px] font-bold">सकाळ (AM)</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="Sandhya" id="sandhya" className="h-3 w-3" />
                <Label htmlFor="sandhya" className="text-[10px] font-bold">संध्या (PM)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4 bg-muted/30 p-1 h-10 rounded-2xl">
          <TabsTrigger value="route-visit" className="text-[10px] font-black gap-2 py-1.5 rounded-xl"><Truck className="h-3 w-3" /> रूट व्हिजिट (Route)</TabsTrigger>
          <TabsTrigger value="field-visit" className="text-[10px] font-black gap-2 py-1.5 rounded-xl"><MapPin className="h-3 w-3" /> क्षेत्र भेट (Field)</TabsTrigger>
          <TabsTrigger value="office-work" className="text-[10px] font-black gap-2 py-1.5 rounded-xl"><Briefcase className="h-3 w-3" /> ऑफिस काम (Office)</TabsTrigger>
        </TabsList>

        <TabsContent value="route-visit" className="space-y-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                <Truck className="h-3.5 w-3.5" /> रूट व वाहन तपशील (Vehicle Details)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase">स्लिप क्र. (Slip)</Label>
                <Input className="h-8 text-[10px] px-2 bg-muted/10 rounded-lg font-bold" value={formData.slipNo} onChange={e => setFormData({...formData, slipNo: e.target.value})} placeholder="Slip No" />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase">वाहन क्र. (Vehicle)</Label>
                <Input className="h-8 text-[10px] px-2 bg-muted/10 rounded-lg font-bold" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase">ड्रायव्हर (Driver)</Label>
                <Input className="h-8 text-[10px] px-2 bg-muted/10 rounded-lg font-bold" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="Driver" />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-blue-600">Out Time</Label>
                <Input className="h-8 text-[10px] px-2 bg-blue-50/50 border-blue-100 rounded-lg font-bold" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-blue-600">In Time</Label>
                <Input className="h-8 text-[10px] px-2 bg-blue-50/50 border-blue-100 rounded-lg font-bold" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-indigo-600">Start Reading</Label>
                <Input className="h-8 text-[10px] px-2 bg-indigo-50/50 border-indigo-100 rounded-lg font-bold" type="number" value={formData.startReading} onChange={e => setFormData({...formData, startReading: e.target.value})} placeholder="Start" />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-indigo-600">End Reading</Label>
                <Input className="h-8 text-[10px] px-2 bg-indigo-50/50 border-indigo-100 rounded-lg font-bold" type="number" value={formData.endReading} onChange={e => setFormData({...formData, endReading: e.target.value})} placeholder="End" />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-indigo-800">एकूण KM (Total)</Label>
                <Input className="h-8 text-[10px] px-2 bg-indigo-100/50 border-indigo-200 font-black rounded-lg" type="number" value={formData.totalKm} readOnly />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-red-600">दूध तूट (Loss)</Label>
                <Input className="h-8 text-[10px] px-2 bg-red-50/50 border-red-100 rounded-lg font-bold" type="number" step="0.1" value={formData.shortageLiters} onChange={e => setFormData({...formData, shortageLiters: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-green-600">दूध वाढ (Gain)</Label>
                <Input className="h-8 text-[10px] px-2 bg-green-50/50 border-green-100 rounded-lg font-bold" type="number" step="0.1" value={formData.excessLiters} onChange={e => setFormData({...formData, excessLiters: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                <Hash className="h-3.5 w-3.5" /> रूट व्हिजिट लॉग (Visit Log)
              </CardTitle>
              <Button size="sm" onClick={addRouteEntry} className="h-7 text-[9px] font-black gap-1.5 px-4 rounded-xl shadow-md">
                <Plus className="h-3 w-3" /> केंद्र जोडा (Add Point)
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-muted/50 border-b text-center uppercase tracking-widest font-black text-[8px] text-muted-foreground">
                    <th className="p-2 border-r w-8">Sr.</th>
                    <th className="p-2 border-r min-w-[70px]">कोड (Code)</th>
                    <th className="p-2 border-r min-w-[120px]">नाव (Name)</th>
                    <th className="p-2 border-r w-16">बर्फ (Ice)</th>
                    <th className="p-2 border-r w-24">पोहोचली (Arr)</th>
                    <th className="p-2 border-r w-24">निघाली (Dep)</th>
                    <th className="p-2 border-r w-16">रिकामे (E)</th>
                    <th className="p-2 border-r w-16">भरलेले (F)</th>
                    <th className="p-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.routeVisitLogs.map((entry, index) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-2 border-r text-center font-black">{index + 1}</td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent uppercase font-bold" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} placeholder="C-101" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent font-black" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} placeholder="Point Name" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent text-center font-bold" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} placeholder="0" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent text-center font-bold" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent text-center font-bold" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent text-center font-bold" type="number" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} placeholder="0" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-8 text-[10px] border-none shadow-none focus-visible:ring-0 px-2 rounded-none bg-transparent text-center font-bold text-primary" type="number" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} placeholder="0" />
                      </td>
                      <td className="p-0 flex justify-center items-center h-8">
                        <Button variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-6 w-6 text-destructive rounded-full hover:bg-destructive/10" disabled={formData.routeVisitLogs.length <= 1}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field-visit">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                <MapPin className="h-3.5 w-3.5" /> क्षेत्र भेट अहवाल (Field Visit Report)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea 
                value={formData.fieldObservations} 
                onChange={e => setFormData({...formData, fieldObservations: e.target.value})} 
                placeholder="क्षेत्र भेटी दरम्यान केलेली निरीक्षणे आणि कामकाज येथे लिहा... (Write field observations here)" 
                className="min-h-[200px] text-xs px-4 py-3 rounded-2xl bg-muted/10 border-none font-bold" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office-work">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                <Briefcase className="h-3.5 w-3.5" /> ऑफिस काम अहवाल (Office Work Report)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea 
                value={formData.officeTasks} 
                onChange={e => setFormData({...formData, officeTasks: e.target.value})} 
                placeholder="आज दिवसभरात केलेली ऑफिसची कामे आणि इतर नोंद येथे लिहा... (Write office work details here)" 
                className="min-h-[200px] text-xs px-4 py-3 rounded-2xl bg-muted/10 border-none font-bold" 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mt-4">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">सारांश व स्वाक्षरी (Summary & Review)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-green-600">कामगिरी (Achievements)</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="आजची चांगली कामगिरी..." className="min-h-[60px] text-[10px] py-2 px-3 rounded-xl bg-green-50/30 border-green-100 font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-red-600">समस्या (Problems Found)</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="कामकाजात आलेल्या समस्या..." className="min-h-[60px] text-[10px] py-2 px-3 rounded-xl bg-red-50/30 border-red-100 font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-blue-600">कार्यवाही (Actions Taken)</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} placeholder="समस्येवर केलेली कार्यवाही..." className="min-h-[60px] text-[10px] py-2 px-3 rounded-xl bg-blue-50/30 border-blue-100 font-bold" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <Label className="text-[9px] font-black uppercase text-muted-foreground">सुपरवायझरचे नाव (Supervisor Name)</Label>
              <Input className="h-10 text-xs font-black px-4 bg-muted/20 border-none rounded-xl" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} placeholder="सुपरवायझरचे नाव लिहा" />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button onClick={handleUpdate} variant="secondary" className="flex-1 sm:w-auto h-10 font-black text-[10px] gap-2 px-8 rounded-xl bg-muted/50 hover:bg-muted transition-all">
                <RefreshCw className="h-3.5 w-3.5" /> अपडेट करा (Update)
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:w-auto h-10 font-black text-[10px] gap-2 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all">
                <Save className="h-3.5 w-3.5" /> अहवाल जतन करा (Save)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
