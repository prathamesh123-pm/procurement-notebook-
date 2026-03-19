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
  ArrowLeft, Save, ClipboardList, Warehouse, Milk, Info
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
    if (!db || !user || !formData.centerName) return
    const report = {
      type: 'Survey Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `सर्व्हे: ${formData.centerName}. प्रकार: ${formData.centerType}.`,
      overallSummary: `सर्व्हे: ${formData.centerName}. प्रकार: ${formData.centerType}.`,
      fullData: { ...formData, name: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "सर्वे जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" /> सर्वे फॉर्म (SURVEY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <Card className="compact-card">
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><Warehouse className="h-3 w-3" /> १) मूलभूत माहिती</h3>
          <div className="space-y-1.5">
            <div className="space-y-0.5"><Label className="compact-label">केंद्र नाव *</Label><Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><Info className="h-3 w-3" /> २) इन्फ्रा व सुविधा</h3>
          <div className="space-y-2">
            {[
              { label: 'प्रकार', key: 'centerType', options: ['UTPADAK', 'GAVALI', 'GOTHA'] },
              { label: 'सुविधा', key: 'facilities', options: ['BMC', 'PHE', 'CAN'] },
              { label: 'वीज', key: 'hasPower', options: ['YES', 'NO'] },
              { label: 'लॅब (Lab)', key: 'hasLab', options: ['YES', 'NO'] },
              { label: 'बर्फ वापर', key: 'useIce', options: ['YES', 'NO'] },
            ].map((item) => (
              <div key={item.key} className="space-y-0.5">
                <Label className="compact-label">{item.label}</Label>
                <RadioGroup value={(formData as any)[item.key]} onValueChange={v => setFormData({...formData, [item.key]: v})} className="compact-radio-group">
                  {item.options.map(opt => (
                    <div key={opt} className="compact-radio-item">
                      <RadioGroupItem value={opt} id={`sv-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`sv-${item.key}-${opt}`} className="compact-radio-label">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><Milk className="h-3 w-3" /> ३) दूध संकलन</h3>
          <div className="responsive-table-wrapper">
            <table className="w-full text-[10px]">
              <thead className="bg-slate-50 border-b">
                <tr className="text-[8px] font-black uppercase">
                  <th className="p-1 text-left">Shift</th><th className="p-1 text-center">Ltrs</th><th className="p-1 text-center">Fat%</th><th className="p-1 text-center">SNF%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {['mornMix', 'mornCow', 'eveMix', 'eveCow'].map(row => (
                  <tr key={row}>
                    <td className="p-1 font-bold uppercase text-[8px] text-slate-500">{row.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[10px] p-0 border-none bg-slate-50" value={(formData as any)[row].ltrs} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], ltrs: e.target.value}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[10px] p-0 border-none bg-slate-50" value={(formData as any)[row].fat} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], fat: e.target.value}})} /></td>
                    <td className="p-0.5"><Input className="h-6 text-center text-[10px] p-0 border-none bg-slate-50" value={(formData as any)[row].snf} onChange={e => setFormData({...formData, [row]: {...(formData as any)[row], snf: e.target.value}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="compact-button w-full bg-primary text-white mb-10"><Save className="h-3.5 w-3.5" /> जतन करा (SUBMIT)</Button>
    </div>
  )
}
