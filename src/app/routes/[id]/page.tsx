
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem, SupplierType, Route } from "@/lib/types"
import { 
  Plus, Search, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, 
  ShieldCheck, Printer, CheckCircle2, Clock, Layers, Users, TrendingDown, 
  IndianRupee, History, Briefcase, Info, FileText, MapPin, Lightbulb
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1.5 border-b-2 pb-1 mb-3 mt-6", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{title}</h3>
  </div>
)

const ProducerCenterReportView = ({ supplier }: { supplier: Supplier }) => {
  const details = supplier.producer_center?.additional_details || {};

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="space-y-4 text-left">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">३) संकलन वेळ & उत्पादक</h4>
          <div className="space-y-2 text-[12px] font-bold">
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सकाळ वेळ</span><span>{details.morning_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सायंकाळ वेळ</span><span>{details.evening_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>एकूण उत्पादक</span><span>{details.total_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सक्रिय उत्पादक</span><span className="text-emerald-600">{details.active_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>स्थापना वर्ष</span><span>{details.start_year || "-"}</span></div>
          </div>
        </div>
        <div className="space-y-4 text-left">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">४) जनावरांची गणना</h4>
          <div className="grid grid-cols-2 gap-3 text-center">
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">COWS</p><p className="text-[12px] font-black">{details.cows || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">BUFFALO</p><p className="text-[12px] font-black">{details.buffalo || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black">CALVES</p><p className="text-[12px] font-black">{details.calves || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-900 text-white"><p className="text-[8px] font-black">TOTAL</p><p className="text-[12px] font-black">{details.total_animals || 0}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-left">
         <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">५) २+ वर्ष जुने उत्पादक</h4>
         <div className="overflow-x-auto border-2 border-black rounded-lg">
           <table className="w-full border-collapse text-[10px] min-w-[500px]">
             <thead className="bg-slate-100 font-black">
               <tr className="border-b-2 border-black text-center">
                 <th className="p-2 border-r border-black text-left">नाव</th>
                 <th className="p-2 border-r border-black">जुने दूध</th>
                 <th className="p-2 border-r border-black">सध्याचे दूध</th>
                 <th className="p-2 border-r border-black">जुनी जनावरे</th>
                 <th className="p-2">सध्याची जनावरे</th>
               </tr>
             </thead>
             <tbody>
               {(details.long_term_producers || []).map((p: any, i: number) => (
                 <tr key={i} className="border-b border-black font-bold text-center">
                   <td className="p-2 border-r border-black text-left">{p.producer_name}</td>
                   <td className="p-2 border-r border-black">{p.previous_milk} L</td>
                   <td className="p-2 border-r border-black">{p.current_milk} L</td>
                   <td className="p-2 border-r border-black">{p.previous_animals}</td>
                   <td className="p-2">{p.current_animals}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="space-y-4 text-left">
         <h4 className="text-[11px] font-black uppercase text-rose-700 border-b-2 border-black pb-1">६) दूध घटलेले उत्पादक विश्लेषण</h4>
         <div className="overflow-x-auto border-2 border-black rounded-lg">
           <table className="w-full border-collapse text-[10px] min-w-[600px]">
             <thead className="bg-rose-50 font-black text-rose-900">
               <tr className="border-b-2 border-black text-center">
                 <th className="p-2 border-r border-black text-left">नाव</th>
                 <th className="p-2 border-r border-black">जुने दूध</th>
                 <th className="p-2 border-r border-black">नवे दूध</th>
                 <th className="p-2 border-r border-black">जुनी जनावरे</th>
                 <th className="p-2 border-r border-black">सध्याची जनावरे</th>
                 <th className="p-2 text-left">कारण</th>
               </tr>
             </thead>
             <tbody>
               {(details.decreasing_producers || []).map((p: any, i: number) => (
                 <tr key={i} className="border-b border-black font-bold text-center">
                   <td className="p-2 border-r border-black text-left">{p.producer_name}</td>
                   <td className="p-2 border-r border-black">{p.previous_milk} L</td>
                   <td className="p-2 border-r border-black">{p.current_milk} L</td>
                   <td className="p-2 border-r border-black">{p.previous_animals}</td>
                   <td className="p-2 border-r border-black">{p.current_animals}</td>
                   <td className="p-2 text-left text-rose-600">{p.reason}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="space-y-4 text-left">
        <SectionTitle icon={ShieldCheck} title="११) LSS सुविधा माहिती" />
        <div className="overflow-x-auto border-2 border-black rounded-lg">
          <table className="w-full border-collapse text-[9px] min-w-[400px]">
            <thead className="bg-slate-50 font-black">
              <tr className="border-b-2 border-black text-center">
                <th className="p-1 border-r border-black text-left pl-2">सुविधा नाव</th>
                <th className="p-1 border-r border-black text-center">स्थिती</th>
                <th className="p-1 text-left pl-2">शेरा</th>
              </tr>
            </thead>
            <tbody>
              {(details.lss_details || []).map((l: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold last:border-0">
                  <td className="p-1 border-r border-black text-left pl-2 uppercase">{l.item}</td>
                  <td className="p-1 border-r border-black text-center">{l.status}</td>
                  <td className="p-1 text-left pl-2">{l.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 text-left">
        <SectionTitle icon={Truck} title="१२) अंतर्गत रूट माहिती (SUB-ROUTES)" color="text-emerald-700" />
        <div className="overflow-x-auto border-2 border-black rounded-lg">
          <table className="w-full border-collapse text-[9px] min-w-[500px]">
            <thead className="bg-emerald-50 font-black uppercase">
              <tr className="border-b-2 border-black text-center">
                <th className="p-1 border-r border-black">गाडी</th>
                <th className="p-1 border-r border-black">किमी</th>
                <th className="p-1 border-r border-black">परिसर</th>
                <th className="p-1 border-r border-black">उत्पादक</th>
                <th className="p-1 border-r border-black">जनावरे</th>
                <th className="p-1">दूध (L)</th>
              </tr>
            </thead>
            <tbody>
              {(details.sub_routes || []).map((r: any, i: number) => (
                <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                  <td className="p-1 border-r border-black uppercase">{r.vehicleType}</td>
                  <td className="p-1 border-r border-black">{r.km}</td>
                  <td className="p-1 border-r border-black uppercase">{r.area}</td>
                  <td className="p-1 border-r border-black">{r.producerCount}</td>
                  <td className="p-1 border-r border-black">{r.animalCount}</td>
                  <td className="p-1">{r.milkQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
        <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  );
};

function RouteDetailsContent() {
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
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    lssFacilities: [] as any[],
    subRoutes: [] as any[],
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
      localEmployees: [], localGavali: [], lssFacilities: [], subRoutes: [],
      milk_decrease_reasons: "",
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
      highMilkProducers: details.high_milk_producer_list || [],
      localEmployees: details.local_employees || [],
      localGavali: details.milkman_gavali_details || [],
      lssFacilities: details.lss_details || [],
      subRoutes: details.sub_routes || [],
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
      high_milk_producer_list: formData.highMilkProducers,
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavali,
      lss_details: formData.lssFacilities,
      sub_routes: formData.subRoutes,
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

  const addDynamicRow = (key: string, initialData: any) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key as keyof typeof prev] as any[]), { id: crypto.randomUUID(), ...initialData }] }))
  }

  const removeDynamicRow = (key: string, id: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).filter(r => r.id !== id) }))
  }

  const updateDynamicRow = (key: string, id: string, updates: any) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).map(r => r.id === id ? { ...r, ...updates } : r) }))
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Route Management</p>
          </div>
        </div>
        <Button onClick={openAddDialog} className="h-10 font-black rounded-xl text-[10px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन सप्लायर
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-2xl bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="या रूटमध्ये शोधा..." className="w-full pl-9 h-10 text-[12px] bg-muted/10 border-2 border-black rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={cn("p-3 cursor-pointer hover:bg-primary/5 transition-all", selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : '')}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-[11px] uppercase truncate flex-1">{s.name}</h4>
                    {s.supplierType === 'Center' && <Badge className="h-3.5 px-1 text-[7px] font-black bg-emerald-500 border-none">CENTER</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black bg-primary/5 text-primary border-none">ID: {s.supplierId}</Badge>
                    <span className="text-[9px] text-muted-foreground font-bold truncate">{s.address}</span>
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
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedSupplier.supplierType} REPORT</Badge>
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
                    <SectionTitle icon={Info} title="१) प्राथमिक माहिती" />
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पत्ता</span><span className="leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={ShieldCheck} title="२) परवाना व तांत्रिक" />
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    </div>
                  </div>
                </div>

                {selectedSupplier.supplierType === 'Center' && <ProducerCenterReportView supplier={selectedSupplier} />}

                <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
                  <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
                  <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <User className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">निवड करा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a supplier to view report</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[900px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white text-left">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सप्लायरचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-4 md:p-8 text-left">
            <div className="space-y-10 pb-20">
              <div className="space-y-4">
                <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-11 text-[12px] border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-11 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-11 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-11 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="lg:col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-11 border-2 border-black font-bold rounded-xl" /></div>
                </div>
              </div>

              {formData.supplierType === 'Center' && (
                <div className="space-y-10 border-l-4 border-primary/20 pl-4 md:pl-8">
                  <div className="space-y-4">
                    <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सकाळ संकलन वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सायंकाळ संकलन वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">निष्क्रिय उत्पादक</Label><Input type="number" value={formData.inactive_producers} onChange={e => setFormData({...formData, inactive_producers: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-10 border-2 border-black" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">एकूण जनावरे</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-10 border-2 border-black font-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गाई संख्या</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-10 border-2 border-black font-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">म्हशी संख्या</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-10 border-2 border-black font-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-10 border-2 border-black font-black" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><SectionTitle icon={Layers} title="४) २+ वर्ष जुने उत्पादक" /><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-7 text-[8px] uppercase">जोडा</Button></div>
                    <ScrollArea className="w-full border-2 border-black rounded-xl">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-100 text-[9px] font-black uppercase border-b-2 border-black">
                          <tr><th className="p-2 border-r-2 border-black">नाव</th><th className="p-2 border-r-2 border-black text-center">जुने दूध</th><th className="p-2 border-r-2 border-black text-center">सध्याचे दूध</th><th className="p-2 border-r-2 border-black text-center">जुनी जनावरे</th><th className="p-2 border-r-2 border-black text-center">सध्याची जनावरे</th><th className="p-2 text-center">X</th></tr>
                        </thead>
                        <tbody>
                          {formData.longTermProducers.map(p => (
                            <tr key={p.id} className="border-b-2 border-black last:border-0">
                              <td className="p-1 border-r-2 border-black"><Input value={p.producer_name} onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-8 text-[11px] border-none font-bold" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-8 text-[11px] border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-8 text-[11px] border-none text-center font-black" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-8 text-[11px] border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_animals: e.target.value })} className="h-8 text-[11px] border-none text-center font-black" /></td>
                              <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="text-rose-500"><X className="h-4 w-4"/></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table><ScrollBar orientation="horizontal" /></ScrollArea>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between"><SectionTitle icon={TrendingDown} title="५) दूध कमी झालेले उत्पादक विश्लेषण" color="text-rose-600" /><Button size="sm" onClick={() => addDynamicRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0, reason: "" })} className="h-7 text-[8px] uppercase bg-rose-600">जोडा</Button></div>
                     <ScrollArea className="w-full border-2 border-black rounded-xl">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-rose-50 text-[9px] font-black uppercase border-b-2 border-black text-rose-900">
                          <tr><th className="p-2 border-r-2 border-black">नाव</th><th className="p-2 border-r-2 border-black text-center">जुने दूध</th><th className="p-2 border-r-2 border-black text-center">नवे दूध</th><th className="p-2 border-r-2 border-black text-center">जुनी जनावरे</th><th className="p-2 border-r-2 border-black text-center">सध्याची जनावरे</th><th className="p-2 border-r-2 border-black">कारण</th><th className="p-2 text-center">X</th></tr>
                        </thead>
                        <tbody>
                          {formData.decreasingProducers.map(p => (
                            <tr key={p.id} className="border-b-2 border-black last:border-0">
                              <td className="p-1 border-r-2 border-black"><Input value={p.producer_name} onChange={e => updateDynamicRow('decreasingProducers', p.id, { producer_name: e.target.value })} className="h-8 text-[11px] border-none font-bold" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_milk: e.target.value })} className="h-8 text-[11px] border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_milk: e.target.value })} className="h-8 text-[11px] border-none text-center font-black" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_animals: e.target.value })} className="h-8 text-[11px] border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_animals: e.target.value })} className="h-8 text-[11px] border-none text-center font-black" /></td>
                              <td className="p-1 border-r-2 border-black"><Input value={p.reason} onChange={e => updateDynamicRow('decreasingProducers', p.id, { reason: e.target.value })} className="h-8 text-[11px] border-none" /></td>
                              <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('decreasingProducers', p.id)} className="text-rose-500"><X className="h-4 w-4"/></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table><ScrollBar orientation="horizontal" /></ScrollArea>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><SectionTitle icon={ShieldCheck} title="९) LSS सुविधा माहिती" /><Button size="sm" onClick={() => addDynamicRow('lssFacilities', { item: "", status: "YES", remarks: "" })} className="h-7 text-[8px] uppercase bg-primary">जोडा</Button></div>
                    <ScrollArea className="w-full border-2 border-black rounded-xl">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead className="bg-slate-50 text-[9px] font-black uppercase border-b-2 border-black">
                          <tr><th className="p-2 border-r-2 border-black">सुविधा नाव</th><th className="p-2 border-r-2 border-black text-center">स्थिती</th><th className="p-2 border-r-2 border-black">शेरा</th><th className="p-2 text-center">X</th></tr>
                        </thead>
                        <tbody>
                          {formData.lssFacilities.map(l => (
                            <tr key={l.id} className="border-b-2 border-black last:border-0">
                              <td className="p-1 border-r-2 border-black"><Input value={l.item} onChange={val => updateDynamicRow('lssFacilities', l.id, { item: val.target.value })} className="h-7 border-none text-[10px] uppercase font-black" /></td>
                              <td className="p-1 border-r-2 border-black text-center"><select value={l.status} onChange={val => updateDynamicRow('lssFacilities', l.id, { status: val.target.value })} className="text-[10px] font-bold outline-none bg-transparent"><option value="YES">हो</option><option value="NO">नाही</option></select></td>
                              <td className="p-1 border-r-2 border-black"><Input value={l.remarks} onChange={val => updateDynamicRow('lssFacilities', l.id, { remarks: val.target.value })} className="h-7 border-none text-[10px]" /></td>
                              <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('lssFacilities', l.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table><ScrollBar orientation="horizontal" /></ScrollArea>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between"><SectionTitle icon={Truck} title="१०) अंतर्गत रूट माहिती (SUB-ROUTES)" color="text-emerald-700" /><Button size="sm" onClick={() => addDynamicRow('subRoutes', { vehicleType: "", km: "", area: "", producerCount: 0, animalCount: 0, milkQty: 0 })} className="h-7 text-[8px] uppercase bg-emerald-600">जोडा</Button></div>
                     <ScrollArea className="w-full border-2 border-black rounded-xl">
                      <table className="w-full text-left border-collapse min-w-[700px] text-[10px]">
                        <thead className="bg-emerald-50 font-black uppercase border-b-2 border-black">
                          <tr><th className="p-1 border-r-2 border-black">गाडी</th><th className="p-1 border-r-2 border-black">किमी</th><th className="p-1 border-r-2 border-black">परिसर</th><th className="p-1 border-r-2 border-black">उत्पादक</th><th className="p-1 border-r-2 border-black">जनावरे</th><th className="p-1 border-r-2 border-black">दूध (L)</th><th className="p-1 text-center">X</th></tr>
                        </thead>
                        <tbody>
                          {formData.subRoutes.map(r => (
                            <tr key={r.id} className="border-b border-black last:border-0 text-center">
                              <td className="p-1 border-r-2 border-black"><Input value={r.vehicleType} onChange={e => updateDynamicRow('subRoutes', r.id, { vehicleType: e.target.value })} className="h-7 border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input value={r.km} onChange={e => updateDynamicRow('subRoutes', r.id, { km: e.target.value })} className="h-7 border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input value={r.area} onChange={e => updateDynamicRow('subRoutes', r.id, { area: e.target.value })} className="h-7 border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={r.producerCount} onChange={e => updateDynamicRow('subRoutes', r.id, { producerCount: e.target.value })} className="h-7 border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={r.animalCount} onChange={e => updateDynamicRow('subRoutes', r.id, { animalCount: e.target.value })} className="h-7 border-none text-center" /></td>
                              <td className="p-1 border-r-2 border-black"><Input type="number" value={r.milkQty} onChange={e => updateDynamicRow('subRoutes', r.id, { milkQty: e.target.value })} className="h-7 border-none text-center font-black" /></td>
                              <td className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('subRoutes', r.id)} className="text-rose-500"><X className="h-3 w-3" /></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table><ScrollBar orientation="horizontal" /></ScrollArea>
                  </div>

                  <div className="space-y-4">
                     <SectionTitle icon={Lightbulb} title="११) विशेष विश्लेषण & उपाययोजना" />
                     <div className="space-y-4">
                        <div className="space-y-1"><Label className="text-[10px] font-black uppercase">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="min-h-[80px] border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[10px] font-black uppercase">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="min-h-[80px] border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[10px] font-black uppercase">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="min-h-[80px] border-2 border-black" /></div>
                     </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <SectionTitle icon={ShieldCheck} title={formData.supplierType === 'Center' ? "१२) परवाना व तांत्रिक" : "२) परवाना व तांत्रिक"} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle icon={Wallet} title={formData.supplierType === 'Center' ? "१३) व्यावसायिक व दूध तपशील" : "३) व्यावसायिक व दूध तपशील"} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">जागा</Label>
                    <Select value={formData.spaceOwnership} onValueChange={(v: any) => setFormData({...formData, spaceOwnership: v})}>
                      <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Self" className="font-bold">स्वतःची</SelectItem><SelectItem value="Rented" className="font-bold">भाड्याची</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">स्वच्छता ग्रेड</Label>
                    <Select value={formData.hygieneGrade} onValueChange={(v: any) => setFormData({...formData, hygieneGrade: v})}>
                      <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 border-2 border-black rounded-xl font-black" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-blue-50/50 rounded-xl border-2 border-blue-200">
                    <Label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">गाय दूध (Qty/F/S)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Qty" />
                      <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Fat" />
                      <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Snf" />
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-xl border-2 border-amber-200">
                    <Label className="text-[10px] font-black uppercase text-amber-600 mb-2 block">म्हेस दूध (Qty/F/S)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Qty" />
                      <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Fat" />
                      <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 border-2 border-black text-center" placeholder="Snf" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle icon={Box} title={formData.supplierType === 'Center' ? "१४) इन्व्हेंटरी व स्टेटस" : "४) इन्व्हेंटरी व स्टेटस"} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" type="button" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})} className={cn("h-12 border-2 border-black rounded-xl font-black text-[10px]", formData.computerAvailable ? "bg-primary text-white" : "")}><Laptop className="mr-2 h-4 w-4" /> POP: {formData.computerAvailable ? 'हो' : 'नाही'}</Button>
                  <Button variant="outline" type="button" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})} className={cn("h-12 border-2 border-black rounded-xl font-black text-[10px]", formData.upsInverterAvailable ? "bg-amber-500 text-white" : "")}><Zap className="mr-2 h-4 w-4" /> UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</Button>
                  <Button variant="outline" type="button" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})} className={cn("h-12 border-2 border-black rounded-xl font-black text-[10px]", formData.solarAvailable ? "bg-emerald-500 text-white" : "")}><Sun className="mr-2 h-4 w-4" /> सोलर: {formData.solarAvailable ? 'हो' : 'नाही'}</Button>
                  <div className="flex flex-col gap-1"><Label className="text-[8px] font-black uppercase opacity-60">CANS</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-10 border-2 border-black text-center" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">Adulteration Kit (भेसळ तपासणी कीट)</Label><Input value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-11 border-2 border-black rounded-xl" placeholder="उदा. हो, चितळे कीट" /></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><h4 className="text-[10px] font-black uppercase opacity-60 tracking-widest">साहित्याची यादी (INVENTORY)</h4><Button variant="outline" type="button" size="sm" onClick={() => addDynamicRow('equipment', { name: "", quantity: 1, ownership: 'Company' })} className="h-7 text-[8px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                  <div className="space-y-2">
                    {formData.equipment.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 bg-muted/10 p-2 rounded-xl border-2 border-black items-center">
                        <div className="col-span-6"><Input value={item.name} onChange={e => updateDynamicRow('equipment', item.id, { name: e.target.value })} className="h-8 text-[11px] border-none rounded-lg font-bold bg-white w-full" placeholder="साहित्य नाव" /></div>
                        <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateDynamicRow('equipment', item.id, { quantity: Number(e.target.value) })} className="h-8 text-[11px] text-center border-none rounded-lg font-black bg-white w-full" /></div>
                        <div className="col-span-3">
                          <Select value={item.ownership} onValueChange={v => updateDynamicRow('equipment', item.id, { ownership: v as any })}>
                            <SelectTrigger className="h-8 text-[8px] bg-white border-none rounded-lg font-black"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('equipment', item.id)} className="h-7 w-7 text-rose-400 p-0"><X className="h-3.5 w-3.5" /></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalNotes || formData.additionalInfo} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-24 border-2 border-black rounded-xl p-4 font-bold" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-2">
            <Button onClick={handleSaveSupplier} className="w-full font-black uppercase text-[10px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-4 w-4 mr-1.5" /> प्रोफाइल जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function RouteDetailsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <RouteDetailsContent />
    </Suspense>
  )
}
