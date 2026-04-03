
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Warehouse, Plus, Search, MapPin, Edit, X, ChevronRight, Trash2, 
  Laptop, Zap, Sun, Box, Milk, ShieldCheck, Wallet, User, ClipboardList, Printer, CheckCircle2, Info
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Supplier, EquipmentItem, SupplierType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, query, where } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'suppliers'), where('supplierType', '==', 'Center'))
  }, [db, user])

  const { data: centers, isLoading } = useCollection<Supplier>(centersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<Supplier | null>(null)
  
  const [formData, setFormData] = useState({
    name: "", supplierId: "", operatorName: "", mobile: "", address: "", routeId: "",
    fssaiNumber: "", fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", cattleFeedBrand: "", competition: "", paymentCycle: "7 Days",
    spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
    additionalNotes: "",
    scaleBrand: "", fatMachineBrand: "", chemicalsStock: "",
    batteryCondition: "", milkCansCount: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", supplierId: "", operatorName: "", mobile: "", address: "", routeId: "",
      fssaiNumber: "", fssaiExpiry: "", cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0", iceBlocks: "0", cattleFeedBrand: "",
      competition: "", paymentCycle: "7 Days", spaceOwnership: "Self", hygieneGrade: "A",
      additionalNotes: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: Supplier) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name || "", supplierId: center.supplierId || "", operatorName: center.operatorName || "",
      mobile: center.mobile || "", address: center.address || center.village || "", routeId: center.routeId || "",
      fssaiNumber: center.fssaiNumber || "", fssaiExpiry: center.fssaiExpiry || "",
      cowQty: String(center.cowMilk?.quantity || 0),
      cowFat: String(center.cowMilk?.fat || 0),
      cowSnf: String(center.cowMilk?.snf || 0),
      bufQty: String(center.buffaloMilk?.quantity || 0),
      bufFat: String(center.buffaloMilk?.fat || 0),
      bufSnf: String(center.buffaloMilk?.snf || 0),
      iceBlocks: String(center.iceBlocks || 0),
      cattleFeedBrand: center.cattleFeedBrand || "",
      competition: center.competition || "",
      paymentCycle: center.paymentCycle || "7 Days",
      spaceOwnership: center.spaceOwnership || "Self",
      hygieneGrade: center.hygieneGrade || "A",
      additionalNotes: center.additionalNotes || center.additionalInfo || "",
      scaleBrand: center.scaleBrand || "",
      fatMachineBrand: center.fatMachineBrand || "",
      chemicalsStock: center.chemicalsStock || "",
      batteryCondition: center.batteryCondition || "",
      milkCansCount: String(center.milkCansCount || 0),
      computerAvailable: center.computerAvailable || false,
      upsInverterAvailable: center.upsInverterAvailable || false,
      solarAvailable: center.solarAvailable || false,
      adulterationKitInfo: center.adulterationKitInfo || "",
      equipment: center.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveCenter = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData = {
      name: formData.name, supplierId: formData.supplierId, operatorName: formData.operatorName,
      mobile: formData.mobile, address: formData.address, village: formData.address, fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry, routeId: formData.routeId, supplierType: 'Center' as SupplierType,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), cattleFeedBrand: formData.cattleFeedBrand,
      competition: formData.competition, paymentCycle: formData.paymentCycle,
      spaceOwnership: formData.spaceOwnership, hygieneGrade: formData.hygieneGrade,
      additionalNotes: formData.additionalNotes, additionalInfo: formData.additionalNotes,
      scaleBrand: formData.scaleBrand, fatMachineBrand: formData.fatMachineBrand,
      chemicalsStock: formData.chemicalsStock, batteryCondition: formData.batteryCondition,
      milkCansCount: Number(formData.milkCansCount), computerAvailable: formData.computerAvailable,
      upsInverterAvailable: formData.upsInverterAvailable, solarAvailable: formData.solarAvailable,
      adulterationKitInfo: formData.adulterationKitInfo,
      equipment: formData.equipment,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'suppliers'), centerData)
      toast({ title: "यशस्वी", description: "नवीन केंद्र जोडण्यात आले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'suppliers', editingId), centerData)
      toast({ title: "यशस्वी", description: "केंद्राची माहिती अपडेट झाली." })
    }
    setIsDialogOpen(false)
  }

  const addEquipmentRow = () => {
    setFormData({ ...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }] })
  }

  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({ ...formData, equipment: formData.equipment.map(e => e.id === id ? { ...e, ...updates } : e) })
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(e => e.id !== id) })
  }

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(center => {
      const name = center.name?.toLowerCase() || ""
      const code = center.supplierId?.toString().toLowerCase() || ""
      const q = searchQuery.toLowerCase()
      return name.includes(q) || code.includes(q)
    })
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print text-center sm:text-left">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-foreground flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Warehouse className="h-6 w-6 text-primary" /> संकलन केंद्र (CENTERS)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile & Audit View</p>
        </div>
        <Button type="button" onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन केंद्र
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-4 w-full">
        <Card className="border shadow-2xl bg-white rounded-2xl overflow-hidden border-muted-foreground/10 no-print w-full">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="केंद्राचे नाव किंवा कोड शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-2 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="divide-y divide-muted-foreground/5">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-muted/50 flex justify-between items-center transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-[12px] text-slate-900 truncate uppercase tracking-tight">{center.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md bg-muted/50 border-none">{center.supplierId}</Badge>
                      <span className="text-[9px] text-muted-foreground truncate flex items-center gap-1 font-bold">
                        <MapPin className="h-3 w-3" /> {center.address || center.village || "पत्ता नाही"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedCenter && (
          <Card className="border shadow-2xl bg-white rounded-3xl overflow-hidden border-muted-foreground/10 animate-in slide-in-from-bottom-2 duration-300 print:border-none print:shadow-none w-full mx-auto printable-report">
            <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10 print:bg-white print:border-black print:border-b-[3px] w-full">
              <div className="min-w-0">
                <h3 className="text-[13px] font-black truncate uppercase text-slate-900 print:text-[18pt]">{selectedCenter.name}</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest print:text-[10pt]">केंद्राचा तपशील (CENTER PROFILE)</p>
              </div>
              <div className="flex gap-2 no-print">
                <Button variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl" onClick={() => setSelectedCenter(null)}><X className="h-5 w-5" /></Button>
              </div>
            </div>
            <ScrollArea className="max-h-[700px] print:max-h-none print:overflow-visible w-full">
              <div className="p-4 space-y-5 pb-10 print:p-8 print:space-y-8 flex flex-col items-center max-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                  <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">
                      <User className="h-3.5 w-3.5 print:hidden" /> १) प्राथमिक माहिती
                    </h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">नाव</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.name}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">कोड</p><p className="text-[10px] font-black uppercase print:text-[10pt]">{selectedCenter.supplierId}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">ऑपरेटर</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.operatorName || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मोबाईल</p><p className="text-[10px] font-black print:text-[10pt]">{selectedCenter.mobile || "-"}</p></div>
                      <div className="col-span-2"><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पत्ता</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.address || selectedCenter.village || "-"}</p></div>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">
                      <ShieldCheck className="h-3.5 w-3.5 print:hidden" /> २) परवाना व तांत्रिक
                    </h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">FSSAI</p><p className="text-[10px] font-black uppercase print:text-[10pt]">{selectedCenter.fssaiNumber || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मुदत</p><p className="text-[10px] font-black print:text-[10pt]">{selectedCenter.fssaiExpiry || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">काटा ब्रँड</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.scaleBrand || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मशीन ब्रँड</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.fatMachineBrand || "-"}</p></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                  <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">
                      <Wallet className="h-3.5 w-3.5 print:hidden" /> ३) व्यावसायिक माहिती
                    </h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पेमेंट सायकल</p><p className="text-[10px] font-black print:text-[10pt]">{selectedCenter.paymentCycle || "7 Days"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">जागा</p><p className="text-[10px] font-black print:text-[10pt]">{selectedCenter.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">स्वच्छता ग्रेड</p>
                        <Badge className={`h-4 px-1.5 text-[8px] font-black border-none text-white ${selectedCenter.hygieneGrade === 'A' ? 'bg-emerald-500' : 'bg-rose-500'} print:bg-slate-200 print:text-black`}>
                          {selectedCenter.hygieneGrade || "A"}
                        </Badge>
                      </div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">बर्फ लाद्या</p><p className="text-[10px] font-black print:text-[10pt]">{selectedCenter.iceBlocks || 0}</p></div>
                    </div>
                  </div>
                  <div className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-blue-700 tracking-widest flex items-center gap-2 border-b border-blue-200 pb-1 print:text-black print:border-black print:text-[12pt]">
                      <Milk className="h-3.5 w-3.5 print:hidden" /> ४) दूध संकलन सारांश
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white rounded-lg border border-blue-50">
                        <p className="text-[7px] font-black text-blue-500 uppercase">गाय दूध</p>
                        <p className="text-[11px] font-black">{selectedCenter.cowMilk?.quantity || 0} L</p>
                        <p className="text-[7px] text-muted-foreground">F: {selectedCenter.cowMilk?.fat}% | S: {selectedCenter.cowMilk?.snf}%</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-blue-50">
                        <p className="text-[7px] font-black text-blue-500 uppercase">म्हेस दूध</p>
                        <p className="text-[11px] font-black">{selectedCenter.buffaloMilk?.quantity || 0} L</p>
                        <p className="text-[7px] text-muted-foreground">F: {selectedCenter.buffaloMilk?.fat}% | S: {selectedCenter.buffaloMilk?.snf}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 print:grid-cols-3 w-full">
                  <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 transition-all ${selectedCenter.computerAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Laptop className="h-4 w-4" /><span className="text-[8px] font-black uppercase text-center">POP: {selectedCenter.computerAvailable ? 'हो' : 'नाही'}</span>
                  </div>
                  <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 transition-all ${selectedCenter.upsInverterAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Zap className="h-4 w-4" /><span className="text-[8px] font-black uppercase text-center">UPS: {selectedCenter.upsInverterAvailable ? 'हो' : 'नाही'}</span>
                  </div>
                  <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 transition-all ${selectedCenter.solarAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Sun className="h-4 w-4" /><span className="text-[8px] font-black uppercase text-center">सोलर: {selectedCenter.solarAvailable ? 'हो' : 'नाही'}</span>
                  </div>
                </div>

                <div className="space-y-1.5 w-full">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b pb-1 print:text-black print:border-black print:text-[12pt]">
                    <Box className="h-3.5 w-3.5 print:hidden" /> साहित्याची यादी (INVENTORY)
                  </h4>
                  <div className="border border-muted-foreground/10 rounded-xl overflow-hidden shadow-sm print:border-2 print:border-black">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b print:bg-slate-100 print:border-black">
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground print:text-black">साहित्य</th>
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-center print:text-black">नग</th>
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-right print:text-black">मालकी</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted-foreground/5 print:divide-black">
                        {(selectedCenter.equipment || []).map((item, idx) => (
                          <tr key={item.id || idx} className="bg-white">
                            <td className="p-2 text-[10px] font-black uppercase text-slate-700 print:text-black">{item.name}</td>
                            <td className="p-2 text-[10px] font-black text-center text-slate-900 print:text-black">{item.quantity}</td>
                            <td className="p-2 text-right">
                              <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black uppercase border-none bg-muted/50 print:text-black">
                                {item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="hidden print:grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest text-slate-400 mt-20 w-full">
                  <div className="border-t-2 border-black pt-3 text-black">अधिकारी स्वाक्षरी</div>
                  <div className="border-t-2 border-black pt-3 text-black">सुपरवायझर स्वाक्षरी</div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन केंद्र' : 'केंद्राची माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">केंद्राचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">केंद्राचे नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">केंद्र आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ३) व्यावसायिक व दूध तपशील</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">जागा</Label>
                      <Select value={formData.spaceOwnership} onValueChange={(v: 'Self' | 'Rented') => setFormData({...formData, spaceOwnership: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Self">स्वतःची</SelectItem><SelectItem value="Rented">भाड्याची</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">बर्फ लाद्या संख्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Qty" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Fat" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="SNF" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-1">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Qty" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Fat" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="SNF" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ४) साहित्य व स्टेटस</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Checkbox checked={formData.computerAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">POP</Label></div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Checkbox checked={formData.upsInverterAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">UPS</Label></div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}><Checkbox checked={formData.solarAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">सोलर</Label></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[11px] font-black uppercase tracking-widest">साहित्य यादी</h4><Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black px-3 rounded-xl">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/10 p-2 rounded-xl">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] px-3 bg-white border-none rounded-lg font-bold" placeholder="साहित्य" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] px-0 text-center bg-white border-none rounded-lg font-black" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[10px] px-2 bg-white border-none rounded-lg font-black"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-2xl p-4 shadow-inner" /></div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={handleSaveCenter} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
