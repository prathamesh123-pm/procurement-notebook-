
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
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, ShieldCheck, Printer, CheckCircle2, ListPlus, Clock, Layers, Users, TrendingDown, IndianRupee, History, Briefcase, Hash, Info, FileText, MapPin
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const ProducerCenterLayout = ({ supplier }: { supplier: Supplier }) => {
  const d = supplier;
  const details = d.producer_center?.additional_details || {};

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">३) संकलन वेळ & उत्पादक</h4>
          <div className="space-y-2 text-[12px] font-bold">
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सकाळ वेळ</span><span>{details.morning_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सायंकाळ वेळ</span><span>{details.evening_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>एकूण उत्पादक</span><span>{details.total_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सक्रिय उत्पादक</span><span className="text-emerald-600">{details.active_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>स्थापना वर्ष</span><span>{details.start_year || "-"}</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">४) जनावरांची गणना</h4>
          <div className="grid grid-cols-2 gap-3 text-center">
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">COWS</p><p className="text-[12px] font-black">{details.cows || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">BUFFALO</p><p className="text-[12px] font-black">{details.buffalo || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">CALVES</p><p className="text-[12px] font-black">{details.calves || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-900 text-white"><p className="text-[8px] font-black">TOTAL</p><p className="text-[12px] font-black">{details.total_animals || 0}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
         <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">५) २+ वर्ष जुने उत्पादक</h4>
         <table className="w-full border-collapse border-2 border-black text-[10px]">
           <thead className="bg-slate-100 font-black">
             <tr className="border-b-2 border-black text-center">
               <th className="p-2 border-r border-black text-left">उत्पादक नाव</th>
               <th className="p-2 border-r border-black">जुने दूध</th>
               <th className="p-2 border-r border-black">सध्याचे</th>
               <th className="p-2">जनावरे (जुनी/नवी)</th>
             </tr>
           </thead>
           <tbody>
             {(details.long_term_producers || []).map((p: any, i: number) => (
               <tr key={i} className="border-b border-black font-bold text-center">
                 <td className="p-2 border-r border-black text-left">{p.producer_name}</td>
                 <td className="p-2 border-r border-black">{p.previous_milk} L</td>
                 <td className="p-2 border-r border-black">{p.current_milk} L</td>
                 <td className="p-2">{p.previous_animals} / {p.current_animals}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

      <div className="space-y-4">
         <h4 className="text-[11px] font-black uppercase text-rose-700 border-b-2 border-black pb-1">६) दूध घटलेले उत्पादक विश्लेषण</h4>
         <table className="w-full border-collapse border-2 border-black text-[10px]">
           <thead className="bg-rose-50 font-black text-rose-900">
             <tr className="border-b-2 border-black text-center">
               <th className="p-2 border-r border-black text-left">नाव</th>
               <th className="p-2 border-r border-black">जुने दूध</th>
               <th className="p-2 border-r border-black">नवे दूध</th>
               <th className="p-2 text-left">कारण</th>
             </tr>
           </thead>
           <tbody>
             {(details.decreasing_producers || []).map((p: any, i: number) => (
               <tr key={i} className="border-b border-black font-bold text-center">
                 <td className="p-2 border-r border-black text-left">{p.producer_name}</td>
                 <td className="p-2 border-r border-black">{p.previous_milk} L</td>
                 <td className="p-2 border-r border-black">{p.current_milk} L</td>
                 <td className="p-2 text-left text-rose-600">{p.reason}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

      {details.local_employees?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-indigo-700 border-b-2 border-black pb-1">७) परिसरातील डेअरी कर्मचारी माहिती</h4>
          <table className="w-full border-collapse border-2 border-black text-[9px]">
            <thead className="bg-slate-50 font-black">
              <tr className="border-b-2 border-black text-center">
                <th className="p-1 border-r border-black text-left pl-2">कर्मचारी नाव</th>
                <th className="p-1 border-r border-black">शेती</th>
                <th className="p-1 border-r border-black">जनावरे</th>
                <th className="p-1">सध्याचा पुरवठा</th>
              </tr>
            </thead>
            <tbody>
              {details.local_employees.map((e: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                  <td className="p-1 border-r border-black text-left pl-2">{e.name}</td>
                  <td className="p-1 border-r border-black">{e.land}</td>
                  <td className="p-1 border-r border-black">{e.animals}</td>
                  <td className="p-1">{e.current_supply_to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {details.milkman_gavali_details?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase text-amber-700 border-b-2 border-black pb-1">८) स्थानिक गवळी माहिती (आपल्या डेअरीचे)</h4>
          <table className="w-full border-collapse border-2 border-black text-[9px]">
            <thead className="bg-slate-50 font-black">
              <tr className="border-b-2 border-black text-center">
                <th className="p-1 border-r border-black text-left pl-2">नाव / कोड</th>
                <th className="p-1 border-r border-black">गाय (L)</th>
                <th className="p-1 border-r border-black">म्हेस (L)</th>
                <th className="p-1 border-r border-black">एकूण (L)</th>
                <th className="p-1">उत्पादक</th>
              </tr>
            </thead>
            <tbody>
              {details.milkman_gavali_details.map((g: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                  <td className="p-1 border-r border-black text-left pl-2">{g.name} ({g.code})</td>
                  <td className="p-1 border-r border-black">{g.gay_dudh} L</td>
                  <td className="p-1 border-r border-black">{g.mhais_dudh} L</td>
                  <td className="p-1 border-r border-black font-black text-primary">{(Number(g.gay_dudh) + Number(g.mhais_dudh)).toFixed(1)} L</td>
                  <td className="p-1">{g.producers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="w-full space-y-4">
         <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-black pb-1">९) विश्लेषण & उपाययोजना</h4>
         <div className="grid grid-cols-1 gap-4">
           {details.milk_decrease_reasons && (
             <div className="p-3 bg-slate-50 border-l-4 border-rose-400 rounded-r-lg">
               <p className="text-[8px] font-black uppercase text-rose-600 mb-1">दूध कमी होण्याची कारणे</p>
               <p className="text-[11px] font-bold text-slate-800">{details.milk_decrease_reasons}</p>
             </div>
           )}
           {details.efforts_taken && (
             <div className="p-3 bg-slate-50 border-l-4 border-primary rounded-r-lg">
               <p className="text-[8px] font-black uppercase text-primary mb-1">सेंटरने केलेले प्रयत्न</p>
               <p className="text-[11px] font-bold text-slate-800">{details.efforts_taken}</p>
             </div>
           )}
           {details.required_actions && (
             <div className="p-3 bg-slate-50 border-l-4 border-emerald-400 rounded-r-lg">
               <p className="text-[8px] font-black uppercase text-emerald-600 mb-1">दूध वाढवण्यासाठी उपाय</p>
               <p className="text-[11px] font-bold text-slate-800">{details.required_actions}</p>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const currentRouteId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
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
    adulterationKitInfo: "", additionalNotes: "", equipment: [] as EquipmentItem[],
    morning_collection_time: "", evening_collection_time: "",
    start_year: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [] as any[],
    decreasingProducers: [] as any[],
    can_expand_8_10_cows: false,
    highCapacityProducers: [] as any[],
    has_100_plus_milk: false,
    highMilkProducers: [] as any[],
    localEmployees: [] as any[],
    localGavali: [] as any[],
    milk_decrease_reasons: "",
    efforts_taken: "",
    required_actions: ""
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = () => {
    setFormData({
      name: "", supplierId: "", address: "", mobile: "", operatorName: "",
      routeId: currentRouteId,
      supplierType: "Gavali", fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", paymentCycle: "10 Days", spaceOwnership: "Self",
      hygieneGrade: "A", competition: "", cattleFeedBrand: "", iceBlocks: "0",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", additionalNotes: "", equipment: [],
      morning_collection_time: "", evening_collection_time: "",
      start_year: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], can_expand_8_10_cows: false,
      highCapacityProducers: [], has_100_plus_milk: false, highMilkProducers: [],
      localEmployees: [], localGavali: [], milk_decrease_reasons: "",
      efforts_taken: "", required_actions: ""
    })
  }

  const openAddDialog = () => {
    setDialogMode('add'); setEditingId(null);
    resetFormData();
    setIsDialogOpen(true)
  }

  const openEditDialog = (s: Supplier) => {
    setDialogMode('edit'); setEditingId(s.id);
    const details = s.producer_center?.additional_details || {};
    setFormData({
      name: s.name || "", supplierId: s.supplierId || "", address: s.address || "",
      mobile: s.mobile || "", operatorName: s.operatorName || "",
      routeId: s.routeId || currentRouteId,
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
      equipment: s.equipment || [],
      morning_collection_time: details.morning_collection_time || "",
      evening_collection_time: details.evening_collection_time || "",
      start_year: details.start_year || "",
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
      highMilkProducers: (details.high_milk_producer_list || []).map((name: string) => ({ id: crypto.randomUUID(), name })),
      localEmployees: details.local_employees || [],
      localGavali: details.milkman_gavali_details || [],
      milk_decrease_reasons: details.milk_decrease_reasons || "",
      efforts_taken: details.efforts_taken || "",
      required_actions: details.required_actions || ""
    })
    setIsDialogOpen(true)
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) return;
    
    const additional_details = {
      morning_collection_time: formData.morning_collection_time,
      evening_collection_time: formData.evening_collection_time,
      start_year: formData.start_year,
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
      high_milk_producer_list: formData.highMilkProducers.map((p: any) => p.name),
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavali,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions
    };

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), milkCansCount: Number(formData.milkCansCount),
      producer_center: formData.supplierType === 'Center' ? { additional_details } : null,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
  }

  const handleAssignFromMaster = (sid: string) => {
    if (!db || !user) return
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', sid), { routeId: currentRouteId, updatedAt: new Date().toISOString() })
    setIsMasterDialogOpen(false)
    toast({ title: "यशस्वी", description: "सप्लायर या रूटला जोडला गेला." })
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

  const deleteSupplier = (id: string) => {
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
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
              <input placeholder="या रूटमध्ये शोधा..." className="w-full pl-9 h-10 text-[12px] bg-muted/10 border border-black rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
            <ScrollArea className="w-full h-full">
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
                    </div>
                  </div>
                </div>

                {selectedSupplier.supplierType === 'Center' && <ProducerCenterLayout supplier={selectedSupplier} />}

                <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
                  <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
                  <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
                </div>
              </div>
            </ScrollArea>
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
                className="pl-10 h-11 w-full rounded-xl bg-muted/10 border border-black font-bold shadow-inner outline-none focus:ring-1 focus:ring-primary"
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
        <DialogContent className="max-w-[90vw] md:max-w-[850px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white text-left">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सप्लायरचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 md:p-6 text-left">
            <div className="space-y-6 pb-20 text-left">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border border-black font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border border-black font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border border-black font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border border-black font-bold rounded-xl shadow-inner" /></div>
                    <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border border-black font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Center' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4 p-4 border border-primary/20 rounded-2xl bg-primary/5">
                      <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Clock className="h-4 w-4" /> २) संकलन वेळ & उत्पादक सारांश</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सकाळ संकलन वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सायंकाळ संकलन वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">निष्क्रिय उत्पादक</Label><Input type="number" value={formData.inactive_producers} onChange={e => setFormData({...formData, inactive_producers: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 border border-black rounded-2xl bg-white shadow-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-2"><Milk className="h-4 w-4" /> ३) जनावरांची माहिती</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black">एकूण जनावरे</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 text-[10px] border-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-primary/30 pb-1"><h4 className="text-[10px] font-black uppercase text-primary">४) २+ वर्ष जुने उत्पादक</h4><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-7 text-[8px] uppercase">जोडा</Button></div>
                      <div className="overflow-x-auto border border-black rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100 text-[9px] font-black uppercase border-b border-black">
                            <tr>
                              <th className="p-2 border-r border-black">नाव</th>
                              <th className="p-2 border-r border-black text-center">जुने दूध</th>
                              <th className="p-2 border-r border-black text-center">नवे दूध</th>
                              <th className="p-2 border-r border-black text-center">ज-जुनी</th>
                              <th className="p-2 border-r border-black text-center">ज-नवी</th>
                              <th className="p-2 text-center">क्रिया</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.longTermProducers.map(p => (
                              <tr key={p.id} className="border-b border-black last:border-0 bg-white">
                                <td className="p-1 border-r border-black"><Input value={p.producer_name} onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_animals: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4"/></Button></td>
                              </tr>
                            ))}
                            {formData.longTermProducers.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-[10px] italic opacity-50">माहिती उपलब्ध नाही. 'जोडा' बटण वापरा.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b-2 border-rose-300 pb-1"><h4 className="text-[10px] font-black uppercase text-rose-600">५) दूध कमी झालेले उत्पादक</h4><Button size="sm" onClick={() => addDynamicRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0, reason: "" })} className="h-6 text-[8px] uppercase bg-rose-600">जोडा</Button></div>
                       <div className="overflow-x-auto border border-black rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-rose-50 text-[9px] font-black uppercase border-b border-black text-rose-900">
                            <tr>
                              <th className="p-2 border-r border-black">नाव</th>
                              <th className="p-2 border-r border-black text-center">जुने दूध</th>
                              <th className="p-2 border-r border-black text-center">नवे दूध</th>
                              <th className="p-2 border-r border-black text-center">ज-जुनी</th>
                              <th className="p-2 border-r border-black text-center">ज-नवी</th>
                              <th className="p-2 border-r border-black">कारण</th>
                              <th className="p-2 text-center">क्रिया</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.decreasingProducers.map(p => (
                              <tr key={p.id} className="border-b border-black last:border-0 bg-white">
                                <td className="p-1 border-r border-black"><Input value={p.producer_name} onChange={e => updateDynamicRow('decreasingProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_milk: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_animals: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_animals: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input value={p.reason} onChange={e => updateDynamicRow('decreasingProducers', p.id, { reason: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('decreasingProducers', p.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4"/></Button></td>
                              </tr>
                            ))}
                            {formData.decreasingProducers.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-[10px] italic opacity-50">माहिती उपलब्ध नाही.</td></tr>}
                          </tbody>
                        </table>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-4 p-4 border border-black rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b pb-2">
                            <Label className="text-[10px] font-black uppercase">८-१० गाईंचा गोठा करू शकतील असे?</Label>
                            <Switch checked={formData.can_expand_8_10_cows} onCheckedChange={(v) => setFormData({...formData, can_expand_8_10_cows: v})} />
                          </div>
                          {formData.can_expand_8_10_cows && (
                            <div className="space-y-2">
                               <div className="flex justify-end"><Button size="sm" variant="outline" className="h-7 text-[8px] uppercase border-black" onClick={() => addDynamicRow('highCapacityProducers', { name: "", current_milk: 0, puravtha_varsh: "", current_animals: 0, land: "", fodder_available: "YES", shed_available: "YES" })}>उत्पादक जोडा</Button></div>
                               <div className="overflow-x-auto border border-black rounded-xl">
                                <table className="w-full text-left border-collapse">
                                  <thead className="bg-slate-50 text-[8px] font-black uppercase border-b border-black">
                                    <tr>
                                      <th className="p-2 border-r border-black">नाव</th>
                                      <th className="p-2 border-r border-black text-center">दूध</th>
                                      <th className="p-2 border-r border-black text-center">वर्षे</th>
                                      <th className="p-2 border-r border-black text-center">जनावरे</th>
                                      <th className="p-2 border-r border-black text-center">शेती</th>
                                      <th className="p-2 border-r border-black text-center">चारा</th>
                                      <th className="p-2 border-r border-black text-center">शेड</th>
                                      <th className="p-2 text-center">क्रिया</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formData.highCapacityProducers.map(p => (
                                      <tr key={p.id} className="border-b border-black last:border-0 bg-white">
                                        <td className="p-1 border-r border-black"><Input value={p.name} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                        <td className="p-1 border-r border-black"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { current_milk: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                        <td className="p-1 border-r border-black"><Input value={p.puravtha_varsh} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { puravtha_varsh: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                        <td className="p-1 border-r border-black"><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { current_animals: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                        <td className="p-1 border-r border-black"><Input value={p.land} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { land: e.target.value })} className="h-7 text-[10px] border-none text-center bg-transparent" /></td>
                                        <td className="p-1 border-r border-black"><select value={p.fodder_available} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { fodder_available: e.target.value })} className="text-[10px] bg-transparent border-none outline-none w-full"><option value="YES">YES</option><option value="NO">NO</option></select></td>
                                        <td className="p-1 border-r border-black"><select value={p.shed_available} onChange={e => updateDynamicRow('highCapacityProducers', p.id, { shed_available: e.target.value })} className="text-[10px] bg-transparent border-none outline-none w-full"><option value="YES">YES</option><option value="NO">NO</option></select></td>
                                        <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('highCapacityProducers', p.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4"/></Button></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                               </div>
                            </div>
                          )}
                       </div>
                       <div className="space-y-4 p-4 border border-black rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b pb-2">
                            <Label className="text-[10px] font-black uppercase">३० ते १००+ लिटर दूध उत्पादक?</Label>
                            <Switch checked={formData.has_100_plus_milk} onCheckedChange={(v) => setFormData({...formData, has_100_plus_milk: v})} />
                          </div>
                          {formData.has_100_plus_milk && (
                            <div className="space-y-2">
                               <div className="flex justify-end"><Button size="sm" variant="outline" className="h-7 text-[8px] uppercase border-black" onClick={() => addDynamicRow('highMilkProducers', { name: "" })}>उत्पादक जोडा</Button></div>
                               <div className="overflow-x-auto border border-black rounded-xl">
                                  <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-[9px] font-black uppercase border-b border-black">
                                      <tr><th className="p-2 border-r border-black">उत्पादक नाव</th><th className="p-2 text-center w-20">क्रिया</th></tr>
                                    </thead>
                                    <tbody>
                                      {formData.highMilkProducers.map(p => (
                                        <tr key={p.id} className="border-b border-black last:border-0 bg-white">
                                          <td className="p-1 border-r border-black"><Input value={p.name} onChange={e => updateDynamicRow('highMilkProducers', p.id, { name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                          <td className="p-1 text-center"><Button size="icon" variant="ghost" onClick={() => removeDynamicRow('highMilkProducers', p.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4"/></Button></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-4 p-4 border border-black rounded-2xl bg-slate-50/50">
                       <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">विशेष विश्लेषण & उपाययोजना</h4>
                       <div className="space-y-3">
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="h-14 text-[10px] border-black" /></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="h-14 text-[10px] border-black" /></div>
                          <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="h-14 text-[10px] border-black" /></div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b-2 border-indigo-300 pb-1"><h4 className="text-[10px] font-black uppercase text-indigo-700">परिसरातील डेअरी कर्मचारी माहिती</h4><Button size="sm" onClick={() => addDynamicRow('localEmployees', { name: "", land: "", animals: 0, current_supply_to: "" })} className="h-7 text-[8px] uppercase bg-indigo-600">कर्मचारी जोडा</Button></div>
                       <div className="overflow-x-auto border border-black rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-indigo-50/50 text-[8px] font-black uppercase border-b border-black text-indigo-900 text-center">
                            <tr>
                              <th className="p-2 border-r border-black text-left">नाव</th>
                              <th className="p-2 border-r border-black">शेती</th>
                              <th className="p-2 border-r border-black">जनावरे</th>
                              <th className="p-2 border-r border-black">पुरवठा</th>
                              <th className="p-2">क्रिया</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.localEmployees.map(it => (
                              <tr key={it.id} className="border-b border-black last:border-0 bg-white text-center">
                                <td className="p-1 border-r border-black"><Input value={it.name} onChange={e => updateDynamicRow('localEmployees', it.id, { name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input value={it.land} onChange={e => updateDynamicRow('localEmployees', it.id, { land: e.target.value })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={it.animals} onChange={e => updateDynamicRow('localEmployees', it.id, { animals: e.target.value })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1 border-r border-black"><Input value={it.current_supply_to} onChange={e => updateDynamicRow('localEmployees', it.id, { current_supply_to: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('localEmployees', it.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4" /></Button></td>
                              </tr>
                            ))}
                            {formData.localEmployees.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-[10px] italic opacity-50">माहिती उपलब्ध नाही.</td></tr>}
                          </tbody>
                        </table>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b-2 border-amber-300 pb-1"><h4 className="text-[10px] font-black uppercase text-amber-700">परिसरातील गवळी (आपल्या डेअरीचे)</h4><Button size="sm" onClick={() => addDynamicRow('localGavali', { name: "", code: "", gay_dudh: 0, mhais_dudh: 0, total_milk: 0, producers: 0 })} className="h-7 text-[8px] uppercase bg-amber-600">गवळी जोडा</Button></div>
                       <div className="overflow-x-auto border border-black rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-amber-50/50 text-[8px] font-black uppercase border-b border-black text-amber-900 text-center">
                            <tr>
                              <th className="p-2 border-r border-black text-left">नाव</th>
                              <th className="p-2 border-r border-black">कोड</th>
                              <th className="p-2 border-r border-black">गाय</th>
                              <th className="p-2 border-r border-black">म्हेस</th>
                              <th className="p-2 border-r border-black">एकूण</th>
                              <th className="p-2 border-r border-black">उत्पादक</th>
                              <th className="p-2">क्रिया</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.localGavali.map(it => (
                              <tr key={it.id} className="border-b border-black last:border-0 bg-white text-center">
                                <td className="p-1 border-r border-black"><Input value={it.name} onChange={e => updateDynamicRow('localGavali', it.id, { name: e.target.value })} className="h-7 text-[10px] border-none bg-transparent" /></td>
                                <td className="p-1 border-r border-black"><Input value={it.code} onChange={e => updateDynamicRow('localGavali', it.id, { code: e.target.value })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={it.gay_dudh} onChange={e => updateDynamicRow('localGavali', it.id, { gay_dudh: e.target.value, total_milk: Number(e.target.value) + Number(it.mhais_dudh) })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1 border-r border-black"><Input type="number" value={it.mhais_dudh} onChange={e => updateDynamicRow('localGavali', it.id, { mhais_dudh: e.target.value, total_milk: Number(e.target.value) + Number(it.gay_dudh) })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1 border-r border-black font-black text-primary text-[10px]">{it.total_milk}</td>
                                <td className="p-1 border-r border-black"><Input type="number" value={it.producers} onChange={e => updateDynamicRow('localGavali', it.id, { producers: e.target.value })} className="h-7 text-[10px] border-none bg-transparent text-center" /></td>
                                <td className="p-1"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('localGavali', it.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-4 w-4" /></Button></td>
                              </tr>
                            ))}
                            {formData.localGavali.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-[10px] italic opacity-50">माहिती उपलब्ध नाही.</td></tr>}
                          </tbody>
                        </table>
                       </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> ५) परवाना व तांत्रिक</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ६) व्यावसायिक व दूध तपशील</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">जागा</Label>
                      <Select value={formData.spaceOwnership} onValueChange={(v: any) => setFormData({...formData, spaceOwnership: v})}>
                        <SelectTrigger className="h-10 text-[12px] border-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Self" className="font-bold">स्वतःची</SelectItem><SelectItem value="Rented" className="font-bold">भाड्याची</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">स्वच्छता ग्रेड</Label>
                      <Select value={formData.hygieneGrade} onValueChange={(v: any) => setFormData({...formData, hygieneGrade: v})}>
                        <SelectTrigger className="h-10 text-[12px] border-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[11px] border-black" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-0.5">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] border-black" placeholder="L" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] border-black" placeholder="F" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] border-black" placeholder="S" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-0.5">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] border-black" placeholder="L" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] border-black" placeholder="F" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] border-black" placeholder="S" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ७) इन्व्हेंटरी व स्टेटस</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-black" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Laptop className={`h-5 w-5 ${formData.computerAvailable ? 'text-primary' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">POP: {formData.computerAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-black" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Zap className={`h-5 w-5 ${formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-black" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Sun className={`h-5 w-5 ${formData.solarAvailable ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">सोलर: {formData.solarAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl border border-black">
                      <Label className="text-[8px] font-black uppercase opacity-50">Cans</Label>
                      <Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 text-[10px] bg-white rounded text-center border-black" />
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Adulteration Kit (भेसळ तपासणी कीट)</Label><Input value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-10 text-[12px] border-black" placeholder="उदा. हो, चितळे कीट" /></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">साहित्याची यादी (INVENTORY)</h4><Button variant="outline" type="button" size="sm" onClick={() => addDynamicRow('equipment', { name: "", quantity: 1, ownership: 'Company' })} className="h-7 text-[8px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 bg-muted/10 p-2 rounded-xl border border-black items-center">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateDynamicRow('equipment', item.id, { name: e.target.value })} className="h-8 text-[10px] border border-black rounded-lg font-bold bg-white w-full" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateDynamicRow('equipment', item.id, { quantity: Number(e.target.value) })} className="h-8 text-[10px] text-center border border-black rounded-lg font-black bg-white w-full" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateDynamicRow('equipment', item.id, { ownership: v as any })}>
                              <SelectTrigger className="h-8 text-[8px] bg-white border border-black rounded-lg font-black"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('equipment', item.id)} className="h-7 w-7 text-rose-400 p-0"><X className="h-3.5 w-3.5" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-left"><Label className="text-[10px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] border-black" /></div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={handleSaveSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
