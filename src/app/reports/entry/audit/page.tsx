
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, Save, ClipboardCheck, Microscope, FlaskConical, AlertCircle, Warehouse, Milk, Settings, Droplets, Laptop, Zap, Sun, Box, History, Thermometer
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
    centerName: "", centerCode: "", ownerName: "", mobile: "", address: "", fssaiNo: "", validDate: "",
    producers: "", avgTemp: "", totalMilk: "",
    mornCow: "", mornBuf: "", eveCow: "", eveBuf: "",
    quality: { cowFat: "", bufFat: "", cowSnf: "", bufSnf: "", temp: "" },
    tests: { sugar: "NEG", soda: "NEG", cob: "NEG", mbrt: "", acidity: "", density: "" },
    equipment: { tester: "", calibrationDate: "", calibrated: "YES", cooling: "YES", other: "" },
    hygiene: { center: true, floor: true, drainage: true, staff: true, equipment: true, waste: true },
    structure: { building: "GOOD", electric: "REGULAR" },
    auditResult: "EXCELLENT", recommendations: "", nextAuditDate: "", repName: ""
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
      summary: `ऑडिट: ${formData.centerName}. निकाल: ${formData.auditResult}. दूध: ${formData.totalMilk}L. फॅट: C-${formData.quality.cowFat}/B-${formData.quality.bufFat}.`,
      overallSummary: `केंद्र: ${formData.centerName}, कोड: ${formData.centerCode}, ऑडिट निकाल: ${formData.auditResult}`,
      fullData: { ...formData, auditor: user.displayName || "Quality Auditor" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "ऑडिट अहवाल जतन झाला." })
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
    <div className="compact-form-container px-2 pb-20 max-w-[500px] mx-auto">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><Microscope className="h-3.5 w-3.5 text-primary" /> केंद्र ऑडिट (AUDIT)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Warehouse} title="१) केंद्राची मूलभूत माहिती (GENERAL)" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-8" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">केंद्र कोड *</Label><Input className="compact-input h-8" value={formData.centerCode} onChange={e => setFormData({...formData, centerCode: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-8" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI क्र.</Label><Input className="compact-input h-8" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">वैधता मुदत</Label><Input type="date" className="compact-input h-8" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-blue-50/20 border-blue-100">
          <SectionTitle icon={History} title="२) दैनिक संकलन माहिती (STATS)" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-0.5"><Label className="compact-label text-[8px]">उत्पादक संख्या</Label><Input className="compact-input h-7" value={formData.producers} onChange={e => setFormData({...formData, producers: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-[8px]">एकूण संकलन (L)</Label><Input className="compact-input h-7 font-black" value={formData.totalMilk} onChange={e => setFormData({...formData, totalMilk: e.target.value})} /></div>
          </div>
          <div className="responsive-table-wrapper">
            <table className="w-full text-[8px]">
              <thead className="bg-blue-100/50">
                <tr className="font-black uppercase tracking-tighter"><th className="p-1">SHIFT</th><th className="p-1">COW (L)</th><th className="p-1">BUF (L)</th></tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr><td className="p-1 font-bold">MORN</td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5 border-none bg-white" value={formData.mornCow} onChange={e => setFormData({...formData, mornCow: e.target.value})} /></td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5 border-none bg-white" value={formData.mornBuf} onChange={e => setFormData({...formData, mornBuf: e.target.value})} /></td></tr>
                <tr><td className="p-1 font-bold">EVE</td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5 border-none bg-white" value={formData.eveCow} onChange={e => setFormData({...formData, eveCow: e.target.value})} /></td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5 border-none bg-white" value={formData.eveBuf} onChange={e => setFormData({...formData, eveBuf: e.target.value})} /></td></tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={FlaskConical} title="३) गुणवत्ता व चाचण्या (QUALITY)" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <Label className="text-[8px] font-black text-slate-500">COW (F/S)</Label>
              <div className="flex gap-1"><Input className="h-7 text-[9px] text-center" placeholder="FAT" value={formData.quality.cowFat} onChange={e => setFormData({...formData, quality: {...formData.quality, cowFat: e.target.value}})} /><Input className="h-7 text-[9px] text-center" placeholder="SNF" value={formData.quality.cowSnf} onChange={e => setFormData({...formData, quality: {...formData.quality, cowSnf: e.target.value}})} /></div>
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black text-slate-500">BUF (F/S)</Label>
              <div className="flex gap-1"><Input className="h-7 text-[9px] text-center" placeholder="FAT" value={formData.quality.bufFat} onChange={e => setFormData({...formData, quality: {...formData.quality, bufFat: e.target.value}})} /><Input className="h-7 text-[9px] text-center" placeholder="SNF" value={formData.quality.bufSnf} onChange={e => setFormData({...formData, quality: {...formData.quality, bufSnf: e.target.value}})} /></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-dashed pt-2">
            {[
              { l: 'SUGAR', k: 'sugar' }, { l: 'SODA', k: 'soda' }, { l: 'COB', k: 'cob' }
            ].map(it => (
              <div key={it.k} className="space-y-1">
                <Label className="text-[7px] font-black opacity-50">{it.l} TEST</Label>
                <RadioGroup value={(formData.tests as any)[it.k]} onValueChange={v => setFormData({...formData, tests: {...formData.tests, [it.k]: v}})} className="flex gap-1">
                  <div className="flex items-center gap-0.5"><RadioGroupItem value="NEG" className="h-2 w-2"/><Label className="text-[7px]">NEG</Label></div>
                  <div className="flex items-center gap-0.5"><RadioGroupItem value="POS" className="h-2 w-2"/><Label className="text-[7px]">POS</Label></div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-0.5"><Label className="text-[7px] font-black">MBRT (MIN)</Label><Input className="h-7 text-[9px] p-1" value={formData.tests.mbrt} onChange={e => setFormData({...formData, tests: {...formData.tests, mbrt: e.target.value}})} /></div>
            <div className="space-y-0.5"><Label className="text-[7px] font-black">ACIDITY%</Label><Input className="h-7 text-[9px] p-1" value={formData.tests.acidity} onChange={e => setFormData({...formData, tests: {...formData.tests, acidity: e.target.value}})} /></div>
            <div className="space-y-0.5"><Label className="text-[7px] font-black">DENSITY</Label><Input className="h-7 text-[9px] p-1" value={formData.tests.density} onChange={e => setFormData({...formData, tests: {...formData.tests, density: e.target.value}})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Droplets} title="४) स्वच्छता चेकलिस्ट (HYGIENE)" />
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { l: 'केंद्र स्वच्छ', k: 'center' }, { l: 'मजला स्वच्छ', k: 'floor' },
              { l: 'ड्रेन सिस्टीम', k: 'drainage' }, { l: 'कर्मचारी स्वच्छ', k: 'staff' },
              { l: 'उपकरणे स्वच्छ', k: 'equipment' }, { l: 'कचरा व्य.', k: 'waste' }
            ].map(it => (
              <div key={it.k} className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                <Checkbox checked={(formData.hygiene as any)[it.k]} onCheckedChange={v => setFormData({...formData, hygiene: {...formData.hygiene, [it.k]: !!v}})} className="h-3 w-3" />
                <span className="text-[7.5px] font-black uppercase tracking-tighter">{it.l}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3 bg-amber-50/20 border-amber-100">
          <SectionTitle icon={AlertCircle} title="५) ऑडिट निकाल (RESULT)" />
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="compact-label">एकूण ऑडिट निकाल</Label>
              <RadioGroup value={formData.auditResult} onValueChange={v => setFormData({...formData, auditResult: v})} className="flex flex-wrap gap-1.5">
                {['EXCELLENT', 'GOOD', 'NEEDS IMP.', 'POOR'].map(o => <div key={o} className="compact-radio-item p-1 border-primary/10 bg-white"><RadioGroupItem value={o} id={`res-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`res-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">शिफारसी व सुधारणा</Label><Textarea className="compact-input h-14 p-2 text-[10px]" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} placeholder="..." /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">पुढील ऑडिट तारीख</Label><Input type="date" className="compact-input h-8" value={formData.nextAuditDate} onChange={e => setFormData({...formData, nextAuditDate: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">प्रतिनिधी नाव</Label><Input className="compact-input h-8" value={formData.repName} onChange={e => setFormData({...formData, repName: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-11 uppercase font-black transition-all active:scale-95">
          ऑडिट जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
