
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
  ArrowLeft, Save, ClipboardCheck, Microscope, FlaskConical, AlertCircle, Warehouse, Milk, Settings, Droplets
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
    producerCount: "", avgTemp: "", totalMilk: "",
    mornCow: "", mornBuf: "", eveCow: "", eveBuf: "",
    quality: { cowFat: "", bufFat: "", cowSnf: "", bufSnf: "", temp: "" },
    chemicalTests: { sugar: "NEG", soda: "NEG", cob: "NEG", mbrt: "", acidity: "", density: "" },
    equipment: { tester: "", calibrationDate: "", calibrated: "YES", cooling: "YES", other: "" },
    hygiene: { center: "OK", floor: "OK", drainage: "OK", staff: "OK", equipment: "OK", waste: "OK" },
    buildingStatus: "GOOD", electricSupply: "YES",
    inspector: "", designation: "", auditResult: "EXCELLENT", recommendations: "", nextAuditDate: ""
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
      summary: `ऑडिट: ${formData.centerName}. निकाल: ${formData.auditResult}. फॅट: C-${formData.quality.cowFat}/B-${formData.quality.bufFat}.`,
      overallSummary: `केंद्र: ${formData.centerName}, कोड: ${formData.centerCode}, निकाल: ${formData.auditResult}, निरीक्षक: ${formData.inspector}`,
      fullData: { ...formData },
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
    <div className="compact-form-container px-2 pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><Microscope className="h-3.5 w-3.5 text-primary" /> केंद्र ऑडिट (AUDIT FORM)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Warehouse} title="१) केंद्राची मूलभूत माहिती" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5 col-span-2"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-8" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">केंद्र कोड *</Label><Input className="compact-input h-8" value={formData.centerCode} onChange={e => setFormData({...formData, centerCode: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-8" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="२) दैनिक संकलन व गुणवत्ता" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-0.5"><Label className="compact-label">उत्पादक संख्या</Label><Input className="compact-input h-7" value={formData.producerCount} onChange={e => setFormData({...formData, producerCount: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">सरासरी तापमान</Label><Input className="compact-input h-7" value={formData.avgTemp} onChange={e => setFormData({...formData, avgTemp: e.target.value})} /></div>
          </div>
          <div className="responsive-table-wrapper">
            <table className="w-full text-[9px]">
              <thead className="bg-slate-50">
                <tr className="text-[8px] font-black uppercase"><th className="p-1 text-left">Shift</th><th className="p-1">Cow</th><th className="p-1">Buf</th></tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-1 font-bold">MORNING</td><td className="p-0.5"><Input className="h-6 text-center text-[9px]" value={formData.mornCow} onChange={e => setFormData({...formData, mornCow: e.target.value})} /></td><td className="p-0.5"><Input className="h-6 text-center text-[9px]" value={formData.mornBuf} onChange={e => setFormData({...formData, mornBuf: e.target.value})} /></td></tr>
                <tr><td className="p-1 font-bold">EVENING</td><td className="p-0.5"><Input className="h-6 text-center text-[9px]" value={formData.eveCow} onChange={e => setFormData({...formData, eveCow: e.target.value})} /></td><td className="p-0.5"><Input className="h-6 text-center text-[9px]" value={formData.eveBuf} onChange={e => setFormData({...formData, eveBuf: e.target.value})} /></td></tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={FlaskConical} title="३) रासायनिक चाचण्या (Tests)" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Sugar Test', key: 'sugar' },
              { label: 'Soda Test', key: 'soda' },
              { label: 'COB Test', key: 'cob' },
            ].map(it => (
              <div key={it.key} className="space-y-0.5">
                <Label className="text-[8px] font-black text-slate-500 uppercase">{it.label}</Label>
                <RadioGroup value={(formData.chemicalTests as any)[it.key]} onValueChange={v => setFormData({...formData, chemicalTests: {...formData.chemicalTests, [it.key]: v}})} className="flex gap-1.5">
                  <div className="flex items-center gap-1"><RadioGroupItem value="NEG" id={`${it.key}-n`} className="h-2 w-2"/><Label htmlFor={`${it.key}-n`} className="text-[8px]">NEG</Label></div>
                  <div className="flex items-center gap-1"><RadioGroupItem value="POS" id={`${it.key}-p`} className="h-2 w-2"/><Label htmlFor={`${it.key}-p`} className="text-[8px]">POS</Label></div>
                </RadioGroup>
              </div>
            ))}
            <div className="space-y-0.5"><Label className="text-[8px] font-black text-slate-500 uppercase">Acidity %</Label><Input className="h-7 text-[9px] p-1 bg-slate-50" value={formData.chemicalTests.acidity} onChange={e => setFormData({...formData, chemicalTests: {...formData.chemicalTests, acidity: e.target.value}})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Droplets} title="४) स्वच्छता व संरचना" />
          <div className="space-y-2">
            {[
              { label: 'केंद्र स्वच्छ?', key: 'center' },
              { label: 'मजला स्वच्छ?', key: 'floor' },
              { label: 'कर्मचारी स्वच्छ?', key: 'staff' },
              { label: 'कचरा व्यवस्थापन?', key: 'waste' },
            ].map(it => (
              <div key={it.key} className="flex justify-between items-center border-b border-dotted pb-1">
                <Label className="text-[9px] font-bold uppercase text-slate-600">{it.label}</Label>
                <RadioGroup value={(formData.hygiene as any)[it.key]} onValueChange={v => setFormData({...formData, hygiene: {...formData.hygiene, [it.key]: v}})} className="flex gap-2">
                  <div className="flex items-center gap-1"><RadioGroupItem value="OK" id={`hy-${it.key}-ok`} className="h-2 w-2"/><Label htmlFor={`hy-${it.key}-ok`} className="text-[8px]">HOY</Label></div>
                  <div className="flex items-center gap-1"><RadioGroupItem value="NOT" id={`hy-${it.key}-no`} className="h-2 w-2"/><Label htmlFor={`hy-${it.key}-no`} className="text-[8px]">NAHI</Label></div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <SectionTitle icon={AlertCircle} title="५) ऑडिट निकाल" />
          <div className="space-y-2">
            <div className="space-y-0.5"><Label className="compact-label">एकूण ऑडिट निकाल</Label>
              <RadioGroup value={formData.auditResult} onValueChange={v => setFormData({...formData, auditResult: v})} className="flex flex-wrap gap-1.5">
                {['EXCELLENT', 'GOOD', 'POOR', 'FAIL'].map(o => <div key={o} className="compact-radio-item p-1"><RadioGroupItem value={o} id={`res-${o}`} /><Label htmlFor={`res-${o}`} className="text-[8px] font-black">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">शिफारसी</Label><Textarea className="compact-input h-14 p-2 text-[10px]" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-10 font-black uppercase">
          ऑडिट जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
