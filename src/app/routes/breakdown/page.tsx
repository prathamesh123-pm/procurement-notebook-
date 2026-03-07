
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Truck, AlertTriangle, MapPin, User, 
  Trash2, Save, History, PlusCircle, Milk, X, Edit, RotateCcw, IndianRupee
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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

  const calculateTotalLoss = () => {
    return formData.losses.reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
  }

  const handleSaveRecord = () => {
    if (!formData.routeName || !formData.vehicleNumber) {
      toast({ title: "त्रुटी", description: "रूट आणि गाडी नंबर आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = calculateTotalLoss()
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

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const reportSummary = `ब्रेकडाऊन: ${formData.routeName} | गाडी: ${formData.vehicleNumber} | नुकसान: ₹${totalLoss}`
    
    const reportData = {
      id: recordIdForReport,
      type: 'Breakdown',
      date: reportDate,
      summary: reportSummary,
      fullData: { ...formData, totalLossAmount: totalLoss, date: reportDate }
    }

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
    
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const updatedReports = storedReports.filter((r: any) => r.id !== id)
    localStorage.setItem('procurepal_reports', JSON.stringify(updatedReports))

    if (editingId === id) resetForm()
    toast({ title: "हटवले", description: "रेकॉर्ड काढून टाकला आहे." })
  }

  if (!mounted) return null

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">रूट (Route)</Label>
                <Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="रस्तापूर" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">गाडी नंबर</Label>
                <Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="MH 10..." />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">प्रकार (Type)</Label>
                <Input value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="Tata Ace" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">ड्रायव्हर</Label>
                <Input value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="नाव" />
              </div>
              <div className="col-span-2 space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">लोकेशन</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="उदा. मुख्य चौक" />
              </div>
              <div className="col-span-2 space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">कारण</Label>
                <Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="ब्रेकडाऊनचे कारण" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase text-destructive flex items-center gap-1.5">
                  <Milk className="h-3.5 w-3.5" /> नुकसान तपशील
                </span>
                <Button size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] font-black gap-1 uppercase rounded-md bg-destructive hover:bg-destructive/90 px-3">
                  <PlusCircle className="h-3.5 w-3.5" /> गवळी जोडा
                </Button>
              </div>

              <div className="responsive-table-container border rounded-lg overflow-hidden">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-[8px] font-black uppercase text-muted-foreground border-b">
                      <th className="p-1.5 text-center border-r w-6">#</th>
                      <th className="p-1.5 text-left border-r w-16">कोड</th>
                      <th className="p-1.5 text-left border-r min-w-[80px]">गवळी नाव</th>
                      <th className="p-1.5 text-center border-r w-12">म्हेस</th>
                      <th className="p-1.5 text-center border-r w-12">गाय</th>
                      <th className="p-1.5 text-right border-r w-16">रक्कम</th>
                      <th className="p-1.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.losses.map((loss, idx) => (
                      <tr key={loss.id} className="border-b last:border-0">
                        <td className="p-1.5 text-center border-r font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="p-0 border-r">
                          <Input value={loss.supplierCode} onChange={e => updateLossRow(loss.id, { supplierCode: e.target.value })} className="h-7 text-[10px] border-none text-center px-1 font-bold" placeholder="ID" />
                        </td>
                        <td className="p-0 border-r">
                          <Input value={loss.supplierName} onChange={e => updateLossRow(loss.id, { supplierName: e.target.value })} className="h-7 text-[10px] border-none px-1.5 font-bold" placeholder="नाव" />
                        </td>
                        <td className="p-0 border-r">
                          <Input value={loss.bufMilkLossLiters} onChange={e => updateLossRow(loss.id, { bufMilkLossLiters: e.target.value })} className="h-7 text-[10px] border-none text-center px-1" placeholder="L" />
                        </td>
                        <td className="p-0 border-r">
                          <Input value={loss.cowMilkLossLiters} onChange={e => updateLossRow(loss.id, { cowMilkLossLiters: e.target.value })} className="h-7 text-[10px] border-none text-center px-1" placeholder="L" />
                        </td>
                        <td className="p-0 border-r">
                          <Input value={loss.lossAmount} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-7 text-[10px] border-none text-right px-1.5 font-black text-destructive" placeholder="₹" />
                        </td>
                        <td className="p-1 flex justify-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-6 w-6 text-destructive rounded-full"><X className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))}
                    {formData.losses.length > 0 && (
                      <tr className="bg-destructive/5 font-black">
                        <td colSpan={5} className="p-2 text-right text-[9px] uppercase border-r">एकूण नुकसान रक्कम (Total Loss):</td>
                        <td className="p-2 text-right text-[11px] text-destructive border-r">₹{calculateTotalLoss()}</td>
                        <td className="p-2"></td>
                      </tr>
                    )}
                    {formData.losses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-[9px] italic text-muted-foreground uppercase">नोंद करण्यासाठी वरील बटण दाबा.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Button onClick={handleSaveRecord} className={`w-full font-black h-9 rounded-lg shadow-md text-xs ${editingId ? 'bg-primary' : 'bg-destructive'}`}>
              <Save className="h-4 w-4 mr-1.5" />
              {editingId ? 'अपडेट करा (Update)' : 'रेकॉर्ड जतन करा (Save)'}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-2">
          <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
            <div className="bg-muted/10 py-2 px-3 border-b flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-tight">जुने रेकॉर्ड (History)</span>
            </div>
            <ScrollArea className="h-[400px] lg:h-[600px]">
              <div className="p-2 space-y-2">
                {records.length > 0 ? (
                  records.map((record) => (
                    <Card key={record.id} className={`border shadow-none transition-all rounded-lg overflow-hidden ${editingId === record.id ? 'bg-primary/5 ring-1 ring-primary' : 'bg-white hover:bg-muted/5'}`}>
                      <div className="p-2.5 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h4 className="font-black text-[11px] text-foreground truncate">{record.routeName}</h4>
                            <p className="text-[9px] font-black text-muted-foreground uppercase">{record.vehicleNumber} | {record.date}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary rounded-md" onClick={() => handleEditRecord(record)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-md" onClick={() => handleDeleteRecord(record.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-muted-foreground bg-muted/20 p-1.5 rounded-md">
                          <div className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3 text-destructive" /> {record.location}</div>
                          <div className="flex items-center gap-1.5 truncate"><User className="h-3 w-3 text-primary" /> {record.driverName}</div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-dashed">
                          <span className="text-[8px] font-black uppercase text-muted-foreground">{record.losses.length} गवळी</span>
                          <Badge className="h-4 text-[9px] font-black bg-destructive text-white border-none">₹{record.totalLossAmount}</Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10 flex flex-col items-center gap-2 opacity-30">
                    <History className="h-8 w-8" />
                    <p className="text-[9px] font-black uppercase">नोंदी नाहीत</p>
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
