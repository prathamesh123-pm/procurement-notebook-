
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route, Supplier, CollectionCenter } from "@/lib/types"
import { Plus, MapPin, Truck, Users, IndianRupee, Trash2, ArrowRight, Edit, IceCream, Milk, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [centers, setCenters] = useState<CollectionCenter[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
    iceBlocks: "0"
  })

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const storedCenters = JSON.parse(localStorage.getItem('procurepal_centers') || '[]')
    
    setSuppliers(storedSupps)
    setCenters(storedCenters)
    setRoutes(storedRoutes)
  }, [])

  const saveRoutes = (updated: Route[]) => {
    setRoutes(updated)
    localStorage.setItem('procurepal_routes', JSON.stringify(updated))
  }

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
    if (!formData.name || !formData.distanceKm || !formData.vehicle) {
      toast({ title: "त्रुटी", description: "कृपया आवश्यक माहिती भरा.", variant: "destructive" })
      return
    }

    if (isEditing && currentRouteId) {
      const updatedRoutes = routes.map(r => 
        r.id === currentRouteId 
          ? { 
              ...r, 
              name: formData.name, 
              distanceKm: Number(formData.distanceKm), 
              vehicle: formData.vehicle, 
              costPerKm: Number(formData.costPerKm) || 0,
              iceBlocks: Number(formData.iceBlocks) || 0
            } 
          : r
      )
      saveRoutes(updatedRoutes)
      toast({ title: "यशस्वी", description: "रूटची माहिती अद्ययावत केली." })
    } else {
      const newRoute: Route = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        distanceKm: Number(formData.distanceKm),
        vehicle: formData.vehicle,
        costPerKm: Number(formData.costPerKm) || 0,
        iceBlocks: Number(formData.iceBlocks) || 0,
        supplierIds: []
      }
      saveRoutes([...routes, newRoute])
      toast({ title: "यशस्वी", description: "नवीन रूट जोडला गेला." })
    }

    setIsDialogOpen(false)
  }

  const deleteRoute = (id: string) => {
    if (confirm("तुम्हाला खात्री आहे की हा रूट हटवायचा आहे?")) {
      const updated = routes.filter(r => r.id !== id)
      saveRoutes(updated)
      toast({ title: "हटवले", description: "रूट काढून टाकला आहे." })
    }
  }

  const getRouteMilkTotals = (routeId: string) => {
    const routeSupps = suppliers.filter(s => s.routeId === routeId)
    const routeCenters = centers.filter(c => c.routeId === routeId)
    
    const totalCow = routeSupps.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0) + 
                     routeCenters.reduce((acc, c) => acc + (c.cowMilk?.quantity || 0), 0)
                     
    const totalBuf = routeSupps.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0) + 
                     routeCenters.reduce((acc, c) => acc + (c.buffaloMilk?.quantity || 0), 0)
                     
    return { 
      totalCow, 
      totalBuf, 
      pointsCount: routeSupps.length + routeCenters.length 
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" /> Milk Collection Routes
          </h2>
          <p className="text-muted-foreground font-medium text-sm">लॉजिस्टिक, वाहन खर्च आणि संकलित दूध माहिती.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-lg font-bold h-11 px-8 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105">
          <Plus className="h-5 w-5" /> Add New Route
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
        {routes.length > 0 ? (
          routes.map((route) => {
            const totals = getRouteMilkTotals(route.id)
            return (
              <Card key={route.id} className="border-none shadow-sm hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden flex flex-col group rounded-2xl border-t-4 border-t-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary border-none font-bold py-1 px-3">
                      <MapPin className="h-3 w-3 mr-1" /> {route.distanceKm} KM
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full" onClick={() => handleOpenEdit(route)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => deleteRoute(route.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4 font-headline text-2xl font-bold group-hover:text-primary transition-colors">{route.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1.5 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                    <Truck className="h-3.5 w-3.5 text-primary" /> {route.vehicle}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-5 pt-2 text-sm flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase mb-1">
                        <Milk className="h-3 w-3" /> Cow Total
                      </div>
                      <p className="text-xl font-black text-blue-900">{totals.totalCow.toFixed(1)} <span className="text-[10px] font-bold">L</span></p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px] uppercase mb-1">
                        <Milk className="h-3 w-3" /> Buf Total
                      </div>
                      <p className="text-xl font-black text-amber-900">{totals.totalBuf.toFixed(1)} <span className="text-[10px] font-bold">L</span></p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground uppercase flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> Active Points</span>
                      <span className="text-foreground">{totals.pointsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground uppercase flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5 text-primary" /> Rate / KM</span>
                      <span className="text-foreground">₹{(route.costPerKm || 0).toFixed(2)}</span>
                    </div>
                    {route.iceBlocks !== undefined && (
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-muted-foreground uppercase flex items-center gap-2"><IceCream className="h-3.5 w-3.5 text-primary" /> Ice Required</span>
                        <span className="text-foreground">{route.iceBlocks} Blocks</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-0 border-t mt-auto">
                   <Button variant="ghost" className="w-full justify-between text-primary font-bold group rounded-none h-14 px-6 hover:bg-primary hover:text-white transition-all" asChild>
                      <Link href={`/routes/${route.id}`}>
                        <span>पुरवठादार व्यवस्थापित करा</span>
                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                   </Button>
                </CardFooter>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-muted-foreground/20">
             <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-muted-foreground/40" />
             </div>
             <h3 className="text-2xl font-bold text-foreground">एकही रूट तयार नाही</h3>
             <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-medium">तुमचे पहिले दूध संकलन रूट जोडण्यासाठी वरील बटणावर क्लिक करा.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline text-primary">{isEditing ? 'रूट माहिती बदला' : 'नवीन रूट तयार करा'}</DialogTitle>
            <DialogDescription className="text-sm font-medium">वाहन, अंतर आणि लॉजिस्टिक माहिती भरा.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="routeName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">रूटचे नाव (Route Name)</Label>
              <Input id="routeName" placeholder="उदा. मुख्य महामार्ग पश्चिम" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-muted/40 border-none h-12 text-base font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">एकूण अंतर (KM)</Label>
                <Input id="distance" type="number" placeholder="40" value={formData.distanceKm} onChange={(e) => setFormData({...formData, distanceKm: e.target.value})} className="bg-muted/40 border-none h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">खर्च प्रति KM (₹)</Label>
                <Input id="cost" type="number" step="0.01" placeholder="0.85" value={formData.costPerKm} onChange={(e) => setFormData({...formData, costPerKm: e.target.value})} className="bg-muted/40 border-none h-12 font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">वाहन नाव (Vehicle)</Label>
                <Input id="vehicle" placeholder="उदा. टाटा योद्धा" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} className="bg-muted/40 border-none h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iceBlocks" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">बर्फाचे प्रमाण</Label>
                <Input id="iceBlocks" type="number" placeholder="0" value={formData.iceBlocks} onChange={(e) => setFormData({...formData, iceBlocks: e.target.value})} className="bg-muted/40 border-none h-12 font-bold" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 font-bold px-8 rounded-xl border-2">रद्द करा</Button>
            <Button onClick={handleSaveRoute} className="h-12 font-bold px-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              {isEditing ? 'माहिती अद्ययावत करा' : 'रूट जतन करा'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
