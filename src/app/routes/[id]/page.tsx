
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
    paymentCycle: "7 Days", spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
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
      chemicalsStock: "", batteryCondition: "", paymentCycle: "7 Days", spaceOwnership: "Self",
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
      batteryCondition: s.batteryCondition || "", paymentCycle: s.paymentCycle || "7 Days",
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
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "पुरवठादार माहिती जतन झाली." })
  }

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-2">
      <div className="flex items-center justify-between border-b pb-3 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/routes')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h2 className="text-lg font-black uppercase">{route?.name || "रूट माहिती"}</h2><p className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Management</p></div>
        </div>
        <Button onClick={openAddDialog} className="h-10 font-black rounded-xl text-[11px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-1.5" /> नवीन सप्लायर</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-2xl bg-white no-print">
          <div className="p-3 border-b"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" /><input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-muted/10 border-none rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
          <ScrollArea className="h-[400px]">
            {filteredSuppliers.map(s => (
              <div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-3 cursor-pointer hover:bg-primary/5 border-b transition-all ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                <h4 className="font-black text-[11px] uppercase">{s.name}</h4>
                <p className="text-[9px] text-muted-foreground font-bold">ID: {s.supplierId}</p>
              </div>
            ))}
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[500px]">
          {selectedSupplier ? (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div><h3 className="text-xl font-black uppercase text-primary">{selectedSupplier.name}</h3><p className="text-[10px] font-black text-muted-foreground uppercase">ID: {selectedSupplier.supplierId} | {selectedSupplier.supplierType}</p></div>
                <div className="flex gap-2 no-print"><Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-4 w-4" /></Button></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1"><p className="font-black text-slate-400 uppercase text-[9px]">ऑपरेटर</p><p className="font-bold">{selectedSupplier.operatorName || "-"}</p></div>
                <div className="space-y-1"><p className="font-black text-slate-400 uppercase text-[9px]">मोबाईल</p><p className="font-bold">{selectedSupplier.mobile || "-"}</p></div>
                <div className="col-span-2 space-y-1"><p className="font-black text-slate-400 uppercase text-[9px]">पत्ता</p><p className="font-bold">{selectedSupplier.address || "-"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-center"><p className="text-[8px] font-black text-blue-600 uppercase">गाय दूध</p><p className="text-lg font-black">{selectedSupplier.cowMilk?.quantity || 0} L</p></div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center"><p className="text-[8px] font-black text-amber-600 uppercase">म्हेस दूध</p><p className="text-lg font-black">{selectedSupplier.buffaloMilk?.quantity || 0} L</p></div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center"><p className="text-[8px] font-black text-emerald-600 uppercase">बर्फ वापर</p><p className="text-lg font-black">{selectedSupplier.iceBlocks || 0}</p></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20"><User className="h-16 w-16 mb-4" /><h4 className="font-black uppercase tracking-[0.3em]">सप्लायर निवडा</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white"><DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6 bg-white">
            <div className="space-y-6 pb-10">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">सप्लायर प्रकार *</Label>
                    <Select value={formData.supplierType} onValueChange={(v: SupplierType) => setFormData({...formData, supplierType: v})}><SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Gavali">गवळी (Gavali)</SelectItem><SelectItem value="Gotha">गोठा (Gotha)</SelectItem><SelectItem value="Center">उत्पादक केंद्र (Center)</SelectItem></SelectContent></Select>
                  </div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ३) व्यावसायिक व दूध तपशील</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">स्वच्छता ग्रेड (A/B/C)</Label><Input value={formData.hygieneGrade} onChange={e => setFormData({...formData, hygieneGrade: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">बर्फ वापर</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय दूध (Cow)</div>
                  <div className="space-y-1"><Label className="text-[8px] font-black">Ltr</Label><Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none rounded-lg" /></div>
                  <div className="space-y-1"><Label className="text-[8px] font-black">F%</Label><Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none rounded-lg" /></div>
                  <div className="space-y-1"><Label className="text-[8px] font-black">S%</Label><Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none rounded-lg" /></div>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-2xl p-4 shadow-inner" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5"><Button onClick={handleSaveSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
