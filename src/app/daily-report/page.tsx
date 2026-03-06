"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ClipboardCheck, User, Briefcase, FileText, CheckCircle2, 
  Truck, MapPin, Plus, Trash2, IceCream, 
  Package, SearchCheck, Beaker, Clock, Hash
} from "lucide-react"

interface RouteVisitEntry {
  id: string;
  centerCode: string;
  supplierName: string;
  iceAllocated: string;
  arrivalTime: string;
  emptyCans: string;
  fullCans: string;
  testSoda: boolean;
  testSugar: boolean;
  testCOB: boolean;
  testMalto: boolean;
  seizedMilk: string;
  instructions: string;
}

interface CenterVisit {
  id: string;
  name: string;
  topic: string;
  observation: string;
  suggestion: string;
  objectives: string[];
  compliance: string[];
  complianceRemarks: Record<string, string>;
  arrivalTime: string;
  departureTime: string;
  iceAllocated: string;
  iceUsed: string;
  emptyCansUnloaded: string;
  fullCansLoaded: string;
  mixQty: string;
  mixFat: string;
  cowQty: string;
  cowFat: string;
  inspectionResult: string;
  seizedMilk: string;
  remark: string;
}

interface Meeting {
  id: string;
  person: string;
  org: string;
  from: string;
  to: string;
  subject: string;
  decision: string;
}

