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
  ArrowLeft, Save, ClipboardCheck, Microscope, FlaskConical, AlertCircle
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
    centerName: "", code: "", operator: "",
    weighingScale: "OK", fatMachine: "OK", chemicals: "OK", hygiene: "GOOD",
    recordsMaintenance: "OK", recommendations: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "नाव आवश्यक आहे.", variant: "destructive" })
      return
    }

    const report = {
      type: 'Center Audit',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ऑडिट: ${formData.centerName}. स्थिती: ${formData.hygiene}. मशीन: ${formData.fatMachine}.`,
      overallSummary: `ऑडिट: ${formData.centerName}. स्थिती: ${formData.hygiene}. मशीन: ${formData.fatMachine}.`,
      fullData: { ...formData, name: user.displayName || "Procurement Auditor" },
      createdAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "ऑडिट अहवाल जतन करण्यात आला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase truncate">
            <ClipboardCheck className="h-3.5 w-3.5 text-primary shrink-0" /> केंद्र ऑडिट (AUDIT)
          </h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Card className="compact-card">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><Microscope className="h-3 w-3" /> १) केंद्राची माहिती</h3>
            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <Label className="compact-label">केंद्राचे नाव *</Label>
                <Input className="compact-input h-9" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="compact-label">कोड (Code)</Label>
                  <Input className="compact-input h-9" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="space-y-0.5">
                  <Label className="compact-label">ऑपरेटर</Label>
                  <Input className="compact-input h-9" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><FlaskConical className="h-3 w-3" /> २) तांत्रिक तपासणी</h3>
            <div className="space-y-2">
              {[
                { label: 'काटा (Scale)', key: 'weighingScale', options: ['OK', 'NOT-OK'] },
                { label: 'फॅट मशीन (Fat)', key: 'fatMachine', options: ['OK', 'NOT-OK'] },
                { label: 'केमिकल्स स्टॉक', key: 'chemicals', options: ['OK', 'SHORT'] },
                { label: 'स्वच्छता (Hygiene)', key: 'hygiene', options: ['GOOD', 'POOR'] },
                { label: 'रेकॉर्ड्स', key: 'recordsMaintenance', options: ['OK', 'PENDING'] },
              ].map((item) => (
                <div key={item.key} className="space-y-0.5">
                  <Label className="compact-label">{item.label}</Label>
                  <RadioGroup value={(formData as any)[item.key]} onValueChange={v => setFormData({...formData, [item.key]: v})} className="compact-radio-group">
                    {item.options.map(opt => (
                      <div key={opt} className="compact-radio-item">
                        <RadioGroupItem value={opt} id={`audit-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                        <Label htmlFor={`audit-${item.key}-${opt}`} className="compact-radio-label">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="compact-card">
          <div className="space-y-1">
            <Label className="compact-label flex items-center gap-1"><AlertCircle className="h-3 w-3" /> शिफारसी (Recommendations)</Label>
            <Textarea className="compact-input min-h-[60px] h-auto p-2" value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} placeholder="..." />
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full h-10 bg-primary text-white mb-10"><Save className="h-3.5 w-3.5 mr-1.5" /> ऑडिट जतन करा (SUBMIT)</Button>
      </div>
    </div>
  )
}
