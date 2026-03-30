
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, Truck, AlertTriangle, Milk, User, IndianRupee, RefreshCw, Plus, X, MapPin, Clock, Phone, Settings, Wrench
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"
import { Textarea } from "@/components/ui/textarea"

interface CenterLoss {
  id: string;
  centerCode: string;
  centerName: string;
  qtyLiters: string;
  lossAmount: string;
}

function BreakdownReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: "", 
    vehicleType: "TEMPO", 
    capacity: "", 
    driverName: "", 
    mobile: "", 
    routeName: "",
    breakdownTime: "", 
    location: "", 
    reason: "ENGINE",
    severity: "MINOR", // NEW
    detailedReason: "", // NEW
    milkHot: "NO", 
    milkSour: "NO",
    alternateArrangement: "YES",
    recoveryVehicleNo: "", // NEW
    recoveryArrivalTime: "", // NEW
    estimatedRepairTime: "", // NEW
    estimatedRepairCost: "0", // NEW
    lossAmount: "0",
    centerLosses: [] as CenterLoss[]
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({
        ...prev,
        ...existingReport.fullData
      }))
    }
  }, [existingReport])

  const addCenterRow = () => {
    const newRow: CenterLoss = { id: crypto.randomUUID(), centerCode: "", centerName: "", qtyLiters: "", lossAmount: "" }
    setFormData({ ...formData, centerLosses: [...formData.centerLosses, newRow] })
  }

  const removeCenterRow = (id: string) => {
    setFormData({ ...formData, centerLosses: formData.centerLosses.filter(c => c.id !== id) })
  }

  const updateCenterRow = (id: string, updates: Partial<CenterLoss>) => {
    setFormData({ ...formData, centerLosses: formData.centerLosses.map(c => c.id === id ? { ...c, ...updates } : c) })
  }

  const handleSave = () => {
    if (!db || !user || !formData.vehicleNo) {
      toast({ title: "त्रुटी", description: "वाहन क्रमांक आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalCalculatedLoss = formData.centerLosses.reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
    
    const reportData = {
      type: 'Transport Breakdown Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ब्रेकडाऊन: ${formData.vehicleNo}. रूट: ${formData.routeName}. नुकसान: ₹${totalCalculatedLoss || formData.lossAmount}. पर्यायी सोय: ${formData.recoveryVehicleNo || '-'}.`,
      overallSummary: `वाहन: ${formData.vehicleNo}, ड्रायव्हर: ${formData.driverName}, नुकसान: ₹${totalCalculatedLoss || formData.lossAmount}`,
      fullData: { ...formData, lossAmount: totalCalculatedLoss > 0 ? String(totalCalculatedLoss) : formData.lossAmount },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल अद्ययावत झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container px-2 max-w-[550px] mx-auto pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5 text-rose-600"><Truck className="h-4 w-4" /> {editId ? 'ब्रेकडाऊन अपडेट' : 'ब्रेकडाऊन अहवाल'}</h2>
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-muted-foreground/10 shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <User className="h-3 w-3 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) वाहन व ड्रायव्हर माहिती</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">वाहन क्र. *</Label><Input className="compact-input h-9" value={formData.vehicleNo || ""} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} placeholder="MH 12..." /></div>
            <div className="space-y-0.5"><Label className="compact-label">गाडीचा प्रकार</Label>
              <RadioGroup value={formData.vehicleType || "TEMPO"} onValueChange={v => setFormData({...formData, vehicleType: v})} className="flex gap-2 mt-1">
                <div className="flex items-center gap-1 bg-muted/20 px-2 py-1 rounded-md"><RadioGroupItem value="TEMPO" id="v-t" className="h-2.5 w-2.5"/><Label htmlFor="v-t" className="text-[8px] font-black">TEMPO</Label></div>
                <div className="flex items-center gap-1 bg-muted/20 px-2 py-1 rounded-md"><RadioGroupItem value="PICKUP" id="v-p" className="h-2.5 w-2.5"/><Label htmlFor="v-p" className="text-[8px] font-black">PICKUP</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">ड्रायव्हरचे नाव</Label><Input className="compact-input h-9" value={formData.driverName || ""} onChange={e => setFormData({...formData, driverName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">मोबाईल नंबर</Label><Input className="compact-input h-9" value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">रूटचे नाव</Label><Input className="compact-input h-9" value={formData.routeName || ""} onChange={e => setFormData({...formData, routeName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">गाडी क्षमता (L)</Label><Input className="compact-input h-9" value={formData.capacity || ""} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50/20 border-rose-100">
          <div className="flex items-center gap-1.5 border-b border-rose-200 pb-1 mb-2">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            <h3 className="text-[10px] font-black uppercase text-rose-600 tracking-widest">२) ब्रेकडाऊन तपशील</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label flex items-center gap-1"><Clock className="h-2 w-2" /> बिघाड वेळ</Label><Input type="time" className="compact-input h-9 bg-white" value={formData.breakdownTime || ""} onChange={e => setFormData({...formData, breakdownTime: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label flex items-center gap-1"><MapPin className="h-2 w-2" /> बिघाड ठिकाण</Label><Input className="compact-input h-9 bg-white" value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            </div>
            
            <div className="space-y-1">
              <Label className="compact-label">बिघाडाचे स्वरूप (Severity)</Label>
              <RadioGroup value={formData.severity || "MINOR"} onValueChange={v => setFormData({...formData, severity: v})} className="flex gap-3">
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-rose-100"><RadioGroupItem value="MINOR" id="sev-min" className="h-2.5 w-2.5"/><Label htmlFor="sev-min" className="text-[8px] font-black text-amber-600">छोटा (MINOR)</Label></div>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-rose-100"><RadioGroupItem value="MAJOR" id="sev-maj" className="h-2.5 w-2.5"/><Label htmlFor="sev-maj" className="text-[8px] font-black text-rose-600">मोठा (MAJOR)</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-1">
              <Label className="compact-label">बिघाडाचे कारण</Label>
              <RadioGroup value={formData.reason || "ENGINE"} onValueChange={v => setFormData({...formData, reason: v})} className="flex flex-wrap gap-1.5">
                {['ENGINE', 'TYRE', 'FUEL', 'ACCIDENT', 'OTHER'].map(o => (
                  <div key={o} className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                    <RadioGroupItem value={o} id={`br-${o}`} className="h-2.5 w-2.5"/>
                    <Label htmlFor={`br-${o}`} className="text-[8px] font-black">{o}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-0.5">
              <Label className="compact-label">कारणाचे सविस्तर वर्णन</Label>
              <Textarea className="compact-input h-16 p-2 bg-white" value={formData.detailedReason || ""} onChange={e => setFormData({...formData, detailedReason: e.target.value})} placeholder="..." />
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 border-primary/10">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Settings className="h-3 w-3 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">३) दुरुस्ती व पर्यायी सोय</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <Label className="compact-label">दुरुस्तीसाठी लागणारा वेळ</Label>
              <Input className="compact-input h-9" value={formData.estimatedRepairTime || ""} onChange={e => setFormData({...formData, estimatedRepairTime: e.target.value})} placeholder="उदा. 4 तास" />
            </div>
            <div className="space-y-0.5">
              <Label className="compact-label">अंदाजे खर्च (₹)</Label>
              <Input type="number" className="compact-input h-9" value={formData.estimatedRepairCost || "0"} onChange={e => setFormData({...formData, estimatedRepairCost: e.target.value})} />
            </div>
            <div className="space-y-0.5">
              <Label className="compact-label">पर्यायी गाडी क्र.</Label>
              <Input className="compact-input h-9" value={formData.recoveryVehicleNo || ""} onChange={e => setFormData({...formData, recoveryVehicleNo: e.target.value})} placeholder="MH..." />
            </div>
            <div className="space-y-0.5">
              <Label className="compact-label">पर्यायी गाडी वेळ</Label>
              <Input type="time" className="compact-input h-9" value={formData.recoveryArrivalTime || ""} onChange={e => setFormData({...formData, recoveryArrivalTime: e.target.value})} />
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-amber-50/20 border-amber-100">
          <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1 mb-2">
            <Milk className="h-3 w-3 text-amber-600" />
            <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest">४) दुधाची स्थिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 shadow-sm">
              <span className="text-[9px] font-black uppercase">दूध गरम झाले का?</span>
              <RadioGroup value={formData.milkHot || "NO"} onValueChange={v => setFormData({...formData, milkHot: v})} className="flex gap-3">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="mh-y" className="h-2.5 w-2.5"/><Label htmlFor="mh-y" className="text-[8px] font-black">हो</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="mh-n" className="h-2.5 w-2.5"/><Label htmlFor="mh-n" className="text-[8px] font-black">नाही</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 shadow-sm">
              <span className="text-[9px] font-black uppercase">दूध खराब/आंबट झाले?</span>
              <RadioGroup value={formData.milkSour || "NO"} onValueChange={v => setFormData({...formData, milkSour: v})} className="flex gap-3">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="ms-y" className="h-2.5 w-2.5"/><Label htmlFor="ms-y" className="text-[8px] font-black">हो</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="ms-n" className="h-2.5 w-2.5"/><Label htmlFor="ms-n" className="text-[8px] font-black">नाही</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> नुकसान तपशील (CENTER LOG)</span>
            <Button type="button" size="sm" onClick={addCenterRow} className="h-7 text-[9px] bg-rose-600 font-black uppercase rounded-lg shadow-md"><Plus className="h-3 w-3 mr-1" /> केंद्र जोडा</Button>
          </div>
          <div className="space-y-2">
            {formData.centerLosses.map((row, index) => (
              <Card key={row.id} className="compact-card p-2.5 bg-muted/5 border-muted-foreground/10 relative shadow-inner">
                <Button variant="ghost" size="icon" onClick={() => removeCenterRow(row.id)} className="absolute top-1 right-1 h-6 w-6 text-rose-400"><X className="h-3.5 w-3.5" /></Button>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="space-y-0.5">
                    <Label className="text-[8px] font-black uppercase opacity-60">कोड/नाव</Label>
                    <div className="flex gap-1">
                      <Input className="h-8 text-[10px] bg-white border-none rounded-lg w-12 text-center font-black" placeholder="ID" value={row.centerCode || ""} onChange={e => updateCenterRow(row.id, { centerCode: e.target.value })} />
                      <Input className="h-8 text-[10px] bg-white border-none rounded-lg flex-1 font-bold" placeholder="केंद्राचे नाव" value={row.centerName || ""} onChange={e => updateCenterRow(row.id, { centerName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">दूध (L)</Label><Input type="number" className="h-8 text-[10px] bg-white border-none rounded-lg text-center font-black" value={row.qtyLiters || ""} onChange={e => updateCenterRow(row.id, { qtyLiters: e.target.value })} /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase text-rose-600">नुकसान ₹</Label><Input type="number" className="h-8 text-[10px] bg-rose-50 border-none rounded-lg text-center font-black text-rose-700" value={row.lossAmount || ""} onChange={e => updateCenterRow(row.id, { lossAmount: e.target.value })} /></div>
                  </div>
                </div>
              </Card>
            ))}
            {formData.centerLosses.length === 0 && (
              <div className="text-center py-6 bg-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/10 italic text-[9px] font-bold text-muted-foreground uppercase tracking-widest">नुकसानीची नोंद करण्यासाठी वरील बटण दाबा</div>
            )}
          </div>
        </div>

        <AIGuidanceCard context={formData.detailedReason || formData.reason} formType="breakdown" />

        <Button onClick={handleSave} className="compact-button w-full bg-rose-600 text-white shadow-xl shadow-rose-200 mt-4 mb-10 h-12 uppercase font-black tracking-[0.2em] transition-all active:scale-95">
          {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {editId ? 'अहवाल अद्ययावत करा' : 'अहवाल जतन करा'}
        </Button>
      </div>
    </div>
  )
}

export default function BreakdownReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <BreakdownReportForm />
    </Suspense>
  )
}
