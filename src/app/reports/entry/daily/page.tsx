
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, Save, Briefcase, MapPin, ListTodo, ClipboardList, TrendingUp, Users, UserCheck, Mail, FileText, Settings
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
    officeTasks: { 
      milkSample: false, rateList: false, billing: false, 
      register: false, misReport: false, email: false 
    },
    customOfficeTask: "",
    workDetail: "",
    meetings: [{ id: "1", person: "", dept: "", timeFrom: "", timeTo: "", topic: "", result: "" }],
    achievements: "", problems: "", actions: "", followUp: "",
    supervisorName: ""
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
      summary: `प्रतिनिधी: ${formData.repName}. प्रकार: ${formData.workType}. कामगिरी: ${formData.achievements.slice(0, 40)}...`,
      overallSummary: `प्रतिनिधी: ${formData.repName}, शिफ्ट: ${formData.shift}, कामाचा प्रकार: ${formData.workType}`,
      fullData: { ...formData },
      createdAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), report)
    toast({ title: "यशस्वी", description: "दैनिक अहवाल जतन झाला." })
    router.push('/reports')
  }

  const addMeeting = () => setFormData({...formData, meetings: [...formData.meetings, { id: Date.now().toString(), person: "", dept: "", timeFrom: "", timeTo: "", topic: "", result: "" }]})
  const removeMeeting = (id: string) => setFormData({...formData, meetings: formData.meetings.filter(m => m.id !== id)})

  if (!mounted) return null

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
      <Icon className="h-3 w-3 text-primary" />
      <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">{title}</h3>
    </div>
  )

  return (
    <div className="compact-form-container px-2 pb-20 max-w-[500px] mx-auto">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ListTodo className="h-3.5 w-3.5 text-primary" /> दैनिक कामकाज (DAILY REPORT)</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3">
          <SectionTitle icon={Users} title="१) प्रतिनिधी माहिती (PERSONNEL)" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">नाव</Label><Input className="compact-input h-8 bg-muted/10 border-none font-black" value={formData.repName} readOnly /></div>
            <div className="space-y-0.5"><Label className="compact-label">आयडी (ID)</Label><Input className="compact-input h-8" value={formData.repId} onChange={e => setFormData({...formData, repId: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">पदनाम (DESIG.)</Label><Input className="compact-input h-8" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">शिफ्ट (SHIFT)</Label>
              <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2">
                <div className="flex items-center gap-1"><RadioGroupItem value="SAKAL" id="sh-s" className="h-2.5 w-2.5"/><Label htmlFor="sh-s" className="text-[8px] font-black">MORN</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="SANDHYA" id="sh-e" className="h-2.5 w-2.5"/><Label htmlFor="sh-e" className="text-[8px] font-black">EVE</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <SectionTitle icon={Briefcase} title="२) आजचा कामाचा प्रकार (WORK TYPE)" />
          <RadioGroup value={formData.workType} onValueChange={v => setFormData({...formData, workType: v})} className="flex flex-wrap gap-2">
            {['OFFICE', 'FIELD', 'MIXED'].map(o => <div key={o} className="compact-radio-item p-1.5 border-primary/10 bg-white"><RadioGroupItem value={o} id={`wt-${o}`} className="h-2.5 w-2.5" /><Label htmlFor={`wt-${o}`} className="text-[9px] font-black uppercase px-1">{o} WORK</Label></div>)}
          </RadioGroup>
          
          <div className="mt-3 space-y-2 border-t border-dashed pt-2">
            <Label className="text-[8px] font-black uppercase text-primary/60">प्रमुख कार्ये (OFFICE TASKS)</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { l: 'नमुना नोंद तपासणी', k: 'milkSample' }, { l: 'दरपत्रक मंजुरी', k: 'rateList' },
                { l: 'पेमेंट मंजुरी', k: 'billing' }, { l: 'रजिस्टर तपासणी', k: 'register' },
                { l: 'MIS रिपोर्ट अपडेट', k: 'misReport' }, { l: 'ई-मेल / पत्रव्यवहार', k: 'email' }
              ].map(it => (
                <div key={it.k} className="flex items-center space-x-1.5 bg-white p-1 rounded border border-primary/5">
                  <Checkbox checked={(formData.officeTasks as any)[it.k]} onCheckedChange={v => setFormData({...formData, officeTasks: {...formData.officeTasks, [it.k]: !!v}})} className="h-3 w-3" />
                  <span className="text-[7.5px] font-bold uppercase leading-none">{it.l}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={ClipboardList} title="३) कामाचा संक्षिप्त तपशील (DETAILS)" />
          <Textarea className="compact-input h-16 p-2 text-[10px] bg-slate-50 border-none shadow-inner" placeholder="केलेल्या कामाचा सविस्तर तपशील..." value={formData.workDetail} onChange={e => setFormData({...formData, workDetail: e.target.value})} />
        </Card>

        <Card className="compact-card p-3">
          <SectionTitle icon={Users} title="४) बैठका / भेटी (MEETINGS)" />
          <div className="space-y-2">
            {formData.meetings.map((m, i) => (
              <div key={m.id} className="p-2 border rounded-xl bg-slate-50 space-y-1.5 relative border-primary/5">
                <Button variant="ghost" size="icon" onClick={() => removeMeeting(m.id)} className="h-5 w-5 absolute top-1 right-1 text-rose-400"><X className="h-3 w-3"/></Button>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input placeholder="व्यक्ती / विभाग" className="h-7 text-[9px] p-1 bg-white border-none shadow-sm" value={m.person} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, person: e.target.value} : it)})} />
                  <div className="flex gap-1">
                    <Input type="time" className="h-7 text-[8px] p-1 bg-white border-none shadow-sm w-full" value={m.timeFrom} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, timeFrom: e.target.value} : it)})} />
                    <Input type="time" className="h-7 text-[8px] p-1 bg-white border-none shadow-sm w-full" value={m.timeTo} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, timeTo: e.target.value} : it)})} />
                  </div>
                </div>
                <Input placeholder="चर्चेचा विषय" className="h-7 text-[9px] p-1 bg-white border-none shadow-sm" value={m.topic} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, topic: e.target.value} : it)})} />
                <Input placeholder="निर्णय / कार्यवाही" className="h-7 text-[9px] p-1 bg-white border-none shadow-sm" value={m.result} onChange={e => setFormData({...formData, meetings: formData.meetings.map(it => it.id === m.id ? {...it, result: e.target.value} : it)})} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMeeting} className="w-full h-8 text-[9px] font-black uppercase border-dashed border-primary/20 bg-primary/5 text-primary"> बैठक जोडा (ADD MEETING)</Button>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-emerald-50/30 border-emerald-100">
          <SectionTitle icon={TrendingUp} title="५) सारांश व प्रमाणीकरण (SUMMARY)" />
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label text-emerald-600">आजची प्रमुख कामगिरी</Label><Input className="compact-input h-8 border-emerald-100" value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">आलेल्या समस्या</Label><Input className="compact-input h-8" value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label">उद्याचा Follow-up</Label><Input className="compact-input h-8" value={formData.followUp} onChange={e => setFormData({...formData, followUp: e.target.value})} /></div>
            <div className="space-y-0.5 mt-2"><Label className="compact-label">सुपरवायझर नाव</Label><Input className="compact-input h-9 bg-white border-emerald-100 font-bold" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg shadow-primary/20 mb-10 h-11 uppercase font-black transition-all active:scale-95">
          दैनिक अहवाल जतन करा (SUBMIT)
        </Button>
      </div>
    </div>
  )
}
