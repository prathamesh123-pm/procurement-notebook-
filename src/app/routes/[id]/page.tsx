
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
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from "@/firebase"
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

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: allRoutes } = useCollection(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection<Supplier>(suppliersQuery)
  const { data: userData } = useDoc(userDocRef)

  const route = useMemo(() => allRoutes?.find(r => r.id === routeId), [allRoutes, routeId])
  const suppliersList = useMemo(() => allSuppliers?.filter(s => s.routeId === routeId) || [], [allSuppliers, routeId])

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

  useEffect(() => {
    if (selectedSupplier && allSuppliers) {
      const updated = allSuppliers.find(s => s.id === selectedSupplier.id)
      if (updated) setSelectedSupplier(updated)
    }
  }, [allSuppliers])

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

  const filteredSuppliers = useMemo(() => {
    return suppliersList.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliersList, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  const profileName = userData?.displayName || user?.displayName || "सुपरवायझर";
  const profileId = userData?.employeeId || "---";

  return (
    <div className="space-y-4 max-w-[1000px] mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-3 px-1 no-print">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted" onClick={() => router.push('/routes')}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase truncate tracking-tight">सप्लायर (Suppliers)</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase truncate tracking-widest">RT: {route?.name || routeId}</p>
          </div>
        </div>
        <Button type="button" onClick={openAddDialog} size="sm" className="h-10 font-black gap-2 rounded-xl text-[11px] px-6 uppercase tracking-widest shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /> नवीन सप्लायर</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className={`lg:col-span-4 border shadow-2xl bg-white overflow-hidden flex flex-col border-muted-foreground/10 no-print ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="सप्लायर शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-2 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[250px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-3 cursor-pointer hover:bg-muted/50 flex justify-between items-center transition-all ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-[11px] truncate uppercase text-slate-900">{s.name}</h4>
                      {s.supplierType === 'Center' && <Badge className="bg-emerald-500 h-3 px-1 text-[6px] font-black border-none uppercase">Center</Badge>}
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate font-bold mt-0.5">ID: {s.supplierId || s.id?.slice(-6)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => handleDeleteSupplier(s.id, e)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border shadow-2xl bg-white rounded-3xl min-h-[500px] border-muted-foreground/10 print:border-none print:shadow-none ${!selectedSupplier ? 'hidden lg:flex' : 'block'} printable-report`} id="printable-area">
          {selectedSupplier ? (
            <div className="flex flex-col h-full items-center">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10 print:bg-white print:border-black print:border-b-[3px] w-full">
                <Button type="button" variant="ghost" size="icon" className="lg:hidden no-print" onClick={() => setSelectedSupplier(null)}><ArrowLeft className="h-5 w-5" /></Button>
                <div className="flex-1 px-3 min-w-0">
                  <h3 className="text-[13px] font-black truncate uppercase print:text-[18pt]">{selectedSupplier.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase print:text-[10pt] print:text-slate-600">ID: {selectedSupplier.supplierId || selectedSupplier.id} | {selectedSupplier.supplierType || 'Gavali'}</p>
                    <span className="hidden print:inline-block text-[10pt] font-black uppercase text-slate-400">| सादरकर्ता: {profileName} (ID: {profileId})</span>
                  </div>
                </div>
                <div className="flex gap-2 no-print">
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-4 w-4" /></Button>
                </div>
              </div>
<<<<<<< HEAD
              <ScrollArea className="flex-1 h-[600px] print:h-auto print:overflow-visible w-full">
                <div className="p-4 space-y-5 print:p-8 print:space-y-8 flex flex-col items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">१) प्राथमिक माहिती</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">नाव</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.name}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">कोड</p><p className="text-[10px] font-black uppercase print:text-[10pt]">{selectedSupplier.supplierId}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">ऑपरेटर</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.operatorName || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मोबाईल</p><p className="text-[10px] font-black print:text-[10pt]">{selectedSupplier.mobile || "-"}</p></div>
                        <div className="col-span-2"><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पत्ता</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.address || selectedSupplier.village || "-"}</p></div>
=======
              <ScrollArea className="flex-1 h-[600px] print:h-auto">
                <div className="p-4 space-y-5 print:p-6 print:space-y-8 print:w-full print:mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-6">
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:rounded-none">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1 print:text-black print:text-xs">१) प्राथमिक माहिती</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 print:gap-y-3">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-[10pt]">नाव</p><p className="text-[10px] font-black uppercase truncate print:text-[12pt]">{selectedSupplier.name}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-[10pt]">कोड</p><p className="text-[10px] font-black uppercase print:text-[12pt]">{selectedSupplier.supplierId}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-[10pt]">ऑपरेटर</p><p className="text-[10px] font-black uppercase truncate print:text-[12pt]">{selectedSupplier.operatorName || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-[10pt]">मोबाईल</p><p className="text-[10px] font-black print:text-[12pt]">{selectedSupplier.mobile || "-"}</p></div>
                        <div className="col-span-2"><p className="text-[8px] text-muted-foreground uppercase font-black print:text-[10pt]">पत्ता</p><p className="text-[10px] font-black uppercase truncate print:text-[12pt]">{selectedSupplier.address || selectedSupplier.village || "-"}</p></div>
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
                      </div>
                    </div>
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">२) परवाना व तांत्रिक</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">FSSAI</p><p className="text-[10px] font-black uppercase print:text-[10pt]">{selectedSupplier.fssaiNumber || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मुदत</p><p className="text-[10px] font-black print:text-[10pt]">{selectedSupplier.fssaiExpiry || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">काटा ब्रँड</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.scaleBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">मशीन ब्रँड</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">रसायन स्टॉक</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.chemicalsStock || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">बॅटरी स्थिती</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.batteryCondition || "-"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black print:border-2">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1 print:text-black print:border-black print:text-[12pt]">३) व्यावसायिक माहिती</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पेमेंट सायकल</p><p className="text-[10px] font-black print:text-[10pt]">{selectedSupplier.paymentCycle || "7 Days"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">जागा</p><p className="text-[10px] font-black print:text-[10pt]">{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">स्पर्धा</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.competition || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">ग्रेड</p>
                          <Badge className={`h-4 px-1.5 text-[8px] font-black border-none text-white ${selectedSupplier.hygieneGrade === 'A' ? 'bg-emerald-500' : selectedSupplier.hygieneGrade === 'B' ? 'bg-blue-500' : 'bg-rose-500'} print:bg-slate-200 print:text-black print:text-[8pt]`}>
                            {selectedSupplier.hygieneGrade || "A"}
                          </Badge>
                        </div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">पशुखाद्य</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.cattleFeedBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black print:text-slate-500">बर्फ लाद्या</p><p className="text-[10px] font-black uppercase truncate print:text-[10pt]">{selectedSupplier.iceBlocks || 0}</p></div>
                      </div>
                    </div>
                    <div className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 space-y-1.5 print:bg-white print:border-black print:border-2">
                      <h4 className="text-[9px] font-black uppercase text-blue-700 tracking-widest border-b border-blue-200 pb-1 print:text-black print:border-black print:text-[12pt]">४) दूध संकलन सारांश</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-white rounded-lg border border-blue-50 print:border-slate-300">
                          <p className="text-[7px] font-black text-blue-500 uppercase print:text-slate-500">गाय</p>
                          <p className="text-[11px] font-black print:text-[12pt]">{selectedSupplier.cowMilk?.quantity || 0} L</p>
                          <p className="text-[7px] text-muted-foreground print:text-[8pt]">F: {selectedSupplier.cowMilk?.fat}% | S: {selectedSupplier.cowMilk?.snf}%</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-blue-50 print:border-slate-300">
                          <p className="text-[7px] font-black text-blue-500 uppercase print:text-slate-500">म्हेस</p>
                          <p className="text-[11px] font-black print:text-[12pt]">{selectedSupplier.buffaloMilk?.quantity || 0} L</p>
                          <p className="text-[7px] text-muted-foreground print:text-[8pt]">F: {selectedSupplier.buffaloMilk?.fat}% | S: {selectedSupplier.buffaloMilk?.snf}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 print:grid-cols-3 w-full">
                    {[{icon: Laptop, label: 'POP', val: selectedSupplier.computerAvailable}, {icon: Zap, label: 'UPS', val: selectedSupplier.upsInverterAvailable}, {icon: Sun, label: 'सोलर', val: selectedSupplier.solarAvailable}].map((it, i) => (
                      <div key={i} className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${it.val ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-muted/20 opacity-40 border-muted-foreground/5'} print:border-black print:border-2 print:opacity-100`}>
                        <it.icon className="h-4 w-4" />
                        <span className="text-[8px] font-black uppercase text-center print:text-[9pt]">{it.label}: {it.val ? 'हो' : 'नाही'}</span>
                      </div>
                    ))}
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
                          {(selectedSupplier.equipment || []).map((e, idx) => (
                            <tr key={e.id || idx} className="bg-white">
                              <td className="p-2 font-black uppercase text-[10px] print:text-black print:text-[10pt]">{e.name}</td>
                              <td className="p-2 text-center font-black text-[10px] print:text-black print:text-[10pt]">{e.quantity}</td>
                              <td className="p-2 text-right">
                                <Badge variant="outline" className="text-[7px] font-black uppercase h-4 px-1.5 bg-muted/50 border-none print:text-black print:border-slate-300 print:text-[8pt]">
                                  {e.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                          {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (
                            <tr><td colSpan={3} className="p-6 text-center text-[9px] opacity-30 font-black uppercase print:text-[10pt]">नोंद नाही</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 w-full">
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-1 print:border-black print:text-[12pt]">भेळस तपासणी किट</h4>
                      <div className="p-2 bg-muted/10 rounded-xl text-[9px] font-bold print:bg-white print:border-2 print:border-black print:text-[10pt] print:p-3">{selectedSupplier.adulterationKitInfo || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-1 print:border-black print:text-[12pt]">विशेष शेरा</h4>
                      <div className="p-2 bg-muted/10 rounded-xl italic text-[9px] text-slate-600 print:bg-white print:border-2 print:border-black print:text-black print:text-[10pt] print:p-3">{selectedSupplier.additionalNotes || selectedSupplier.additionalInfo || "-"}</div>
                    </div>
                  </div>
                  
                  <div className="hidden print:grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest text-slate-400 mt-20 w-full">
                    <div className="border-t-2 border-black pt-3 text-black">अधिकारी स्वाक्षरी</div>
                    <div className="border-t-2 border-black pt-3 text-black">सुपरवायझर स्वाक्षरी</div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-3 p-20 justify-center h-full no-print">
              <div className="p-6 rounded-full bg-primary/5"><User className="h-12 w-12 text-primary/20" /></div>
              <h4 className="font-black text-muted-foreground/30 text-[11px] uppercase tracking-[0.4em]">सप्लायर निवडा</h4>
            </div>
          )}
        </Card>
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
>>>>>>> 6c0c428 (आजची मोठी कामगिरी)
          }

          [data-radix-scroll-area-viewport] {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }

          .printable-report * {
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
