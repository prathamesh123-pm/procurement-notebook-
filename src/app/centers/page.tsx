
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Warehouse, Plus, Search, MapPin, Edit, Truck, X, ChevronRight, Trash2, 
  Laptop, Zap, Sun, Box, CheckCircle2, Milk, ShieldCheck, Info, Wallet, User, ClipboardList, Printer, Battery, Droplets, Thermometer
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

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: centers, isLoading } = useCollection<Supplier>(centersQuery)
  const { data: userData } = useDoc(userDocRef)

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

  useEffect(() => {
    if (selectedCenter && centers) {
      const updated = centers.find(c => c.id === selectedCenter.id)
      if (updated) setSelectedCenter(updated)
    }
  }, [centers])

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

  const handleDeleteCenter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'suppliers', id))
      if (selectedCenter?.id === id) setSelectedCenter(null)
      toast({ title: "यशस्वी", description: "केंद्र हटवण्यात आले." })
    }
  }

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(center => {
      const name = center.name?.toLowerCase() || ""
      const code = center.supplierId?.toString().toLowerCase() || ""
      const q = searchQuery.toLowerCase()
      return name.includes(q) || code.includes(q)
    })
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  const profileName = userData?.displayName || user?.displayName || "सुपरवायझर";
  const profileId = userData?.employeeId || "---";

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
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-xl" onClick={(e) => handleDeleteCenter(center.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                  </div>
                </div>
              ))}
              {filteredCenters.length === 0 && (
                <div className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-[0.4em]">केंद्र उपलब्ध नाहीत</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {selectedCenter && (
          <Card className="border shadow-2xl bg-white rounded-3xl overflow-hidden border-muted-foreground/10 animate-in slide-in-from-bottom-2 duration-300 print:border-none print:shadow-none w-full mx-auto printable-report" id="printable-area">
            <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10 print:bg-white print:border-black print:border-b-[3px] w-full">
              <div className="min-w-0">
                <h3 className="text-[13px] font-black truncate uppercase text-slate-900 print:text-[18pt]">{selectedCenter.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest print:text-[10pt] print:text-slate-600">केंद्राचा तपशील (CENTER PROFILE)</p>
                  <span className="hidden print:inline-block text-[10pt] font-black uppercase text-slate-400">| सादरकर्ता: {profileName} (ID: {profileId})</span>
                </div>
              </div>
              <div className="flex gap-2 no-print">
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => handleOpenEdit(selectedCenter)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl" onClick={() => setSelectedCenter(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
<<<<<<< HEAD
            <ScrollArea className="max-h-[700px] print:max-h-none print:overflow-visible w-full">
              <div className="p-4 space-y-5 pb-10 print:p-8 print:space-y-8 flex flex-col items-center max-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                  <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">
=======
            <ScrollArea className="max-h-[700px] print:max-h-none">
              <div className="p-4 space-y-5 pb-10 print:p-6 print:space-y-8 print:w-full print:mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-6">
                  <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:rounded-none">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b border-primary/10 pb-1 print:text-black print:text-xs">
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
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
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">रसायन स्टॉक</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.chemicalsStock || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">बॅटरी स्थिती</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.batteryCondition || "-"}</p></div>
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
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">स्थानीय स्पर्धा</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.competition || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">स्वच्छता ग्रेड</p>
                        <Badge className={`h-4 px-1.5 text-[8px] font-black border-none text-white ${selectedCenter.hygieneGrade === 'A' ? 'bg-emerald-500' : selectedCenter.hygieneGrade === 'B' ? 'bg-blue-500' : 'bg-rose-500'} print:bg-slate-200 print:text-black print:text-[8pt]`}>
                          {selectedCenter.hygieneGrade || "A"}
                        </Badge>
                      </div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पशुखाद्य</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.cattleFeedBrand || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">बर्फ लाद्या</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedCenter.iceBlocks || 0}</p></div>
                    </div>
                  </div>
                  <div className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 space-y-1.5 print:bg-white print:border-black print:border-2">
                    <h4 className="text-[9px] font-black uppercase text-blue-700 tracking-widest flex items-center gap-2 border-b border-blue-200 pb-1 print:text-black print:border-black print:text-[12pt]">
                      <Milk className="h-3.5 w-3.5 print:hidden" /> ४) दूध संकलन सारांश
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white rounded-lg border border-blue-50 print:border-slate-300">
                        <p className="text-[7px] font-black text-blue-500 uppercase print:text-slate-500">गाय दूध</p>
                        <p className="text-[11px] font-black print:text-[12pt]">{selectedCenter.cowMilk?.quantity || 0} L</p>
                        <p className="text-[7px] text-muted-foreground print:text-[8pt]">F: {selectedCenter.cowMilk?.fat}% | S: {selectedCenter.cowMilk?.snf}%</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-blue-50 print:border-slate-300">
                        <p className="text-[7px] font-black text-blue-500 uppercase print:text-slate-500">म्हेस दूध</p>
                        <p className="text-[11px] font-black print:text-[12pt]">{selectedCenter.buffaloMilk?.quantity || 0} L</p>
                        <p className="text-[7px] text-muted-foreground print:text-[8pt]">F: {selectedCenter.buffaloMilk?.fat}% | S: {selectedCenter.buffaloMilk?.snf}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 print:grid-cols-3 w-full">
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.computerAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Laptop className="h-4 w-4" />
                    <span className="text-[8px] font-black uppercase text-center print:text-[9pt]">POP: {selectedCenter.computerAvailable ? 'हो' : 'नाही'}</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.upsInverterAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Zap className="h-4 w-4" />
                    <span className="text-[8px] font-black uppercase text-center print:text-[9pt]">UPS: {selectedCenter.upsInverterAvailable ? 'हो' : 'नाही'}</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.solarAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-muted/20 opacity-40'} print:opacity-100 print:border-2 print:border-black print:bg-white`}>
                    <Sun className="h-4 w-4" />
                    <span className="text-[8px] font-black uppercase text-center print:text-[9pt]">सोलर: {selectedCenter.solarAvailable ? 'हो' : 'नाही'}</span>
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
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground print:text-black print:text-[10pt]">साहित्य</th>
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-center print:text-black print:text-[10pt]">नग</th>
                          <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-right print:text-black print:text-[10pt]">मालकी</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted-foreground/5 print:divide-black">
                        {(selectedCenter.equipment || []).map((item, idx) => (
                          <tr key={item.id || idx} className="bg-white">
                            <td className="p-2 text-[10px] font-black uppercase text-slate-700 print:text-black print:text-[10pt]">{item.name}</td>
                            <td className="p-2 text-[10px] font-black text-center text-slate-900 print:text-black print:text-[10pt]">{item.quantity}</td>
                            <td className="p-2 text-right">
                              <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black uppercase border-none bg-muted/50 print:text-black print:border-slate-300 print:text-[8pt]">
                                {item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {(!selectedCenter.equipment || selectedCenter.equipment.length === 0) && (
                          <tr><td colSpan={3} className="p-6 text-center text-[9px] opacity-30 font-black uppercase print:text-[10pt]">साहित्याची नोंद नाही</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b pb-1 print:text-black print:border-black print:text-[12pt]">
                      <ShieldCheck className="h-3.5 w-3.5 print:hidden" /> भेळस तपासणी किट
                    </h4>
                    <div className="p-2 bg-muted/10 rounded-xl border border-muted-foreground/5 text-[9px] font-bold print:bg-white print:border-black print:border-2 print:text-[10pt] print:p-3">
                      {selectedCenter.adulterationKitInfo || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b pb-1 print:text-black print:border-black print:text-[12pt]">
                      <ClipboardList className="h-3.5 w-3.5 print:hidden" /> विशेष शेरा
                    </h4>
                    <div className="p-2 bg-muted/10 rounded-xl border border-muted-foreground/5 italic text-[9px] text-slate-600 print:bg-white print:border-black print:border-2 print:text-black print:text-[10pt] print:p-3">
                      {selectedCenter.additionalNotes || selectedCenter.additionalInfo || "-"}
                    </div>
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

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
<<<<<<< HEAD
          html, body {
            visibility: hidden !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }

          body * { visibility: hidden !important; }

          .printable-report, .printable-report * {
            visibility: visible !important;
          }

          .printable-report {
            position: relative !important;
            display: block !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 210mm !important;
            transform: none !important;
            box-shadow: none !important;
            border: 2px solid black !important;
            padding: 10mm !important;
            background: white !important;
          }

          header, nav, aside, footer, .sidebar, .no-print, button, [role="dialog"], .sidebar-trigger {
            display: none !important;
          }

          [data-radix-scroll-area-viewport] {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }

          .printable-report * {
=======
          body > *:not([role="main"]), 
          header, nav, aside, footer, .sidebar, .no-print, button {
            display: none !important;
          }

          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          #printable-area {
            position: relative !important;
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
            padding: 20px !important;
            border: 2px solid black !important;
            background: white !important;
            box-shadow: none !important;
            left: 0 !important;
            top: 0 !important;
          }

          #printable-area * {
            visibility: visible !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Normalizing Font Sizes for Print */
          #printable-area p, #printable-area span, #printable-area td {
            font-size: 11pt !important;
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
            color: black !important;
          }
          
          .printable-report h3 {
            font-size: 20pt !important;
            font-weight: 900 !important;
            text-align: center !important;
            border-bottom: 3px solid black;
            padding-bottom: 10pt;
            margin-bottom: 15pt;
          }

          .printable-report h4 {
            font-size: 13pt !important;
            font-weight: 900 !important;
            border-bottom: 2px solid black !important;
            margin-bottom: 10px !important;
            margin-top: 20pt !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
<<<<<<< HEAD
            border: 2px solid black !important;
            margin: 15pt 0 !important;
=======
            border: 1.5px solid black !important;
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
          }

          th, td {
            border: 1px solid black !important;
<<<<<<< HEAD
            padding: 10pt !important;
            font-size: 11pt !important;
=======
            padding: 8px !important;
            font-size: 11pt !important;
          }

          th {
            background-color: #f0f0f0 !important;
            font-weight: 900 !important;
          }

          .bg-muted/20, .bg-blue-50/30 {
            background-color: transparent !important;
            border: 1px solid black !important;
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
          }
        }
      `}</style>
    </div>
  )
}
