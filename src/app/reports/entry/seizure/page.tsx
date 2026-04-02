
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, AlertCircle, Ban, IndianRupee, ShieldAlert, RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

function SeizureReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: "", supplierId: "", route: "",
    seizureQty: "", milkType: "MIX", 
    reason: "Adulteration", fineAmount: "",
    actionTaken: "Destroyed", notes: ""
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
      setFormData(existingReport.fullData)
    }
  }, [existingReport])

  const handleSave = () => {
    if (!db || !user || !formData.supplierName) {
      toast({ title: "त्रुटी", description: "पुरवठादाराचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }

    const reportData = {
      type: 'Seizure & Penalty',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `जप्ती: ${formData.supplierName}. दूध: ${formData.seizureQty}L. दंड: ₹${formData.fineAmount}. कारण: ${formData.reason}.`,
      overallSummary: `जप्ती: ${formData.supplierName}. दूध: ${formData.seizureQty}L. दंड: ₹${formData.fineAmount}. कारण: ${formData.reason}.`,
      fullData: { ...formData, name: user.displayName || "संकलन सुपरवायझर" },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "जप्ती अहवाल अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "जप्ती अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5 text-destructive"><ShieldAlert className="h-3.5 w-3.5" /> {editId ? 'जप्ती अपडेट' : 'जप्ती व दंड (SEIZURE)'}</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Card className="compact-card border-destructive/10">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-destructive border-b pb-0.5 flex items-center gap-1"><Ban className="h-3 w-3" /> १) पुरवठादार माहिती</h3>
            <div className="space-y-1.5">
              <div className="space-y-0.5"><Label className="compact-label">नाव *</Label><Input className="compact-input h-9" value={formData.supplierName || ""} onChange={e => setFormData({...formData, supplierName: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5"><Label className="compact-label">आयडी / कोड</Label><Input className="compact-input h-9" value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} /></div>
                <div className="space-y-0.5"><Label className="compact-label">रूट</Label><Input className="compact-input h-9" value={formData.route || ""} onChange={e => setFormData({...formData, route: e.target.value})} /></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> २) जप्ती तपशील</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">दूध प्रमाण (L)</Label><Input type="number" className="compact-input h-9" value={formData.seizureQty || ""} onChange={e => setFormData({...formData, seizureQty: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">कारण (Reason)</Label><Input className="compact-input h-9" value={formData.reason || ""} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">केलेली कार्यवाही</Label><Input className="compact-input h-9" value={formData.actionTaken || ""} onChange={e => setFormData({...formData, actionTaken: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card bg-rose-50/30">
          <div className="space-y-1">
            <Label className="compact-label flex items-center gap-1"><IndianRupee className="h-3 w-3" /> दंड रक्कम (PENALTY AMOUNT)</Label>
            <Input type="number" className="compact-input h-10 border-destructive/20 text-lg text-destructive" value={formData.fineAmount || ""} onChange={e => setFormData({...formData, fineAmount: e.target.value})} placeholder="0.00" />
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full h-10 bg-destructive text-white mb-10">
          {editId ? <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {editId ? 'जप्ती अहवाल अपडेट करा' : 'जप्ती अहवाल जतन करा'}
        </Button>
      </div>
    </div>
  )
}

export default function SeizureReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <SeizureReportForm />
    </Suspense>
  )
}
