
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
  ArrowLeft, Save, ShieldCheck, Microscope, Droplets, Zap, UserCheck, ClipboardCheck, Building
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function FSSAIInspectionPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", ownerName: "", mobile: "", address: "", district: "", taluka: "",
    licenseNo: "", validDate: "", capacity: "", vehicleCount: "", startDate: "", centerType: "",
    licenseStatus: "VALID", licenseDisplay: "YES", conditionsFollowed: "YES",
    etpStatus: "YES", generator: "YES", roWater: "YES", labStatus: "YES", bmcCompressorTime: "",
    hygieneCheck: { centerClean: "YES", staffClean: "YES", healthCheck: "YES", apronUsed: "YES", trainingDone: "YES", drainageClean: "YES" },
    structure: { building: "GOOD", floor: "CLEAN", drainageSystem: "WORKING", electric: "REGULAR", cooling: "WORKING", temp: "", pests: "CONTROLLED", air: "PROPER", light: "GOOD" },
    inspectionResult: "SATISFACTORY", recommendations: "", nextInspectionDate: "", representativeName: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) return
    const report = {
      type: 'FSSAI Center Inspection',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `FSSAI: ${formData.centerName}. निकाल: ${formData.inspectionResult}. लायसन्स: ${formData.licenseNo}.`,
      overallSummary: `केंद्र: ${formData.centerName}, FSSAI लायसन्स: ${formData.licenseNo}, तपासणी निकाल: ${formData.inspectionResult}`,
      fullData: { ...formData, inspector: user.displayName || "Quality Inspector" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "FSSAI अहवाल जतन झाला." })
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
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> FSSAI तपासणी (INSPECTION)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={ClipboardCheck} title="१) मूलभूत माहिती" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-8" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-8" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-8" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI No *</Label><Input className="compact-input h-8" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">परवाना मुदत *</Label><Input type="date" className="compact-input h-8" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Microscope} title="२) स्वच्छता व आरोग्य" />
          <div className="space-y-2">
            {[
              { label: 'केंद्र स्वच्छ आहे का?', key: 'centerClean' },
              { label: 'स्टाफ वैयक्तिक स्वच्छता?', key: 'staffClean' },
              { label: 'आरोग्य तपासणी नोंद?', key: 'healthCheck' },
              { label: 'एप्रन/बुशशर्ट वापर?', key: 'apronUsed' },
              { label: 'ड्रेनज स्वच्छता?', key: 'drainageClean' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2 border-b border-dotted pb-1">
                <Label className="text-[9px] font-bold text-slate-600 uppercase">{item.label}</Label>
                <RadioGroup value={(formData.hygieneCheck as any)[item.key]} onValueChange={v => setFormData({...formData, hygieneCheck: {...formData.hygieneCheck, [item.key]: v}})} className="flex gap-2">
                  <div className="flex items-center gap-1"><RadioGroupItem value="YES" id={`f-${item.key}-y`} className="h-2 w-2"/><Label htmlFor={`f-${item.key}-y`} className="text-[8px] font-black">HOY</Label></div>
                  <div className="flex items-center gap-1"><RadioGroupItem value="NO" id={`f-${item.key}-n`} className="h-2 w-2"/><Label htmlFor={`f-${item.key}-n`} className="text-[8px] font-black">NAHI</Label></div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Building} title="३) संरचना तपासणी" />
          <div className="space-y-2">
            {[
              { label: 'इमारत', key: 'building', opt: ['UTTAM', 'GOOD', 'POOR'] },
              { label: 'मजला', key: 'floor', opt: ['CLEAN', 'DIRTY'] },
              { label: 'वीज', key: 'electric', opt: ['REGULAR', 'BACKUP'] },
              { label: 'शीतकरण', key: 'cooling', opt: ['WORKING', 'OFF'] },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="compact-label text-[8px]">{item.label}</Label>
                <RadioGroup value={(formData.structure as any)[item.key]} onValueChange={v => setFormData({...formData, structure: {...formData.structure, [item.key]: v}})} className="flex gap-1.5 flex-wrap">
                  {item.opt.map(o => <div key={o} className="compact-radio-item p-1"><RadioGroupItem value={o} id={`st-${item.key}-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`st-${item.key}-${o}`} className="text-[8px] font-black">{o}</Label></div>)}
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Save} title="४) तपासणी निकाल" />
          <div className="space-y-2">
            <div className="space-y-0.5"><Label className="compact-label">एकूण निकाल</Label>
              <RadioGroup value={formData.inspectionResult} onValueChange={v => setFormData({...formData, inspectionResult: v})} className="flex gap-2">
                <div className="flex items-center gap-1 bg-green-50 p-1.5 rounded-lg border border-green-100"><RadioGroupItem value="SATISFACTORY" id="res-s" /><Label htmlFor="res-s" className="text-[9px] font-black">UTTAM</Label></div>
                <div className="flex items-center gap-1 bg-rose-50 p-1.5 rounded-lg border border-rose-100"><RadioGroupItem value="CRITICAL" id="res-c" /><Label htmlFor="res-c" className="text-[9px] font-black">POOR</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">शिफारसी</Label><Textarea className="compact-input h-14 p-2 text-[10px]" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-10 font-black uppercase">
          तपासणी अहवाल जतन करा
        </Button>
      </div>
    </div>
  )
}
