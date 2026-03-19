
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
  ArrowLeft, Save, Briefcase, MapPin, ListTodo, ClipboardList, TrendingUp, Users, UserCheck
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
    repName: "", repId: "", designation: "", mobile: "", shift: "SAKAL",
    workType: "OFFICE",
    officeTasks: [],
    customOfficeTask: "",
    workDetail: "",
    meetings: [{ id: "1", person: "", dept: "", time: "", topic: "", result: "" }],
    achievements: "", problems: "", actions: "", followUp: "",
    otherNotes: "", supervisorName: ""
  })

  useEffect(() => {
    setMounted(true)
    setFormData(prev => ({...prev, repName: user?.displayName || ""}))
  }, [user])

  const handleSave = () => {
    if (!db || !user) return
    const report = {
      type: 'Daily Work Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `प्रतिनिधी: ${formData.repName}. प्रकार: ${formData.workType}. महत्त्वाची कामगिरी: ${formData.achievements.slice(0, 30)}...`,
      overallSummary: `प्रतिनिधी: ${formData.repName}, शिफ्ट: ${formData.shift}, कामाचा प्रकार: ${formData.workType}, कामगिरी: ${formData.achievements}`,
      fullData: { ...formData },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "दैनिक अहवाल जतन झाला." })
    router.push('/reports')
  }

  const addMeeting = () => setFormData({...formData, meetings: [...formData.meetings, { id: Date.now().toString(), person: "", dept: "", time: "", topic: "", result: "" }]})

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
      <Icon className="h-3 w-3 text-primary" />
      <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">{title}</h3>
    </div>
  )

  return (
    <div className="compact-form-container px-2 pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ListTodo className="h-3.5 w-3.5 text-primary" /> दैनिक अहवाल (DAILY REPORT)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Users} title="१) प्रतिनिधीची मूलभूत माहिती" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">नाव</Label><Input className="compact-input h-8" value={formData.repName} readOnly /></div>
            <div className="space-y-0.5"><Label className="compact-label">आयडी</Label><Input className="compact-input h-8" value={formData.repId} onChange={e => setFormData({...formData, repId: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">Designation</Label><Input className="compact-input h-8" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">शिफ्ट</Label>
              <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2">
                <div className="flex items-center gap-1"><RadioGroupItem value="SAKAL" id="sh-s" className="h-2 w-2"/><Label htmlFor="sh-s" className="text-[8px] font-black">SAKAL</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="SANDHYA" id="sh-e" className="h-2 w-2"/><Label htmlFor="sh-e" className="text-[8px] font-black">SANDHYA</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Briefcase} title="२) आजचा कामाचा प्रकार" />
          <RadioGroup value={formData.workType} onValueChange={v => setFormData({...formData, workType: v})} className="flex flex-wrap gap-2">
            {['OFFICE', 'FIELD', 'MIXED'].map(o => <div key={o} className="compact-radio-item p-1.5"><RadioGroupItem value={o} id={`wt-${o}`} /><Label htmlFor={`wt-${o}`} className="text-[9px] font-black uppercase px-1">{o} WORK</Label></div>)}
          </RadioGroup>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={ClipboardList} title="३) कामाचा संक्षिप्त तपशील" />
          <div className="space-y-2">
            <Textarea className="compact-input h-16 p-2 text-[10px]" placeholder="आज केलेल्या कामाचा तपशील..." value={formData.workDetail} onChange={e => setFormData({...formData, workDetail: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Users} title="४) बैठका / भेटी (Meetings)" />
          <div className="space-y-2">
            {formData.meetings.map((m, i) => (
              <div key={m.id} className="p-2 border rounded-lg bg-slate-50 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Input placeholder="व्यक्ती / विभाग" className="h-7 text-[9px] p-1 bg-white" value={m.person} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, person: e.target.value} : it)})} />
                  <Input placeholder="वेळ" className="h-7 text-[9px] p-1 bg-white" value={m.time} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, time: e.target.value} : it)})} />
                </div>
                <Input placeholder="चर्चेचा विषय" className="h-7 text-[9px] p-1 bg-white" value={m.topic} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, topic: e.target.value} : it)})} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMeeting} className="w-full h-7 text-[8px] font-black uppercase border-dashed">बैठक जोडा</Button>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-emerald-50/20 border-emerald-100">
          <SectionTitle icon={TrendingUp} title="५) दिवसाचा एकूण आढावा" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label text-emerald-600">आजची प्रमुख कामगिरी</Label><Input className="compact-input h-8 border-emerald-100" value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">आलेल्या समस्या</Label><Input className="compact-input h-8" value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">उद्याचा Follow-up</Label><Input className="compact-input h-8" value={formData.followUp} onChange={e => setFormData({...formData, followUp: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-10 font-black uppercase">
          दैनिक अहवाल जतन करा
        </Button>
      </div>
    </div>
  )
}
