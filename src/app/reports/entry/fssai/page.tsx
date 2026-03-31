
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, ShieldCheck, Zap, ClipboardCheck, RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

function FSSAIForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    centerName: "", ownerName: "", mobile: "", address: "", district: "", taluka: "",
    capacity: "", licenseStatus: "VALID",
    facilities: { etp: "YES", generator: "YES", ro: "YES" }
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
    }
  }, [existingReport])

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "केंद्राचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    
    const report = {
      type: 'FSSAI Center Inspection',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `FSSAI: ${formData.centerName}. स्थिती: ${formData.licenseStatus}. क्षमता: ${formData.capacity}L.`,
      overallSummary: `केंद्र: ${formData.centerName}, जिल्हा: ${formData.district}, निकाल: ${formData.licenseStatus}`,
      fullData: { ...formData, inspector: user.displayName || "Quality Inspector" },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, report)
      toast({ title: "यशस्वी", description: "FSSAI अहवाल अद्ययावत झाला." })
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), {
        ...report,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "FSSAI अहवाल जतन झाला." })
    }
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> {editId ? 'FSSAI अपडेट' : 'FSSAI तपासणी (FSSAI)'}</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <ClipboardCheck className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">मूलभूत माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">केंद्राचे नाव *</Label><Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">मालक</Label><Input className="compact-input" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">मोबाईल</Label><Input className="compact-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">पत्ता</Label><Input className="compact-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">जिल्हा</Label><Input className="compact-input" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">तालुका</Label><Input className="compact-input" value={formData.taluka} onChange={e => setFormData({...formData, taluka: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">दूध प्रक्रिया क्षमता (L/Day)</Label><Input className="compact-input" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">परवाना स्थिती (LICENSE)</h3>
          </div>
          <RadioGroup value={formData.licenseStatus} onValueChange={v => setFormData({...formData, licenseStatus: v})} className="flex flex-wrap gap-2">
            {['VALID', 'EXPIRED', 'NOT AVAILABLE'].map(o => <div key={o} className="compact-radio-item p-1.5"><RadioGroupItem value={o} id={`ls-${o}`} className="h-2.5 w-2.5"/><Label htmlFor={`ls-${o}`} className="compact-radio-label">{o}</Label></div>)}
          </RadioGroup>
        </Card>

        <Card className="compact-card p-3 bg-primary/5">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Zap className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">उपकरणे व सुविधा</h3>
          </div>
          <div className="space-y-2">
            {[ {l: 'E.T.P.', k: 'etp'}, {l: 'Generator', k: 'generator'}, {l: 'RO Water', k: 'ro'} ].map(it => (
              <div key={it.k} className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-primary/10">
                <span className="text-[8px] font-black uppercase">{it.l} सुविधा?</span>
                <RadioGroup value={(formData.facilities as any)[it.k]} onValueChange={v => setFormData({...formData, facilities: {...formData.facilities, [it.k]: v}})} className="flex gap-2">
                  <div className="flex items-center gap-1"><RadioGroupItem value="YES" id={`${it.k}-y`} className="h-2 w-2"/><Label htmlFor={`${it.k}-y`} className="text-[7px]">YES</Label></div>
                  <div className="flex items-center gap-1"><RadioGroupItem value="NO" id={`${it.k}-n`} className="h-2 w-2"/><Label htmlFor={`${it.k}-n`} className="text-[7px]">NO</Label></div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg mb-10 h-11 uppercase font-black">
          {editId ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {editId ? 'तपासणी अपडेट करा' : 'तपासणी जतन करा (SUBMIT)'}
        </Button>
      </div>
    </div>
  )
}

export default function FSSAIInspectionPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <FSSAIForm />
    </Suspense>
  )
}
