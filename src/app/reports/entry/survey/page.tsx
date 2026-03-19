
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
  ArrowLeft, Save, ClipboardList, Warehouse, Milk, Info, Laptop, Zap, Sun, Box, PlusCircle, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SurveyReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", ownerName: "", address: "", mobile: "", fssaiNo: "", validDate: "",
    centerType: "UTPADAK", facility: "BMC", plantHygiene: "YES", milkSource: "FARMERS",
    building: "SHADE", floor: "CONCRETE", floorCondition: "GOOD", drainage: "YES", 
    etp: "NO", electricSupply: "YES", labAvailability: "YES", washingSop: "YES",
    filterUsage: "YES", useIce: "NO", iceCount: "",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    equipment: [] as any[],
    mornMix: { ltrs: "", fat: "", snf: "", endTime: "" },
    mornCow: { ltrs: "", fat: "", snf: "", endTime: "" },
    eveMix: { ltrs: "", fat: "", snf: "", endTime: "" },
    eveCow: { ltrs: "", fat: "", snf: "", endTime: "" },
    mixBasicRate: "", cowBasicRate: "", paymentCycle: "",
    otherInfo: ""
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
      summary: `सर्व्हे: ${formData.centerName}. प्रकार: ${formData.centerType}. इन्फ्रा: ${formData.building}.`,
      overallSummary: `केंद्राचे नाव: ${formData.centerName}, मालक: ${formData.ownerName}, प्रकार: ${formData.centerType}`,
      fullData: { ...formData, officer: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "सर्वे जतन झाला." })
    router.push('/reports')
  }

  const addEquipmentRow = () => {
    setFormData({...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: "Self" }]})
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({...formData, equipment: formData.equipment.filter(e => e.id !== id)})
  }

  const updateEquipmentRow = (id: string, updates: any) => {
    setFormData({...formData, equipment: formData.equipment.map(e => e.id === id ? {...e, ...updates} : e)})
  }

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
      <Icon className="h-3 w-3 text-primary" />
      <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">{title}</h3>
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
          <SectionTitle icon={Warehouse} title="१) मूलभूत माहिती" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-9" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-9" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-9" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI No</Label><Input className="compact-input h-9" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">Valid Up To</Label><Input type="date" className="compact-input h-9" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Info} title="२) इन्फ्रा व सुविधा" />
          <div className="space-y-3">
            {[
              { label: 'केंद्र प्रकार', key: 'centerType', options: ['UTPADAK', 'GAVALI', 'GOTHA'] },
              { label: 'सुविधा', key: 'facility', options: ['BMC', 'PHE', 'CAN'] },
              { label: 'इमारत', key: 'building', options: ['SHADE', 'CONCRETE'] },
              { label: 'वीज (Electric)', key: 'electricSupply', options: ['YES', 'NO'] },
              { label: 'लॅब (Lab)', key: 'labAvailability', options: ['YES', 'NO'] },
              { label: 'फिल्टर वापर', key: 'filterUsage', options: ['YES', 'NO'] },
              { label: 'बर्फ वापर', key: 'useIce', options: ['YES', 'NO'] },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="compact-label text-[10px]">{item.label}</Label>
                <RadioGroup value={(formData as any)[item.key]} onValueChange={v => setFormData({...formData, [item.key]: v})} className="flex flex-wrap gap-1.5">
                  {item.options.map(opt => (
                    <div key={opt} className="compact-radio-item p-1 border-primary/10">
                      <RadioGroupItem value={opt} id={`sv-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`sv-${item.key}-${opt}`} className="text-[9px] font-black uppercase cursor-pointer px-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <SectionTitle icon={Laptop} title="३) तांत्रिक व वीज सुविधा" />
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2 bg-white/50 p-2.5 rounded-xl border border-primary/10">
              <Checkbox id="sv-comp" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
              <Label htmlFor="sv-comp" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर आहे का?</Label>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 p-2.5 rounded-xl border border-primary/10">
              <Checkbox id="sv-ups" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
              <Label htmlFor="sv-ups" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर आहे का?</Label>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 p-2.5 rounded-xl border border-primary/10">
              <Checkbox id="sv-solar" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
              <Label htmlFor="sv-solar" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध आहे का?</Label>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="flex items-center justify-between border-b pb-1 mb-2">
            <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <Box className="h-3.5 w-3.5" /> ४) साहित्य यादी (INVENTORY)
            </h4>
            <Button type="button" variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black px-2 border-primary/20 bg-primary/5 text-primary">
              जोडा
            </Button>
          </div>
          <div className="space-y-1.5">
            {formData.equipment.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-muted/10 p-2 rounded-xl border border-muted-foreground/5">
                <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[10px] px-2 bg-white border-none rounded-md font-bold" placeholder="नाव" /></div>
                <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] px-0 text-center bg-white border-none rounded-md font-black" /></div>
                <div className="col-span-3">
                  <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v})}>
                    <SelectTrigger className="h-8 text-[8px] px-1 bg-white border-none rounded-md font-black"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Self" className="text-[10px] font-black">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px] font-black">डेअरी</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive"><X className="h-3.5 w-3.5" /></Button></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="५) दूध संकलन (Milk Collection)" />
          <div className="responsive-table-wrapper border-none">
            <table className="w-full text-[9px]">
              <thead className="bg-slate-50">
                <tr className="text-[8px] font-black uppercase">
                  <th className="p-1.5 text-left">Type</th><th className="p-1.5 text-center">Ltrs</th><th className="p-1.5 text-center">F%</th><th className="p-1.5 text-center">S%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/5">
                {['mornMix', 'mornCow', 'eveMix', 'eveCow'].map(row => (
                  <tr key={row}>
                    <td className="p-1.5 font-bold text-[8px] uppercase">{row.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="p-1"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData as any)[row].ltrs} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], ltrs: e.target.value}})} /></td>
                    <td className="p-1"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData as any)[row].fat} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], fat: e.target.value}})} /></td>
                    <td className="p-1"><Input className="h-7 text-center text-[10px] border-none bg-slate-50 font-black p-0" value={(formData as any)[row].snf} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], snf: e.target.value}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-11 uppercase font-black transition-all active:scale-95">
          अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
