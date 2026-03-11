"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Truck, AlertTriangle, MapPin, User, 
  Trash2, Save, History, PlusCircle, Milk, X, Edit, RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BreakdownRecord, BreakdownLoss } from "@/lib/types"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function BreakdownPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const breakdownsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'breakdowns')
  }, [db, user])

  const { data: records, isLoading } = useCollection(breakdownsQuery)
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    routeName: "",
    vehicleType: "",
    vehicleNumber: "",
    driverName: "",
    location: "",
    reason: "",
    losses: [] as BreakdownLoss[]
  })

  useEffect(() => setMounted(true), [])

  const handleAddLossRow = () => {
    const newLoss: BreakdownLoss = {
      id: crypto.randomUUID(),
      supplierCode: "",
      supplierName: "",
      bufMilkLossLiters: "",
      cowMilkLossLiters: "",
      lossAmount: ""
    }
    setFormData({ ...formData, losses: [...formData.losses, newLoss] })
  }

  const handleRemoveLossRow = (id: string) => {
    setFormData({ ...formData, losses: formData.losses.filter(l => l.id !== id) })
  }

  const updateLossRow = (id: string, updates: Partial<BreakdownLoss>) => {
    setFormData({
      ...formData,
      losses: formData.losses.map(l => l.id === id ? { ...l, ...updates } : l)
    })
  }

  const calculateTotalLoss = () => {
    return formData.losses.reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
  }

  const handleSaveRecord = () => {
    if (!formData.routeName || !formData.vehicleNumber || !db || !user) {
      toast({ title: "त्रुटी", description: "माहिती आणि लॉग-इन आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = calculateTotalLoss()
    const reportDate = new Date().toISOString().split('T')[0];
    
    const recordData = {
      ...formData,
      date: reportDate,
      totalLossAmount: totalLoss,
      updatedAt: new Date().toISOString()
    }

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'breakdowns', editingId)
      updateDocumentNonBlocking(docRef, recordData)
      toast({ title: "अद्ययावत केले", description: "रेकॉर्ड यशस्वीरित्या अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'breakdowns')
      addDocumentNonBlocking(colRef, { ...recordData, createdAt: new Date().toISOString() })
      
      // Add to daily reports as well
      const reportsRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(reportsRef, {
        type: 'Breakdown',
        date: reportDate,
        reportDate: reportDate,
        summary: `ब्रेकडाऊन: ${formData.routeName} | गाडी: ${formData.vehicleNumber} | नुकसान: ₹${totalLoss}`,
        overallSummary: `ब्रेकडाऊन: ${formData.routeName} | गाडी: ${formData.vehicleNumber} | नुकसान: ₹${totalLoss}`,
        generatedByUserId: user.uid,
        fullData: { ...recordData, reportType: 'breakdown' },
        createdAt: new Date().toISOString()
      })
      
      toast({ title: "जतन केले", description: "ब्रेकडाऊन रेकॉर्ड यशस्वीरित्या सेव्ह झाला." })
    }

    resetForm()
  }

  const handleEditRecord = (record: BreakdownRecord) => {
    setEditingId(record.id)
    setFormData({
      routeName: record.routeName,
      vehicleType: record.vehicleType,
      vehicleNumber: record.vehicleNumber,
      driverName: record.driverName,
      location: record.location,
      reason: record.reason,
      losses: record.losses
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      routeName: "", vehicleType: "", vehicleNumber: "", driverName: "",
      location: "", reason: "", losses: []
    })
  }

  const handleDeleteRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!db || !user || !id) return
    if (!confirm("हा रेकॉर्ड कायमचा हटवायचा आहे का?")) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'breakdowns', id)
      deleteDocumentNonBlocking(docRef)
      if (editingId === id) resetForm()
      toast({ title: "हटवले", description: "रेकॉर्ड काढून टाकला आहे." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "हटवताना अडचण आली.", variant: "destructive" })
    }
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1 sm:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-1 px-1">
        <h2 className="text-base font-headline font-black text-foreground flex items-center gap-2">
          <Truck className="h-4 w-4 text-destructive" /> वाहन ब्रेकडाऊन (Breakdown)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className={`lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden ${editingId ? 'ring-1 ring-primary' : ''}`}>
          <CardHeader className={`${editingId ? 'bg-primary/5' : 'bg-destructive/5'} py-2 px-3 border-b flex flex-row items-center justify-between`}>
            <span className="text-[10px] font-black uppercase flex items-center gap-2">
              {editingId ? <Edit className="h-3.5 w-3.5 text-primary" /> : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
              {editingId ? 'माहिती बदला' : 'नवीन नोंद'}
            </span>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[9px] font-black uppercase gap-1 px-2">
                <RotateCcw className="h-3 w-3" /> रद्द
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-3 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">रूट (Route)</Label><Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">गाडी नंबर</Label><Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">प्रकार (Type)</Label><Input value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">ड्रायव्हर</Label><Input value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
              <div className="col-span-2 space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">लोकेशन</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
              <div className="col-span-2 space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">कारण</Label><Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase text-destructive flex items-center gap-1.5"><Milk className="h-3.5 w-3.5" /> नुकसान तपशील</span>
                <Button size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] font-black gap-1 uppercase rounded-md bg-destructive hover:bg-destructive/90 px-3"><PlusCircle className="h-3.5 w-3.5" /> जोडा</Button>
              </div>
              <div className="responsive-table-container border rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead><tr className="bg-muted/50 text-[8px] font-black uppercase text-muted-foreground border-b"><th className="p-1.5 w-6">#</th><th className="p-1.5">कोड</th><th className="p-1.5">गवळी</th><th className="p-1.5 text-right">रक्कम</th><th className="p-1.5 w-8"></th></tr></thead>
                  <tbody>
                    {formData.losses.map((loss, idx) => (
                      <tr key={loss.id} className="border-b last:border-0">
                        <td className="p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="p-0"><Input value={loss.supplierCode} onChange={e => updateLossRow(loss.id, { supplierCode: e.target.value })} className="h-7 text-[10px] border-none text-center px-1" /></td>
                        <td className="p-0"><Input value={loss.supplierName} onChange={e => updateLossRow(loss.id, { supplierName: e.target.value })} className="h-7 text-[10px] border-none px-1.5" /></td>
                        <td className="p-0"><Input value={loss.lossAmount} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-7 text-[10px] border-none text-right px-1.5 font-black text-destructive" /></td>
                        <td className="p-1 flex justify-center"><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Button onClick={handleSaveRecord} className={`w-full font-black h-9 rounded-lg shadow-md text-xs ${editingId ? 'bg-primary' : 'bg-destructive'}`}><Save className="h-4 w-4 mr-1.5" /> {editingId ? 'अपडेट करा' : 'जतन करा'}</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-2">
          <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
            <div className="bg-muted/10 py-2 px-3 border-b flex items-center gap-2"><History className="h-3.5 w-3.5 text-primary" /><span className="text-[10px] font-black uppercase tracking-tight">जुने रेकॉर्ड</span></div>
            <ScrollArea className="h-[400px] lg:h-[600px]">
              <div className="p-2 space-y-2">
                {records?.map((record) => (
                  <Card key={record.id} className={`border shadow-none transition-all rounded-lg overflow-hidden ${editingId === record.id ? 'bg-primary/5 ring-1 ring-primary' : ''}`}>
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0" onClick={() => handleEditRecord(record)}>
                          <h4 className="font-black text-[11px] text-foreground truncate">{record.routeName}</h4>
                          <p className="text-[9px] font-black text-muted-foreground uppercase">{record.vehicleNumber} | {record.date}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleEditRecord(record)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleDeleteRecord(e, record.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-dashed">
                        <span className="text-[8px] font-black uppercase text-muted-foreground">{record.losses.length} गवळी</span>
                        <Badge className="h-4 text-[9px] font-black bg-destructive text-white border-none">₹{record.totalLossAmount}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}