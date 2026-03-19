
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
  ArrowLeft, Save, ShieldCheck, Microscope, Droplets, Zap, UserCheck, ClipboardCheck, Building, Milk, FileText, CheckCircle2
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
    centerName: "", ownerName: "", mobile: "", email: "", address: "", district: "", taluka: "",
    licenseNo: "", validDate: "", capacity: "", vehicleCount: "", startDate: "", centerType: "",
    licenseStatus: "VALID", licenseDisplay: "YES", conditionsFollowed: "YES",
    equipment: { etp: "YES", generator: "YES", ro: "YES", lab: "YES", compressorTime: "", other: "" },
    hygiene: { center: "YES", staff: "YES", health: "YES", apron: "YES", training: "YES", drainage: "YES", waste: "YES", records: "YES" },
    structure: { building: "GOOD", floor: "CLEAN", drainage: "WORKING", electric: "REGULAR", cooling: "WORKING", temp: "", pests: "CONTROLLED", air: "PROPER", light: "GOOD" },
    collection: {
      mornCow: "", mornBuf: "", mornTotal: "", mornTime: "",
      eveCow: "", eveBuf: "", eveTotal: "", eveTime: "",
      cleanMilk: "YES", vehicleOk: "YES"
    },
    quality: {
      cowFat: "", cowSnf: "", bufFat: "", bufSnf: "", mixFat: "", mixSnf: ""
    },
    docs: { collection: false, health: false, calibration: false, hygiene: false, license: false, ownership: false },
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
      summary: `FSSAI तपासणी: ${formData.centerName}. निकाल: ${formData.inspectionResult}. लायसन्स: ${formData.licenseNo}.`,
      overallSummary: `केंद्र: ${formData.centerName}, FSSAI लायसन्स: ${formData.licenseNo}, निकाल: ${formData.inspectionResult}`,
      fullData: { ...formData, inspector: user.displayName || "Quality Inspector" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "FSSAI तपासणी अहवाल जतन झाला." })
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
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> FSSAI तपासणी (INSPECTION)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={ClipboardCheck} title="१) मूलभूत माहिती (BASIC INFO)" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-8" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-8" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-8" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI क्र. *</Label><Input className="compact-input h-8" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">परवाना मुदत *</Label><Input type="date" className="compact-input h-8" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <SectionTitle icon={Zap} title="२) उपकरणे व स्वच्छता (HYGIENE)" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'E.T.P.', k: 'etp' }, { label: 'Generator', k: 'generator' }, 
              { label: 'RO Water', k: 'ro' }, { label: 'Lab Center', k: 'lab' }
            ].map(it => (
              <div key={it.k} className="flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-primary/10">
                <Label className="text-[8px] font-black">{it.label}</Label>
                <RadioGroup value={(formData.equipment as any)[it.k]} onValueChange={v => setFormData({...formData, equipment: {...formData.equipment, [it.k]: v}})} className="flex gap-1">
                  <div className="flex items-center gap-0.5"><RadioGroupItem value="YES" id={`e-${it.k}-y`} className="h-2 w-2"/><Label htmlFor={`e-${it.k}-y`} className="text-[7px]">Y</Label></div>
                  <div className="flex items-center gap-0.5"><RadioGroupItem value="NO" id={`e-${it.k}-n`} className="h-2 w-2"/><Label htmlFor={`e-${it.k}-n`} className="text-[7px]">N</Label></div>
                </RadioGroup>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <Label className="text-[8px] font-black uppercase text-slate-500">स्वच्छता तपासणी चेकलिस्ट</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { l: 'केंद्र स्वच्छ?', k: 'center' }, { l: 'स्टाफ वैयक्तिक?', k: 'staff' },
                { l: 'एप्रन वापर?', k: 'apron' }, { l: 'ड्रेनज स्वच्छ?', k: 'drainage' }
              ].map(it => (
                <div key={it.k} className="flex items-center justify-between p-1 border-b border-dotted">
                  <span className="text-[7px] font-bold uppercase">{it.l}</span>
                  <RadioGroup value={(formData.hygiene as any)[it.k]} onValueChange={v => setFormData({...formData, hygiene: {...formData.hygiene, [it.k]: v}})} className="flex gap-1">
                    <RadioGroupItem value="YES" className="h-2 w-2"/><RadioGroupItem value="NO" className="h-2 w-2"/>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="३) दूध संकलन व गुणवत्ता (COLLECTION)" />
          <div className="responsive-table-wrapper mb-2">
            <table className="w-full text-[8px]">
              <thead className="bg-slate-50">
                <tr className="font-black uppercase tracking-tighter">
                  <th className="p-1">SHIFT</th><th className="p-1">COW</th><th className="p-1">BUF</th><th className="p-1 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-1 font-bold">MORN</td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5" value={formData.collection.mornCow} onChange={e => setFormData({...formData, collection: {...formData.collection, mornCow: e.target.value}})} /></td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5" value={formData.collection.mornBuf} onChange={e => setFormData({...formData, collection: {...formData.collection, mornBuf: e.target.value}})} /></td><td className="p-0.5"><Input type="time" className="h-6 text-[8px] p-0.5" value={formData.collection.mornTime} onChange={e => setFormData({...formData, collection: {...formData.collection, mornTime: e.target.value}})} /></td></tr>
                <tr><td className="p-1 font-bold">EVE</td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5" value={formData.collection.eveCow} onChange={e => setFormData({...formData, collection: {...formData.collection, eveCow: e.target.value}})} /></td><td className="p-0.5"><Input className="h-6 text-[9px] p-0.5" value={formData.collection.eveBuf} onChange={e => setFormData({...formData, collection: {...formData.collection, eveBuf: e.target.value}})} /></td><td className="p-0.5"><Input type="time" className="h-6 text-[8px] p-0.5" value={formData.collection.eveTime} onChange={e => setFormData({...formData, collection: {...formData.collection, eveTime: e.target.value}})} /></td></tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {['mixFat', 'mixSnf', 'cowFat', 'cowSnf', 'bufFat', 'bufSnf'].map(k => (
              <div key={k} className="space-y-0.5"><Label className="text-[7px] font-black uppercase text-muted-foreground">{k}</Label><Input className="h-7 text-[9px] font-bold text-center" value={(formData.quality as any)[k]} onChange={e => setFormData({...formData, quality: {...formData.quality, [k]: e.target.value}})} /></div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3 bg-emerald-50/20 border-emerald-100">
          <SectionTitle icon={CheckCircle2} title="४) तपासणी निकाल (RESULT)" />
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="compact-label">एकूण तपासणी निकाल</Label>
              <RadioGroup value={formData.inspectionResult} onValueChange={v => setFormData({...formData, inspectionResult: v})} className="flex flex-wrap gap-1.5">
                {['SATISFACTORY', 'GOOD', 'POOR', 'FAIL'].map(o => <div key={o} className="compact-radio-item p-1 border-primary/10 bg-white"><RadioGroupItem value={o} id={`res-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`res-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">शिफारसी (RECO.)</Label><Textarea className="compact-input h-14 p-2 text-[10px]" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} placeholder="सुधारणा सुचवा..." /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">प्रतिनिधी नाव</Label><Input className="compact-input h-8" value={formData.representativeName} onChange={e => setFormData({...formData, representativeName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">पुढील तारीख</Label><Input type="date" className="compact-input h-8" value={formData.nextInspectionDate} onChange={e => setFormData({...formData, nextInspectionDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-11 uppercase font-black transition-all active:scale-95">
          तपासणी अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
