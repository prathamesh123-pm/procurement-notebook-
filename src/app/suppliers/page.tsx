"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, 
  History, Edit, CheckCircle2, Box, UserCheck, Wallet, User, Printer, Truck, 
  ShieldCheck, Clock, Layers, TrendingDown, IndianRupee, Hash, ListPlus, 
  Lightbulb, Info, FileText, PlusCircle, Briefcase
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
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

      <div className="w-full mt-12 pt-12 grid grid-cols-2 gap-10 text-center uppercase font-black text-[9pt] tracking-[0.2em]">
        <div className="border-t border-black pt-2">अधिकृत स्वाक्षरी</div>
        <div className="border-t border-black pt-2">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  );
};

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
  const { data: suppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

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

  const handleAddSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

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

  const addDynamicRow = (key: string, initialData: any) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key as keyof typeof prev] as any[]), { id: crypto.randomUUID(), ...initialData }] }))
  }

  const removeDynamicRow = (key: string, id: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).filter(r => r.id !== id) }))
  }

  const updateDynamicRow = (key: string, id: string, updates: any) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).map(r => r.id === id ? { ...r, ...updates } : r) }))
  }

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
    setIsEditing(true)
  }

  const deleteSupplier = (id: string) => {
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
      setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.name?.toLowerCase().includes(q) || s.mobile?.includes(q) || s.supplierId?.toString().includes(q);
      const matchesRoute = routeFilter === 'all' || (routeFilter === 'none' ? !s.routeId : s.routeId === routeFilter);
      return matchesSearch && matchesRoute;
    })
  }, [suppliers, searchQuery, routeFilter])

  const getRouteName = (rid: string) => {
    if (!rid || rid === "none") return "Unassigned";
    return routes?.find(r => r.id === rid)?.name || "Unknown Route"
  }

  if (!mounted) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-full mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 overflow-x-hidden text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" /> सप्लायर (SUPPLIERS)
        </h2>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
              <Plus className="h-4 w-4" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[850px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white text-left">
            <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-sm font-black uppercase tracking-widest">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">संपर्क, तांत्रिक आणि माहिती भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-4 sm:p-6">
              <div className="space-y-10 pb-20">
                <div className="space-y-4">
                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                        <SelectTrigger className="h-10 text-[11px] bg-muted/20 border-2 border-black font-black rounded-xl p-3 shadow-inner"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-60">रूट निवडा</Label>
                      <Select value={formData.routeId} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-10 border-2 border-black rounded-xl font-bold"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="font-bold">रूट नाही</SelectItem>
                          {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Center' && (
                  <div className="space-y-10 border-l-4 border-primary/20 pl-4 md:pl-8">
                    <div className="space-y-4">
                      <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">निष्क्रिय उत्पादक</Label><Input type="number" value={formData.inactive_producers} onChange={e => setFormData({...formData, inactive_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-8 border-2 border-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1"><Label className="text-[8px] font-black">एकूण जनावरे</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><SectionTitle icon={Layers} title="४) २+ वर्ष जुने उत्पादक" /><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-7 text-[8px] uppercase">जोडा</Button></div>
                      <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead className="bg-slate-100 text-[9px] font-black uppercase border-b-2 border-black">
                            <tr><th>नाव</th><th>जुने दूध</th><th>सध्याचे दूध</th><th>जुनी जनावरे</th><th>नवी जनावरे</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.longTermProducers.map(p => (
                              <tr key={p.id} className="border-b-2 border-black last:border-0">
                                <td><Input value={p.producer_name} onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-7 border-none text-[10px]" /></td>
                                <td><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-7 border-none text-center" /></td>
                                <td><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-7 border-none text-center font-black" /></td>
                                <td><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-7 border-none text-center" /></td>
                                <td><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_animals: e.target.value })} className="h-7 border-none text-center font-black" /></td>
                                <td className="text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table><ScrollBar orientation="horizontal" /></ScrollArea>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between"><SectionTitle icon={TrendingDown} title="५) दूध घटलेले उत्पादक" color="text-rose-600" /><Button size="sm" onClick={() => addDynamicRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0, reason: "" })} className="h-6 text-[8px] uppercase bg-rose-600">जोडा</Button></div>
                       <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse text-[8px]">
                          <thead className="bg-rose-50 font-black uppercase border-b-2 border-black text-rose-900">
                            <tr><th>नाव</th><th>जुने दूध</th><th>नवे दूध</th><th>जुनी जनावरे</th><th>नवी जनावरे</th><th>कारण</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.decreasingProducers.map(p => (
                              <tr key={p.id} className="border-b border-black last:border-0 bg-white text-center">
                                <td className="text-left pl-1"><Input value={p.producer_name} onChange={e => updateDynamicRow('decreasingProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[10px] border-none" /></td>
                                <td><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_milk: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_milk: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_animals: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_animals: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Input value={p.reason} onChange={e => updateDynamicRow('decreasingProducers', p.id, { reason: e.target.value })} className="h-6 text-[8px] border-none" /></td>
                                <td><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('decreasingProducers', p.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
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
                            <tr><th>सुविधा नाव</th><th>स्थिती</th><th>शेरा</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.lssFacilities.map(l => (
                              <tr key={l.id} className="border-b-2 border-black last:border-0">
                                <td><Input value={l.item} onChange={val => updateDynamicRow('lssFacilities', l.id, { item: val.target.value })} className="h-7 border-none text-[10px] uppercase font-black" /></td>
                                <td className="text-center"><select value={l.status} onChange={val => updateDynamicRow('lssFacilities', l.id, { status: val.target.value })} className="text-[10px] font-bold outline-none bg-transparent"><option value="YES">हो</option><option value="NO">नाही</option></select></td>
                                <td><Input value={l.remarks} onChange={val => updateDynamicRow('lssFacilities', l.id, { remarks: val.target.value })} className="h-7 border-none text-[10px]" /></td>
                                <td className="text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('lssFacilities', l.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table><ScrollBar orientation="horizontal" /></ScrollArea>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between"><SectionTitle icon={Truck} title="१०) अंतर्गत रूट माहिती (SUB-ROUTES)" color="text-emerald-700" /><Button size="sm" onClick={() => addDynamicRow('subRoutes', { vehicleType: "", km: "", area: "", producerCount: 0, animalCount: 0, milkQty: 0 })} className="h-7 text-[8px] uppercase bg-emerald-600">जोडा</Button></div>
                       <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse min-w-[600px] text-[10px]">
                          <thead className="bg-emerald-50 font-black uppercase border-b-2 border-black">
                            <tr><th>गाडी</th><th>किमी</th><th>परिसर</th><th>उत्पादक</th><th>जनावरे</th><th>दूध (L)</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.subRoutes.map(r => (
                              <tr key={r.id} className="border-b border-black last:border-0 text-center">
                                <td><Input value={r.vehicleType} onChange={e => updateDynamicRow('subRoutes', r.id, { vehicleType: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input value={r.km} onChange={e => updateDynamicRow('subRoutes', r.id, { km: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input value={r.area} onChange={e => updateDynamicRow('subRoutes', r.id, { area: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.producerCount} onChange={e => updateDynamicRow('subRoutes', r.id, { producerCount: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.animalCount} onChange={e => updateDynamicRow('subRoutes', r.id, { animalCount: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.milkQty} onChange={e => updateDynamicRow('subRoutes', r.id, { milkQty: e.target.value })} className="h-7 border-none font-black" /></td>
                                <td className="text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('subRoutes', r.id)} className="h-5 w-5 text-rose-500"><X className="h-3 w-3" /></Button></td>
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
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Wallet} title={formData.supplierType === 'Center' ? "१३) व्यावसायिक व दूध तपशील" : "३) व्यावसायिक व दूध तपशील"} />
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[9px] font-black uppercase text-blue-600 mb-0.5">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="L" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="F" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="S" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[9px] font-black uppercase text-amber-600 mb-0.5">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="L" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="F" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="S" />
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Box} title={formData.supplierType === 'Center' ? "१४) इन्व्हेंटरी" : "४) इन्व्हेंटरी"} />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[9px] font-black uppercase tracking-widest">साहित्य यादी</h4><Button variant="outline" size="sm" onClick={() => addDynamicRow('equipment', { name: "", quantity: 1, ownership: 'Company' })} className="h-7 text-[8px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 bg-muted/10 p-2 rounded-xl border-2 border-black items-center">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateDynamicRow('equipment', item.id, {name: e.target.value})} className="h-8 text-[10px] border-none rounded-lg font-bold bg-white w-full" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateDynamicRow('equipment', item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] text-center border-none rounded-lg font-black bg-white w-full" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateDynamicRow('equipment', item.id, {ownership: v as any})}>
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
                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-20 text-[11px] bg-muted/20 border-2 border-black rounded-xl p-3 shadow-inner" /></div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-2">
              <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-[10px] h-11 rounded-xl shadow-2xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-4 w-4 mr-1.5" /> प्रोफाइल जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-2xl rounded-2xl overflow-hidden bg-white border-muted-foreground/10 p-2 no-print w-full">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <Input placeholder="नाव किंवा मोबाईलने शोधा..." className="pl-10 h-10 rounded-xl bg-muted/10 border-2 border-black font-bold text-xs shadow-inner w-full focus-visible:ring-1" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-muted/10 border-2 border-black font-black text-[9px] uppercase shadow-inner">
              <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="रूट निवडा" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] font-bold uppercase">सर्व रूट</SelectItem>
              {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[10px] font-bold uppercase">{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="w-full flex flex-col items-center">
        {selectedSupplier ? (
          <div className="w-full max-w-full overflow-x-auto pb-4">
            <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 sm:p-8 printable-report flex flex-col items-center shadow-none mb-4 animate-in slide-in-from-right-2 duration-300">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2 flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-black">{selectedSupplier.supplierType} REPORT</Badge>
                <div className="flex gap-1.5 flex-wrap">
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px]" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px]" onClick={() => prepareEdit(selectedSupplier)}><Edit className="h-3.5 w-3.5 mr-1" /> बदला</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[9px] text-destructive border-destructive/20" onClick={() => deleteSupplier(selectedSupplier.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
                </div>
              </div>

              <div className="w-full border-b-[3px] border-black pb-3 mb-6 text-center">
                <h3 className="text-[16pt] sm:text-[20pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
                <p className="text-[9pt] sm:text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType} प्रोफाईल</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 w-full mb-6 text-left">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-black/20 pb-1 mb-2">१) प्राथमिक माहिती</h4>
                  <div className="space-y-2 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/10 pb-1"><span className="text-muted-foreground uppercase text-[9px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/10 pb-1"><span className="text-muted-foreground uppercase text-[9px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[9px]">पत्ता</span><span className="leading-tight">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b border-black/20 pb-1 mb-2">२) परवाना व तांत्रिक</h4>
                  <div className="space-y-2 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/10 pb-1"><span className="text-muted-foreground uppercase text-[9px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/10 pb-1"><span className="text-muted-foreground uppercase text-[9px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/10 pb-1"><span className="text-muted-foreground uppercase text-[9px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                  </div>
                </div>
              </div>

              {selectedSupplier.supplierType === 'Center' && <ProducerCenterReportView supplier={selectedSupplier} />}

              <div className="w-full mt-12 pt-12 grid grid-cols-2 gap-10 text-center uppercase font-black text-[9pt] tracking-[0.2em]">
                <div className="border-t border-black pt-2">अधिकृत स्वाक्षरी</div>
                <div className="border-t border-black pt-2">सुपरवायझर स्वाक्षरी</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-muted-foreground/10 shadow-2xl overflow-hidden no-print w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">सप्लायर तपशील</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-center whitespace-nowrap">रूट (ROUTE)</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-right px-4">क्रिया</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supp) => (
                    <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => setSelectedSupplier(supp)}>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-[12px] uppercase truncate max-w-[150px]">{supp.name}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="h-3.5 px-1 text-[7px] border-none bg-primary/5 text-primary">ID: {supp.supplierId}</Badge>
                            <span className="text-[8px] text-muted-foreground font-black uppercase flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {supp.mobile}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("h-4 px-1.5 text-[7px] font-black uppercase border-none truncate max-w-[80px]", supp.routeId ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                          {getRouteName(supp.routeId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSupplier(supp.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={3} className="p-10 text-center text-[10px] font-black opacity-30 uppercase italic">कोणतेही सप्लायर सापडले नाहीत.</td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isEditing} onOpenChange={(open) => { if(!open) { setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[850px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white text-left">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">माहिती बदला / अपडेट</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 sm:p-8 text-left">
            <div className="space-y-10 pb-20">
              <div className="space-y-4">
                <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[9px] font-black uppercase text-rose-600">रूट निवडा (TRANSFER)</Label>
                    <Select value={formData.routeId} onValueChange={v => setFormData({...formData, routeId: v})}>
                      <SelectTrigger className="h-10 text-[11px] bg-rose-50 border-2 border-black rounded-xl font-black">
                        <Truck className="h-3.5 w-3.5 mr-2 text-rose-600" /><SelectValue placeholder="रूट निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="font-bold text-rose-600">Unassigned</SelectItem>
                        {routes?.map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-10 text-[11px] bg-muted/20 border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  <div className="sm:col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                </div>
              </div>

              {formData.supplierType === 'Center' && (
                <div className="space-y-10 border-l-4 border-primary/20 pl-4 md:pl-8">
                    <div className="space-y-4">
                      <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">निष्क्रिय उत्पादक</Label><Input type="number" value={formData.inactive_producers} onChange={e => setFormData({...formData, inactive_producers: e.target.value})} className="h-8 border-2 border-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-8 border-2 border-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1"><Label className="text-[8px] font-black">एकूण जनावरे</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                        <div className="space-y-1"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 border-2 border-black font-black" /></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><SectionTitle icon={Layers} title="४) २+ वर्ष जुने उत्पादक" /><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-6 text-[8px] uppercase">जोडा</Button></div>
                      <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse text-[8px]">
                          <thead className="bg-slate-100 font-black uppercase border-b-2 border-black">
                            <tr><th>नाव</th><th>जुने दूध</th><th>सध्याचे दूध</th><th>जुनी जनावरे</th><th>नवी जनावरे</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.longTermProducers.map(p => (
                              <tr key={p.id} className="border-b-2 border-black last:border-0">
                                <td><Input value={p.producer_name} onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-6 text-[8px] border-none" /></td>
                                <td><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_animals: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="h-5 w-5 text-rose-500"><X className="h-3 w-3"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table><ScrollBar orientation="horizontal" /></ScrollArea>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between"><SectionTitle icon={TrendingDown} title="५) दूध घटलेले उत्पादक" color="text-rose-600" /><Button size="sm" onClick={() => addDynamicRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0, reason: "" })} className="h-6 text-[8px] uppercase bg-rose-600">जोडा</Button></div>
                       <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse text-[8px]">
                          <thead className="bg-rose-50 font-black uppercase border-b-2 border-black text-rose-900">
                            <tr><th>नाव</th><th>जुने दूध</th><th>नवे दूध</th><th>जुनी जनावरे</th><th>नवी जनावरे</th><th>कारण</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.decreasingProducers.map(p => (
                              <tr key={p.id} className="border-b border-black last:border-0 bg-white text-center">
                                <td className="text-left pl-1"><Input value={p.producer_name} onChange={e => updateDynamicRow('decreasingProducers', p.id, { producer_name: e.target.value })} className="h-7 text-[10px] border-none" /></td>
                                <td><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_milk: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_milk: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { previous_animals: e.target.value })} className="h-6 text-[8px] border-none text-center" /></td>
                                <td><Input type="number" value={p.current_animals} onChange={e => updateDynamicRow('decreasingProducers', p.id, { current_animals: e.target.value })} className="h-6 text-[8px] border-none text-center font-black" /></td>
                                <td><Input value={p.reason} onChange={e => updateDynamicRow('decreasingProducers', p.id, { reason: e.target.value })} className="h-6 text-[8px] border-none" /></td>
                                <td><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('decreasingProducers', p.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
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
                            <tr><th>सुविधा नाव</th><th>स्थिती</th><th>शेरा</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.lssFacilities.map(l => (
                              <tr key={l.id} className="border-b-2 border-black last:border-0">
                                <td><Input value={l.item} onChange={val => updateDynamicRow('lssFacilities', l.id, { item: val.target.value })} className="h-7 border-none text-[10px] uppercase font-black" /></td>
                                <td className="text-center"><select value={l.status} onChange={val => updateDynamicRow('lssFacilities', l.id, { status: val.target.value })} className="text-[10px] font-bold outline-none bg-transparent"><option value="YES">हो</option><option value="NO">नाही</option></select></td>
                                <td><Input value={l.remarks} onChange={val => updateDynamicRow('lssFacilities', l.id, { remarks: val.target.value })} className="h-7 border-none text-[10px]" /></td>
                                <td className="text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('lssFacilities', l.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table><ScrollBar orientation="horizontal" /></ScrollArea>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between"><SectionTitle icon={Truck} title="१०) अंतर्गत रूट माहिती (SUB-ROUTES)" color="text-emerald-700" /><Button size="sm" onClick={() => addDynamicRow('subRoutes', { vehicleType: "", km: "", area: "", producerCount: 0, animalCount: 0, milkQty: 0 })} className="h-7 text-[8px] uppercase bg-emerald-600">जोडा</Button></div>
                       <ScrollArea className="w-full border-2 border-black rounded-xl">
                        <table className="w-full text-left border-collapse min-w-[600px] text-[10px]">
                          <thead className="bg-emerald-50 font-black uppercase border-b-2 border-black">
                            <tr><th>गाडी</th><th>किमी</th><th>परिसर</th><th>उत्पादक</th><th>जनावरे</th><th>दूध (L)</th><th>X</th></tr>
                          </thead>
                          <tbody>
                            {formData.subRoutes.map(r => (
                              <tr key={r.id} className="border-b border-black last:border-0 text-center">
                                <td><Input value={r.vehicleType} onChange={e => updateDynamicRow('subRoutes', r.id, { vehicleType: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input value={r.km} onChange={e => updateDynamicRow('subRoutes', r.id, { km: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input value={r.area} onChange={e => updateDynamicRow('subRoutes', r.id, { area: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.producerCount} onChange={e => updateDynamicRow('subRoutes', r.id, { producerCount: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.animalCount} onChange={e => updateDynamicRow('subRoutes', r.id, { animalCount: e.target.value })} className="h-7 border-none" /></td>
                                <td><Input type="number" value={r.milkQty} onChange={e => updateDynamicRow('subRoutes', r.id, { milkQty: e.target.value })} className="h-7 border-none font-black" /></td>
                                <td className="text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('subRoutes', r.id)} className="h-5 w-5 text-rose-500"><X className="h-3 w-3" /></Button></td>
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
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 border-2 border-black font-bold rounded-xl" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Wallet} title={formData.supplierType === 'Center' ? "१३) व्यावसायिक व दूध तपशील" : "३) व्यावसायिक व दूध तपशील"} />
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[9px] font-black uppercase text-blue-600 mb-0.5">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="L" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="F" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="S" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[9px] font-black uppercase text-amber-600 mb-0.5">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="L" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="F" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] bg-white border-2 border-black font-bold" placeholder="S" />
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Box} title={formData.supplierType === 'Center' ? "१४) इन्व्हेंटरी" : "४) इन्व्हेंटरी"} />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[9px] font-black uppercase tracking-widest">साहित्य यादी</h4><Button variant="outline" size="sm" onClick={() => addDynamicRow('equipment', { name: "", quantity: 1, ownership: 'Company' })} className="h-7 text-[8px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 bg-muted/10 p-2 rounded-xl border-2 border-black items-center">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateDynamicRow('equipment', item.id, {name: e.target.value})} className="h-8 text-[10px] border-none rounded-lg font-bold bg-white w-full" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateDynamicRow('equipment', item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] text-center border-none rounded-lg font-black bg-white w-full" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateDynamicRow('equipment', item.id, {ownership: v as any})}>
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
                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-20 text-[11px] bg-muted/20 border-2 border-black rounded-xl p-3 shadow-inner" /></div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-2">
              <Button onClick={handleUpdateSupplier} className="w-full font-black uppercase text-[10px] h-11 rounded-xl shadow-2xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-4 w-4 mr-1.5" /> बदल जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
