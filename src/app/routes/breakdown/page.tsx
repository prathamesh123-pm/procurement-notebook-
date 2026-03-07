
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Truck, AlertTriangle, MapPin, User, Hash, 
  Trash2, Plus, Save, History, PlusCircle, Milk, IndianRupee, X, Edit, RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BreakdownRecord, BreakdownLoss } from "@/lib/types"

export default function BreakdownPage() {
  const [records, setRecords] = useState<BreakdownRecord[]>([])
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    routeName: "",
    vehicleType: "",
    vehicleNumber: "",
    driverName: "",
    location: "",
    reason: "",
    losses: [] as BreakdownLoss[]
  })

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_breakdowns') || '[]')
    setRecords(stored)
  }, [])

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

  const handleSaveRecord = () => {
    if (!formData.routeName || !formData.vehicleNumber) {
      toast({ title: "त्रुटी", description: "रूट आणि गाडी नंबर आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = formData.losses.reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
    const reportDate = new Date().toISOString().split('T')[0];
    
    let updatedRecords: BreakdownRecord[]
    let recordIdForReport = editingId;

    if (editingId) {
      updatedRecords = records.map(r => 
        r.id === editingId 
          ? { ...r, ...formData, totalLossAmount: totalLoss } 
          : r
      )
      toast({ title: "अद्ययावत केले", description: "रेकॉर्ड यशस्वीरित्या अपडेट झाला." })
    } else {
      recordIdForReport = crypto.randomUUID();
      const newRecord: BreakdownRecord = {
        id: recordIdForReport as string,
        ...formData,
        date: reportDate,
        totalLossAmount: totalLoss
      }
      updatedRecords = [newRecord, ...records]
      toast({ title: "जतन केले", description: "ब्रेकडाऊन रेकॉर्ड यशस्वीरित्या सेव्ह झाला." })
    }

    setRecords(updatedRecords)
    localStorage.setItem('procurepal_breakdowns', JSON.stringify(updatedRecords))

    // Push to central reports
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const reportSummary = `ब्रेकडाऊन: ${formData.routeName} | गाडी: ${formData.vehicleNumber} | नुकसान: ₹${totalLoss}`
    
    const reportData = {
      id: recordIdForReport,
      type: 'Breakdown',
      date: reportDate,
      summary: reportSummary,
      fullData: { ...formData, totalLossAmount: totalLoss, date: reportDate }
    }

    // Update or Add Report
    const updatedReports = storedReports.filter((r: any) => r.id !== recordIdForReport);
    localStorage.setItem('procurepal_reports', JSON.stringify([reportData, ...updatedReports]))

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

  const handleDeleteRecord = (id: string) => {
    if (!confirm("हा रेकॉर्ड हटवायचा आहे का?")) return
    const updated = records.filter(r => r.id !== id)
    setRecords(updated)
    localStorage.setItem('procurepal_breakdowns', JSON.stringify(updated))
    
    // Also remove from reports
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const updatedReports = storedReports.filter((r: any) => r.id !== id)
    localStorage.setItem('procurepal_reports', JSON.stringify(updatedReports))

    if (editingId === id) resetForm()
    toast({ title: "हटवले", description: "रेकॉर्ड काढून टाकला आहे." })
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-2 sm:px-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 border-b pb-2">
        <h2 className="text-xl font-headline font-black text-foreground flex items-center gap-2">
          <Truck className="h-5 w-5 text-destructive" /> वाहन ब्रेकडाऊन (Vehicle Breakdown)
        </h2>
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">Breakdown & Loss Records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <Card className={`lg:col-span-7 border-none shadow-sm bg-white rounded-2xl overflow-hidden ${editingId ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader className={`${editingId ? 'bg-primary/5' : 'bg-destructive/5'} py-3 border-b flex flex-row items-center justify-between`}>
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase">
              {editingId ? <Edit className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
              {editingId ? 'माहिती बदला (Edit Entry)' : 'नवीन नोंद (New Entry)'}
            </CardTitle>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 text-[10px] font-black uppercase gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> रद्द करा
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">रूट नाव (Route)</Label>
                <Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-10 text-sm rounded-xl" placeholder="उदा. रस्तापूर रूट" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">गाडी नंबर (Vehicle No)</Label>
                <Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="h-10 text-sm rounded-xl" placeholder="MH 10 AB 1234" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">गाडी प्रकार (Type)</Label>
                <Input value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="h-10 text-sm rounded-xl" placeholder="उदा. Tata Ace" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">ड्रायव्हर नाव (Driver)</Label>
                <Input value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="h-10 text-sm rounded-xl" placeholder="नाव" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">लोकेशन (Location)</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-10 text-sm rounded-xl" placeholder="उदा. मुख्य चौक, रस्तापूर" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">कारण (Reason)</Label>
                <Textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="min-h-[80px] text-sm rounded-xl" placeholder="ब्रेकडाऊनचे कारण..." />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase text-destructive flex items-center gap-2">
                  <Milk className="h-4 w-4" /> नुकसान तपशील (Loss Details)
                </h4>
                <Button size="sm" variant="outline" onClick={handleAddLossRow} className="h-8 text-[10px] font-black gap-1.5 uppercase rounded-lg border-destructive/20 text-destructive">
                  <PlusCircle className="h-4 w-4" /> गवळ्याची नोंद जोडा
                </Button>
              </div>

              <div className="responsive-table-container rounded-xl border border-dashed p-1.5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30 text-[10px] font-black uppercase text-muted-foreground border-b">
                      <th className="p-2.5 text-left">गवळी (Supplier)</th>
                      <th className="p-2.5 text-center">म्हेस (Buf)</th>
                      <th className="p-2.5 text-center">गाय (Cow)</th>
                      <th className="p-2.5 text-right">रक्कम</th>
                      <th className="p-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.losses.map((loss) => (
                      <tr key={loss.id} className="border-b last:border-0">
                        <td className="p-1.5 space-y-1">
                          <Input value={loss.supplierCode} onChange={e => updateLossRow(loss.id, { supplierCode: e.target.value })} className="h-8 text-[11px] px-2" placeholder="कोड" />
                          <Input value={loss.supplierName} onChange={e => updateLossRow(loss.id, { supplierName: e.target.value })} className="h-8 text-[11px] px-2" placeholder="नाव" />
                        </td>
                        <td className="p-1.5">
                          <Input value={loss.bufMilkLossLiters} onChange={e => updateLossRow(loss.id, { bufMilkLossLiters: e.target.value })} className="h-8 text-[11px] text-center" placeholder="Liters" />
                        </td>
                        <td className="p-1.5">
                          <Input value={loss.cowMilkLossLiters} onChange={e => updateLossRow(loss.id, { cowMilkLossLiters: e.target.value })} className="h-8 text-[11px] text-center" placeholder="Liters" />
                        </td>
                        <td className="p-1.5">
                          <Input value={loss.lossAmount} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-8 text-[11px] text-right font-black" placeholder="₹" />
                        </td>
                        <td className="p-1.5 text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-7 w-7 text-destructive"><X className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {formData.losses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-[11px] italic text-muted-foreground uppercase">कोणतीही नुकसान नोंद नाही.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              {editingId && (
                <Button variant="outline" onClick={resetForm} className="flex-1 font-black h-12 rounded-xl text-sm">
                  रद्द करा
                </Button>
              )}
              <Button onClick={handleSaveRecord} className={`flex-[2] font-black h-12 rounded-xl shadow-lg text-sm ${editingId ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-destructive hover:bg-destructive/90 shadow-destructive/20'}`}>
                <Save className="h-5 w-5 mr-2" />
                {editingId ? 'अपडेट करा (Update Record)' : 'रेकॉर्ड जतन करा (Save Record)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/5 py-3 border-b">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase">
                <History className="h-4 w-4 text-primary" /> जुने रेकॉर्ड (History)
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px] lg:h-[700px]">
              <div className="p-4 space-y-4">
                {records.length > 0 ? (
                  records.map((record) => (
                    <Card key={record.id} className={`border-none shadow-sm transition-all rounded-xl overflow-hidden group ${editingId === record.id ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted/20 hover:bg-muted/30'}`}>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-sm text-foreground">{record.routeName}</h4>
                            <p className="text-[10px] font-black text-muted-foreground uppercase">{record.vehicleNumber} | {record.vehicleType} | {record.date}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditRecord(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-destructive" /> {record.location}</div>
                          <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-primary" /> {record.driverName}</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-dashed text-[11px] font-medium text-gray-700">
                          <span className="font-black uppercase text-destructive text-[9px] block mb-1">कारण (Reason):</span>
                          {record.reason}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">{record.losses.length} गवळ्यांचे नुकसान</span>
                          <Badge variant="destructive" className="h-5 text-[10px] font-black px-2">₹{record.totalLossAmount}</Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 flex flex-col items-center gap-3">
                    <History className="h-12 w-12 text-muted-foreground/20" />
                    <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">रेकॉर्ड सापडले नाही</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
