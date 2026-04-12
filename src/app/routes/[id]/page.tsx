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
          <Button variant="outline" onClick={() => setIsMasterDialogOpen(true)} className="h-10 font-black rounded-xl text-[10px] uppercase tracking-widest px-4 border-primary/20 text-primary hover:bg-primary/5 shrink-0">
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
            <div className="p-6 space-y-6 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left">
              <div className="w-full flex items-center justify-between no-print mb-3 border-b pb-1.5">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px]" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px]" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदल करा</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px] text-destructive border-destructive/20" onClick={() => deleteSupplier(selectedSupplier.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
                </div>
              </div>

              <div className="w-full border-b-4 border-black pb-2 mb-4 text-center">
                <h3 className="text-[18pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
                <p className="text-[10pt] font-black text-muted-foreground uppercase">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType === 'Center' ? 'संकलन केंद्र' : 'गवळी / सप्लायर'} प्रोफाईल</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-0.5 mb-1">१) प्राथमिक माहिती (PRIMARY)</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-0.5"><span className="text-muted-foreground uppercase text-[9px]">पत्ता</span><span className="leading-tight">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-0.5 mb-1">२) परवाना व तांत्रिक (TECHNICAL)</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">बॅटरी स्थिती</span><span>{selectedSupplier.batteryCondition || "-"}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-0.5 mb-1">३) व्यावसायिक माहिती (BUSINESS)</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">पेमेंट सायकल</span><span>{selectedSupplier.paymentCycle || "10 Days"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">जागा</span><span>{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">स्वच्छता ग्रेड</span><span className="font-black text-emerald-600">{selectedSupplier.hygieneGrade || "A"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-0.5"><span className="text-muted-foreground uppercase text-[9px]">बर्फ लाद्या</span><span>{selectedSupplier.iceBlocks || 0}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b-2 border-black pb-0.5 mb-1">४) दूध संकलन सारांश (MILK)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded border border-black text-center"><p className="text-[8px] font-black uppercase text-blue-600">गाय (COW)</p><p className="text-base font-black">{selectedSupplier.cowMilk?.quantity || 0}L</p></div>
                    <div className="p-2.5 rounded border border-black text-center"><p className="text-[8px] font-black uppercase text-amber-600">म्हेस (BUF)</p><p className="text-base font-black">{selectedSupplier.buffaloMilk?.quantity || 0}L</p></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="p-2 border border-black text-center"><p className="text-[7px] font-black uppercase">POP / Computer</p><p className="text-[10px] font-black">{selectedSupplier.computerAvailable ? 'हो' : 'नाही'}</p></div>
                <div className="p-2 border border-black text-center"><p className="text-[7px] font-black uppercase">UPS / Inverter</p><p className="text-[10px] font-black">{selectedSupplier.upsInverterAvailable ? 'हो' : 'नाही'}</p></div>
                <div className="p-2 border border-black text-center"><p className="text-[7px] font-black uppercase">Solar System</p><p className="text-[10px] font-black">{selectedSupplier.solarAvailable ? 'हो' : 'नाही'}</p></div>
              </div>

              <div className="space-y-2 w-full text-left">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-0.5 mb-1">५) साहित्याची यादी (INVENTORY)</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2 border border-black text-left uppercase text-[9px] w-[60%]">साहित्य नाव (Item Name)</th>
                      <th className="p-2 border border-black text-center uppercase text-[9px] w-[15%]">नग</th>
                      <th className="p-2 border border-black text-right uppercase text-[9px] w-[25%]">मालकी</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSupplier.equipment || []).map((it, idx) => (
                      <tr key={idx} className="font-bold border-b border-black">
                        <td className="p-2 border border-black">{it.name}</td>
                        <td className="p-2 border border-black text-center">{it.quantity}</td>
                        <td className="p-2 border border-black text-right uppercase text-[8px]">{it.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</td>
                      </tr>
                    ))}
                    {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (
                      <tr><td colSpan={3} className="p-4 text-center italic text-[9px] opacity-50 border border-black">कोणतेही साहित्य नोंदवलेले नाही.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
                <div className="border-t-2 border-black pt-2">अधिकारी स्वाक्षरी</div>
                <div className="border-t-2 border-black pt-2">सुपरवायझर स्वाक्षरी</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <User className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">पुरवठादार निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a supplier from the list to view full profile & inventory</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सप्लायरचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4 text-left">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase">सप्लायर नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  </div>
                </div>
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
