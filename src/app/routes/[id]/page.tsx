"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem, SupplierType, Route } from "@/lib/types"
import { 
  Plus, Search, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, ShieldCheck, Printer, CheckCircle2, ListPlus
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const currentRouteId = params.id as string
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

  const { data: allRoutes } = useCollection<Route>(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const route = useMemo(() => allRoutes?.find(r => r.id === currentRouteId), [allRoutes, currentRouteId])
  const suppliersList = useMemo(() => allSuppliers?.filter(s => s.routeId === currentRouteId) || [], [allSuppliers, currentRouteId])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [masterSearchQuery, setMasterSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMasterDialogOpen, setIsMasterDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", supplierId: "", address: "", mobile: "", operatorName: "",
    routeId: currentRouteId,
    supplierType: "Gavali" as SupplierType, fssaiNumber: "", fssaiExpiry: "",
    scaleBrand: "", fatMachineBrand: "", chemicalsStock: "", batteryCondition: "",
    paymentCycle: "10 Days", spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
    competition: "", cattleFeedBrand: "", iceBlocks: "0",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "", additionalNotes: "", equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const openAddDialog = () => {
    setDialogMode('add'); setEditingId(null);
    setFormData({
      name: "", supplierId: "", address: "", mobile: "", operatorName: "",
      routeId: currentRouteId,
      supplierType: "Gavali", fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", paymentCycle: "10 Days", spaceOwnership: "Self",
      hygieneGrade: "A", competition: "", cattleFeedBrand: "", iceBlocks: "0",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", additionalNotes: "", equipment: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (s: Supplier) => {
    setDialogMode('edit'); setEditingId(s.id);
    setFormData({
      name: s.name || "", supplierId: s.supplierId || "", address: s.address || "",
      mobile: s.mobile || "", operatorName: s.operatorName || "",
      routeId: s.routeId || "none",
      supplierType: s.supplierType || "Gavali", fssaiNumber: s.fssaiNumber || "",
      fssaiExpiry: s.fssaiExpiry || "", scaleBrand: s.scaleBrand || "",
      fatMachineBrand: s.fatMachineBrand || "", chemicalsStock: s.chemicalsStock || "",
      batteryCondition: s.batteryCondition || "", paymentCycle: s.paymentCycle || "10 Days",
      spaceOwnership: s.spaceOwnership || "Self", hygieneGrade: s.hygieneGrade || "A",
      competition: s.competition || "", cattleFeedBrand: s.cattleFeedBrand || "",
      iceBlocks: String(s.iceBlocks || 0),
      cowQty: String(s.cowMilk?.quantity || 0), cowFat: String(s.cowMilk?.fat || 0), cowSnf: String(s.cowMilk?.snf || 0),
      bufQty: String(s.buffaloMilk?.quantity || 0), bufFat: String(s.buffaloMilk?.fat || 0), bufSnf: String(s.buffaloMilk?.snf || 0),
      milkCansCount: String(s.milkCansCount || 0), computerAvailable: s.computerAvailable || false,
      upsInverterAvailable: s.upsInverterAvailable || false, solarAvailable: s.solarAvailable || false,
      adulterationKitInfo: s.adulterationKitInfo || "", additionalNotes: s.additionalNotes || s.additionalInfo || "",
      equipment: s.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.supplierId || !db) return;
    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), milkCansCount: Number(formData.milkCansCount),
      updatedAt: new Date().toISOString()
    }
    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
  }

  const handleAssignFromMaster = (sid: string) => {
    if (!db) return
    updateDocumentNonBlocking(doc(db, 'suppliers', sid), { routeId: currentRouteId, updatedAt: new Date().toISOString() })
    setIsMasterDialogOpen(false)
    toast({ title: "यशस्वी", description: "सप्लायर या रूटला जोडला गेला." })
  }

  const availableMasterSuppliers = useMemo(() => {
    return (allSuppliers || []).filter(s => {
      const isNotInCurrentRoute = s.routeId !== currentRouteId;
      const q = masterSearchQuery.toLowerCase();
      const matchesSearch = s.name?.toLowerCase().includes(q) || s.supplierId?.toString().includes(q);
      return isNotInCurrentRoute && matchesSearch;
    })
  }, [allSuppliers, currentRouteId, masterSearchQuery])

  const getRouteName = (rid: string) => {
    if (!rid) return "रूट नाही";
    return allRoutes?.find(r => r.id === rid)?.name || "---"
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

  const deleteSupplier = (id: string) => {
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'suppliers', id))
      setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])
  
  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-3 no-print gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push('/routes')} className="rounded-full shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase truncate">{route?.name || "रूट माहिती"}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supplier Management</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          <Button onClick={() => setIsMasterDialogOpen(true)} variant="outline" className="h-10 font-black rounded-xl text-[10px] uppercase tracking-widest px-4 border-primary/20 text-primary shrink-0 shadow-sm">
            <ListPlus className="h-4 w-4 mr-1.5" /> मास्टर मधून निवडा
          </Button>
          <Button onClick={openAddDialog} className="h-10 font-black rounded-xl text-[10px] uppercase tracking-widest px-4 shadow-lg shadow-primary/20 shrink-0">
            <Plus className="h-4 w-4 mr-1.5" /> नवीन सप्लायर
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-2xl bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="या रूटमध्ये शोधा..." className="w-full pl-9 h-10 text-[12px] bg-muted/10 border-none rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-3 cursor-pointer hover:bg-primary/5 transition-all ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-[11px] uppercase truncate flex-1">{s.name}</h4>
                    {s.supplierType === 'Center' && <Badge className="h-3.5 px-1 text-[7px] font-black bg-emerald-500 border-none">CENTER</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black bg-primary/5 text-primary border-none">ID: {s.supplierId}</Badge>
                    <span className="text-[9px] text-muted-foreground font-bold">{s.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center">
          {selectedSupplier ? (
            <div className="p-8 space-y-8 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left bg-white">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedSupplier.supplierType} PROFILE REPORT</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] text-destructive border-destructive/20" onClick={() => deleteSupplier(selectedSupplier.id)}><Trash2 className="h-4 w-4 mr-1.5" /> हटवा</Button>
                </div>
              </div>

              <div className="w-full border-b-4 border-black pb-3 mb-6 text-center">
                <h3 className="text-[20pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
                <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType === 'Center' ? 'संकलन केंद्र' : 'गवळी / सप्लायर'} प्रोफाईल</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">१) प्राथमिक माहिती (PRIMARY)</h4>
                  <div className="space-y-2 text-[12px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">ऑपरेटर नाव</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल नंबर</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पूर्ण पत्ता</span><span className="leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">२) परवाना व तांत्रिक (TECHNICAL)</h4>
                  <div className="space-y-2 text-[12px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">काटा ब्रँड नाव</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बॅटरी स्थिती</span><span>{selectedSupplier.batteryCondition || "-"}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">३) व्यावसायिक माहिती (BUSINESS)</h4>
                  <div className="space-y-2 text-[12px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">पेमेंट सायकल</span><span>{selectedSupplier.paymentCycle || "10 Days"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">जागा मालकी</span><span>{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">स्वच्छता ग्रेड</span><span className="font-black text-emerald-600 text-sm">{selectedSupplier.hygieneGrade || "A"} GRADE</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बर्फ लाद्या</span><span>{selectedSupplier.iceBlocks || 0} नग</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] border-b-2 border-black pb-1 mb-2">४) दूध संकलन सारांश (MILK)</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 rounded-lg border-2 border-blue-600 flex justify-between items-center bg-blue-50/30">
                      <span className="text-[10px] font-black uppercase text-blue-600">गाय दूध (COW)</span>
                      <span className="text-base font-black">{selectedSupplier.cowMilk?.quantity || 0} L <span className="text-[10px] opacity-60 ml-2">(F:{selectedSupplier.cowMilk?.fat}% S:{selectedSupplier.cowMilk?.snf}%)</span></span>
                    </div>
                    <div className="p-3 rounded-lg border-2 border-amber-600 flex justify-between items-center bg-amber-50/30">
                      <span className="text-[10px] font-black uppercase text-amber-600">म्हेस दूध (BUF)</span>
                      <span className="text-base font-black">{selectedSupplier.buffaloMilk?.quantity || 0} L <span className="text-[10px] opacity-60 ml-2">(F:{selectedSupplier.buffaloMilk?.fat}% S:{selectedSupplier.buffaloMilk?.snf}%)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full mb-8">
                <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">POP / COMPUTER</p><p className="text-[12px] font-black">{selectedSupplier.computerAvailable ? 'AVAILABLE' : 'NO'}</p></div>
                <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">UPS / INVERTER</p><p className="text-[12px] font-black">{selectedSupplier.upsInverterAvailable ? 'AVAILABLE' : 'NO'}</p></div>
                <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">SOLAR SYSTEM</p><p className="text-[12px] font-black">{selectedSupplier.solarAvailable ? 'AVAILABLE' : 'NO'}</p></div>
              </div>

              <div className="space-y-3 w-full text-left">
                <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">५) साहित्याची यादी (INVENTORY ASSETS)</h4>
                <table className="w-full border-collapse border border-black shadow-sm">
                  <thead>
                    <tr className="bg-slate-100 h-10">
                      <th className="p-3 border border-black text-left uppercase text-[10px] font-black w-[50%]">साहित्य नाव (Item)</th>
                      <th className="p-3 border border-black text-center uppercase text-[10px] font-black w-[15%]">नग</th>
                      <th className="p-3 border border-black text-right uppercase text-[10px] font-black w-[35%]">मालकी हक्क</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSupplier.equipment || []).map((it, idx) => (
                      <tr key={idx} className="font-bold border-b border-black h-10">
                        <td className="p-3 border border-black text-[12px] uppercase">{it.name}</td>
                        <td className="p-3 border border-black text-center text-[12px]">{it.quantity}</td>
                        <td className="p-3 border border-black text-right uppercase text-[10px]">{it.ownership === 'Self' ? 'स्वतःची' : 'डेअरीची'}</td>
                      </tr>
                    ))}
                    {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (
                      <tr className="h-12"><td colSpan={3} className="p-4 text-center italic text-[11px] opacity-50 border border-black">कोणतेही साहित्य नोंदवलेले नाही.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
                <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
                <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <User className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">पुरवठादार निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a supplier from the list to view professional report</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isMasterDialogOpen} onOpenChange={setIsMasterDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle className="text-base font-black uppercase tracking-widest">मास्टर लिस्ट मधून निवडा</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">या रूटला सप्लायर असाइन करा.</DialogDescription>
          </DialogHeader>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input 
                placeholder="नाव किंवा कोडने शोधा..." 
                className="pl-10 h-11 w-full rounded-xl bg-muted/10 border-none font-bold shadow-inner outline-none focus:ring-1 focus:ring-primary"
                value={masterSearchQuery}
                onChange={e => setMasterSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-muted-foreground/5">
              {availableMasterSuppliers.length > 0 ? (
                availableMasterSuppliers.map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1 mr-4">
                      <h4 className="font-black text-[12px] uppercase truncate">{s.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="h-4 px-1 text-[7px] border-none bg-primary/5 text-primary uppercase">ID: {s.supplierId}</Badge>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase truncate">रूट: {getRouteName(s.routeId)}</span>
                      </div>
                    </div>
                    <Button size="sm" className="h-8 text-[9px] font-black uppercase rounded-lg px-4 shadow-md" onClick={() => handleAssignFromMaster(s.id)}>
                      येथे जोडा
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-muted-foreground font-black uppercase text-[10px] opacity-30 italic">सप्लायर सापडले नाहीत.</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white text-left">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सप्लायरचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6 text-left">
            <div className="space-y-6 pb-10 text-left">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">रसायन स्टॉक</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ३) व्यावसायिक व दूध तपशील</h4>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">जागा</Label>
                      <Select value={formData.spaceOwnership} onValueChange={(v: any) => setFormData({...formData, spaceOwnership: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Self" className="font-bold">स्वतःची</SelectItem><SelectItem value="Rented" className="font-bold">भाड्याची</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">स्वच्छता ग्रेड</Label>
                      <Select value={formData.hygieneGrade} onValueChange={(v: any) => setFormData({...formData, hygieneGrade: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पशुखाद्य</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="L" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="F" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="S" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-1">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="L" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="F" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="S" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ४) इन्व्हेंटरी व स्टेटस</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Laptop className={`h-5 w-5 ${formData.computerAvailable ? 'text-primary' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">POP: {formData.computerAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Zap className={`h-5 w-5 ${formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Sun className={`h-5 w-5 ${formData.solarAvailable ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">सोलर: {formData.solarAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl border border-muted-foreground/5">
                      <Label className="text-[8px] font-black uppercase opacity-50">Cans</Label>
                      <Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 text-[10px] bg-white border-none rounded text-center" />
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Adulteration Kit (भेसळ तपासणी कीट)</Label><Input value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" placeholder="उदा. हो, चितळे कीट" /></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[11px] font-black uppercase tracking-widest">साहित्याची यादी (INVENTORY)</h4><Button variant="outline" type="button" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 items-center">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] border-none rounded-lg font-bold bg-white" placeholder="साहित्य" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] text-center border-none rounded-lg font-black bg-white" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[9px] bg-white border-none rounded-lg font-black"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-rose-400"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-left"><Label className="text-[10px] font-black uppercase text-muted-foreground">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-xl p-4 shadow-inner" /></div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={handleSaveSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20">माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
