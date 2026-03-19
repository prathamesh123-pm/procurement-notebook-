"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, ClipboardList, MapPin, Warehouse, Truck, Milk, Info
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
    centerName: "", ownerName: "", mobile: "", fssaiNo: "", validDate: "",
    centerType: "UTPADAK", facilities: "BMC", building: "SHADE",
    hasPower: "YES", hasLab: "YES", hasFilter: "YES", useIce: "YES", iceQty: "",
    mornMix: { ltrs: "", fat: "", snf: "" },
    mornCow: { ltrs: "", fat: "", snf: "" },
    eveMix: { ltrs: "", fat: "", snf: "" },
    eveCow: { ltrs: "", fat: "", snf: "" },
    mixRate: "", cowRate: "", observations: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "केंद्राचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }

    const report = {
      type: 'Survey Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `केंद्राचे नाव: ${formData.centerName}. प्रकार: ${formData.centerType}. इन्फ्रा: ${formData.facilities}.`,
      overallSummary: `केंद्राचे नाव: ${formData.centerName}. प्रकार: ${formData.centerType}. इन्फ्रा: ${formData.facilities}.`,
      fullData: { ...formData, name: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "सर्व्हे अहवाल जतन करण्यात आला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <ClipboardList className="h-4 w-4 text-primary" /> सर्वे फॉर्म (SURVEY)
          </h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Warehouse className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) मूलभूत माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="space-y-1">
              <Label className="compact-label">केंद्राचे नाव *</Label>
              <Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} placeholder="..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label">मालक नाव</Label>
                <Input className="compact-input" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="..." />
              </div>
              <div className="space-y-1">
                <Label className="compact-label">मोबाईल</Label>
                <Input className="compact-input" type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label">FSSAI क्र.</Label>
                <Input className="compact-input" value={formData.fssaiNo} onChange={e => setFormData({...formData, fssaiNo: e.target.value})} placeholder="..." />
              </div>
              <div className="space-y-1">
                <Label className="compact-label">मुदत (Valid Date)</Label>
                <Input className="compact-input" type="date" value={formData.validDate} onChange={e => setFormData({...formData, validDate: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Info className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">२) इन्फ्रा व सुविधा</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'केंद्र प्रकार', key: 'centerType', options: ['UTPADAK', 'GAVALI', 'GOTHA'] },
              { label: 'सुविधा', key: 'facilities', options: ['BMC', 'PHE', 'CAN'] },
              { label: 'इमारत', key: 'building', options: ['SHADE', 'CONCRETE'] },
              { label: 'वीज पुरवठा', key: 'hasPower', options: ['YES', 'NO'] },
              { label: 'लॅब (Lab)', key: 'hasLab', options: ['YES', 'NO'] },
              { label: 'फिल्टर (Filter)', key: 'hasFilter', options: ['YES', 'NO'] },
              { label: 'बर्फ वापर', key: 'useIce', options: ['YES', 'NO'] },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="compact-label">{item.label}</Label>
                <RadioGroup 
                  value={(formData as any)[item.key]} 
                  onValueChange={v => setFormData({...formData, [item.key]: v})}
                  className="compact-radio-group"
                >
                  {item.options.map(opt => (
                    <div key={opt} className="compact-radio-item">
                      <RadioGroupItem value={opt} id={`${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`${item.key}-${opt}`} className="compact-radio-label">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <div className="space-y-1">
              <Label className="compact-label">बर्फ प्रमाण (Qty)</Label>
              <Input className="compact-input" value={formData.iceQty} onChange={e => setFormData({...formData, iceQty: e.target.value})} placeholder="..." />
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Milk className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">३) दूध संकलन (Ltrs/Fat/SNF)</h3>
          </div>
          <div className="responsive-table-wrapper">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase border-b">
                  <th className="p-1.5 text-left">Shift</th>
                  <th className="p-1.5">Ltrs</th>
                  <th className="p-1.5">Fat%</th>
                  <th className="p-1.5">SNF%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { label: 'Morn Mix', key: 'mornMix' },
                  { label: 'Morn Cow', key: 'mornCow' },
                  { label: 'Eve Mix', key: 'eveMix' },
                  { label: 'Eve Cow', key: 'eveCow' },
                ].map(row => (
                  <tr key={row.key} className="hover:bg-slate-50/50">
                    <td className="p-1 font-black text-slate-500 uppercase text-[9px]">{row.label}</td>
                    <td className="p-1"><Input className="h-7 text-center text-[11px] p-1 border-none bg-slate-50" value={(formData as any)[row.key].ltrs} onChange={e => setFormData({...formData, [row.key]: {...(formData as any)[row.key], ltrs: e.target.value}})} /></td>
                    <td className="p-1"><Input className="h-7 text-center text-[11px] p-1 border-none bg-slate-50" value={(formData as any)[row.key].fat} onChange={e => setFormData({...formData, [row.key]: {...(formData as any)[row.key], fat: e.target.value}})} /></td>
                    <td className="p-1"><Input className="h-7 text-center text-[11px] p-1 border-none bg-slate-50" value={(formData as any)[row.key].snf} onChange={e => setFormData({...formData, [row.key]: {...(formData as any)[row.key], snf: e.target.value}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">४) दर व इतर</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="compact-label">Mix Rate</Label>
              <Input className="compact-input" value={formData.mixRate} onChange={e => setFormData({...formData, mixRate: e.target.value})} placeholder="..." />
            </div>
            <div className="space-y-1">
              <Label className="compact-label">Cow Rate</Label>
              <Input className="compact-input" value={formData.cowRate} onChange={e => setFormData({...formData, cowRate: e.target.value})} placeholder="..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="compact-label">निरीक्षणे (Observations)</Label>
            <Textarea className="compact-input min-h-[60px] h-auto p-2" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} placeholder="..." />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-primary/20 mb-10">
        <Save className="h-4 w-4" /> अहवाल जतन करा (SUBMIT)
      </Button>
    </div>
  )
}
