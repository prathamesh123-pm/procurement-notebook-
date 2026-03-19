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
    samplingMethod: "PROPER", recordsMaintenance: "OK",
    recommendations: ""
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
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <ClipboardCheck className="h-4 w-4 text-primary" /> केंद्र ऑडिट (AUDIT)
          </h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Microscope className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) केंद्राची माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="space-y-1">
              <Label className="compact-label">केंद्राचे नाव *</Label>
              <Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} placeholder="..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label">कोड (Code)</Label>
                <Input className="compact-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="..." />
              </div>
              <div className="space-y-1">
                <Label className="compact-label">ऑपरेटर</Label>
                <Input className="compact-input" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} placeholder="..." />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">२) तांत्रिक तपासणी</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'काटा (Weighing Scale)', key: 'weighingScale', options: ['OK', 'NOT-OK'] },
              { label: 'फॅट मशीन (Fat Machine)', key: 'fatMachine', options: ['OK', 'NOT-OK'] },
              { label: 'केमिकल्स स्टॉक', key: 'chemicals', options: ['OK', 'SHORT'] },
              { label: 'स्वच्छता (Hygiene)', key: 'hygiene', options: ['GOOD', 'AVERAGE', 'POOR'] },
              { label: 'सॅम्पलिंग पद्धत', key: 'samplingMethod', options: ['PROPER', 'WRONG'] },
              { label: 'नोंदवही / रेकॉर्ड्स', key: 'recordsMaintenance', options: ['OK', 'PENDING'] },
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
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">३) शिफारसी व सुधारणा</h3>
          </div>
          <div className="space-y-1">
            <Label className="compact-label">महत्वाच्या शिफारसी (Recommendations)</Label>
            <Textarea 
              className="compact-input min-h-[80px] h-auto p-2" 
              value={formData.recommendations} 
              onChange={e => setFormData({...formData, recommendations: e.target.value})} 
              placeholder="..." 
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-primary/20 mb-10">
        <Save className="h-4 w-4" /> ऑडिट जतन करा (SUBMIT)
      </Button>
    </div>
  )
}
