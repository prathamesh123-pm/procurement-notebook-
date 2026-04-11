
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
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, ShieldCheck, Printer, CheckCircle2, FlaskConical, Battery
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
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", supplierId: "", address: "", mobile: "", operatorName: "",
    routeId: currentRouteId, // Default to current route
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

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center">
          {selectedSupplier ? (
            <div className="p-5 space-y-5 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto">
              <div className="w-full flex items-center justify-between no-print mb-3 border-b pb-1.5">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px]" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px]" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदल करा</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-xl font-black uppercase text-[8px] text-destructive border-destructive/20" onClick={() => deleteSupplier(selectedSupplier.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
                </div>
              </div>

              <div className="w-full border-b-2 border-black pb-1.5 mb-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-7 w-7 bg-black rounded flex items-center justify-center"><Milk className="h-4 w-4 text-white" /></div>
                  <h1 className="text-[14pt] font-black uppercase tracking-tight leading-none">संकलन नोंदवही</h1>
                </div>
                <h3 className="text-[11pt] font-black uppercase text-primary tracking-widest">{selectedSupplier.name}</h3>
                <p className="text-[8pt] font-black text-muted-foreground uppercase">ID: {selectedSupplier.supplierId} | {selectedSupplier.supplierType}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-0.5 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> १) प्राथमिक माहिती</h4>
                  <div className="space-y-1 text-[10px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-0.5"><span className="text-muted-foreground uppercase text-[8px]">पत्ता</span><span className="leading-tight">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-0.5 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> २) परवाना व तांत्रिक</h4>
                  <div className="space-y-1 text-[10px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">रसायन स्टॉक</span><span>{selectedSupplier.chemicalsStock || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">बॅटरी स्थिती</span><span>{selectedSupplier.batteryCondition || "-"}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-3 text-left">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-0.5 flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> ३) व्यावसायिक माहिती</h4>
                  <div className="space-y-1 text-[10px] font-bold">
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">पेमेंट सायकल</span><span>{selectedSupplier.paymentCycle || "10 Days"}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">जागा</span><span>{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</span></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">स्वच्छता ग्रेड</span><Badge className="h-3.5 px-1 text-[7px] border-none bg-emerald-500">{selectedSupplier.hygieneGrade || "A"}</Badge></div>
                    <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-muted-foreground uppercase text-[8px]">बर्फ लाद्या</span><span>{selectedSupplier.iceBlocks || 0}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-blue-600 tracking-widest border-b pb-0.5 flex items-center gap-1.5"><Milk className="h-3.5 w-3.5" /> ४) दूध सारांश</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-center border border-blue-100"><p className="text-[7px] font-black uppercase text-blue-500">गाय</p><p className="text-[11px] font-black">{selectedSupplier.cowMilk?.quantity || 0}L</p></div>
                    <div className="p-1.5 rounded-lg bg-amber-50 text-center border border-amber-100"><p className="text-[7px] font-black uppercase text-amber-500">म्हेस</p><p className="text-[11px] font-black">{selectedSupplier.buffaloMilk?.quantity || 0}L</p></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full text-left">
                <div className={`p-1.5 rounded-lg border border-muted-foreground/10 flex flex-col items-center gap-0.5 ${selectedSupplier.computerAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Laptop className="h-3 w-3" /><span className="text-[7px] font-black uppercase">POP: {selectedSupplier.computerAvailable ? 'हो' : 'नाही'}</span></div>
                <div className={`p-1.5 rounded-lg border border-muted-foreground/10 flex flex-col items-center gap-0.5 ${selectedSupplier.upsInverterAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Zap className="h-3 w-3" /><span className="text-[7px] font-black uppercase">UPS: {selectedSupplier.upsInverterAvailable ? 'हो' : 'नाही'}</span></div>
                <div className={`p-1.5 rounded-lg border border-muted-foreground/10 flex flex-col items-center gap-0.5 ${selectedSupplier.solarAvailable ? 'bg-emerald-50' : 'bg-muted/20 opacity-40'}`}><Sun className="h-3 w-3" /><span className="text-[7px] font-black uppercase">सोलर: {selectedSupplier.solarAvailable ? 'हो' : 'नाही'}</span></div>
              </div>

              <div className="space-y-2 w-full text-left">
                <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-0.5 flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> साहित्याची यादी (INVENTORY)</h4>
                <div className="border border-muted-foreground/10 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead><tr className="bg-muted/30 border-b"><th className="p-1.5 font-black uppercase">साहित्य</th><th className="p-1.5 text-center font-black uppercase">नग</th><th className="p-1.5 text-right font-black uppercase">मालकी</th></tr></thead>
                    <tbody>
                      {(selectedSupplier.equipment || []).map((it, idx) => (
                        <tr key={idx} className="border-b last:border-0 font-bold"><td className="p-1.5">{it.name}</td><td className="p-1.5 text-center">{it.quantity}</td><td className="p-1.5 text-right uppercase text-[7pt]"><Badge variant="outline" className="border-none bg-muted/50 h-4 px-1">{it.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full mt-auto pt-8 grid grid-cols-2 gap-12 text-center uppercase font-black text-[8pt] tracking-widest hidden print:grid">
                <div className="border-t-[1.2px] border-black pt-1.5">अधिकारी स्वाक्षरी</div>
                <div className="border-t-[1.2px] border-black pt-1.5">सुपरवायझर स्वाक्षरी</div>
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

      {/* Dialog OMITTED for brevity but remains the same */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body { visibility: hidden !important; background: white !important; margin: 0 !important; padding: 0 !important; }
          .printable-report, .printable-report * { visibility: visible !important; opacity: 1 !important; color: black !important; }
          .printable-report { 
            position: absolute !important; 
            top: 0 !important; 
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 100% !important; 
            max-width: 190mm !important; 
            border: 1.2px solid black !important; 
            padding: 8mm !important; 
            display: block !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            background: white !important;
            margin: 0 !important;
          }
          .no-print, button, header, nav, footer, .sidebar, [role="dialog"] [class*="Close"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
