
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, Truck, AlertTriangle, Milk, PlusCircle, X, History, MapPin
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function BreakdownReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: "", vehicleType: "", capacity: "", driverName: "", mobile: "", routeName: "",
    totalMilk: "", loadTemp: "", fat: "", snf: "",
    breakdownTime: "", location: "", reason: "ENGINE",
    milkStatus: { gotHot: "NO", gotSour: "NO" },
    centerLosses: [{ id: "1", gavaliName: "", centerName: "", bufLtrs: "", cowLtrs: "", bufRs: "", cowRs: "" }],
    totalLossAmount: "0", transportDeduction: "", approvedAmount: ""
  })

  useEffect(() => setMounted(true), [])

  const addCenterRow = () => {
    setFormData({...formData, centerLosses: [...formData.centerLosses, { id: Date.now().toString(), gavaliName: "", centerName: "", bufLtrs: "", cowLtrs: "", bufRs: "", cowRs: "" }]})
  }

  const removeCenterRow = (id: string) => {
    if (formData.centerLosses.length > 1) {
      setFormData({...formData, centerLosses: formData.centerLosses.filter(c => c.id !== id)})
    }
  }

  const updateCenterLoss = (id: string, field: string, val: string) => {
    setFormData({...formData, centerLosses: formData.centerLosses.map(c => c.id === id ? {...c, [field]: val} : c)})
  }

  const handleSave = () => {
    if (!db || !user || !formData.vehicleNo) return
    const report = {
      type: 'Transport Breakdown Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ब्रेकडाऊन: ${formData.vehicleNo}. रूट: ${formData.routeName}. नुकसान: ₹${formData.totalLossAmount}.`,
      overallSummary: `वाहन: ${formData.vehicleNo}, ड्रायव्हर: ${formData.driverName}, कारण: ${formData.reason}, एकूण नुकसान: ₹${formData.totalLossAmount}`,
      fullData: { ...formData, name: user.displayName || "Transport Manager" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
      <Icon className="h-3 w-3 text-primary" />
      <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">{title}</h3>
    </div>
  )

  return (
    <div className="compact-form-container px-2 pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5 text-rose-600"><Truck className="h-3.5 w-3.5" /> ब्रेकडाऊन रिपोर्ट (BREAKDOWN)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={History} title="१) वाहन व ड्रायव्हर माहिती" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">वाहन क्रमांक *</Label><Input className="compact-input h-8" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">ड्रायव्हर नाव *</Label><Input className="compact-input h-8" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">रूट / गाव</Label><Input className="compact-input h-8" value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">एकूण दूध (L)</Label><Input className="compact-input h-8" type="number" value={formData.totalMilk} onChange={e => setFormData({...formData, totalMilk: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={AlertTriangle} title="२) ब्रेकडाऊन तपशील" />
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">वेळ</Label><Input type="time" className="compact-input h-8" value={formData.breakdownTime} onChange={e => setFormData({...formData, breakdownTime: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">लोकेशन</Label><Input className="compact-input h-8" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            </div>
            <div className="space-y-1">
              <Label className="compact-label">कारण (Reason)</Label>
              <RadioGroup value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})} className="flex flex-wrap gap-1.5">
                {['ENGINE', 'PUNCTURE', 'FUEL', 'ACCIDENT', 'OTHER'].map(o => <div key={o} className="compact-radio-item p-1"><RadioGroupItem value={o} id={`br-${o}`} /><Label htmlFor={`br-${o}`} className="text-[8px] font-black">{o}</Label></div>)}
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="३) नुकसान तपशील (Center Wise)" />
          <div className="space-y-2">
            {formData.centerLosses.map((c, i) => (
              <div key={c.id} className="p-2 border rounded-lg bg-slate-50 relative group space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">Center {i+1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeCenterRow(c.id)} className="h-5 w-5 text-rose-400"><X className="h-3 w-3"/></Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="गवळ्याचे नाव" className="h-7 text-[9px] p-1 bg-white" value={c.gavaliName} onChange={e => updateCenterLoss(c.id, 'gavaliName', e.target.value)} />
                  <Input placeholder="केंद्र नाव" className="h-7 text-[9px] p-1 bg-white" value={c.centerName} onChange={e => updateCenterLoss(c.id, 'centerName', e.target.value)} />
                  <div className="flex gap-1">
                    <Input placeholder="Buf L" className="h-7 text-[9px] p-1 bg-white w-full" value={c.bufLtrs} onChange={e => updateCenterLoss(c.id, 'bufLtrs', e.target.value)} />
                    <Input placeholder="Buf ₹" className="h-7 text-[9px] p-1 bg-white w-full" value={c.bufRs} onChange={e => updateCenterLoss(c.id, 'bufRs', e.target.value)} />
                  </div>
                  <div className="flex gap-1">
                    <Input placeholder="Cow L" className="h-7 text-[9px] p-1 bg-white w-full" value={c.cowLtrs} onChange={e => updateCenterLoss(c.id, 'cowLtrs', e.target.value)} />
                    <Input placeholder="Cow ₹" className="h-7 text-[9px] p-1 bg-white w-full" value={c.cowRs} onChange={e => updateCenterLoss(c.id, 'cowRs', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCenterRow} className="w-full h-8 text-[9px] font-black uppercase border-dashed border-primary/30 text-primary">
              <PlusCircle className="h-3 w-3 mr-1" /> केंद्र जोडा (ADD CENTER)
            </Button>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50 border-rose-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">एकूण नुकसान (₹)</Label><Input className="h-8 text-rose-700 font-black text-lg bg-white" type="number" value={formData.totalLossAmount} onChange={e => setFormData({...formData, totalLossAmount: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">वाहतूकदार कपात (₹)</Label><Input className="h-8 text-rose-700 font-black bg-white" type="number" value={formData.transportDeduction} onChange={e => setFormData({...formData, transportDeduction: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-rose-600 text-white shadow-lg shadow-rose-200 mb-10 h-10 font-black uppercase">
          ब्रेकडाऊन रिपोर्ट जतन करा
        </Button>
      </div>
    </div>
  )
}
