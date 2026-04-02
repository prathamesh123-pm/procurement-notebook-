
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

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground uppercase text-[10px] opacity-50">लोड होत आहे...</div>

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

        <Card className={`lg:col-span-8 border shadow-2xl bg-white rounded-3xl min-h-[500px] border-muted-foreground/10 print:border-none print:shadow-none ${!selectedSupplier ? 'hidden lg:flex' : 'block'}`} id="printable-area">
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10 print:bg-white print:border-black print:border-b-2">
                <Button type="button" variant="ghost" size="icon" className="lg:hidden no-print" onClick={() => setSelectedSupplier(null)}><ArrowLeft className="h-5 w-5" /></Button>
                <div className="flex-1 px-3 min-w-0">
                  <h3 className="text-[13px] font-black truncate uppercase print:text-xl">{selectedSupplier.name}</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase print:text-black">ID: {selectedSupplier.supplierId || selectedSupplier.id} | {selectedSupplier.supplierType || 'Gavali'}</p>
                </div>
                <div className="flex gap-2 no-print">
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/5 rounded-xl" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-4 w-4" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1 h-[600px] print:h-auto">
                <div className="p-4 space-y-5 print:p-0 print:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1">१) प्राथमिक माहिती</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">नाव</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.name}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">कोड</p><p className="text-[10px] font-black uppercase">{selectedSupplier.supplierId}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">ऑपरेटर</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.operatorName || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">मोबाईल</p><p className="text-[10px] font-black">{selectedSupplier.mobile || "-"}</p></div>
                        <div className="col-span-2"><p className="text-[8px] text-muted-foreground uppercase font-black">पत्ता</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.address || selectedSupplier.village || "-"}</p></div>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1">२) परवाना व तांत्रिक</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">FSSAI</p><p className="text-[10px] font-black uppercase">{selectedSupplier.fssaiNumber || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">मुदत</p><p className="text-[10px] font-black">{selectedSupplier.fssaiExpiry || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">काटा</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.scaleBrand || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">मशीन</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-3 rounded-2xl border border-muted-foreground/5 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-1">३) व्यावसायिक माहिती</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">पेमेंट सायकल</p><p className="text-[10px] font-black">{selectedSupplier.paymentCycle || "7 Days"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">जागा</p><p className="text-[10px] font-black">{selectedSupplier.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">स्पर्धा</p><p className="text-[10px] font-black uppercase truncate">{selectedSupplier.competition || "-"}</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">ग्रेड</p><Badge className="h-4 px-1.5 text-[8px] font-black border-none text-white bg-emerald-500">{selectedSupplier.hygieneGrade || "A"}</Badge></div>
                      </div>
                    </div>
                    <div className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 space-y-1.5 print:bg-white print:border-black">
                      <h4 className="text-[9px] font-black uppercase text-blue-700 tracking-widest border-b border-blue-200 pb-1">४) दूध संकलन सारांश</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-1 bg-white rounded-lg border border-blue-50">
                          <p className="text-[7px] font-black text-blue-500 uppercase">गाय</p>
                          <p className="text-[11px] font-black">{selectedSupplier.cowMilk?.quantity || 0} L</p>
                        </div>
                        <div className="text-center p-1 bg-white rounded-lg border border-blue-50">
                          <p className="text-[7px] font-black text-blue-500 uppercase">म्हेस</p>
                          <p className="text-[11px] font-black">{selectedSupplier.buffaloMilk?.quantity || 0} L</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[{icon: Laptop, label: 'POP', val: selectedSupplier.computerAvailable}, {icon: Zap, label: 'UPS', val: selectedSupplier.upsInverterAvailable}, {icon: Sun, label: 'सोलर', val: selectedSupplier.solarAvailable}].map((it, i) => (
                      <div key={i} className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${it.val ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-muted/20 opacity-40 border-muted-foreground/5'} print:border-black print:opacity-100`}>
                        <it.icon className="h-4 w-4" />
                        <span className="text-[8px] font-black uppercase text-center">{it.label}: {it.val ? 'हो' : 'नाही'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b pb-1 print:text-black">
                      <Box className="h-3.5 w-3.5 print:hidden" /> साहित्याची यादी (INVENTORY)
                    </h4>
                    <div className="border border-muted-foreground/10 rounded-xl overflow-hidden shadow-sm print:border-black">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/30 border-b print:bg-white print:border-black">
                            <th className="p-2 text-[8px] font-black uppercase text-muted-foreground print:text-black">साहित्य</th>
                            <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-center print:text-black">नग</th>
                            <th className="p-2 text-[8px] font-black uppercase text-muted-foreground text-right print:text-black">मालकी</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted-foreground/5 print:divide-black">
                          {(selectedSupplier.equipment || []).map(e => (
                            <tr key={e.id} className="bg-white">
                              <td className="p-2 font-black uppercase text-[10px] print:text-black">{e.name}</td>
                              <td className="p-2 text-center font-black text-[10px] print:text-black">{e.quantity}</td>
                              <td className="p-2 text-right">
                                <Badge variant="outline" className="text-[7px] font-black uppercase h-4 px-1.5 bg-muted/50 border-none print:text-black print:border-black">
                                  {e.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                          {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (
                            <tr><td colSpan={3} className="p-6 text-center text-[9px] opacity-30 font-black uppercase">नोंद नाही</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-1">भेळस तपासणी किट</h4>
                      <div className="p-2 bg-muted/10 rounded-xl text-[9px] font-bold">{selectedSupplier.adulterationKitInfo || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black uppercase text-primary tracking-widest border-b pb-1">विशेष शेरा</h4>
                      <div className="p-2 bg-muted/10 rounded-xl italic text-[9px] text-slate-600">{selectedSupplier.additionalNotes || "-"}</div>
                    </div>
                  </div>
                  
                  <div className="hidden print:grid grid-cols-2 gap-10 text-center uppercase font-black text-[8px] tracking-widest text-slate-400 mt-20">
                    <div className="border-t border-black pt-2 text-black">अधिकारी स्वाक्षरी</div>
                    <div className="border-t border-black pt-2 text-black">सुपरवायझर स्वाक्षरी</div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[550px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती बदला'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">संपूर्ण तांत्रिक व व्यावसायिक तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6 bg-white">
            <div className="space-y-6 pb-10">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 tracking-widest">१) प्राथमिक व परवाना माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-black rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gavali" className="text-[11px] font-black">गवळी</SelectItem>
                        <SelectItem value="Gotha" className="text-[11px] font-black">गोठा</SelectItem>
                        <SelectItem value="Center" className="text-[11px] font-black">उत्पादक केंद्र</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">पूर्ण नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">कोड (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">पत्ता / गाव</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Truck className="h-4 w-4" /> २) तांत्रिक व रसायने
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] rounded-xl bg-muted/20 border-none font-black shadow-inner" /></div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                    <Checkbox checked={formData.computerAvailable} />
                    <Label className="text-[11px] font-black uppercase cursor-pointer">POP सिस्टम आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                    <Checkbox checked={formData.upsInverterAvailable} />
                    <Label className="text-[11px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर आहे का?</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Box className="h-4 w-4" /> ३) साहित्याची यादी (INVENTORY)
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self' }] })} className="h-7 text-[9px] font-black px-3 rounded-xl border-primary/20 bg-primary/5 text-primary">
                    जोडा
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-inner">
                      <div className="col-span-6">
                        <Input value={item.name} onChange={e => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, name: e.target.value } : eq) })} className="h-8 text-[11px] px-3 bg-white border-none rounded-lg font-bold" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={item.quantity} onChange={e => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, quantity: Number(e.target.value) } : eq) })} className="h-8 text-[11px] px-0 text-center bg-white border-none rounded-lg" />
                      </div>
                      <div className="col-span-3">
                        <Select value={item.ownership} onValueChange={v => setFormData({ ...formData, equipment: formData.equipment.map(eq => eq.id === item.id ? { ...eq, ownership: v as any } : eq) })}>
                          <SelectTrigger className="h-8 text-[9px] px-2 bg-white border-none rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Self" className="text-[11px] font-black">स्वतः</SelectItem>
                            <SelectItem value="Company" className="text-[11px] font-black">डेअरी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, equipment: formData.equipment.filter(eq => eq.id !== item.id) })} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 tracking-widest">४) अतिरिक्त माहिती (NOTES)</h4>
                <Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="min-h-[100px] text-[12px] rounded-2xl bg-muted/20 border-none font-bold p-4 shadow-inner" placeholder="..." />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/10 gap-3 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-11 text-[11px] font-black uppercase border-primary/20 flex-1 sm:flex-none">रद्द</Button>
            <Button type="button" onClick={handleSaveSupplier} className="rounded-2xl h-11 text-[11px] font-black uppercase shadow-xl shadow-primary/20 flex-1 sm:flex-none">
              <CheckCircle2 className="h-4 w-4 mr-2" /> जतन करा
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
            padding: 6px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  )
}
