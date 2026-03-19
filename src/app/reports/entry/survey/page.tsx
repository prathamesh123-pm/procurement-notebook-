
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
  ArrowLeft, Save, ClipboardList, Warehouse, Milk, Info, Laptop, Zap, Sun, Box, PlusCircle, X, MapPin, Droplets, Thermometer, ShieldCheck, User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function SurveyReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", ownerName: "", address: "", email: "", mobile: "", fssaiNo: "", validDate: "",
    centerType: "UTPADAK", facility: "BMC", plantHygiene: "YES", milkSource: "FARMERS",
    infrastructure: {
      building: "SHADE", floor: "CONCRETE", floorCondition: "GOOD", drainage: "YES", 
      etp: "NO", electric: "YES", lab: "YES", washingSop: "YES", selfVehicle: "NO",
      filter: "YES", vehicleType: "COVERED", useIce: "NO", iceCount: "",
      testerType: "MILK TESTER", weighingCompany: "", weighingCondition: "CLEAN"
    },
    collection: {
      mixMorn: { ltrs: "", fat: "", snf: "", time: "" },
      cowMorn: { ltrs: "", fat: "", snf: "", time: "" },
      mixEve: { ltrs: "", fat: "", snf: "", time: "" },
      cowEve: { ltrs: "", fat: "", snf: "", time: "" }
    },
    rates: {
      mixBasic: "", mixFatPlus: "", mixFatMinus: "", mixSnfPlus: "",
      cowBasic: "", cowFatPlus: "", cowFatMinus: "", cowSnfMinus: ""
    },
    totalMilk: "", paymentCycle: "7 DAYS", otherInfo: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "केंद्राचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    const report = {
      type: 'Milk Procurement Survey',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `सर्व्हे: ${formData.centerName}. प्रकार: ${formData.centerType}. एकूण दूध: ${formData.totalMilk}L. इन्फ्रा: ${formData.infrastructure.building}.`,
      overallSummary: `केंद्राचे नाव: ${formData.centerName}, मालक: ${formData.ownerName}, प्रकार: ${formData.centerType}`,
      fullData: { ...formData, officer: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "सर्वे यशस्वीरित्या जतन झाला." })
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
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" /> सर्वे फॉर्म (SURVEY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Warehouse} title="१) मूलभूत माहिती (GENERAL)" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-9" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-9" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-9" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">पत्ता (ADDRESS)</Label><Input className="compact-input h-9" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI No</Label><Input className="compact-input h-9" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">Valid Up To</Label><Input type="date" className="compact-input h-9" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Info} title="२) प्रकार व सुविधा (TYPE & FACILITY)" />
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="compact-label text-[8px]">केंद्र प्रकार (TYPE)</Label>
              <RadioGroup value={formData.centerType} onValueChange={v => setFormData({...formData, centerType: v})} className="flex flex-wrap gap-1.5">
                {['UTPADAK', 'ONEMAN', 'GAVALI', 'GOTHA'].map(o => <div key={o} className="compact-radio-item p-1 border-primary/10"><RadioGroupItem value={o} id={`ct-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`ct-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="space-y-1">
              <Label className="compact-label text-[8px]">सुविधा (FACILITY)</Label>
              <RadioGroup value={formData.facility} onValueChange={v => setFormData({...formData, facility: v})} className="flex flex-wrap gap-1.5">
                {['BMC', 'PHE', 'BOTH', 'CAN'].map(o => <div key={o} className="compact-radio-item p-1 border-primary/10"><RadioGroupItem value={o} id={`fac-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`fac-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label text-[8px]">स्वच्छता (HYGIENE)</Label>
                <RadioGroup value={formData.plantHygiene} onValueChange={v => setFormData({...formData, plantHygiene: v})} className="flex gap-1.5">
                  {['YES', 'NO'].map(o => <div key={o} className="compact-radio-item p-1"><RadioGroupItem value={o} id={`hy-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`hy-${o}`} className="text-[8px] font-black">{o}</Label></div>)}
                </RadioGroup>
              </div>
              <div className="space-y-1">
                <Label className="compact-label text-[8px]">दूध स्रोत (SOURCE)</Label>
                <RadioGroup value={formData.milkSource} onValueChange={v => setFormData({...formData, milkSource: v})} className="flex flex-wrap gap-1.5">
                  {['FARMERS', 'GAVALI', 'GOTHA'].map(o => <div key={o} className="compact-radio-item p-1"><RadioGroupItem value={o} id={`src-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`src-${o}`} className="text-[8px] font-black px-1">{o}</Label></div>)}
                </RadioGroup>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <SectionTitle icon={Laptop} title="३) इन्फ्रा व तांत्रिक (INFRASTRUCTURE)" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Building', key: 'building', opts: ['SHADE', 'CONCRETE'] },
              { label: 'Floor', key: 'floor', opts: ['TILE', 'CONCRETE', 'SOIL'] },
              { label: 'Condition', key: 'floorCondition', opts: ['GOOD', 'BROKEN'] },
              { label: 'Drainage', key: 'drainage', opts: ['YES', 'NO'] },
              { label: 'Lab', key: 'lab', opts: ['YES', 'NO'] },
              { label: 'Electric', key: 'electric', opts: ['YES', 'NO'] },
              { label: 'Filter', key: 'filter', opts: ['YES', 'NO'] },
              { label: 'Ice Use', key: 'useIce', opts: ['YES', 'NO'] },
            ].map(it => (
              <div key={it.key} className="space-y-1">
                <Label className="text-[8px] font-black text-slate-500 uppercase">{it.label}</Label>
                <RadioGroup value={(formData.infrastructure as any)[it.key]} onValueChange={v => setFormData({...formData, infrastructure: {...formData.infrastructure, [it.key]: v}})} className="flex flex-wrap gap-1">
                  {it.opts.map(o => <div key={o} className="compact-radio-item p-0.5 border-none bg-white/50"><RadioGroupItem value={o} id={`infra-${it.key}-${o}`} className="h-2 w-2"/><Label htmlFor={`infra-${it.key}-${o}`} className="text-[7px] font-black px-0.5">{o}</Label></div>)}
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="४) दूध संकलन (MILK COLLECTION)" />
          <div className="responsive-table-wrapper border-none">
            <table className="w-full text-[9px]">
              <thead className="bg-slate-50">
                <tr className="text-[8px] font-black uppercase tracking-tighter">
                  <th className="p-1 text-left">TYPE</th><th className="p-1 text-center">LTR</th><th className="p-1 text-center">F%</th><th className="p-1 text-center">S%</th><th className="p-1 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/5">
                {[
                  { label: 'MORN MIX', k: 'mixMorn' },
                  { label: 'MORN COW', k: 'cowMorn' },
                  { label: 'EVE MIX', k: 'mixEve' },
                  { label: 'EVE COW', k: 'cowEve' }
                ].map(row => (
                  <tr key={row.k}>
                    <td className="p-1 font-bold text-[7px] uppercase leading-none">{row.label}</td>
                    <td className="p-0.5"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData.collection as any)[row.k].ltrs} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], ltrs: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData.collection as any)[row.k].fat} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], fat: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData.collection as any)[row.k].snf} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], snf: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input type="time" className="h-7 text-right text-[8px] border-none bg-slate-50 font-black p-0" value={(formData.collection as any)[row.k].time} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], time: e.target.value}}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-amber-50/20 border-amber-100">
          <SectionTitle icon={Zap} title="५) दर व इतर (RATES & INFO)" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">MIX RATE</Label><Input className="compact-input h-8" value={formData.rates.mixBasic} onChange={e => setFormData({...formData, rates: {...formData.rates, mixBasic: e.target.value}})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">COW RATE</Label><Input className="compact-input h-8" value={formData.rates.cowBasic} onChange={e => setFormData({...formData, rates: {...formData.rates, cowBasic: e.target.value}})} /></div>
            <div className="space-y-0.5 col-span-2"><Label className="compact-label">एकूण संकलन (TOTAL LTR)</Label><Input className="compact-input h-9 text-lg font-black" type="number" value={formData.totalMilk} onChange={e => setFormData({...formData, totalMilk: e.target.value})} /></div>
            <div className="space-y-0.5 col-span-2"><Label className="compact-label">निरीक्षणे (REMARKS)</Label><Textarea className="compact-input h-14 p-2 text-[10px]" value={formData.otherInfo} onChange={e => setFormData({...formData, otherInfo: e.target.value})} placeholder="..." /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-11 uppercase font-black transition-all active:scale-95">
          सर्वे अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
