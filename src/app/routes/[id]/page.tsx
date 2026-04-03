
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, MapPin, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, ShieldCheck, Printer, CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
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
  const suppliersList = useMemo(() => allSuppliers?.filter(s => s.routeId === routeId) || [], [allSuppliers, routeId])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", supplierId: "", address: "", mobile: "", operatorName: "",
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
      ...formData, routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), milkCansCount: Number(formData.milkCansCount),
      updatedAt: new Date().toISOString()
    }
    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
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

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-3 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/routes')} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
          <div><h2 className="text-lg font-black uppercase">{route?.name || "रूट माहिती"}</h2><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supplier Management</p></div>
        </div>
        <Button onClick={openAddDialog} className="h-10 font-black rounded-xl text-[11px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-1.5" /> नवीन सप्लायर</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-2xl bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" /><input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-muted/10 border-none rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
          <ScrollArea className="h-[450px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-3 cursor-pointer hover:bg-primary/5 transition-all ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                  <h4 className="font-black text-[11px] uppercase truncate">{s.name}</h4>
                  <p className="text-[9px] text-muted-foreground font-bold">ID: {s.supplierId}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[500px]">
          {selectedSupplier ? (
            <div className="p-6 space-y-6 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px]" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px]" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3.5 w-3.5 mr-1" /> बदल करा</Button>
                </div>
              </div>

              <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center"><Milk className="h-5 w-5 text-white" /></div>
                  <h1 className="text-[18pt] font-black uppercase tracking-tight leading-none">संकलन नोंदवही</h1>
                </div>
                <h3 className="text-[13pt] font-black uppercase text-primary tracking-widest">{selectedSupplier.name}</h3>
                <p className="text-[9pt] font-black text-muted-foreground uppercase">ID: {selectedSupplier.supplierId} | {selectedSupplier.supplierType}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b pb-1 flex items-center gap-2"><User className="h-3.5 w-3.5" /> १) प्राथमिक माहिती</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-0.5"><span className="text-muted-foreground uppercase text-[9px]">पत्ता</span><span className="leading-tight">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> २) परवाना व तांत्रिक</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">FSSAI</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">मशीन</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">रसायन</span><span>{selectedSupplier.chemicalsStock || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">बॅटरी</span><span>{selectedSupplier.batteryCondition || "-"}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b pb-1 flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> ३) व्यावसायिक माहिती</h4>
                  <div className="space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">सायकल</span><span>{selectedSupplier.paymentCycle || "10 Days"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">जागा</span><span>{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">ग्रेड</span><Badge className="h-4 px-1 text-[8px] border-none bg-emerald-500">{selectedSupplier.hygieneGrade || "A"}</Badge></div>
                    <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground uppercase text-[9px]">बर्फ लाद्या</span><span>{selectedSupplier.iceBlocks || 0}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-1 flex items-center gap-2"><Milk className="h-3.5 w-3.5" /> ४) दूध सारांश</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-center border border-blue-100"><p className="text-[8px] font-black uppercase text-blue-500">गाय</p><p className="text-sm font-black">{selectedSupplier.cowMilk?.quantity || 0}L</p></div>
                    <div className="p-2 rounded-xl bg-amber-50 text-center border border-amber-100"><p className="text-[8px] font-black uppercase text-amber-500">म्हेस</p><p className="text-sm font-black">{selectedSupplier.buffaloMilk?.quantity || 0}L</p></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 ${selectedSupplier.computerAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Laptop className="h-4 w-4" /><span className="text-[8px] font-black uppercase">POP: {selectedSupplier.computerAvailable ? 'हो' : 'नाही'}</span></div>
                <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 ${selectedSupplier.upsInverterAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Zap className="h-4 w-4" /><span className="text-[8px] font-black uppercase">UPS: {selectedSupplier.upsInverterAvailable ? 'हो' : 'नाही'}</span></div>
                <div className={`p-2 rounded-xl border border-muted-foreground/10 flex flex-col items-center gap-1 ${selectedSupplier.solarAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Sun className="h-4 w-4" /><span className="text-[8px] font-black uppercase">सोलर: {selectedSupplier.solarAvailable ? 'हो' : 'नाही'}</span></div>
              </div>

              <div className="space-y-3 w-full">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest border-b pb-1 flex items-center gap-2"><Box className="h-3.5 w-3.5" /> साहित्याची यादी (INVENTORY)</h4>
                <div className="border border-muted-foreground/10 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead><tr className="bg-muted/30 border-b"><th className="p-2 font-black uppercase">साहित्य</th><th className="p-2 text-center font-black uppercase">नग</th><th className="p-2 text-right font-black uppercase">मालकी</th></tr></thead>
                    <tbody>
                      {(selectedSupplier.equipment || []).map((it, idx) => (
                        <tr key={idx} className="border-b last:border-0 font-bold"><td className="p-2">{it.name}</td><td className="p-2 text-center">{it.quantity}</td><td className="p-2 text-right uppercase text-[8px]"><Badge variant="outline" className="border-none bg-muted/50">{it.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[9pt] tracking-widest hidden print:grid">
                <div className="border-t-[1.5px] border-black pt-2">अधिकारी स्वाक्षरी</div>
                <div className="border-t-[1.5px] border-black pt-2">सुपरवायझर स्वाक्षरी</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <User className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">पुरवठादार निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a supplier to view full details</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">सप्लायर प्रकार *</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी (Gavali)</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा (Gotha)</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र (Center)</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
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
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ४) इन्व्हेंटरी व स्टेटस</h4>
                <div className="grid grid-cols-3 gap-2">
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
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase">साहित्य यादी</span><Button variant="outline" type="button" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black px-3 rounded-lg border-primary/20 text-primary">जोडा</Button></div>
                  {formData.equipment.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 items-center">
                      <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] border-none rounded-lg font-bold bg-white shadow-inner" placeholder="साहित्य" /></div>
                      <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] text-center border-none rounded-lg font-black bg-white shadow-inner" /></div>
                      <div className="col-span-3">
                        <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                          <SelectTrigger className="h-8 text-[9px] bg-white border-none rounded-lg font-black shadow-inner"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-rose-400 hover:bg-rose-50"><X className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-xl p-4 shadow-inner" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5"><Button onClick={handleSaveSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden !important; background: white !important; }
          .printable-report, .printable-report * { visibility: visible !important; opacity: 1 !important; color: black !important; }
          .printable-report { 
            position: absolute !important; left: 0 !important; right: 0 !important; top: 0 !important;
            margin: 0 auto !important; width: 100% !important; max-width: 210mm !important; 
            border: 1.5px solid black !important; padding: 10mm !important; display: block !important;
            box-shadow: none !important;
          }
          .no-print, button, header, nav, footer, .sidebar, [role="dialog"] [class*="Close"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
