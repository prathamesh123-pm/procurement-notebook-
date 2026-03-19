"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, Briefcase, MapPin, ClipboardList, TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

export default function DailyWorkReportPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    officeWork: "", fieldVisits: "",
    achievements: "", problems: "",
    supervisorName: ""
  })

  useEffect(() => setMounted(true), [])

  const handleSave = () => {
    if (!db || !user) return
    const report = {
      type: 'Daily Work',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ऑफिस: ${formData.officeWork.slice(0, 30)}... | फिल्ड: ${formData.fieldVisits.slice(0, 30)}...`,
      overallSummary: `ऑफिस: ${formData.officeWork} | फिल्ड: ${formData.fieldVisits}`,
      fullData: { ...formData, name: user.displayName || "Procurement Officer" },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "दैनिक अहवाल जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" /> दैनिक अहवाल (DAILY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Card className="compact-card">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><Briefcase className="h-3 w-3" /> १) ऑफिस कामकाज</h3>
            <Textarea className="compact-input min-h-[60px] h-auto p-2" value={formData.officeWork} onChange={e => setFormData({...formData, officeWork: e.target.value})} placeholder="..." />
          </div>
        </Card>

        <Card className="compact-card">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> २) क्षेत्र भेटी (Field)</h3>
            <Textarea className="compact-input min-h-[60px] h-auto p-2" value={formData.fieldVisits} onChange={e => setFormData({...formData, fieldVisits: e.target.value})} placeholder="..." />
          </div>
        </Card>

        <Card className="compact-card bg-emerald-50/30 border-emerald-100">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-emerald-600 border-b border-emerald-100 pb-0.5 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> ३) आजची प्रगती (Achievements)</h3>
            <Textarea className="compact-input min-h-[50px] h-auto p-2 border-emerald-100" value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="..." />
          </div>
        </Card>

        <Card className="compact-card">
          <div className="space-y-1">
            <Label className="compact-label">सुपरवायझर नाव</Label>
            <Input className="compact-input h-9" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} />
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full h-10 bg-primary text-white mb-10"><Save className="h-3.5 w-3.5 mr-1.5" /> अहवाल जतन करा</Button>
      </div>
    </div>
  )
}
