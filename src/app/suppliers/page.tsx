"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, History, Edit, CheckCircle2, Box, UserCheck, Wallet, User, Printer, Truck, ShieldCheck, Clock, Layers, TrendingDown, IndianRupee, Hash
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

function SuppliersContent() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: routes } = useCollection<Route>(routesQuery)
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
    supplierType: "Gavali" as SupplierType, competition: "", additionalInfo: "",
    iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [] as EquipmentItem[],
    operatorName: "",
    spaceOwnership: "Self" as 'Self' | 'Rented',
    hygieneGrade: "A",
    chemicalsStock: "",
    batteryCondition: "",
    morning_collection_time: "", evening_collection_time: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [] as any[],
    decreasingProducers: [] as any[],
    can_expand_8_10_cows: false,
    highCapacityProducers: [] as any[],
    has_100_plus_milk: false,
    highMilkProducers: [] as any[],
    facilitiesProvided: [] as any[],
    lssDetails: [] as any[],
    competitorDairies: [] as any[],
    localEmployees: [] as any[],
    localGavali: [] as any[],
    milk_decrease_reasons: "",
    efforts_taken: "",
    required_actions: ""
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = () => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Gavali", competition: "", additionalInfo: "",
      iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      equipment: [],
      operatorName: "",
      spaceOwnership: "Self",
      hygieneGrade: "A",
      chemicalsStock: "",
      batteryCondition: "",
      morning_collection_time: "", evening_collection_time: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], can_expand_8_10_cows: false,
      highCapacityProducers: [], has_100_plus_milk: false, highMilkProducers: [],
      facilitiesProvided: [], lssDetails: [], competitorDairies: [],
      localEmployees: [], localGavali: [], milk_decrease_reasons: "",
      efforts_taken: "", required_actions: ""
    })
  }

  const handleAddSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const additional_details = {
      morning_collection_time: formData.morning_collection_time,
      evening_collection_time: formData.evening_collection_time,
      total_producers: Number(formData.total_producers),
      active_producers: Number(formData.active_producers),
      inactive_producers: Number(formData.inactive_producers),
      total_animals: Number(formData.total_animals),
      cows: Number(formData.cows),
      buffalo: Number(formData.buffalo),
      calves: Number(formData.calves),
      long_term_producers: formData.longTermProducers,
      decreasing_producers: formData.decreasingProducers,
      can_expand_8_10_cows: formData.can_expand_8_10_cows,
      high_capacity_producer_list: formData.highCapacityProducers,
      has_100_plus_milk: formData.has_100_plus_milk,
      high_milk_producer_list: formData.highMilkProducers.map(p => p.name),
      facilities_provided: formData.facilitiesProvided.map(f => f.name),
      lss_details: formData.lssDetails,
      competitor_dairies: formData.competitorDairies,
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavali,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions
    };

    const newSupp = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      iceBlocks: Number(formData.iceBlocks),
      milkCansCount: Number(formData.milkCansCount),
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      producer_center: formData.supplierType === 'Center' ? { additional_details } : null,
      village: formData.address,
      updatedAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), newSupp)
    toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })
    setIsAdding(false); resetFormData();
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !db || !user) return

    const additional_details = {
      morning_collection_time: formData.morning_collection_time,
      evening_collection_time: formData.evening_collection_time,
      total_producers: Number(formData.total_producers),
      active_producers: Number(formData.active_producers),
      inactive_producers: Number(formData.inactive_producers),
      total_animals: Number(formData.total_animals),
      cows: Number(formData.cows),
      buffalo: Number(formData.buffalo),
      calves: Number(formData.calves),
      long_term_producers: formData.longTermProducers,
      decreasing_producers: formData.decreasingProducers,
      can_expand_8_10_cows: formData.can_expand_8_10_cows,
      high_capacity_producer_list: formData.highCapacityProducers,
      has_100_plus_milk: formData.has_100_plus_milk,
      high_milk_producer_list: formData.highMilkProducers.map(p => p.name),
      facilities_provided: formData.facilitiesProvided.map(f => f.name),
      lss_details: formData.lssDetails,
      competitor_dairies: formData.competitorDairies,
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavali,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions
    };

    const updateData = { 
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      iceBlocks: Number(formData.iceBlocks),
      milkCansCount: Number(formData.milkCansCount),
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      producer_center: formData.supplierType === 'Center' ? { additional_details } : null,
      updatedAt: new Date().toISOString() 
    }
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id), updateData)
    setIsEditing(false); setSelectedSupplier(null);
    toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
  }

  const deleteSupplier = (id: string) => {
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const addDynamicRow = (key: string, initialData: any) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key as keyof typeof prev] as any[]), { id: crypto.randomUUID(), ...initialData }] }))
  }

  const removeDynamicRow = (key: string, id: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).filter(r => r.id !== id) }))
  }

  const updateDynamicRow = (key: string, id: string, updates: any) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).map(r => r.id === id ? { ...r, ...updates } : r) }))
  }

  const addEquipmentRow = () => addDynamicRow('equipment', { name: "", quantity: 1, ownership: 'Company' })
  const removeEquipmentRow = (id: string) => removeDynamicRow('equipment', id)
  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => updateDynamicRow('equipment', id, updates)

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.name?.toLowerCase().includes(q) || s.mobile?.includes(q) || s.supplierId?.toString().includes(q);
      const matchesRoute = routeFilter === 'all' || (routeFilter === 'none' ? !s.routeId : s.routeId === routeFilter);
      return matchesSearch && matchesRoute;
    })
  }, [suppliers, searchQuery, routeFilter])

  const prepareEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    const details = supp.producer_center?.additional_details || {};
    setFormData({
      supplierId: supp.supplierId || "", name: supp.name || "", address: supp.address || "",
      mobile: supp.mobile || "", routeId: supp.routeId || "none", supplierType: supp.supplierType || "Gavali",
      competition: supp.competition || "", additionalInfo: supp.additionalInfo || supp.additionalNotes || "",
      iceBlocks: String(supp.iceBlocks || 0), scaleBrand: supp.scaleBrand || "",
      fatMachineBrand: supp.fatMachineBrand || "", cattleFeedBrand: supp.cattleFeedBrand || "",
      fssaiNumber: supp.fssaiNumber || "", fssaiExpiry: supp.fssaiExpiry || "",
      milkCansCount: String(supp.milkCansCount || 0), computerAvailable: supp.computerAvailable || false,
      upsInverterAvailable: supp.upsInverterAvailable || false, solarAvailable: supp.solarAvailable || false,
      adulterationKitInfo: supp.adulterationKitInfo || "",
      cowQty: String(supp.cowMilk?.quantity || 0), cowFat: String(supp.cowMilk?.fat || 0), cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0), bufFat: String(supp.buffaloMilk?.fat || 0), bufSnf: String(supp.buffaloMilk?.snf || 0),
      equipment: supp.equipment || [],
      operatorName: supp.operatorName || "",
      spaceOwnership: supp.spaceOwnership || "Self",
      hygieneGrade: supp.hygieneGrade || "A",
      chemicalsStock: supp.chemicalsStock || "",
      batteryCondition: supp.batteryCondition || "",
      morning_collection_time: details.morning_collection_time || "",
      evening_collection_time: details.evening_collection_time || "",
      total_producers: String(details.total_producers || 0),
      active_producers: String(details.active_producers || 0),
      inactive_producers: String(details.inactive_producers || 0),
      total_animals: String(details.total_animals || 0),
      cows: String(details.cows || 0),
      buffalo: String(details.buffalo || 0),
      calves: String(details.calves || 0),
      longTermProducers: details.long_term_producers || [],
      decreasingProducers: details.decreasing_producers || [],
      can_expand_8_10_cows: details.can_expand_8_10_cows || false,
      highCapacityProducers: details.high_capacity_producer_list || [],
      has_100_plus_milk: details.has_100_plus_milk || false,
      highMilkProducers: (details.high_milk_producer_list || []).map(name => ({ id: crypto.randomUUID(), name })),
      facilitiesProvided: (details.facilities_provided || []).map(name => ({ id: crypto.randomUUID(), name })),
      lssDetails: details.lss_details || [],
      competitorDairies: details.competitor_dairies || [],
      localEmployees: details.local_employees || [],
      localGavali: details.milkman_gavali_details || [],
      milk_decrease_reasons: details.milk_decrease_reasons || "",
      efforts_taken: details.efforts_taken || "",
      required_actions: details.required_actions || ""
    })
    setIsEditing(true)
  }

  const getRouteName = (rid: string) => {
    if (!rid) return "रूट नाही (None)";
    return routes?.find(r => r.id === rid)?.name || "---"
  }

  if (!mounted) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-full mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-center md:text-left">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> सप्लायर (SUPPLIERS)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Profiles & Inventory</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
              <Plus className="h-4 w-4" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[800px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
            <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-sm font-black uppercase tracking-widest">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">संपर्क, तांत्रिक आणि साहित्य माहिती भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[85vh] p-4 sm:p-6 text-left">
              <div className="space-y-6 pb-20">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                        <SelectTrigger className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-black rounded-xl p-3 shadow-inner"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-60">रूट निवडा</Label>
                      <Select value={formData.routeId} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-10 text-[11px] bg-muted/20 border border-slate-300 rounded-xl font-bold"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>{(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Center' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4 p-4 border border-primary/20 rounded-2xl bg-primary/5">
                      <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Clock className="h-4 w-4" /> २) संकलन वेळ & उत्पादक</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सकाळ संकलन वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सायंकाळ संकलन वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">निष्क्रिय उत्पादक</Label><Input type="number" value={formData.inactive_producers} onChange={e => setFormData({...formData, inactive_producers: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 border border-slate-300 rounded-2xl bg-white shadow-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-2"><Milk className="h-4 w-4" /> ३) जनावरांची माहिती</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black">एकूण जनावरे</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 text-[10px] border-slate-400" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-primary/30 pb-1"><h4 className="text-[10px] font-black uppercase text-primary">४) २+ वर्ष जुने उत्पादक</h4><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-6 text-[8px] uppercase">जोडा</Button></div>
                      <div className="space-y-2">
                        {formData.longTermProducers.map(p => (
                          <div key={p.id} className="grid grid-cols-12 gap-2 p-2 bg-slate-50 border border-slate-300 rounded-xl items-end">
                            <div className="col-span-4"><Input value={p.producer_name} placeholder="नाव" onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[9px] border-slate-400" /></div>
                            <div className="col-span-2"><Input type="number" value={p.previous_milk} placeholder="जुने दूध" onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-7 text-[9px] border-slate-400" /></div>
                            <div className="col-span-2"><Input type="number" value={p.current_milk} placeholder="नवे दूध" onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[9px] border-slate-400" /></div>
                            <div className="col-span-3 flex gap-1"><Input type="number" value={p.previous_animals} placeholder="ज-जुनी" onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-7 text-[9px] border-slate-400 p-1" /><Input type="number" value={p.current_animals} placeholder="ज-नवी" onChange={e => updateDynamicRow('longTermProducers', p.id, { current_animals: e.target.value })} className="h-7 text-[9px] border-slate-400 p-1" /></div>
                            <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="h-7 w-7 text-rose-500"><X className="h-3.5 w-3.5"/></Button></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b-2 border-rose-300 pb-1"><h4 className="text-[10px] font-black uppercase text-rose-600">५) दूध कमी झालेले उत्पादक</h4><Button size="sm" onClick={() => addDynamicRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0, reason: "" })} className="h-6 text-[8px] uppercase bg-rose-600">जोडा</Button></div>
                       <div className="space-y-2">
                        {formData.decreasingProducers.map(p => (
                          <div key={p.id} className="p-2 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-4"><Input value={p.producer_name} placeholder="नाव" onChange={e => updateDynamicRow('decreasingProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[9px] border-slate-400" /></div>
                              <div className="col-span-3 flex gap-1"><Input type="number" value={p.previous_milk} placeholder="जुने" onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_milk: e.target.value })} className="h-7 text-[9px] border-slate-400 p-1" /><Input type="number" value={p.current_milk} placeholder="नवे" onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[9px] border-slate-400 p-1" /></div>
                              <div className="col-span-4"><Input value={p.reason} placeholder="कारण" onChange={e => updateDynamicRow('decreasingProducers', p.id, { reason: e.target.value })} className="h-7 text-[9px] border-slate-400" /></div>
                              <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('decreasingProducers', p.id)} className="h-7 w-7 text-rose-400"><X className="h-3.5 w-3.5"/></Button></div>
                            </div>
                          </div>
                        ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4 p-4 border border-slate-300 rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-black uppercase">८-१० गाईंचा गोठा सक्षम?</Label>
                            <Switch checked={formData.can_expand_8_10_cows} onCheckedChange={(v) => setFormData({...formData, can_expand_8_10_cows: v})} />
                          </div>
                          {formData.can_expand_8_10_cows && (
                            <div className="space-y-2">
                               <Button size="sm" variant="outline" className="h-6 text-[8px] uppercase w-full border-slate-400" onClick={() => addDynamicRow('highCapacityProducers', { name: "", current_milk: 0, supply_years: 0, current_animals: 0, land: "", fodder_available: "YES", shed_available: "YES" })}>उत्पादक जोडा</Button>
                               {formData.highCapacityProducers.map(p => (
                                 <div key={p.id} className="p-2 border rounded bg-slate-50 space-y-2">
                                   <Input value={p.name} placeholder="नाव" onChange={e => updateDynamicRow('highCapacityProducers', p.id, { name: e.target.value })} className="h-7 text-[9px]" />
                                   <div className="grid grid-cols-2 gap-1">
                                     <Input type="number" placeholder="दूध" onChange={e => updateDynamicRow('highCapacityProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[9px]" />
                                     <Input placeholder="शेती" onChange={e => updateDynamicRow('highCapacityProducers', p.id, { land: e.target.value })} className="h-7 text-[9px]" />
                                   </div>
                                   <Button variant="ghost" size="sm" onClick={() => removeDynamicRow('highCapacityProducers', p.id)} className="h-7 w-full text-rose-500 text-[8px]">काढा</Button>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                       <div className="space-y-4 p-4 border border-slate-300 rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-black uppercase">३० ते १००+ लिटर दूध उत्पादक?</Label>
                            <Switch checked={formData.has_100_plus_milk} onCheckedChange={(v) => setFormData({...formData, has_100_plus_milk: v})} />
                          </div>
                          {formData.has_100_plus_milk && (
                            <div className="space-y-2">
                               <Button size="sm" variant="outline" className="h-6 text-[8px] uppercase w-full border-slate-400" onClick={() => addDynamicRow('highMilkProducers', { name: "" })}>उत्पादक जोडा</Button>
                               {formData.highMilkProducers.map(p => (
                                 <div key={p.id} className="flex gap-1"><Input value={p.name} onChange={e => updateDynamicRow('highMilkProducers', p.id, { name: e.target.value })} className="h-7 text-[9px] border-slate-400" /><Button size="icon" variant="ghost" onClick={() => removeDynamicRow('highMilkProducers', p.id)} className="h-7 w-7 text-rose-400"><X className="h-3.5 w-3.5"/></Button></div>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-4 p-4 border border-slate-300 rounded-2xl bg-slate-50/50">
                       <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">विशेष विश्लेषण</h4>
                       <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="h-14 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="h-14 text-[10px] border-slate-400" /></div>
                        <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="h-14 text-[10px] border-slate-400" /></div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b-2 border-amber-300 pb-1"><h4 className="text-[10px] font-black uppercase text-amber-700">परिसरातील गवळी (आपल्या डेअरीचे)</h4><Button size="sm" onClick={() => addDynamicRow('localGavali', { name: "", code: "", gay_dudh: 0, mhais_dudh: 0, producers: 0, gay_sankya: 0, mhais_sankya: 0 })} className="h-7 text-[8px] uppercase bg-amber-600 hover:bg-amber-700">गवळी जोडा</Button></div>
                       <div className="space-y-2">
                        {formData.localGavali.map(it => (
                          <div key={it.id} className="p-3 bg-amber-50/30 border border-amber-200 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input value={it.name} placeholder="नाव" onChange={e => updateDynamicRow('localGavali', it.id, { name: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input value={it.code} placeholder="कोड" onChange={e => updateDynamicRow('localGavali', it.id, { code: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input type="number" value={it.gay_dudh} placeholder="गाय दूध" onChange={e => updateDynamicRow('localGavali', it.id, { gay_dudh: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input type="number" value={it.mhais_dudh} placeholder="म्हेस दूध" onChange={e => updateDynamicRow('localGavali', it.id, { mhais_dudh: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input type="number" value={it.producers} placeholder="उत्पादक" onChange={e => updateDynamicRow('localGavali', it.id, { producers: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input type="number" value={it.gay_sankya} placeholder="गाय संख्या" onChange={e => updateDynamicRow('localGavali', it.id, { gay_sankya: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Input type="number" value={it.mhais_sankya} placeholder="म्हेस संख्या" onChange={e => updateDynamicRow('localGavali', it.id, { mhais_sankya: e.target.value })} className="h-8 text-[10px] border-slate-400" />
                              <Button variant="ghost" size="sm" onClick={() => removeDynamicRow('localGavali', it.id)} className="h-8 text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                       </div>
                    </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> ५) परवाना व तांत्रिक</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[11px] bg-muted/20 border border-slate-300 font-bold rounded-xl" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ६) दूध व व्यावसायिक तपशील</h4>
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="col-span-3 text-[9px] font-black uppercase text-blue-600 mb-0.5">गाय (Qty/F/S)</div>
                  <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="L" />
                  <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="F" />
                  <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="S" />
                </div>
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="col-span-3 text-[9px] font-black uppercase text-amber-600 mb-0.5">म्हेस (Qty/F/S)</div>
                  <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="L" />
                  <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="F" />
                  <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] bg-white border-slate-300 font-bold" placeholder="S" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ७) इन्व्हेंटरी</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><h4 className="text-[9px] font-black uppercase tracking-widest">साहित्य यादी</h4><Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-7 text-[8px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                  <div className="space-y-2">
                    {formData.equipment.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-1.5 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 items-center">
                        <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[10px] border border-slate-300 rounded-lg font-bold bg-white w-full" /></div>
                        <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] text-center border border-slate-300 rounded-lg font-black bg-white w-full" /></div>
                        <div className="col-span-3">
                          <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                            <SelectTrigger className="h-8 text-[8px] bg-white border border-slate-300 rounded-lg font-black"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-rose-400 p-0"><X className="h-3.5 w-3.5" /></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-20 text-[11px] bg-muted/20 border border-slate-300 rounded-xl p-3 shadow-inner" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-2">
            <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-[10px] h-11 rounded-xl shadow-2xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-4 w-4 mr-1.5" /> प्रोफाइल जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
