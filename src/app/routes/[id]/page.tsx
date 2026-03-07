
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem } from "@/lib/types"
import { 
  Plus, Search, MapPin, Phone, Info, Milk, User, 
  Truck, Package, ShieldCheck, 
  Trash2, Edit, ChevronRight, PlusCircle, ArrowLeft, X, CheckCircle2
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const { toast } = useToast()

  const [route, setRoute] = useState<Route | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    address: "",
    mobile: "",
    competition: "",
    additionalInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0",
    collectionType: "Route",
    cattleFeedBrand: "",
    fssaiNumber: "",
    fssaiExpiry: "",
    scaleBrand: "",
    fatMachineBrand: "",
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    setSuppliers(storedSupps.filter((s: Supplier) => s.routeId === routeId))
  }, [routeId])

  const openAddDialog = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", collectionType: "Route", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: "",
      scaleBrand: "", fatMachineBrand: "",
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setDialogMode('edit')
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name || "",
      id: supplier.id || "",
      address: supplier.address || "",
      mobile: supplier.mobile || "",
      competition: supplier.competition || "",
      additionalInfo: supplier.additionalInfo || "",
      cowQty: String(supplier.cowMilk?.quantity ?? 0),
      cowFat: String(supplier.cowMilk?.fat ?? 0),
      cowSnf: String(supplier.cowMilk?.snf ?? 0),
      bufQty: String(supplier.buffaloMilk?.quantity ?? 0),
      bufFat: String(supplier.buffaloMilk?.fat ?? 0),
      bufSnf: String(supplier.buffaloMilk?.snf ?? 0),
      iceBlocks: String(supplier.iceBlocks ?? 0),
      collectionType: supplier.collectionType || "Route",
      cattleFeedBrand: supplier.cattleFeedBrand || "",
      fssaiNumber: supplier.fssaiNumber || "",
      fssaiExpiry: supplier.fssaiExpiry || "",
      scaleBrand: supplier.scaleBrand || "",
      fatMachineBrand: supplier.fatMachineBrand || "",
      equipment: supplier.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleAddEquipmentRow = () => {
    const newItem: EquipmentItem = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      ownership: 'Self'
    }
    setFormData({ ...formData, equipment: [...formData.equipment, newItem] })
  }

  const handleRemoveEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(item => item.id !== id) })
  }

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.map(item => item.id === id ? { ...item, ...updates } : item)
    })
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.id) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी भरणे आवश्यक आहे.", variant: "destructive" })
      return
    }

    const supplierData: Supplier = {
      id: formData.id,
      name: formData.name,
      address: formData.address,
      mobile: formData.mobile,
      routeId: routeId,
      competition: formData.competition,
      additionalInfo: formData.additionalInfo,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks),
      collectionType: formData.collectionType,
      cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry,
      scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand,
      equipment: formData.equipment
    }

    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    let updatedAllSupps: Supplier[]

    if (dialogMode === 'add') {
      updatedAllSupps = [...allSupps, supplierData]
      toast({ title: "यशस्वी", description: "नवीन पुरवठादार जोडला गेला." })
    } else {
      updatedAllSupps = allSupps.map((s: Supplier) => s.id === editingId ? supplierData : s)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत केली गेली." })
    }

    localStorage.setItem('procurepal_suppliers', JSON.stringify(updatedAllSupps))
    setSuppliers(updatedAllSupps.filter((s: Supplier) => s.routeId === routeId))
    if (editingId === selectedSupplier?.id || formData.id === selectedSupplier?.id) setSelectedSupplier(supplierData)
    setIsDialogOpen(false)
  }

  const handleDeleteSupplier = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हा पुरवठादार हटवायचा आहे?")) return
    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const updated = allSupps.filter((s: Supplier) => s.id !== id)
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updated))
    setSuppliers(updated.filter((s: Supplier) => s.routeId === routeId))
    if (selectedSupplier?.id === id) setSelectedSupplier(null)
    toast({ title: "हटवले", description: "पुरवठादार काढून टाकला आहे." })
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 sm:px-0 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.push('/routes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-headline text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" /> सप्लायर व्यवस्थापन (Suppliers)
            </h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Route: {route?.name || routeId}</p>
          </div>
        </div>
        <Button onClick={openAddDialog} size="sm" className="w-full sm:w-auto font-black gap-2 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> नवीन सप्लायर (Add New)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Panel: List */}
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-2xl overflow-hidden ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="सप्लायर शोधा... (Search...)" 
                className="pl-8 h-9 text-xs bg-white border-none rounded-xl shadow-inner" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[400px] lg:h-[650px]">
            <div className="divide-y">
              {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedSupplier(s)} 
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-all flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                >
                  <div className="min-w-0">
                    <h4 className="font-black text-[11px] text-foreground truncate">{s.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 py-0 h-3.5 border-primary/20 text-primary">ID: {s.id}</Badge>
                      <span className="text-[9px] text-muted-foreground font-bold truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {s.address}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
                </div>
              )) : (
                <div className="p-10 text-center space-y-2">
                  <User className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase">एकही सप्लायर सापडला नाही</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel: Details */}
        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-2xl min-h-[500px] ${!selectedSupplier ? 'hidden lg:flex lg:items-center lg:justify-center' : 'block'}`}>
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-full" onClick={() => setSelectedSupplier(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 lg:flex-none">
                  <h3 className="text-lg font-black leading-tight text-foreground">{selectedSupplier.name}</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase mt-0.5 tracking-wider">ID: {selectedSupplier.id} | {selectedSupplier.collectionType}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-primary/20 text-primary hover:bg-primary/5" onClick={() => openEditDialog(selectedSupplier)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-xl hover:bg-destructive/5" onClick={() => handleDeleteSupplier(selectedSupplier.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[500px] lg:h-[650px]">
                <div className="p-4 space-y-6">
                  {/* Basic & Contact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><User className="h-3 w-3" /> संपर्क व पत्ता</h4>
                      <div className="bg-muted/20 p-3 rounded-xl border space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shadow-sm"><Phone className="h-3.5 w-3.5 text-primary" /></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">मोबाईल</p><p className="text-xs font-black">{selectedSupplier.mobile || "-"}</p></div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0"><MapPin className="h-3.5 w-3.5 text-primary" /></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">पत्ता</p><p className="text-[11px] font-black leading-tight">{selectedSupplier.address || "-"}</p></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> परवाना व स्थिती</h4>
                      <div className="bg-muted/20 p-3 rounded-xl border grid grid-cols-2 gap-3">
                        <div className="col-span-2"><p className="text-[8px] font-black text-muted-foreground uppercase">FSSAI License</p><p className="text-xs font-black text-primary">{selectedSupplier.fssaiNumber || "N/A"}</p></div>
                        <div className="pt-2 border-t col-span-2 flex justify-between">
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">Expiry</p><p className="text-[10px] font-black">{selectedSupplier.fssaiExpiry || "-"}</p></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">Type</p><Badge className="text-[8px] h-4 font-black">{selectedSupplier.collectionType}</Badge></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milk Metrics */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Milk className="h-3 w-3" /> दूध संकलन सरांश (Milk Metrics)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                        <p className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1"><Milk className="h-2.5 w-2.5" /> गाय (Cow)</p>
                        <div className="flex items-baseline gap-1"><span className="text-xl font-black text-blue-900">{selectedSupplier.cowMilk?.quantity || 0}</span><span className="text-[10px] font-bold text-blue-700">L</span></div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-black text-blue-800">
                          <div className="bg-white/50 px-1.5 py-0.5 rounded-md">F: {selectedSupplier.cowMilk?.fat || 0}</div>
                          <div className="bg-white/50 px-1.5 py-0.5 rounded-md">S: {selectedSupplier.cowMilk?.snf || 0}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
                        <p className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1"><Milk className="h-2.5 w-2.5" /> म्हैस (Buf)</p>
                        <div className="flex items-baseline gap-1"><span className="text-xl font-black text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}</span><span className="text-[10px] font-bold text-amber-700">L</span></div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-black text-amber-800">
                          <div className="bg-white/50 px-1.5 py-0.5 rounded-md">F: {selectedSupplier.buffaloMilk?.fat || 0}</div>
                          <div className="bg-white/50 px-1.5 py-0.5 rounded-md">S: {selectedSupplier.buffaloMilk?.snf || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Material & Equipment */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Package className="h-3 w-3" /> तांत्रिक व साहित्य (Technical)</h4>
                    <div className="bg-muted/10 p-3 rounded-2xl border border-dashed grid grid-cols-2 gap-4">
                      <div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">वजन काटा ब्रँड</p><p className="text-[11px] font-black">{selectedSupplier.scaleBrand || "-"}</p></div>
                      <div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">फॅट मशीन ब्रँड</p><p className="text-[11px] font-black">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                      <div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">बर्फाच्या लाद्या</p><p className="text-[11px] font-black">{selectedSupplier.iceBlocks || "0"} Blocks</p></div>
                      <div><p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">पशुखाद्य ब्रँड</p><p className="text-[11px] font-black">{selectedSupplier.cattleFeedBrand || "-"}</p></div>
                    </div>

                    <div className="border rounded-xl overflow-hidden bg-white shadow-sm mt-3">
                      <Table>
                        <TableHeader><TableRow className="bg-muted/50 h-8"><TableHead className="text-[8px] font-black uppercase px-3 h-8">साहित्य</TableHead><TableHead className="text-[8px] font-black uppercase text-center h-8">संख्या</TableHead><TableHead className="text-[8px] font-black uppercase text-right px-3 h-8">मालकी</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedSupplier.equipment?.map((item) => (
                            <TableRow key={item.id} className="h-10"><TableCell className="py-1 px-3 text-[10px] font-black">{item.name}</TableCell><TableCell className="py-1 text-center font-black text-[10px]">{item.quantity}</TableCell><TableCell className="py-1 px-3 text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[7px] h-4 font-black px-1.5 uppercase">{item.ownership === 'Self' ? 'स्वतःचे' : 'डेअरी'}</Badge></TableCell></TableRow>
                          ))}
                          {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (<TableRow><TableCell colSpan={3} className="text-center text-[9px] italic py-4">नोंद नाही.</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Competition & Notes */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase text-primary">इतर माहिती (Notes)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-orange-50/30 p-2.5 rounded-xl border border-orange-100"><p className="text-[7px] font-black text-orange-600 uppercase">गाव स्पर्धा</p><p className="text-[10px] font-medium leading-tight mt-0.5">{selectedSupplier.competition || "-"}</p></div>
                      <div className="bg-muted/10 p-2.5 rounded-xl border border-dashed"><p className="text-[7px] font-black text-muted-foreground uppercase">टिप्पणी</p><p className="text-[10px] italic leading-tight mt-0.5">{selectedSupplier.additionalInfo || "-"}</p></div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-4 text-center p-10">
              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center"><User className="h-10 w-10 text-muted-foreground/30" /></div>
              <div className="space-y-1">
                <h4 className="font-black text-muted-foreground">सप्लायर निवडा (Select Supplier)</h4>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">तपशील पाहण्यासाठी यादीतील एका नावावर क्लिक करा.</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl sm:max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-lg font-black flex items-center gap-2"><User className="h-5 w-5" /> {dialogMode === 'add' ? 'नवीन सप्लायर (Add Supplier)' : 'माहिती बदला (Edit Supplier)'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)] p-4 sm:p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 pb-10">
              <div className="space-y-6">
                {/* Section 1: Basic */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-primary/10 pb-1 flex items-center gap-2"><User className="h-3 w-3" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">सप्लायर नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="पूर्ण नाव" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">कोड / आयडी</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="उदा. 101" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="98XXXXXXXX" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">संकलन प्रकार</Label>
                      <Select value={formData.collectionType} onValueChange={v => setFormData({...formData, collectionType: v})}>
                        <SelectTrigger className="h-9 text-xs rounded-xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Route" className="text-xs">Route</SelectItem><SelectItem value="Center" className="text-xs">Center</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">FSSAI मुदत</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">FSSAI नंबर</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="14 अंकी नंबर" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">पत्ता / गाव</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="पूर्ण पत्ता" /></div>
                  </div>
                </div>

                {/* Section 2: Milk */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-primary/10 pb-1 flex items-center gap-2"><Milk className="h-3 w-3" /> २) दूध आकडेवारी</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 border rounded-2xl bg-blue-50/30 space-y-2 shadow-sm">
                      <Label className="text-[9px] font-black text-blue-700 uppercase">गाय दूध (Cow Milk)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">Qty</p><Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">Fat</p><Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">SNF</p><Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-2xl bg-amber-50/30 space-y-2 shadow-sm">
                      <Label className="text-[9px] font-black text-amber-700 uppercase">म्हेस दूध (Buffalo Milk)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">Qty</p><Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">Fat</p><Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                        <div className="space-y-1"><p className="text-[7px] font-black uppercase text-center">SNF</p><Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center bg-white" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Section 3: Technical */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-primary/10 pb-1 flex items-center gap-2"><Package className="h-3 w-3" /> ३) तांत्रिक व इन्व्हेंटरी</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">वजन काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फाच्या लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">पशुखाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  </div>
                  
                  {/* Equipment Sub-section */}
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[9px] font-black uppercase">इतर साहित्य (Equipment List)</Label>
                      <Button variant="ghost" size="sm" onClick={handleAddEquipmentRow} className="h-6 text-[8px] font-black gap-1 uppercase text-primary bg-primary/5 rounded-lg border border-primary/10">
                        <PlusCircle className="h-3 w-3" /> साहित्य जोडा
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.equipment.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 items-end p-2 rounded-xl bg-muted/10 border border-white/50">
                          <div className="col-span-6"><Label className="text-[7px] uppercase font-black mb-0.5">साहित्याचे नाव</Label><Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="h-8 text-[9px] rounded-lg bg-white" placeholder="उदा. कॅन" /></div>
                          <div className="col-span-2"><Label className="text-[7px] uppercase font-black mb-0.5">Qty</Label><Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[9px] text-center rounded-lg bg-white" /></div>
                          <div className="col-span-3">
                            <Label className="text-[7px] uppercase font-black mb-0.5">मालकी</Label>
                            <Select value={item.ownership} onValueChange={v => updateEquipmentItem(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[8px] px-1 rounded-lg bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="h-8 w-8 text-destructive"><X className="h-3.5 w-3.5" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 4: Competition */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-primary/10 pb-1 flex items-center gap-2"><Info className="h-3 w-3" /> ४) गाव माहिती व टिप्पणी</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">गाव स्पर्धा (Competition)</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="इतर कोण संकलन करते?" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">अतिरिक्त टिप्पणी (Notes)</Label><Input value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" placeholder="काही विशेष नोंद..." /></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/5 gap-2 sticky bottom-0 z-10 flex flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 sm:flex-none font-black h-10 px-6 rounded-xl border-2">रद्द करा</Button>
            <Button onClick={handleSaveSupplier} className="flex-1 sm:flex-none font-black h-10 px-10 rounded-xl shadow-lg shadow-primary/20 bg-primary text-white">जतन करा (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
