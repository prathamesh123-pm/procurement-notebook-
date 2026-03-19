
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, Microscope, Warehouse, Milk, CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function AuditReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", centerCode: "", auditDate: new Date().toISOString().split('T')[0],
    morningQty: "", eveningQty: "",
    fat: "", snf: "",
    result: "GOOD"
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "केंद्राचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    const report = {
      type: 'Collection Center Audit',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ऑडिट: ${formData.centerName}. निकाल: ${formData.result}. दूध: ${Number(formData.morningQty) + Number(formData.eveningQty)}L.`,
      overallSummary: `केंद्र: ${formData.centerName}, कोड: ${formData.centerCode}, निकाल: ${formData.result}`,
      fullData: { ...formData },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "ऑडिट अहवाल जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><Microscope className="h-3.5 w-3.5 text-primary" /> केंद्र ऑडिट (AUDIT)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Warehouse className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">केंद्राची माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">केंद्र कोड</Label><Input className="compact-input" value={formData.centerCode} onChange={e => setFormData({...formData, centerCode: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">ऑडिट तारीख</Label><Input type="date" className="compact-input" value={formData.auditDate} onChange={e => setFormData({...formData, auditDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-blue-50/20 border-blue-100">
          <div className="flex items-center gap-1.5 border-b border-blue-200 pb-1 mb-2">
            <Milk className="h-3 w-3 text-blue-600" />
            <h3 className="text-[9px] font-black uppercase text-blue-600 tracking-widest">दूध संकलन (MILK)</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label text-[8px]">सकाळचे संकलन (L)</Label><Input className="compact-input h-8" value={formData.morningQty} onChange={e => setFormData({...formData, morningQty: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-[8px]">संध्याकाळचे संकलन (L)</Label><Input className="compact-input h-8" value={formData.eveningQty} onChange={e => setFormData({...formData, eveningQty: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Microscope className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">गुणवत्ता तपासणी (QUALITY)</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">फॅट (%)</Label><Input className="compact-input h-8" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">SNF (%)</Label><Input className="compact-input h-8" value={formData.snf} onChange={e => setFormData({...formData, snf: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-emerald-50/20 border-emerald-100">
          <div className="flex items-center gap-1.5 border-b border-emerald-200 pb-1 mb-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <h3 className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">अंतिम निकाल (RESULT)</h3>
          </div>
          <RadioGroup value={formData.result} onValueChange={v => setFormData({...formData, result: v})} className="flex flex-wrap gap-2">
            {['GOOD', 'IMPROVE', 'BAD'].map(o => <div key={o} className="compact-radio-item p-1.5 border-emerald-100 bg-white"><RadioGroupItem value={o} id={`r-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`r-${o}`} className="compact-radio-label">{o}</Label></div>)}
          </RadioGroup>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg mb-10 h-11 uppercase font-black">
          ऑडिट जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
