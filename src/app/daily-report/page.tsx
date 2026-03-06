
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
  ClipboardCheck, User, Truck, Plus, Trash2, Hash, MapPin, Briefcase, Save, Gauge, RefreshCw
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
    totalKm: "",
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
    setFormData(prev => ({
      ...prev,
      reportDate: new Date().toISOString().split('T')[0],
      routeVisitLogs: [createEmptyRouteEntry()]
    }))
  }, [])

  // Calculate Total KM automatically
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
    toast({ 
      title: "माहिती अद्ययावत केली", 
      description: "किलोमीटर आणि आकडेमोड तपासून पाहिली आहे." 
    })
  }

  const handleSave = () => {
    let typeDisplay = "Route Visit"
    let reportSummary = ""

    if (reportType === "route-visit") {
      typeDisplay = "Route Visit"
      reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} गवळी/सेंटर. वाहन: ${formData.vehicleNumber}. किलोमीटर: ${formData.totalKm} किमी.`
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
    <div className="space-y-2 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-0 border-b pb-1">
        <h2 className="text-lg font-headline font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" /> 
          दैनिक कामकाज अहवाल (Daily Report)
        </h2>
      </div>

      <Card className="border shadow-none bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b py-1 px-3">
          <CardTitle className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight">
            <User className="h-3 w-3 text-primary" /> १) प्रतिनिधी माहिती (Basic Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">नाव</Label>
            <Input className="h-7 text-[11px] px-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="नाव" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">आयडी</Label>
            <Input className="h-7 text-[11px] px-2" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} placeholder="ID" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">तारीख</Label>
            <Input className="h-7 text-[11px] px-2" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">शिफ्ट</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2 mt-0.5">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sakal" id="sakal" className="h-2.5 w-2.5" />
                <Label htmlFor="sakal" className="text-[10px]">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sandhya" id="sandhya" className="h-2.5 w-2.5" />
                <Label htmlFor="sandhya" className="text-[10px]">संध्या</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mb-2 bg-muted/30 p-0.5 h-8">
          <TabsTrigger value="route-visit" className="text-[9px] font-bold gap-1 py-1"><Truck className="h-2.5 w-2.5" /> Route Visit</TabsTrigger>
          <TabsTrigger value="field-visit" className="text-[9px] font-bold gap-1 py-1"><MapPin className="h-2.5 w-2.5" /> Field Visit</TabsTrigger>
          <TabsTrigger value="office-work" className="text-[9px] font-bold gap-1 py-1"><Briefcase className="h-2.5 w-2.5" /> Office Work</TabsTrigger>
        </TabsList>

        <TabsContent value="route-visit" className="space-y-2">
          <Card className="border shadow-none bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-1 px-3">
              <CardTitle className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight">
                <Truck className="h-3 w-3 text-primary" /> रूट व वाहन तपशील
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase">स्लिप नंबर</Label>
                <Input className="h-7 text-[11px] px-2 border-primary/20" value={formData.slipNo} onChange={e => setFormData({...formData, slipNo: e.target.value})} placeholder="Slip No" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase">वाहन क्र.</Label>
                <Input className="h-7 text-[11px] px-2" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase">ड्रायव्हर</Label>
                <Input className="h-7 text-[11px] px-2" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="Driver" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-primary">बाहेर (Out)</Label>
                <Input className="h-7 text-[11px] px-2" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-primary">आत (In)</Label>
                <Input className="h-7 text-[11px] px-2" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-blue-600">सुटताना (Reading)</Label>
                <Input className="h-7 text-[11px] px-2 border-blue-200" type="number" value={formData.startReading} onChange={e => setFormData({...formData, startReading: e.target.value})} placeholder="Start" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-blue-600">पोहोचल्यावर (End)</Label>
                <Input className="h-7 text-[11px] px-2 border-blue-200" type="number" value={formData.endReading} onChange={e => setFormData({...formData, endReading: e.target.value})} placeholder="End" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-blue-800">एकूण (Total KM)</Label>
                <Input className="h-7 text-[11px] px-2 bg-blue-50 border-blue-300 font-bold" type="number" value={formData.totalKm} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-1 px-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight">
                <Hash className="h-3 w-3 text-primary" /> रूट व्हिजिट लॉग
              </CardTitle>
              <Button size="sm" onClick={addRouteEntry} className="h-6 text-[9px] font-bold gap-1 px-2 py-0">
                <Plus className="h-2.5 w-2.5" /> गवळी जोडा
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-muted/50 border-b text-center uppercase tracking-tighter">
                    <th className="p-1 border-r w-8">Sr.</th>
                    <th className="p-1 border-r min-w-[60px]">कोड</th>
                    <th className="p-1 border-r min-w-[100px]">नाव</th>
                    <th className="p-1 border-r w-14">बर्फ</th>
                    <th className="p-1 border-r w-20">पोहोचली</th>
                    <th className="p-1 border-r w-20">निघाली</th>
                    <th className="p-1 border-r w-14">E</th>
                    <th className="p-1 border-r w-14">F</th>
                    <th className="p-1 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.routeVisitLogs.map((entry, index) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/10">
                      <td className="p-1 border-r text-center font-bold">{index + 1}</td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} placeholder="Code" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 font-bold" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} placeholder="Supplier Name" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} placeholder="Ice" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} placeholder="E" />
                      </td>
                      <td className="p-0 border-r">
                        <Input className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} placeholder="F" />
                      </td>
                      <td className="p-0">
                        <Button variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-6 w-6 text-destructive" disabled={formData.routeVisitLogs.length <= 1}>
                          <Trash2 className="h-2.5 w-2.5" />
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
          <Card className="border shadow-none bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-1 px-3">
              <CardTitle className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight">
                <MapPin className="h-3 w-3 text-primary" /> क्षेत्र भेट अहवाल (Field Visit)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea 
                value={formData.fieldObservations} 
                onChange={e => setFormData({...formData, fieldObservations: e.target.value})} 
                placeholder="क्षेत्र भेटी दरम्यान केलेली निरीक्षणे येथे लिहा..." 
                className="min-h-[120px] text-xs px-2 py-1" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office-work">
          <Card className="border shadow-none bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-1 px-3">
              <CardTitle className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight">
                <Briefcase className="h-3 w-3 text-primary" /> ऑफिस काम अहवाल (Office Work)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea 
                value={formData.officeTasks} 
                onChange={e => setFormData({...formData, officeTasks: e.target.value})} 
                placeholder="आज दिवसभरात केलेली ऑफिसची कामे येथे लिहा..." 
                className="min-h-[120px] text-xs px-2 py-1" 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border shadow-none bg-white overflow-hidden mt-1">
        <CardHeader className="bg-primary/5 border-b py-1 px-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-tight">सारांश व सुपरवायझर (Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-0.5">
              <Label className="text-[8px] font-bold uppercase text-green-600">कामगिरी</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="कामगिरी..." className="min-h-[40px] text-[10px] py-1 px-2" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[8px] font-bold uppercase text-red-600">समस्या</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="समस्या..." className="min-h-[40px] text-[10px] py-1 px-2" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[8px] font-bold uppercase text-blue-600">कार्यवाही</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} placeholder="कार्यवाही..." className="min-h-[40px] text-[10px] py-1 px-2" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t items-end">
            <div className="flex-1 space-y-0.5 w-full">
              <Label className="text-[9px] font-bold uppercase">सुपरवायझरचे नाव</Label>
              <Input className="h-8 text-[11px] font-bold px-2" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} placeholder="Supervisor Name" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleUpdate} variant="secondary" className="flex-1 sm:w-auto h-8 font-bold text-[11px] gap-2 px-6">
                <RefreshCw className="h-3 w-3" /> रिपोर्ट अपडेट करा (Update)
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:w-auto h-8 font-bold text-[11px] gap-2 px-6">
                <Save className="h-3 w-3" /> रिपोर्ट जतन करा (Save)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
