
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
  ArrowLeft, Save, ListTodo, User, Calendar, Clock
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
    repName: "", repId: "", shift: "MORN",
    workType: "OFFICE", summary: "", problems: "", actionTaken: ""
  })

  useEffect(() => {
    setMounted(true)
    if (user) setFormData(prev => ({...prev, repName: user.displayName || ""}))
  }, [user])

  const handleSave = () => {
    if (!db || !user) return
    const report = {
      type: 'Daily Work Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `कामकाज: ${formData.workType}. सारांश: ${formData.summary.slice(0, 40)}...`,
      overallSummary: `प्रतिनिधी: ${formData.repName}, शिफ्ट: ${formData.shift}, प्रकार: ${formData.workType}`,
      fullData: { ...formData },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "दैनिक कामकाज अहवाल जतन झाला." })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ListTodo className="h-3.5 w-3.5 text-primary" /> दैनिक कामकाज (DAILY)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <User className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">प्रतिनिधी माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">प्रतिनिधी नाव</Label><Input className="compact-input font-black" value={formData.repName} readOnly /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">आयडी (ID)</Label><Input className="compact-input" value={formData.repId} onChange={e => setFormData({...formData, repId: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">शिफ्ट (SHIFT)</Label>
                <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2">
                  <div className="flex items-center gap-1"><RadioGroupItem value="MORN" id="s-m" className="h-2.5 w-2.5"/><Label htmlFor="s-m" className="text-[8px] font-black">MORN</Label></div>
                  <div className="flex items-center gap-1"><RadioGroupItem value="EVE" id="s-e" className="h-2.5 w-2.5"/><Label htmlFor="s-e" className="text-[8px] font-black">EVE</Label></div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Clock className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">आजच्या कामाचा प्रकार</h3>
          </div>
          <RadioGroup value={formData.workType} onValueChange={v => setFormData({...formData, workType: v})} className="flex flex-wrap gap-2">
            {['OFFICE', 'FIELD', 'MIXED'].map(o => <div key={o} className="compact-radio-item p-1.5"><RadioGroupItem value={o} id={`wt-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`wt-${o}`} className="compact-radio-label">{o}</Label></div>)}
          </RadioGroup>
        </Card>

        <Card className="compact-card p-3">
          <div className="space-y-3">
            <div className="space-y-0.5"><Label className="compact-label">केलेल्या कामाचा सारांश</Label><Textarea className="compact-input h-20 p-2 text-[10px]" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="..." /></div>
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">महत्त्वाच्या समस्या</Label><Textarea className="compact-input h-16 p-2 text-[10px]" value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="..." /></div>
            <div className="space-y-0.5"><Label className="compact-label text-emerald-600">केलेली कार्यवाही</Label><Textarea className="compact-input h-16 p-2 text-[10px]" value={formData.actionTaken} onChange={e => setFormData({...formData, actionTaken: e.target.value})} placeholder="..." /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg mb-10 h-11 uppercase font-black">
          अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
