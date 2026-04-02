"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, MapPin, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Info, Wallet, ShieldCheck, ClipboardList, CheckCircle2, Printer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'suppliers')
  }, [db, user])

  const { data: allRoutes } = useCollection(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const route = useMemo(() => allRoutes?.find(r => r.id === routeId), [allRoutes, routeId])
  const suppliers = useMemo(() => allSuppliers?.filter(s => s.routeId === routeId) || [], [allSuppliers, routeId])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", supplierId: "", address: "", mobile: "", competition: "", additionalNotes: "",
    operatorName: "", supplierType: "Gavali" as SupplierType,
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", paymentCycle: "7 Days", cattleFeedBrand: "",
    fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
    adulterationKitInfo: "", spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
    chemicalsStock: "", batteryCondition: "",
    milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const openAddDialog = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", supplierId: "", address: "", mobile: "", competition: "", additionalNotes: "",
      operatorName: "", supplierType: "Gavali",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", paymentCycle: "7 Days", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      adulterationKitInfo: "", spaceOwnership: "Self", hygieneGrade: "A",
      chemicalsStock: "", batteryCondition: "",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setDialogMode('edit')
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name || "", supplierId: supplier.supplierId || "", address: supplier.address || supplier.village || "",
      mobile: supplier.mobile || "", competition: supplier.competition || "", 
      additionalNotes: supplier.additionalNotes || supplier.additionalInfo || "",
      operatorName: supplier.operatorName || "",
      supplierType: supplier.supplierType || "Gavali",
      cowQty: String(supplier.cowMilk?.quantity ?? 0), cowFat: String(supplier.cowMilk?.fat ?? 0), cowSnf: String(supplier.cowMilk?.snf ?? 0),
      bufQty: String(supplier.buffaloMilk?.quantity ?? 0), bufFat: String(supplier.buffaloMilk?.fat ?? 0), bufSnf: String(supplier.buffaloMilk?.snf ?? 0),
      iceBlocks: String(supplier.iceBlocks ?? 0), paymentCycle: supplier.paymentCycle || "7 Days",
      cattleFeedBrand: supplier.cattleFeedBrand || "", fssaiNumber: supplier.fssaiNumber || "",
      fssaiExpiry: supplier.fssaiExpiry || "", scaleBrand: supplier.scaleBrand || "",
      fatMachineBrand: supplier.fatMachineBrand || "", 
      adulterationKitInfo: supplier.adulterationKitInfo || "",
      spaceOwnership: supplier.spaceOwnership || "Self",
      hygieneGrade: supplier.hygieneGrade || "A",
      chemicalsStock: supplier.chemicalsStock || "",
      batteryCondition: supplier.batteryCondition || "",
      milkCansCount: String(supplier.milkCansCount || 0),
      computerAvailable: supplier.computerAvailable || false, upsInverterAvailable: supplier.upsInverterAvailable || false,
      solarAvailable: supplier.solarAvailable || false, equipment: supplier.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const supplierData = {
      supplierId: formData.supplierId, name: formData.name, address: formData.address, mobile: formData.mobile,
      routeId: routeId, competition: formData.competition, 
      additionalNotes: formData.additionalNotes, additionalInfo: formData.additionalNotes,
      supplierType: formData.supplierType,
      operatorName: formData.operatorName || (formData.supplierType === 'Center' ? formData.name : undefined),
      village: formData.address,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), paymentCycle: formData.paymentCycle,
      cattleFeedBrand: formData.cattleFeedBrand, fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry, scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand, adulterationKitInfo: formData.adulterationKitInfo,
      spaceOwnership: formData.spaceOwnership, hygieneGrade: formData.hygieneGrade,
      chemicalsStock: formData.chemicalsStock, batteryCondition: formData.batteryCondition,
      milkCansCount: Number(formData.milkCansCount),
      computerAvailable: formData.computerAvailable, upsInverterAvailable: formData.upsInverterAvailable,
      solarAvailable: formData.solarAvailable, equipment: formData.equipment,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'suppliers'), supplierData)
      toast({ title: "यशस्वी", description: "पुरवठादार प्रोफाइल जतन झाले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'suppliers', editingId), supplierData)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत केली गेली." })
      if (selectedSupplier?.id === editingId) setSelectedSupplier({ ...supplierData, id: editingId } as any)
    }
    setIsDialogOpen(false)
  }

  const handleDeleteSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'suppliers', id))
      if (selectedSupplier?.id === id) setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवण्यात आला." })
    }
  }

  const handlePrintProfile = () => {
    window.print()
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-2 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-2 px-1 no-print">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => router.push('/routes')}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><h2 className="text-base font-black uppercase truncate tracking-tight">सप्लायर (Suppliers)</h2><p className="text-[9px] text-muted-foreground font-black uppercase truncate tracking-widest">RT: {route?.name || routeId}</p></div>
        </div>
        <Button type="button" onClick={openAddDialog} size="sm" className="h-8 font-black gap-1.5 rounded-lg text-[10px] px-4 uppercase tracking-widest"><Plus className="h-3.5 w-3.5" /> नवीन</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <Card className={`lg:col-span-4 border shadow-none bg-white overflow-hidden flex flex-col border-muted-foreground/10 no-print ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" /><input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border border-muted-foreground/10 rounded-md font-black uppercase" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
          <ScrollArea className="h-[650px]"><div className="divide-y">{filteredSuppliers.map(s => (<div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-2.5 cursor-pointer hover:bg-muted/50 flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}><div className="min-w-0"><div className="flex items-center gap-1.5"><h4 className="font-black text-[11px] truncate uppercase">{s.name}</h4>{s.supplierType === 'Center' && <Badge className="bg-emerald-500 h-3 px-1 text-[6px] font-black border-none uppercase">Center</Badge>}</div><p className="text-[9px] text-muted-foreground truncate font-bold">ID: {s.supplierId || s.id?.slice(-6)} | {s.address}</p></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => handleDeleteSupplier(s.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button><ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-50" /></div></div>))}</div></ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border shadow-none bg-white rounded-xl min-h-[450px] border-muted-foreground/10 print:border-none print:shadow-none ${!selectedSupplier ? 'hidden lg:flex' : 'block'}`} id="printable-area">
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10 print:bg-white print:border-black print:border-b-2"><Button type="button" variant="ghost" size="icon" className="lg:hidden no-print" onClick={() => setSelectedSupplier(null)}><ArrowLeft className="h-4 w-4" /></Button><div className="flex-1 px-2 min-w-0"><h3 className="text-xs sm:text-sm font-black truncate uppercase print:text-lg">{selectedSupplier.name}</h3><p className="text-[9px] font-black text-muted-foreground uppercase print:text-black">ID: {selectedSupplier.supplierId || selectedSupplier.id} | {selectedSupplier.supplierType || 'Gavali'}</p></div><div className="flex gap-1.5 no-print"><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary border-primary/20 hover:bg-primary/5 rounded-lg" onClick={handlePrintProfile}><Printer className="h-3.5 w-3.5" /></Button><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary border-primary/20 hover:bg-primary/5 rounded-lg" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3.5 w-3.5" /></Button><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-destructive border-rose-200 hover:bg-destructive/5 rounded-lg" onClick={(e) => handleDeleteSupplier(selectedSupplier.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
              <ScrollArea className="flex-1 h-[650px] print:h-auto">
                <div className="p-3 space-y-4 print:p-0 print:space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">१) प्राथमिक माहिती</h4>
                      <div className="space-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">नाव</p><p className="text-[10px] font-black uppercase">{selectedSupplier.name || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">कोड (ID)</p><p className="text-[10px] font-black uppercase">{selectedSupplier.supplierId || "-"}</p></div>
                        {selectedSupplier.supplierType === 'Center' && <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">ऑपरेटर</p><p className="text-[10px] font-black uppercase">{selectedSupplier.operatorName || "-"}</p></div>}
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">मोबाईल</p><p className="text-[10px] font-black">{selectedSupplier.mobile || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">पत्ता / गाव</p><p className="text-[10px] font-black uppercase">{selectedSupplier.address || selectedSupplier.village || "-"}</p></div>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">२) परवाना व तांत्रिक</h4>
                      <div className="space-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">FSSAI क्र.</p><p className="text-[10px] font-black uppercase">{selectedSupplier.fssaiNumber || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">मुदत (Expiry)</p><p className="text-[10px] font-black">{selectedSupplier.fssaiExpiry || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">काटा ब्रँड</p><p className="text-[10px] font-black uppercase">{selectedSupplier.scaleBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">मशीन ब्रँड</p><p className="text-[10px] font-black uppercase">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">बॅटरी स्थिती</p><p className="text-[10px] font-black uppercase">{selectedSupplier.batteryCondition || "-"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">३) व्यावसायिक माहिती</h4>
                      <div className="space-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">पेमेंट सायकल</p><p className="text-[10px] font-black">{selectedSupplier.paymentCycle || "7 Days"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">जागेची मालकी</p><p className="text-[10px] font-black">{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">स्थानिक स्पर्धा</p><p className="text-[10px] font-black uppercase">{selectedSupplier.competition || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">पशुखाद्य ब्रँड</p><p className="text-[10px] font-black uppercase">{selectedSupplier.cattleFeedBrand || "-"}</p></div>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">४) साठा व गुणवत्ता</h4>
                      <div className="space-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">ग्रेड</p><Badge className="h-4 px-1.5 text-[8px] font-black bg-emerald-500 border-none text-white print:bg-black">{selectedSupplier.hygieneGrade || "A"}</Badge></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">बर्फ लाद्या</p><p className="text-[10px] font-black">{selectedSupplier.iceBlocks || 0}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">एकूण कॅन</p><p className="text-[10px] font-black">{selectedSupplier.milkCansCount || 0}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-black">रसायन स्टॉक</p><p className="text-[10px] font-black uppercase">{selectedSupplier.chemicalsStock || "-"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">{[{icon: Laptop, label: 'POP सिस्टम', val: selectedSupplier.computerAvailable}, {icon: Zap, label: 'UPS/Inv', val: selectedSupplier.upsInverterAvailable}, {icon: Sun, label: 'सोलर', val: selectedSupplier.solarAvailable}].map((it, i) => (<div key={i} className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${it.val ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-muted/20 opacity-50 border-muted-foreground/5'} print:border-black print:opacity-100`}><it.icon className={`h-4 w-4 ${it.val ? 'text-green-600' : 'text-muted-foreground'} print:text-black`} /><span className="text-[8px] font-black uppercase">{it.label}: {it.val ? 'हो' : 'नाही'}</span></div>))}</div>
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">दूध आकडेवारी (AVG)</h4><div className="grid grid-cols-2 gap-2"><div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-center print:bg-white print:border-black"><p className="text-[8px] font-black text-blue-600 uppercase tracking-tighter print:text-black">गाय दूध</p><p className="text-sm font-black text-blue-900 print:text-black">{selectedSupplier.cowMilk?.quantity || 0}L</p><p className="text-[8px] font-bold text-blue-400 print:text-black">F: {selectedSupplier.cowMilk?.fat}% | S: {selectedSupplier.cowMilk?.snf}%</p></div><div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center print:bg-white print:border-black"><p className="text-[8px] font-black text-amber-600 uppercase tracking-tighter print:text-black">म्हेस दूध</p><p className="text-sm font-black text-amber-900 print:text-black">{selectedSupplier.buffaloMilk?.quantity || 0}L</p><p className="text-[8px] font-bold text-amber-400 print:text-black">F: {selectedSupplier.buffaloMilk?.fat}% | S: {selectedSupplier.buffaloMilk?.snf}%</p></div></div></div>
                  {selectedSupplier.equipment && selectedSupplier.equipment.length > 0 && (
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">साहित्य यादी (Material)</h4><div className="border border-muted-foreground/10 rounded-xl overflow-hidden print:border-black"><table className="w-full text-[10px]"><thead><tr className="bg-muted/20 text-[8px] font-black uppercase border-b print:bg-white print:border-black"><th className="p-2 text-left print:text-black">साहित्य</th><th className="p-2 text-center print:text-black">नग</th><th className="p-2 text-right print:text-black">मालकी</th></tr></thead><tbody className="divide-y print:divide-black">{selectedSupplier.equipment.map(e => (<tr key={e.id} className="hover:bg-muted/5 transition-colors"><td className="p-2 font-black uppercase text-[9px] print:text-black">{e.name}</td><td className="p-2 text-center font-black print:text-black">{e.quantity}</td><td className="p-2 text-right"><Badge variant="outline" className={`text-[7px] font-black uppercase h-4 ${e.ownership === 'Self' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-blue-200 text-blue-600 bg-blue-50'} print:text-black print:border-black`}>{e.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></td></tr>))}</tbody></table></div></div>
                  )}
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">भेळस तपासणी किट</h4><div className="p-2.5 bg-muted/10 rounded-xl border border-muted-foreground/5 text-[10px] font-bold print:bg-white print:border-black">{selectedSupplier.adulterationKitInfo || "-"}</div></div>
                  {(selectedSupplier.additionalNotes || selectedSupplier.additionalInfo) && <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest print:text-black print:text-[10px]">विशेष शेरा (NOTES)</h4><div className="p-2.5 bg-muted/10 rounded-xl border border-muted-foreground/5 italic text-[10px] text-slate-600 leading-relaxed print:bg-white print:border-black print:text-black">{selectedSupplier.additionalNotes || selectedSupplier.additionalInfo}</div></div>}
                  
                  <div className="hidden print:grid grid-cols-2 gap-10 text-center uppercase font-black text-[8px] tracking-widest text-slate-400 mt-20">
                    <div className="border-t border-black pt-2 text-black">अधिकारी स्वाक्षरी</div>
                    <div className="border-t border-black pt-2 text-black">सुपरवायझर स्वाक्षरी</div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (<div className="hidden lg:flex flex-col items-center gap-2 p-10 justify-center h-full no-print"><User className="h-12 w-12 text-muted-foreground/10" /><h4 className="font-black text-muted-foreground/30 text-[10px] uppercase tracking-[0.3em]">सप्लायर निवडा</h4></div>)}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर जोडा' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">संपूर्ण तांत्रिक, व्यावसायिक व इन्व्हेंटरी तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            <div className="space-y-5 pb-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest">१) प्राथमिक व परवाना माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[9px] font-black uppercase text-primary tracking-widest opacity-60">सप्लायर प्रकार (Type)</Label>
                    <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                      <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gavali" className="text-[11px] font-black">गवळी (Gavali)</SelectItem>
                        <SelectItem value="Gotha" className="text-[11px] font-black">गोठा (Gotha)</SelectItem>
                        <SelectItem value="Center" className="text-[11px] font-black">उत्पादक केंद्र (Center)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">पूर्ण नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">कोड (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">ऑपरेटरचे नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">पत्ता / गाव</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">मुदत (Expiry)</Label><Input value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="DD/MM/YYYY" /></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3" /> २) तांत्रिक व रसायने
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">रसायन स्टॉक</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="उदा. 5 L" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="Good / Poor" /></div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                    <Checkbox checked={formData.computerAvailable} />
                    <Label className="text-[10px] font-black uppercase cursor-pointer tracking-wider">POP सिस्टम आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                    <Checkbox checked={formData.upsInverterAvailable} />
                    <Label className="text-[10px] font-black uppercase cursor-pointer tracking-wider">UPS / इनव्हर्टर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                    <Checkbox checked={formData.solarAvailable} />
                    <Label className="text-[10px] font-black uppercase cursor-pointer tracking-wider">सोलर उपलब्ध आहे का?</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> ३) व्यावसायिक व दूध संकलन
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">स्थानिक स्पर्धा (Competition)</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="उदा. अमूल" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">पेमेंट सायकल</Label>
                      <Select value={formData.paymentCycle} onValueChange={v => setFormData({...formData, paymentCycle: v})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="7 Days">7 दिवस</SelectItem><SelectItem value="10 Days">10 दिवस</SelectItem><SelectItem value="15 Days">15 दिवस</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">जागेची मालकी</Label>
                      <Select value={formData.spaceOwnership} onValueChange={v => setFormData({...formData, spaceOwnership: v as any})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Self">स्वतःची</SelectItem><SelectItem value="Rented">भाड्याची</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">स्वच्छता श्रेणी (Grade)</Label>
                      <Select value={formData.hygieneGrade} onValueChange={v => setFormData({...formData, hygieneGrade: v})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="A">A (उत्तम)</SelectItem><SelectItem value="B">B (चांगले)</SelectItem><SelectItem value="C">C (सुधारणे आवश्यक)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">पशुखाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  </div>
                  <div className="p-3 border rounded-xl bg-blue-50/20 space-y-2">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1.5"><Milk className="h-3 w-3" /> गाय दूध (AVG COW)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat %</Label><Input type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF %</Label><Input type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-amber-50/20 space-y-2">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5"><Milk className="h-3 w-3" /> म्हैस दूध (AVG BUF)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat %</Label><Input type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF %</Label><Input type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Box className="h-3 w-3" /> ४) साहित्याची यादी (INVENTORY)
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self' }] })} className="h-6 text-[8px] font-black px-2 rounded-lg border-primary/20 bg-primary/5 text-primary">
                    जोडा
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-muted/10 p-1.5 rounded-xl border border-muted-foreground/5">
                      <div className="col-span-6">
                        <Input value={item.name} onChange={e => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, name: e.target.value } : eq) })} className="h-7 text-[10px] px-2 bg-white border-none rounded-md font-bold" placeholder="साहित्य नाव" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={item.quantity} onChange={e => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, quantity: Number(e.target.value) } : eq) })} className="h-7 text-[10px] px-0 text-center bg-white border-none rounded-md font-black" />
                      </div>
                      <div className="col-span-3">
                        <Select value={item.ownership} onValueChange={v => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, ownership: v as any } : eq) })}>
                          <SelectTrigger className="h-7 text-[8px] px-1 bg-white border-none rounded-md font-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Self" className="text-[10px] font-black">स्वतः</SelectItem>
                            <SelectItem value="Company" className="text-[10px] font-black">डेअरी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, equipment: formData.equipment.filter(eq => eq.id !== item.id) })} className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-dashed">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">भेळस तपासणी किट माहिती</Label>
                <Input placeholder="..." value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" />
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <ClipboardList className="h-3 w-3" /> ५) अतिरिक्त माहिती (NOTES)
                </h4>
                <Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="min-h-[80px] text-[11px] rounded-xl bg-muted/20 border-none font-bold p-3" placeholder="विशेष माहिती किंवा नोंदी लिहा..." />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 flex-1 sm:flex-none">रद्द</Button>
            <Button type="button" onClick={handleSaveSupplier} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex-1 sm:flex-none">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> जतन करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          
          body > *:not(#printable-area), 
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
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            display: block !important;
            visibility: visible !important;
          }

          #printable-area * {
            visibility: visible !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1.5px solid black !important;
          }

          th, td {
            border: 1px solid black !important;
            padding: 4px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}
