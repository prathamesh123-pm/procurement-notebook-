
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
  ArrowLeft, Save, ClipboardList, Warehouse, Milk, Info, MapPin, Building, Droplets, Zap, Microscope, Truck
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
    building: "SHADE", floor: "CONCRETE", floorCondition: "GOOD", drainage: "YES", 
    etp: "NO", electricSupply: "YES", labAvailability: "YES", washingSop: "YES",
    selfVehicle: "NO", filterUsage: "YES", vehicleType: "COVERED", useIce: "NO", iceCount: "",
    testerType: "MILK TESTER", weighingCompany: "", weighingCondition: "CLEAN",
    mornMix: { ltrs: "", fat: "", snf: "", endTime: "" },
    mornCow: { ltrs: "", fat: "", snf: "", endTime: "" },
    eveMix: { ltrs: "", fat: "", snf: "", endTime: "" },
    eveCow: { ltrs: "", fat: "", snf: "", endTime: "" },
    mixBasicRate: "", mixFatDiff: "", mixSnfDiff: "",
    cowBasicRate: "", cowFatDiff: "", paymentCycle: "",
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
    toast({ title: "यशस्वी", description: "सर्व्हे जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
      <Icon className="h-3 w-3 text-primary" />
      <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">{title}</h3>
    </div>
  )

  return (
    <div className="compact-form-container px-2 pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" /> सर्वे फॉर्म (SURVEY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Warehouse} title="१) मूलभूत माहिती (General Info)" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input h-8" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input h-8" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input h-8" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">पत्ता</Label><Input className="compact-input h-8" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">FSSAI No</Label><Input className="compact-input h-8" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">Valid Up To</Label><Input type="date" className="compact-input h-8" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} /></div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Info} title="२) इन्फ्रा व सुविधा (Infrastructure)" />
          <div className="space-y-3">
            {[
              { label: 'केंद्र प्रकार', key: 'centerType', options: ['UTPADAK', 'ONEMAN', 'GAVALI', 'GOTHA'] },
              { label: 'सुविधा', key: 'facility', options: ['BMC', 'PHE', 'BOTH', 'CAN'] },
              { label: 'स्वच्छता (Hygiene)', key: 'plantHygiene', options: ['YES', 'NO', 'NA'] },
              { label: 'दूध स्त्रोत', key: 'milkSource', options: ['FARMERS', 'GAVALI', 'CENTER'] },
              { label: 'इमारत', key: 'building', options: ['SHADE', 'CONCRETE', 'NA'] },
              { label: 'मजला (Floor)', key: 'floor', options: ['SOIL', 'TILE', 'CONCRETE'] },
              { label: 'वीज (Electric)', key: 'electricSupply', options: ['YES', 'NO'] },
              { label: 'लॅब (Lab)', key: 'labAvailability', options: ['YES', 'NO'] },
              { label: 'बर्फ वापर', key: 'useIce', options: ['YES', 'NO'] },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="compact-label text-[10px]">{item.label}</Label>
                <RadioGroup value={(formData as any)[item.key]} onValueChange={v => setFormData({...formData, [item.key]: v})} className="flex flex-wrap gap-1.5">
                  {item.options.map(opt => (
                    <div key={opt} className="compact-radio-item p-1">
                      <RadioGroupItem value={opt} id={`sv-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`sv-${item.key}-${opt}`} className="text-[9px] font-black uppercase cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Milk} title="३) दूध संकलन (Milk Collection)" />
          <div className="responsive-table-wrapper">
            <table className="w-full text-[9px]">
              <thead className="bg-slate-50">
                <tr className="text-[8px] font-black uppercase">
                  <th className="p-1 text-left">Type</th><th className="p-1 text-center">Ltrs</th><th className="p-1 text-center">F%</th><th className="p-1 text-center">S%</th><th className="p-1 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {['mornMix', 'mornCow', 'eveMix', 'eveCow'].map(row => (
                  <tr key={row}>
                    <td className="p-1 font-bold text-[8px]">{row.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50 p-0" value={(formData as any)[row].ltrs} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], ltrs: e.target.value}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50 p-0" value={(formData as any)[row].fat} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], fat: e.target.value}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[9px] border-none bg-slate-50 p-0" value={(formData as any)[row].snf} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], snf: e.target.value}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-right text-[9px] border-none bg-slate-50 p-0" value={(formData as any)[row].endTime} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], endTime: e.target.value}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Info} title="४) दर व इतर (Rates & Misc)" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">Mix Basic Rate</Label><Input className="compact-input h-8" value={formData.mixBasicRate} onChange={e => setFormData({...formData, mixBasicRate: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">Cow Basic Rate</Label><Input className="compact-input h-8" value={formData.cowBasicRate} onChange={e => setFormData({...formData, cowBasicRate: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">Payment Cycle</Label><Input className="compact-input h-8" value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">निरीक्षणे</Label><Input className="compact-input h-8" value={formData.otherInfo} onChange={e => setFormData({...formData, otherInfo: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-10 uppercase font-black">
          अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
