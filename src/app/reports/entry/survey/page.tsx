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
  ArrowLeft, Save, ClipboardList, Warehouse, Milk, Info, MapPin, ShieldCheck
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
    type: "UTPADAK", facility: "BMC", plantHygiene: "YES", milkSource: "FARMERS",
    infrastructure: {
      building: "", floor: "", floorCondition: "", drainage: "", etp: "",
      electric: "", lab: "", washingSop: "", selfVehicle: "", filter: "", useIce: ""
    },
    collection: {
      mix: { ltrs: "", fat: "", snf: "", time: "" },
      cow: { ltrs: "", fat: "", snf: "", time: "" }
    },
    totalMilk: "", paymentCycle: "", otherInfo: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    const report = {
      type: 'Milk Procurement Survey',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `सर्व्हे: ${formData.centerName}. प्रकार: ${formData.type}. दूध: ${formData.totalMilk}L.`,
      overallSummary: `केंद्राचे नाव: ${formData.centerName}, प्रकार: ${formData.type}`,
      fullData: { ...formData, officer: user.displayName || "Officer" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "सर्वे जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1 border-b border-primary/10 pb-0.5 mb-1.5">
      <Icon className="h-2.5 w-2.5 text-primary" />
      <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">{title}</h3>
    </div>
  )

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-1 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-7 w-7"><ArrowLeft className="h-3.5 w-3.5" /></Button>
        <div className="min-w-0">
          <h2 className="text-[11px] font-black uppercase truncate flex items-center gap-1"><ClipboardList className="h-3 w-3 text-primary" /> दूध सर्व्हे (SURVEY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-2 pb-10">
        <Card className="compact-card">
          <SectionTitle icon={Warehouse} title="१) सामान्य माहिती" />
          <div className="grid grid-cols-1 gap-1.5">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">पत्ता</Label><Input className="compact-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI क्र.</Label><Input className="compact-input" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">वैधता</Label><Input type="date" className="compact-input" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card">
          <SectionTitle icon={Info} title="२) प्रकार व स्रोत" />
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="compact-label">प्रकार (TYPE)</Label>
              <RadioGroup value={formData.type} onValueChange={v => setFormData({...formData, type: v})} className="compact-radio-group">
                {['UTPADAK', 'ONEMAN', 'GAVALI', 'GOTHA'].map(o => <div key={o} className="compact-radio-item"><RadioGroupItem value={o} id={`t-${o}`} className="h-2 w-2"/><Label htmlFor={`t-${o}`} className="compact-radio-label">{o}</Label></div>)}
              </RadioGroup>
            </div>
            <div className="space-y-0.5">
              <Label className="compact-label">सुविधा (FACILITY)</Label>
              <RadioGroup value={formData.facility} onValueChange={v => setFormData({...formData, facility: v})} className="compact-radio-group">
                {['BMC', 'PHE', 'BOTH', 'CAN'].map(o => <div key={o} className="compact-radio-item"><RadioGroupItem value={o} id={`f-${o}`} className="h-2 w-2"/><Label htmlFor={`f-${o}`} className="compact-radio-label">{o}</Label></div>)}
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card">
          <SectionTitle icon={MapPin} title="३) पायाभूत सुविधा" />
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { l: 'Building', k: 'building' }, { l: 'Floor', k: 'floor' },
              { l: 'Condition', k: 'floorCondition' }, { l: 'Drainage', k: 'drainage' },
              { l: 'ETP', k: 'etp' }, { l: 'Electric', k: 'electric' },
              { l: 'Lab', k: 'lab' }, { l: 'SOP', k: 'washingSop' },
              { l: 'Vehicle', k: 'selfVehicle' }, { l: 'Filter', k: 'filter' },
              { l: 'Use Ice', k: 'useIce' }
            ].map(it => (
              <div key={it.k} className="space-y-0.5">
                <Label className="compact-label">{it.l}</Label>
                <Input className="compact-input h-7" value={(formData.infrastructure as any)[it.k]} onChange={e => setFormData({...formData, infrastructure: {...formData.infrastructure, [it.k]: e.target.value}})} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card">
          <SectionTitle icon={Milk} title="४) दूध संकलन" />
          <div className="responsive-table-wrapper">
            <table className="w-full text-[8px]">
              <thead className="bg-slate-50">
                <tr className="font-black uppercase">
                  <th className="p-1 text-left">TYPE</th><th className="p-1 text-center">QTY</th><th className="p-1 text-center">F%</th><th className="p-1 text-center">S%</th><th className="p-1 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[ {l: 'MIX', k: 'mix'}, {l: 'COW', k: 'cow'} ].map(row => (
                  <tr key={row.k}>
                    <td className="p-1 font-bold">{row.l}</td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50" value={(formData.collection as any)[row.k].ltrs} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], ltrs: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50" value={(formData.collection as any)[row.k].fat} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], fat: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50" value={(formData.collection as any)[row.k].snf} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], snf: e.target.value}}})} /></td>
                    <td className="p-0.5"><Input type="time" className="h-6 text-right text-[8px] border-none bg-slate-50" value={(formData.collection as any)[row.k].time} onChange={e => setFormData({...formData, collection: {...formData.collection, [row.k]: {...(formData.collection as any)[row.k], time: e.target.value}}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="compact-card bg-amber-50/20 border-amber-100">
          <SectionTitle icon={ShieldCheck} title="५) सारांश" />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-0.5"><Label className="compact-label">एकूण दूध (LTR)</Label><Input className="compact-input font-black" value={formData.totalMilk} onChange={e => setFormData({...formData, totalMilk: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">पेमेंट सायकल</Label><Input className="compact-input" value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} /></div>
            <div className="space-y-0.5 col-span-2"><Label className="compact-label">इतर</Label><Textarea className="compact-input h-10 p-1 text-[9px]" value={formData.otherInfo} onChange={e => setFormData({...formData, otherInfo: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg mb-10 h-10 uppercase font-black tracking-widest">
          सर्वे जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
