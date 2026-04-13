"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Plus, Search, Thermometer, Edit, X, ChevronRight,
  Printer, Milk, ShieldCheck, Box, Truck, 
  Zap, Warehouse, User, MapPin, CheckCircle2,
  Trash2, Droplets, Sun, Waves, Wind, FlaskConical, Shirt, Clock, Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ChillingCenter, TankItem, TankerLogItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ChillingCentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'chillingCenters')
  }, [db, user])

  const { data: centers, isLoading } = useCollection<ChillingCenter>(centersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<ChillingCenter | null>(null)
  
  const [formData, setFormData] = useState({
    name: "", ownerName: "", code: "", address: "", mobile: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    hasBmc: false, hasIbt: false,
    hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
    hasLab: false, staffUniform: false,
    tanks: [] as TankItem[],
    tankerLogs: [] as TankerLogItem[],
    morningTime: "", eveningTime: "",
    supplierCount: "0", fatMachineBrand: "",
    otherDairySupply: "",
    fssaiNumber: "", fssaiExpiry: "",
    waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
    hasTransportLicenses: false, pestControlDone: false, 
    staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add'); setEditingId(null);
    setFormData({
      name: "", ownerName: "", code: "", address: "", mobile: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      hasBmc: false, hasIbt: false,
      hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
      hasLab: false, staffUniform: false,
      tanks: [], tankerLogs: [],
      morningTime: "", eveningTime: "",
      supplierCount: "0", fatMachineBrand: "",
      otherDairySupply: "",
      fssaiNumber: "", fssaiExpiry: "",
      waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
      hasTransportLicenses: false, pestControlDone: false, 
      staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: ChillingCenter) => {
    setDialogMode('edit'); setEditingId(center.id);
    setFormData({
      name: center.name || "", ownerName: center.ownerName || "", code: center.code || "", address: center.address || "", mobile: center.mobile || "",
      cowQty: String(center.cowMilk?.quantity || 0), cowFat: String(center.cowMilk?.fat || 0), cowSnf: String(center.cowMilk?.snf || 0),
      bufQty: String(center.buffaloMilk?.quantity || 0), bufFat: String(center.buffaloMilk?.fat || 0), bufSnf: String(center.buffaloMilk?.snf || 0),
      hasBmc: center.hasBmc || false, hasIbt: center.hasIbt || false,
      hasEtp: center.hasEtp || false, hasSolar: center.hasSolar || false,
      hasHotWater: center.hasHotWater || false, hasDrainage: center.hasDrainage || false,
      hasLab: center.hasLab || false, staffUniform: center.staffUniform || false,
      tanks: center.tanks || [], tankerLogs: center.tankerLogs || [],
      morningTime: center.morningTime || "", eveningTime: center.eveningTime || "",
      supplierCount: String(center.supplierCount || 0), fatMachineBrand: center.fatMachineBrand || "",
      otherDairySupply: center.otherDairySupply || "",
      fssaiNumber: center.fssaiNumber || "", fssaiExpiry: center.fssaiExpiry || "",
      waterSource: center.waterSource || "Borewell", powerBackup: center.powerBackup || "Generator", 
      hygieneGrade: center.hygieneGrade || "A",
      hasTransportLicenses: center.hasTransportLicenses || false,
      pestControlDone: center.pestControlDone || false,
      staffHealthCheckDone: center.staffHealthCheckDone || false,
      calibrationDone: center.calibrationDone || false,
      fireSafetyOk: center.fireSafetyOk || false
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.code || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड आवश्यक आहे.", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'chillingCenters'), data)
      toast({ title: "यशस्वी", description: "चिलिंग सेंटर जोडले गेले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'chillingCenters', editingId), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
  }

  const addTankRow = () => {
    setFormData({ ...formData, tanks: [...formData.tanks, { id: crypto.randomUUID(), label: `टाकी ${formData.tanks.length + 1}`, capacity: "" }] })
  }

  const updateTankRow = (id: string, capacity: string) => {
    setFormData({ ...formData, tanks: formData.tanks.map(t => t.id === id ? { ...t, capacity } : t) })
  }

  const removeTankRow = (id: string) => {
    setFormData({ ...formData, tanks: formData.tanks.filter(t => t.id !== id) })
  }

  const addTankerLogRow = () => {
    setFormData({ ...formData, tankerLogs: [...formData.tankerLogs, { id: crypto.randomUUID(), tankerNo: "", arrivalTime: "", departureTime: "", qtyFilled: "" }] })
  }

  const updateTankerLogRow = (id: string, updates: Partial<TankerLogItem>) => {
    setFormData({ ...formData, tankerLogs: formData.tankerLogs.map(tl => tl.id === id ? { ...tl, ...updates } : tl) })
  }

  const removeTankerLogRow = (id: string) => {
    setFormData({ ...formData, tankerLogs: formData.tankerLogs.filter(tl => tl.id !== id) })
  }

  const handleDelete = (id: string) => {
    if (!db) return
    if (confirm("हे सेंटर हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'chillingCenters', id))
      setSelectedCenter(null)
      toast({ title: "यशस्वी", description: "सेंटर हटवण्यात आले." })
    }
  }

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toString().includes(searchQuery)
    )
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Thermometer className="h-6 w-6 text-primary" /> चिलिंग सेंटर (CHILLING)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logistics, Tanks & Audit Records</p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन चिलिंग सेंटर
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-2xl bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-primary/5 transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase">{center.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md">ID: {center.code}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold">
                      <MapPin className="h-3 w-3" /> {center.address || "---"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[600px] flex flex-col items-center">
          {selectedCenter ? (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left bg-white">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">CHILLING CENTER PROFILE</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] text-destructive border-destructive/20" onClick={() => handleDelete(selectedCenter.id)}><Trash2 className="h-4 w-4 mr-1.5" /> हटवा</Button>
                </div>
              </div>

              <div className="w-full border-b-4 border-black pb-3 mb-6 text-center">
                <h3 className="text-[22pt] font-black uppercase text-primary tracking-[0.1em]">{selectedCenter.name}</h3>
                <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {selectedCenter.code} | चिलिंग सेंटर सविस्तर अहवाल</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="border-[1.5px] border-black rounded-sm overflow-hidden">
                  <div className="bg-slate-800 text-white p-1 text-[10px] font-black uppercase text-center border-b border-black">१) प्राथमिक माहिती</div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px] w-[120px]">मालक नाव</td><td className="p-2 font-bold text-[11px]">{selectedCenter.ownerName || "-"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">मोबाईल</td><td className="p-2 font-bold text-[11px]">{selectedCenter.mobile || "-"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">पत्ता</td><td className="p-2 font-bold text-[11px] leading-tight">{selectedCenter.address || "-"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">सप्लायर संख्या</td><td className="p-2 font-black text-[11px] text-primary">{selectedCenter.supplierCount || "0"}</td></tr>
                      <tr><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">FSSAI क्र.</td><td className="p-2 font-bold text-[11px]">{selectedCenter.fssaiNumber || "-"}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-[1.5px] border-black rounded-sm overflow-hidden">
                  <div className="bg-slate-800 text-white p-1 text-[10px] font-black uppercase text-center border-b border-black">२) तांत्रिक सुविधा</div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px] w-[120px]">BMC | IBT</td><td className="p-2 font-black text-[11px]">{selectedCenter.hasBmc ? "AVAILABLE" : "NO"} | {selectedCenter.hasIbt ? "OK" : "NO"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">मशीन ब्रँड</td><td className="p-2 font-bold text-[11px]">{selectedCenter.fatMachineBrand || "-"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">पाणी स्रोत</td><td className="p-2 font-bold text-[11px]">{selectedCenter.waterSource || "-"}</td></tr>
                      <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">पॉवर बॅकअप</td><td className="p-2 font-bold text-[11px]">{selectedCenter.powerBackup || "-"}</td></tr>
                      <tr><td className="p-2 bg-slate-50 font-black uppercase text-[9px]">स्वच्छता ग्रेड</td><td className="p-2 font-black text-emerald-600 text-[11px]">{selectedCenter.hygieneGrade || "A"} GRADE</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="border-[1.5px] border-black rounded-sm overflow-hidden">
                  <div className="bg-slate-800 text-white p-1 text-[10px] font-black uppercase text-center border-b border-black">३) टाक्यांची यादी (TANKS)</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black"><th className="p-2 border-r border-black text-left uppercase text-[9px]">टाकी नाव</th><th className="p-2 text-right uppercase text-[9px]">क्षमता (L)</th></tr>
                    </thead>
                    <tbody>
                      {(selectedCenter.tanks || []).map((t, idx) => (
                        <tr key={idx} className="border-b border-black last:border-0"><td className="p-2 border-r border-black text-[11px] font-bold uppercase">{t.label}</td><td className="p-2 text-right text-[11px] font-black">{t.capacity} L</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-[1.5px] border-black rounded-sm overflow-hidden">
                  <div className="bg-rose-800 text-white p-1 text-[10px] font-black uppercase text-center border-b border-black">४) टँकर लॉग (TANKER LOG)</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-rose-50 border-b border-black text-rose-900"><th className="p-2 border-r border-black text-left uppercase text-[8px]">टँकर क्र.</th><th className="p-2 border-r border-black text-center uppercase text-[8px]">वेळ</th><th className="p-2 text-right uppercase text-[8px]">दूध (L)</th></tr>
                    </thead>
                    <tbody>
                      {(selectedCenter.tankerLogs || []).map((tl, idx) => (
                        <tr key={idx} className="border-b border-black last:border-0 font-bold text-[10px]"><td className="p-2 border-r border-black">{tl.tankerNo}</td><td className="p-2 border-r border-black text-center">{tl.arrivalTime}-{tl.departureTime}</td><td className="p-2 text-right font-black">{tl.qtyFilled} L</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-full border-[1.5px] border-black rounded-sm overflow-hidden">
                <div className="bg-blue-800 text-white p-1 text-[10px] font-black uppercase text-center border-b border-black">५) दूध संकलन मॅट्रिक्स (MILK SUMMARY)</div>
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr className="bg-slate-50 border-b border-black font-black uppercase text-[9px]">
                      <th className="p-2 border-r border-black text-left">दूध प्रकार</th>
                      <th className="p-2 border-r border-black">एकूण प्रमाण (L)</th>
                      <th className="p-2 border-r border-black">FAT %</th>
                      <th className="p-2">SNF %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black text-[11px] font-bold">
                      <td className="p-2 border-r border-black text-left bg-slate-50/50 uppercase font-black text-[9px]">गाय (COW MILK)</td>
                      <td className="p-2 border-r border-black font-black">{selectedCenter.cowMilk?.quantity || 0} L</td>
                      <td className="p-2 border-r border-black">{selectedCenter.cowMilk?.fat || "-"} %</td>
                      <td className="p-2">{selectedCenter.cowMilk?.snf || "-"} %</td>
                    </tr>
                    <tr className="text-[11px] font-bold">
                      <td className="p-2 border-r border-black text-left bg-slate-50/50 uppercase font-black text-[9px]">म्हेस (BUF MILK)</td>
                      <td className="p-2 border-r border-black font-black">{selectedCenter.buffaloMilk?.quantity || 0} L</td>
                      <td className="p-2 border-r border-black">{selectedCenter.buffaloMilk?.fat || "-"} %</td>
                      <td className="p-2">{selectedCenter.buffaloMilk?.snf || "-"} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
                {[
                  { l: 'ETP PLANT', v: selectedCenter.hasEtp },
                  { l: 'SOLAR PANEL', v: selectedCenter.hasSolar },
                  { l: 'HOT WATER', v: selectedCenter.hasHotWater },
                  { l: 'DRAINAGE', v: selectedCenter.hasDrainage },
                  { l: 'LABORATORY', v: selectedCenter.hasLab },
                  { l: 'STAFF UNIFORM', v: selectedCenter.staffUniform }
                ].map((item, i) => (
                  <div key={i} className="border border-black p-2 text-center rounded bg-slate-50/30">
                    <p className="text-[7px] font-black uppercase mb-1">{item.l}</p>
                    <p className="text-[10px] font-black">{item.v ? 'YES' : 'NO'}</p>
                  </div>
                ))}
              </div>

              <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[11pt] tracking-widest">
                <div className="border-t-2 border-black pt-3">प्रादेशिक अधिकारी</div>
                <div className="border-t-2 border-black pt-3">सेंटर इंचार्ज / मालक</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Warehouse className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">चिलिंग सेंटर निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a chilling unit to view professional report</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन चिलिंग सेंटर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">पायाभूत सुविधा, तांत्रिक आणि टँकर लॉग भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Warehouse className="h-4 w-4" /> १) प्राथमिक माहिती & परवाना</h4>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">सेंटरचे नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मालकाचे नाव</Label><Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">कोड नंबर *</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">FSSAI क्रमांक</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">FSSAI मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between border-b pb-1"><h4 className="text-[11px] font-black uppercase text-primary flex items-center gap-2"><Box className="h-4 w-4" /> २) टाक्यांची माहिती (TANKS)</h4><Button variant="outline" size="sm" onClick={addTankRow} className="h-7 text-[9px] font-black px-3 rounded-lg">जोडा</Button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.tanks.map((tank) => (
                    <div key={tank.id} className="flex items-center gap-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[8px] font-black uppercase opacity-50">{tank.label}</Label>
                        <Input value={tank.capacity} onChange={e => updateTankRow(tank.id, e.target.value)} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="क्षमता (L)" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeTankRow(tank.id)} className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between border-b pb-1"><h4 className="text-[11px] font-black uppercase text-rose-600 flex items-center gap-2"><Truck className="h-4 w-4" /> ३) टँकर लॉग (TANKER LOG)</h4><Button variant="outline" size="sm" onClick={addTankerLogRow} className="h-7 text-[9px] font-black px-3 rounded-lg border-rose-200 text-rose-600">जोडा</Button></div>
                <div className="space-y-2">
                  {formData.tankerLogs.map((tl) => (
                    <div key={tl.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-rose-50/30 p-2 rounded-xl border border-rose-100">
                      <div className="sm:col-span-3"><Input value={tl.tankerNo} onChange={e => updateTankerLogRow(tl.id, { tankerNo: e.target.value })} className="h-8 text-[10px] bg-white font-bold" placeholder="टँकर क्र." /></div>
                      <div className="sm:col-span-4 flex gap-1"><Input type="time" value={tl.arrivalTime} onChange={e => updateTankerLogRow(tl.id, { arrivalTime: e.target.value })} className="h-8 text-[10px] bg-white p-1" /><Input type="time" value={tl.departureTime} onChange={e => updateTankerLogRow(tl.id, { departureTime: e.target.value })} className="h-8 text-[10px] bg-white p-1" /></div>
                      <div className="sm:col-span-3"><Input value={tl.qtyFilled} onChange={e => updateTankerLogRow(tl.id, { qtyFilled: e.target.value })} className="h-8 text-[10px] bg-white font-black" placeholder="दूध (L)" /></div>
                      <div className="sm:col-span-2 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeTankerLogRow(tl.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <h4 className="text-[11px] font-black uppercase text-amber-600 border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> ४) तांत्रिक, स्वच्छता & ऑडिट</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasEtp: !formData.hasEtp})}><Checkbox checked={formData.hasEtp} /><Label className="text-[10px] font-black uppercase cursor-pointer">ETP उपलब्ध</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasSolar: !formData.hasSolar})}><Checkbox checked={formData.hasSolar} /><Label className="text-[10px] font-black uppercase cursor-pointer">सोलर पॅनेल</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasHotWater: !formData.hasHotWater})}><Checkbox checked={formData.hasHotWater} /><Label className="text-[10px] font-black uppercase cursor-pointer">गरम पाण्याची सोय</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasDrainage: !formData.hasDrainage})}><Checkbox checked={formData.hasDrainage} /><Label className="text-[10px] font-black uppercase cursor-pointer">ड्रेनेज सिस्टीम</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasLab: !formData.hasLab})}><Checkbox checked={formData.hasLab} /><Label className="text-[10px] font-black uppercase cursor-pointer">प्रयोगशाळा (LAB)</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, staffUniform: !formData.staffUniform})}><Checkbox checked={formData.staffUniform} /><Label className="text-[10px] font-black uppercase cursor-pointer">स्टाफ गणवेश</Label></div>
                  
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, hasTransportLicenses: !formData.hasTransportLicenses})}><Checkbox checked={formData.hasTransportLicenses} /><Label className="text-[10px] font-black uppercase cursor-pointer">वाहतूक परवाने</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, pestControlDone: !formData.pestControlDone})}><Checkbox checked={formData.pestControlDone} /><Label className="text-[10px] font-black uppercase cursor-pointer">पेस्ट कंट्रोल</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, staffHealthCheckDone: !formData.staffHealthCheckDone})}><Checkbox checked={formData.staffHealthCheckDone} /><Label className="text-[10px] font-black uppercase cursor-pointer">हेल्थ चेकअप</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, calibrationDone: !formData.calibrationDone})}><Checkbox checked={formData.calibrationDone} /><Label className="text-[10px] font-black uppercase cursor-pointer">कॅलिब्रेशन (Weight)</Label></div>
                  <div className="flex items-center space-x-3 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, fireSafetyOk: !formData.fireSafetyOk})}><Checkbox checked={formData.fireSafetyOk} /><Label className="text-[10px] font-black uppercase cursor-pointer">फायर सेफ्टी Ok</Label></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पाणी स्रोत</Label>
                    <Select value={formData.waterSource} onValueChange={v => setFormData({...formData, waterSource: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Borewell" className="font-bold">बोअरवेल</SelectItem><SelectItem value="Well" className="font-bold">विहीर</SelectItem><SelectItem value="Municipal" className="font-bold">नगरपालिका</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पॉवर बॅकअप</Label>
                    <Select value={formData.powerBackup} onValueChange={v => setFormData({...formData, powerBackup: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Generator" className="font-bold">जनरेटर</SelectItem><SelectItem value="UPS/Inverter" className="font-bold">UPS/इन्व्हर्टर</SelectItem><SelectItem value="None" className="font-bold">काहीही नाही</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">स्वच्छता ग्रेड</Label>
                    <Select value={formData.hygieneGrade} onValueChange={v => setFormData({...formData, hygieneGrade: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="A" className="font-bold">A Grade (उत्कृष्ट)</SelectItem><SelectItem value="B" className="font-bold">B Grade (मध्यम)</SelectItem><SelectItem value="C" className="font-bold">C Grade (सुधारणा हवी)</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <h4 className="text-[11px] font-black uppercase text-blue-600 border-b pb-1 flex items-center gap-2"><Milk className="h-4 w-4" /> ५) दूध सारांश & पुरवठा</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">इतर डेअरीला पुरवठा</Label><Input value={formData.otherDairySupply} onChange={e => setFormData({...formData, otherDairySupply: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" placeholder="उदा. नाही / चितळे डेअरी" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">एकूण सप्लायर्स</Label><Input type="number" value={formData.supplierCount} onChange={e => setFormData({...formData, supplierCount: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय (Cow Q/F/S)</div>
                  <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="L" />
                  <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="F" />
                  <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="S" />
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-1">म्हेस (Buf Q/F/S)</div>
                  <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="L" />
                  <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="F" />
                  <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="S" />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={handleSave} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}