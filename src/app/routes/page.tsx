
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route, Supplier } from "@/lib/types"
import { Plus, MapPin, Truck, Users, Trash2, Edit, ChevronRight, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function RoutesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'suppliers')
  }, [db, user])

  const { data: routes, isLoading } = useCollection(routesQuery)
  const { data: suppliers } = useCollection(suppliersQuery)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
    iceBlocks: "0"
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setIsEditing(false)
    setCurrentRouteId(null)
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "", iceBlocks: "0" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (route: Route) => {
    setIsEditing(true)
    setCurrentRouteId(route.id)
    setFormData({
      name: route.name,
      distanceKm: String(route.distanceKm),
      vehicle: route.vehicle,
      costPerKm: String(route.costPerKm),
      iceBlocks: String(route.iceBlocks || 0)
    })
    setIsDialogOpen(true)
  }

  const handleSaveRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle || !db) {
      toast({ title: "त्रुटी", description: "कृपया आवश्यक माहिती भरा.", variant: "destructive" })
      return
    }

    const routeData = {
      name: formData.name, 
      distanceKm: Number(formData.distanceKm), 
      vehicle: formData.vehicle, 
      costPerKm: Number(formData.costPerKm) || 0,
      iceBlocks: Number(formData.iceBlocks) || 0,
      updatedAt: new Date().toISOString()
    }

    if (isEditing && currentRouteId) {
      const docRef = doc(db, 'routes', currentRouteId)
      updateDocumentNonBlocking(docRef, routeData)
      toast({ title: "यशस्वी", description: "रूटची माहिती अद्ययावत केली." })
    } else {
      const colRef = collection(db, 'routes')
      addDocumentNonBlocking(colRef, routeData)
      toast({ title: "यशस्वी", description: "नवीन रूट जोडला गेला." })
    }

    setIsDialogOpen(false)
  }

  const deleteRoute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!db || !id) return
    if (!confirm("तुम्हाला खात्री आहे की हा रूट कायमचा हटवायचा आहे?")) return
    
    const docRef = doc(db, 'routes', id)
    deleteDocumentNonBlocking(docRef)
    toast({ title: "यशस्वी", description: "रूट यशस्वीरित्या हटवण्यात आला." })
  }

  const getRouteMilkTotals = (routeId: string) => {
    const routeSupps = suppliers?.filter(s => s.routeId === routeId) || []
    const totalCow = routeSupps.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0)
    const totalBuf = routeSupps.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0)
    return { totalCow, totalBuf, pointsCount: routeSupps.length }
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> रूट (Collection Routes)
          </h2>
          <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-wider">Logistics & Costing</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="flex-1 sm:flex-none gap-1.5 font-black h-10 text-[11px] px-4 rounded-xl border-destructive text-destructive">
            <Link href="/routes/breakdown"><AlertTriangle className="h-4 w-4" /> ब्रेकडाऊन</Link>
          </Button>
          <Button onClick={handleOpenAdd} className="flex-1 sm:flex-none gap-1.5 shadow-md font-black h-10 text-[11px] px-5 rounded-xl">
            <Plus className="h-4 w-4" /> नवीन रूट
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-2">
        {routes && routes.length > 0 ? (
          routes.map((route) => {
            const totals = getRouteMilkTotals(route.id)
            return (
              <Card key={route.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden flex flex-col rounded-2xl border-t-2 border-t-primary">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary border-none font-black py-0.5 px-2.5 rounded-full text-[10px] uppercase">
                      <MapPin className="h-3 w-3 mr-1" /> {route.distanceKm} KM
                    </Badge>
                    <div className="flex gap-1.5 relative z-30">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpenEdit(route)}><Edit className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => deleteRoute(e, route.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <CardTitle className="mt-1 font-black text-xl">{route.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 font-black text-muted-foreground uppercase text-[10px] tracking-tight"><Truck className="h-3 w-3 text-primary" /> {route.vehicle}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4 pt-0 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center"><div className="text-blue-600 font-black text-[9px] uppercase tracking-tighter">गाय (Cow)</div><p className="text-base font-black text-blue-900">{totals.totalCow.toFixed(1)}L</p></div>
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-center"><div className="text-amber-600 font-black text-[9px] uppercase tracking-tighter">म्हेस (Buf)</div><p className="text-base font-black text-amber-900">{totals.totalBuf.toFixed(1)}L</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 text-[9px] font-black uppercase text-center">
                    <div className="space-y-0.5"><div className="text-muted-foreground">पॉइंट</div><div className="text-foreground">{totals.pointsCount}</div></div>
                    <div className="space-y-0.5"><div className="text-muted-foreground">दर</div><div className="text-foreground">₹{route.costPerKm}</div></div>
                    <div className="space-y-0.5"><div className="text-muted-foreground">बर्फ</div><div className="text-foreground">{route.iceBlocks || 0}</div></div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t mt-auto">
                   <Button variant="ghost" className="w-full justify-between text-primary font-black uppercase text-[10px] tracking-widest h-11 px-5 hover:bg-primary/5" asChild>
                      <Link href={`/routes/${route.id}`}><span>सप्लायर व्यवस्थापन</span><ChevronRight className="h-4 w-4" /></Link>
                   </Button>
                </CardFooter>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center gap-2 opacity-50">
             <MapPin className="h-10 w-10 text-muted-foreground/20" /><h3 className="text-sm font-black text-muted-foreground uppercase">एकही रूट तयार नाही</h3>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-4 bg-primary text-white"><DialogTitle className="text-lg font-black uppercase tracking-tight">{isEditing ? 'माहिती बदला' : 'नवीन रूट'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 p-5">
            <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase text-muted-foreground">रूटचे नाव</Label><Input placeholder="उदा. रस्तापूर रूट" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-10 text-sm rounded-xl bg-muted/20 border-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase text-muted-foreground">अंतर (KM)</Label><Input type="number" value={formData.distanceKm} onChange={(e) => setFormData({...formData, distanceKm: e.target.value})} className="h-10 text-sm rounded-xl bg-muted/20 border-none" /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase text-muted-foreground">दर प्रति KM (₹)</Label><Input type="number" step="0.01" value={formData.costPerKm} onChange={(e) => setFormData({...formData, costPerKm: e.target.value})} className="h-10 text-sm rounded-xl bg-muted/20 border-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase text-muted-foreground">वाहन नाव</Label><Input value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} className="h-10 text-sm rounded-xl bg-muted/20 border-none" /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-black uppercase text-muted-foreground">बर्फाचे प्रमाण</Label><Input type="number" value={formData.iceBlocks} onChange={(e) => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-sm rounded-xl bg-muted/20 border-none" /></div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/5 gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-black h-10 text-[11px] rounded-xl px-6">रद्द</Button><Button onClick={handleSaveRoute} className="font-black h-10 text-[11px] rounded-xl px-10">जतन (Save)</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
