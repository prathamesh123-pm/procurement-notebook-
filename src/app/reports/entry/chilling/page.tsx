"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, ShieldCheck, Thermometer, Droplets, Zap, UserCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function ChillingReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", tempAtArrival: "", tempAfterChilling: "",
    waterSupply: "OK", powerBackup: "AVAILABLE",
    hygieneStandard: "HIGH", staffUniform: "YES", fssaiDisplay: "YES",
    iceBankStatus: "NORMAL", storageCapacity: "",
    observations: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) return
    
    const report = {
      type: 'Chilling Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `चिलिंग सेंटर: ${formData.centerName}. तापमान: ${formData.tempAfterChilling}°C. स्वच्छता: ${formData.hygieneStandard}.`,
      overallSummary: `चिलिंग सेंटर: ${formData.centerName}. तापमान: ${formData.tempAfterChilling}°C. स्वच्छता: ${formData.hygieneStandard}.`,
      fullData: { ...formData, name: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "चिलिंग अहवाल जतन करण्यात आला." })
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
            <Thermometer className="h-4 w-4 text-primary" /> चिलिंग सेंटर (CHILLING)
          </h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) प्राथमिक व तांत्रिक माहिती</h3>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="compact-label">केंद्राचे नाव *</Label>
              <Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} placeholder="..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label">आगमनाचे तापमान (°C)</Label>
                <Input className="compact-input" type="number" value={formData.tempAtArrival} onChange={e => setFormData({...formData, tempAtArrival: e.target.value})} placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <Label className="compact-label">चिलिंग नंतर तापमान</Label>
                <Input className="compact-input" type="number" value={formData.tempAfterChilling} onChange={e => setFormData({...formData, tempAfterChilling: e.target.value})} placeholder="0.0" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Droplets className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">२) सुविधा व स्वच्छता</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'पाणी पुरवठा (Water)', key: 'waterSupply', options: ['OK', 'NOT-OK'] },
              { label: 'पॉवर बॅकअप (Power)', key: 'powerBackup', options: ['AVAILABLE', 'NONE'] },
              { label: 'स्वच्छता निकष', key: 'hygieneStandard', options: ['HIGH', 'MEDIUM', 'LOW'] },
              { label: 'स्टाफ गणवेश (Uniform)', key: 'staffUniform', options: ['YES', 'NO'] },
              { label: 'FSSAI डिस्प्ले', key: 'fssaiDisplay', options: ['YES', 'NO'] },
              { label: 'आईस बँक स्थिती', key: 'iceBankStatus', options: ['NORMAL', 'CRITICAL'] },
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
                      <RadioGroupItem value={opt} id={`chill-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`chill-${item.key}-${opt}`} className="compact-radio-label">{opt}</Label>
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
          <Label className="compact-label">अतिरिक्त निरीक्षणे (Observations)</Label>
          <Textarea 
            className="compact-input min-h-[60px] h-auto p-2" 
            value={formData.observations} 
            onChange={e => setFormData({...formData, observations: e.target.value})} 
            placeholder="..." 
          />
        </div>
      </Card>

      <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-primary/20 mb-10">
        <Save className="h-4 w-4" /> चिलिंग अहवाल जतन करा
      </Button>
    </div>
  )
}