export default function DailyReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeReportType, setActiveReportType] = useState<string>("route")

  const createEmptyRouteEntry = (): RouteVisitEntry => ({
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    centerCode: "",
    supplierName: "",
    iceAllocated: "",
    arrivalTime: "",
    emptyCans: "",
    fullCans: "",
    testSoda: false,
    testSugar: false,
    testCOB: false,
    testMalto: false,
    seizedMilk: "",
    instructions: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    designation: "",
    mobile: "",
    reportDate: "",
    shift: "Sakal",
    slipNo: "",
    driverName: "",
    vehicleNumber: "",
    routeOutTime: "",
    routeInTime: "",
    fieldRoute: "",
    vehicleType: "Company",
    odoStart: "",
    odoEnd: "",
    officeTasks: [] as string[],
    officeTaskDetail: "",
    meetings: [] as Meeting[],
    centerVisits: [] as CenterVisit[],
    routeVisitLogs: [] as RouteVisitEntry[],
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

  const totalKm = (Number(formData.odoEnd) || 0) - (Number(formData.odoStart) || 0);

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

  const handleSave = () => {
    let typeLabel = "Daily Report"
    if (activeReportType === 'office') typeLabel = 'Daily Office Work'
    else if (activeReportType === 'field') typeLabel = 'Field Visit'
    else if (activeReportType === 'route') typeLabel = 'Route Visit'

    const reportSummary = `${typeLabel}: ${formData.name}. Route: ${formData.fieldRoute}. Entries: ${formData.routeVisitLogs.length}. Achievements: ${formData.achievements}.`
    
    const newReport = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      type: typeLabel,
      date: formData.reportDate,
      workItemsCount: activeReportType === 'office' ? formData.officeTasks.length : formData.routeVisitLogs.length,
      interactionsCount: formData.routeVisitLogs.length,
      summary: reportSummary,
      fullData: { ...formData, reportType: activeReportType, totalKm }
    }

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    
    toast({ title: "अहवाल जतन केला", description: `${typeLabel} यशस्वीरित्या सेव्ह झाला आहे.` })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10" id="printable-report">
      <div className="flex flex-col gap-0.5 border-b pb-2">
        <h2 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary no-print" /> 
          संकलन विभाग - दैनिक कामकाज अहवाल
        </h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Collection Department - Daily Work Report</p>
      </div>

      {/* 1. Basic Info Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary" /> १) प्रतिनिधीची मूलभूत माहिती (Basic Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">नाव</Label>
            <Input className="h-8 text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="प्रतिनिधीचे नाव" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">आयडी</Label>
            <Input className="h-8 text-xs" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} placeholder="ID" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">तारीख</Label>
            <Input className="h-8 text-xs" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">शिफ्ट</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-3 mt-1">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sakal" id="sakal" className="h-3 w-3" />
                <Label htmlFor="sakal" className="text-[10px]">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sandhya" id="sandhya" className="h-3 w-3" />
                <Label htmlFor="sandhya" className="text-[10px]">संध्या</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selector */}
      <div className="bg-muted/30 p-1 rounded-lg no-print">
        <div className="flex gap-1">
          {[
            { id: "route", label: "Route Visit Report", icon: Truck },
            { id: "field", label: "Field Visit Report", icon: MapPin },
            { id: "office", label: "Office Work Report", icon: Briefcase }
          ].map((type) => (
            <Button 
              key={type.id}
              variant={activeReportType === type.id ? "default" : "ghost"}
              className={`flex-1 h-9 text-[11px] font-bold gap-2 rounded-md ${activeReportType === type.id ? "bg-white text-primary shadow-sm hover:bg-white" : ""}`}
              onClick={() => setActiveReportType(type.id)}
            >
              <type.icon className="h-3.5 w-3.5" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ROUTE VISIT REPORT CONTENT */}
      {activeReportType === 'route' && (
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-primary" /> रूट व वाहन तपशील (Route & Vehicle Details)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase">स्लिप नंबर</Label>
                <Input className="h-8 text-xs font-bold border-primary/20" value={formData.slipNo} onChange={e => setFormData({...formData, slipNo: e.target.value})} placeholder="Slip No" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase">वाहन क्रमांक</Label>
                <Input className="h-8 text-xs" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 10..." />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase">ड्रायव्हर</Label>
                <Input className="h-8 text-xs" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} placeholder="Driver" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-primary">निघण्याची वेळ (Out)</Label>
                <Input className="h-8 text-xs" type="time" value={formData.routeOutTime} onChange={e => setFormData({...formData, routeOutTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-primary">परतण्याची वेळ (In)</Label>
                <Input className="h-8 text-xs" type="time" value={formData.routeInTime} onChange={e => setFormData({...formData, routeInTime: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-primary" /> रूट व्हिजिट लॉग (Route Visit Log - Supplier Data)
              </CardTitle>
              <Button size="sm" onClick={addRouteEntry} className="h-7 text-[10px] font-bold gap-1 px-3 no-print">
                <Plus className="h-3 w-3" /> गवळी जोडा
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-muted/50 border-b text-center uppercase tracking-tighter">
                    <th className="p-2 border-r w-10">Sr.</th>
                    <th className="p-2 border-r min-w-[100px]">सेंटर / कोड</th>
                    <th className="p-2 border-r min-w-[150px]">गवल्याचे नाव</th>
                    <th className="p-2 border-r w-24">दिलेला बर्फ</th>
                    <th className="p-2 border-r w-24">पोहोचलेली वेळ</th>
                    <th className="p-2 border-r w-20">उतरलेले कॅन</th>
                    <th className="p-2 border-r w-20">भरलेले कॅन</th>
                    <th className="p-2 border-r w-40">तपासणी (S/U/C/M)</th>
                    <th className="p-2 border-r w-24">जप्त दूध (L)</th>
                    <th className="p-2 border-r">सूचना / शेरा</th>
                    <th className="p-2 w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.routeVisitLogs.map((entry, index) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-2 border-r text-center font-bold">{index + 1}</td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1" value={entry.centerCode} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} placeholder="Code" />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 font-bold" value={entry.supplierName} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} placeholder="Supplier Name" />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" value={entry.iceAllocated} onChange={e => updateRouteEntry(entry.id, { iceAllocated: e.target.value })} placeholder="Ice" />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="time" value={entry.arrivalTime} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} placeholder="Empty" />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} placeholder="Full" />
                      </td>
                      <td className="p-1 border-r">
                        <div className="flex items-center justify-center gap-2">
                          <label className="flex items-center gap-0.5 cursor-pointer">
                            <Checkbox checked={entry.testSoda} onCheckedChange={v => updateRouteEntry(entry.id, { testSoda: !!v })} className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-bold">SO</span>
                          </label>
                          <label className="flex items-center gap-0.5 cursor-pointer">
                            <Checkbox checked={entry.testSugar} onCheckedChange={v => updateRouteEntry(entry.id, { testSugar: !!v })} className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-bold">SU</span>
                          </label>
                          <label className="flex items-center gap-0.5 cursor-pointer">
                            <Checkbox checked={entry.testCOB} onCheckedChange={v => updateRouteEntry(entry.id, { testCOB: !!v })} className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-bold">CO</span>
                          </label>
                          <label className="flex items-center gap-0.5 cursor-pointer">
                            <Checkbox checked={entry.testMalto} onCheckedChange={v => updateRouteEntry(entry.id, { testMalto: !!v })} className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-bold">MA</span>
                          </label>
                        </div>
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center text-red-600 font-bold" value={entry.seizedMilk} onChange={e => updateRouteEntry(entry.id, { seizedMilk: e.target.value })} placeholder="Liters" />
                      </td>
                      <td className="p-1 border-r">
                        <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 italic" value={entry.instructions} onChange={e => updateRouteEntry(entry.id, { instructions: e.target.value })} placeholder="Instructions..." />
                      </td>
                      <td className="p-1 no-print">
                        <Button variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-6 w-6 text-destructive" disabled={formData.routeVisitLogs.length <= 1}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EXISTING FIELD VISIT & OFFICE CONTENT (Hidden if Route Visit is active) */}
      {activeReportType === 'office' && (
        <Card className="border-none shadow-sm bg-white mb-4">
          <CardHeader className="bg-primary/5 border-b py-2 px-4">
            <CardTitle className="text-xs font-bold">ऑफिस वर्क (Office Work)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "दुग्ध नमुना नोंद तपासणी", "दरपत्रक तपासणी / मंजुरी", "बिलिंग / पेमेंट मंजुरी", 
                "संकलन रजिस्टर तपासणी", "बर्फ वाढवणे/कमी करणे", "ई-मेल / पत्रव्यवहार", 
                "कॉल करणे", "वास दूध नोंदणी", "ERP कामकाज"
              ].map((task) => (
                <div key={task} className="flex items-center space-x-2 border p-1.5 rounded hover:bg-muted/30">
                  <Checkbox 
                    id={task} 
                    checked={formData.officeTasks.includes(task)} 
                    onCheckedChange={() => {
                      const current = formData.officeTasks;
                      const updated = current.includes(task) ? current.filter(t => t !== task) : [...current, task];
                      setFormData({...formData, officeTasks: updated});
                    }} 
                    className="h-3 w-3"
                  />
                  <Label htmlFor={task} className="text-[10px] cursor-pointer font-semibold">{task}</Label>
                </div>
              ))}
            </div>
            <Textarea 
              value={formData.officeTaskDetail} 
              onChange={e => setFormData({...formData, officeTaskDetail: e.target.value})} 
              placeholder="तपशील लिहा..." 
              className="min-h-[60px] text-[11px] py-1.5"
            />
          </CardContent>
        </Card>
      )}

      {/* Day Summary Section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden mt-4">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-xs font-bold">दिवसाचा सारांश (Day Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-green-600">कामगिरी (Achievements)</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="कामगिरी..." className="min-h-[60px] text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-red-600">समस्या (Problems)</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="समस्या..." className="min-h-[60px] text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-blue-600">कार्यवाही (Actions Taken)</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} placeholder="कार्यवाही..." className="min-h-[60px] text-[11px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase">सुपरवायझरचे नाव</Label>
              <Input className="h-10 text-sm font-bold border-primary/20" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} placeholder="Supervisor Name" />
            </div>
            <div className="flex gap-2 items-end no-print">
              <Button onClick={handleSave} className="flex-1 h-10 font-bold text-[12px] gap-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> रिपोर्ट जतन करा (Save Report)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
