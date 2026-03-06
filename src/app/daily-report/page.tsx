
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  ClipboardCheck, User, Truck, Plus, Trash2, Hash, CheckCircle2
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
    const reportSummary = `रूट व्हिजिट: ${formData.routeVisitLogs.length} गवळी/सेंटर. वाहन: ${formData.vehicleNumber}.`
    
    const newReport = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      type: "Route Visit",
      date: formData.reportDate,
      workItemsCount: formData.routeVisitLogs.length,
      interactionsCount: formData.routeVisitLogs.length,
      summary: reportSummary,
      fullData: { ...formData, reportType: 'route' }
    }

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    
    toast({ title: "अहवाल जतन केला", description: `रूट व्हिजिट अहवाल यशस्वीरित्या सेव्ह झाला आहे.` })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-0.5 border-b pb-2">
        <h2 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> 
          संकलन विभाग - दैनिक कामकाज अहवाल (Route Visit)
        </h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Collection Department - Daily Work Report</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary" /> १) प्रतिनिधीची मूलभूत माहिती (Basic Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
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
              <Hash className="h-3.5 w-3.5 text-primary" /> रूट व्हिजिट लॉग (Route Visit Log)
            </CardTitle>
            <Button size="sm" onClick={addRouteEntry} className="h-7 text-[10px] font-bold gap-1 px-3">
              <Plus className="h-3 w-3" /> गवळी जोडा
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-muted/50 border-b text-center uppercase tracking-tighter">
                  <th className="p-2 border-r w-10">Sr.</th>
                  <th className="p-2 border-r min-w-[80px]">सेंटर कोड</th>
                  <th className="p-2 border-r min-w-[120px]">गवल्याचे नाव</th>
                  <th className="p-2 border-r w-20">दिलेला बर्फ</th>
                  <th className="p-2 border-r w-24">पोहोचलेली वेळ</th>
                  <th className="p-2 border-r w-24">निघालेली वेळ</th>
                  <th className="p-2 border-r w-16">उतरलेले कॅन</th>
                  <th className="p-2 border-r w-16">भरलेले कॅन</th>
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
                      <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="time" value={entry.departureTime} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} />
                    </td>
                    <td className="p-1 border-r">
                      <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.emptyCans} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} placeholder="E" />
                    </td>
                    <td className="p-1 border-r">
                      <Input className="h-7 text-[10px] border-none shadow-none focus-visible:ring-0 px-1 text-center" type="number" value={entry.fullCans} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} placeholder="F" />
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
