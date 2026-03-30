
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, Truck, AlertTriangle, Milk, User, IndianRupee, RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

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
    vehicleNo: "", vehicleType: "", capacity: "", driverName: "", mobile: "", routeName: "",
    totalMilk: "", breakdownTime: "", location: "", reason: "ENGINE",
    milkHot: "NO", milkSour: "NO",
    lossAmount: "0"
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
      setFormData(existingReport.fullData)
    }
  }, [existingReport])

  const handleSave = () => {
    if (!db || !user || !formData.vehicleNo) {
      toast({ title: "त्रुटी", description: "वाहन क्रमांक आवश्यक आहे.", variant: "destructive" })
      return
    }

    const reportData = {
      type: 'Transport Breakdown Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ब्रेकडाऊन: ${formData.vehicleNo}. नुकसान: ₹${formData.lossAmount}. कारण: ${formData.reason}.`,
      overallSummary: `वाहन: ${formData.vehicleNo}, ड्रायव्हर: ${formData.driverName}, एकूण नुकसान: ₹${formData.lossAmount}`,
      fullData: { ...formData },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5 text-rose-600"><Truck className="h-3.5 w-3.5" /> {editId ? 'ब्रेकडाऊन अपडेट' : 'ब्रेकडाऊन (BREAKDOWN)'}</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <User className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">वाहन व ड्रायव्हर</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">वाहन क्रमांक *</Label><Input className="compact-input" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} placeholder="MH 50..." /></div>
            <div className="space-y-0.5"><Label className="compact-label">ड्रायव्हर नाव *</Label><Input className="compact-input" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">क्षमता (L)</Label><Input className="compact-input" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">रूट / गाव</Label><Input className="compact-input" value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50/30">
          <div className="flex items-center gap-1.5 border-b border-rose-200 pb-1 mb-2">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            <h3 className="text-[9px] font-black uppercase text-rose-600 tracking-widest">ब्रेकडाऊन तपशील</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">वेळ</Label><Input type="time" className="compact-input" value={formData.breakdownTime} onChange={e => setFormData({...formData, breakdownTime: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">लोकेशन</Label><Input className="compact-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            </div>
            <div className="space-y-1">
              <Label className="compact-label text-[8px]">कारण (REASON)</Label>
              <RadioGroup value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})} className="flex flex-wrap gap-1.5">
                {['ENGINE', 'TYRE', 'FUEL', 'ACCIDENT', 'OTHER'].map(o => <div key={o} className="compact-radio-item p-1 border-rose-100"><RadioGroupItem value={o} id={`br-${o}`} className="h-2 w-2"/><Label htmlFor={`br-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-amber-50/30">
          <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1 mb-2">
            <Milk className="h-3 w-3 text-amber-600" />
            <h3 className="text-[9px] font-black uppercase text-amber-600 tracking-widest">दुधावर परिणाम</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-1 bg-white rounded-lg border border-amber-100">
              <span className="text-[8px] font-black uppercase px-1">दूध गरम झाले?</span>
              <RadioGroup value={formData.milkHot} onValueChange={v => setFormData({...formData, milkHot: v})} className="flex gap-1.5">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="h-y" className="h-2 w-2"/><Label htmlFor="h-y" className="text-[7px]">Y</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="h-n" className="h-2 w-2"/><Label htmlFor="h-n" className="text-[7px]">N</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between p-1 bg-white rounded-lg border border-amber-100">
              <span className="text-[8px] font-black uppercase px-1">दूध आंबट झाले?</span>
              <RadioGroup value={formData.milkSour} onValueChange={v => setFormData({...formData, milkSour: v})} className="flex gap-1.5">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="s-y" className="h-2 w-2"/><Label htmlFor="s-y" className="text-[7px]">Y</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="s-n" className="h-2 w-2"/><Label htmlFor="s-n" className="text-[7px]">N</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50 border-rose-100">
          <div className="space-y-1">
            <Label className="compact-label text-rose-600 font-black flex items-center gap-1"><IndianRupee className="h-3 w-3" /> एकूण नुकसान रक्कम (LOSS)</Label>
            <Input className="h-10 text-rose-700 font-black text-xl bg-white border-rose-200" type="number" value={formData.lossAmount} onChange={e => setFormData({...formData, lossAmount: e.target.value})} />
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-rose-600 text-white shadow-lg mb-10 h-11 uppercase font-black tracking-widest">
          {editId ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {editId ? 'ब्रेकडाऊन अपडेट करा' : 'ब्रेकडाऊन अहवाल जतन करा'}
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
