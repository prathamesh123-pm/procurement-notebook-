
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Phone, 
  Trash2, Edit, Package, Info, ChevronRight,
  Milk, Truck, PlusCircle, ShieldCheck, Battery, FlaskConical, MessageSquare, Target, X,
  Laptop, Zap, Sun
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CollectionCenter, EquipmentItem, Route } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function CentersPage() {
  const [centers, setCenters] = useState<CollectionCenter[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<CollectionCenter | null>(null)
  
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "", code: "", operatorName: "", mobile: "", village: "", routeId: "",
    fssaiNumber: "", fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", cattleFeedBrand: "", competition: "", additionalNotes: "",
    weighingScaleBrand: "", fatMachineBrand: "", chemicalsStock: "",
    batteryCondition: "", milkCansCount: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => {
    setMounted(true)
    const storedCenters = JSON.parse(localStorage.getItem('procurepal_centers') || '[]')
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    setCenters(storedCenters)
    setRoutes(storedRoutes)
  }, [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", code: "", operatorName: "", mobile: "", village: "", routeId: "",
      fssaiNumber: "", fssaiExpiry: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", cattleFeedBrand: "", competition: "", additionalNotes: "",
      weighingScaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: CollectionCenter) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name, code: center.code, operatorName: center.operatorName,
      mobile: center.mobile, village: center.village, routeId: center.routeId || "",
      fssaiNumber: center.fssaiNumber || "", fssaiExpiry: center.fssaiExpiry || "",
      cowQty: String(center.cowMilk?.quantity || 0),
      cowFat: String(center.cowMilk?.fat || 0),
      cowSnf: String(center.cowMilk?.snf || 0),
      bufQty: String(center.buffaloMilk?.quantity || 0),
      bufFat: String(center.buffaloMilk?.fat || 0),
      bufSnf: String(center.buffaloMilk?.snf || 0),
      iceBlocks: String(center.iceBlocks || 0),
      cattleFeedBrand: center.cattleFeedBrand || "",
      competition: center.competition || "",
      additionalNotes: center.additionalNotes || "",
      weighingScaleBrand: center.material.weighingScaleBrand || "",
      fatMachineBrand: center.material.fatMachineBrand || "",
      chemicalsStock: center.material.chemicalsStock || "",
      batteryCondition: center.material.batteryCondition || "",
      milkCansCount: String(center.material.milkCansCount || 0),
      computerAvailable: center.material.computerAvailable || false,
      upsInverterAvailable: center.material.upsInverterAvailable || false,
      solarAvailable: center.material.solarAvailable || false,
      equipment: center.material.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveCenter = () => {
    if (!formData.name || !formData.code) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData: CollectionCenter = {
      id: editingId || crypto.randomUUID(),
      name: formData.name, code: formData.code, operatorName: formData.operatorName,
      mobile: formData.mobile, village: formData.village, fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry, routeId: formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), cattleFeedBrand: formData.cattleFeedBrand,
      competition: formData.competition, additionalNotes: formData.additionalNotes,
      material: {
        weighingScaleBrand: formData.weighingScaleBrand,
        fatMachineBrand: formData.fatMachineBrand,
        chemicalsStock: formData.chemicalsStock,
        batteryCondition: formData.batteryCondition,
        milkCansCount: Number(formData.milkCansCount),
        computerAvailable: formData.computerAvailable,
        upsInverterAvailable: formData.upsInverterAvailable,
        solarAvailable: formData.solarAvailable,
        equipment: formData.equipment
      }
    }

    const updated = dialogMode === 'add' ? [...centers, centerData] : centers.map(c => c.id === editingId ? centerData : c)
    setCenters(updated)
    localStorage.setItem('procurepal_centers', JSON.stringify(updated))
    if (selectedCenter?.id === centerData.id) setSelectedCenter(centerData)
    setIsDialogOpen(false)
    toast({ title: "जतन केले", description: "केंद्राची माहिती यशस्वीरित्या सेव्ह झाली." })
  }

  const handleDeleteCenter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) return
    const updated = centers.filter(c => c.id !== id)
    setCenters(updated)
    localStorage.setItem('procurepal_centers', JSON.stringify(updated))
    if (selectedCenter?.id === id) setSelectedCenter(null)
    toast({ title: "हटवले", description: "केंद्र काढून टाकले आहे." })
  }

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black font-headline text-foreground flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-primary" /> संकलन केंद्र (Centers)
          </h2>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black gap-1.5 h-8 text-[11px] rounded-lg">
          <Plus className="h-3.5 w-3.5" /> नवीन केंद्र
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* Left List */}
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-xl overflow-hidden ${selectedCenter ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                placeholder="शोधा..." 
                className="w-full pl-7 h-8 text-[11px] bg-white border rounded-md shadow-inner focus:ring-1 focus:ring-primary outline-none" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)] lg:h-[650px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div 
                  key={center.id}
                  className={`p-2.5 cursor-pointer hover:bg-muted/50 transition-all flex justify-between items-center ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="min-w-0">
                    <h4 className="font-black text-[11px] text-foreground truncate">{center.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-[8px] uppercase font-black px-1.5 py-0 h-3.5">{center.code}</Badge>
                      <span className="text-[9px] text-muted-foreground font-bold truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {center.village}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-md" onClick={(e) => handleDeleteCenter(e, center.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Details */}
        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-xl min-h-[450px] ${!selectedCenter ? 'hidden lg:flex lg:items-center lg:justify-center' : 'block'}`}>
          {selectedCenter ? (
            <div className="flex flex-col h-full">
              <div className="p-2.5 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 rounded-full" onClick={() => setSelectedCenter(null)}>
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex-1 lg:flex-none px-2 min-w-0">
                  <h3 className="text-sm font-black leading-tight truncate">{selectedCenter.name}</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase mt-0.5 tracking-tight truncate">Code: {selectedCenter.code} | {selectedCenter.village}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-primary/20 text-primary" onClick={() => handleOpenEdit(selectedCenter)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-md" onClick={(e) => handleDeleteCenter(e, selectedCenter.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-180px)] lg:h-[650px]">
                <div className="p-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><User className="h-3 w-3" /> ऑपरेटर व परवाना</h4>
                      <div className="bg-muted/20 p-2.5 rounded-lg border space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">नाव</p><p className="text-[10px] font-black truncate">{selectedCenter.operatorName || "-"}</p></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">संपर्क</p><p className="text-[10px] font-black">{selectedCenter.mobile || "-"}</p></div>
                        </div>
                        <div className="pt-1.5 border-t border-dashed grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">FSSAI</p><p className="text-[10px] font-black text-primary truncate">{selectedCenter.fssaiNumber || "N/A"}</p></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">Expiry</p><p className="text-[10px] font-black">{selectedCenter.fssaiExpiry || "-"}</p></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Package className="h-3 w-3" /> तांत्रिक स्थिती</h4>
                      <div className="bg-muted/20 p-2.5 rounded-lg border grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="flex items-center gap-2"><Truck className="h-3 w-3 text-primary opacity-70" /><div className="min-w-0"><p className="text-[8px] font-black uppercase text-muted-foreground">काटा</p><p className="text-[9px] font-black truncate">{selectedCenter.material.weighingScaleBrand || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary opacity-70" /><div className="min-w-0"><p className="text-[8px] font-black uppercase text-muted-foreground">फॅट मशीन</p><p className="text-[9px] font-black truncate">{selectedCenter.material.fatMachineBrand || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><Battery className="h-3 w-3 text-primary opacity-70" /><div className="min-w-0"><p className="text-[8px] font-black uppercase text-muted-foreground">बॅटरी</p><p className="text-[9px] font-black truncate">{selectedCenter.material.batteryCondition || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary opacity-70" /><div className="min-w-0"><p className="text-[8px] font-black uppercase text-muted-foreground">केमिकल्स</p><p className="text-[9px] font-black truncate">{selectedCenter.material.chemicalsStock || "-"}</p></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">उपलब्ध सुविधा</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.computerAvailable ? 'bg-green-50 border-green-100' : 'bg-muted/20 opacity-50'}`}>
                        <Laptop className={`h-4 w-4 ${selectedCenter.material.computerAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span className="text-[8px] font-black uppercase">कॉम्प्युटर</span>
                      </div>
                      <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.upsInverterAvailable ? 'bg-orange-50 border-orange-100' : 'bg-muted/20 opacity-50'}`}>
                        <Zap className={`h-4 w-4 ${selectedCenter.material.upsInverterAvailable ? 'text-orange-600' : 'text-muted-foreground'}`} />
                        <span className="text-[8px] font-black uppercase">UPS/Inv</span>
                      </div>
                      <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.solarAvailable ? 'bg-amber-50 border-amber-100' : 'bg-muted/20 opacity-50'}`}>
                        <Sun className={`h-4 w-4 ${selectedCenter.material.solarAvailable ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className="text-[8px] font-black uppercase">सोलर</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">दूध संकलन सरांश (Avg Milk)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-center">
                        <p className="text-[8px] font-black text-blue-600 uppercase">गाय (Cow)</p>
                        <p className="text-[11px] font-black text-blue-900">{selectedCenter.cowMilk?.quantity || 0} L</p>
                      </div>
                      <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg text-center">
                        <p className="text-[8px] font-black text-amber-600 uppercase">म्हेस (Buf)</p>
                        <p className="text-[11px] font-black text-amber-900">{selectedCenter.buffaloMilk?.quantity || 0} L</p>
                      </div>
                      <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-center">
                        <p className="text-[8px] font-black text-indigo-600 uppercase">बर्फ (Ice)</p>
                        <p className="text-[11px] font-black text-indigo-900">{selectedCenter.iceBlocks || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">साहित्य यादी (Equipment)</h4>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader><TableRow className="bg-muted/50 h-7"><TableHead className="text-[8px] font-black uppercase h-7 px-2">साहित्य</TableHead><TableHead className="text-[8px] font-black uppercase h-7 text-center">Qty</TableHead><TableHead className="text-[8px] font-black uppercase h-7 text-right px-2">मालकी</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedCenter.material.equipment?.map((item) => (
                            <TableRow key={item.id} className="h-8"><TableCell className="py-1 px-2 text-[10px] font-black">{item.name}</TableCell><TableCell className="py-1 text-center font-black text-[10px]">{item.quantity}</TableCell><TableCell className="py-1 px-2 text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[7px] h-3.5 px-1 font-black uppercase">{item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></TableCell></TableRow>
                          ))}
                          {(!selectedCenter.material.equipment || selectedCenter.material.equipment.length === 0) && (<TableRow><TableCell colSpan={3} className="text-center text-[9px] italic py-4">नोंद नाही.</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">इतर माहिती (Notes)</h4>
                    <div className="bg-muted/10 p-2.5 rounded-lg border border-dashed text-[10px] font-medium leading-relaxed italic">
                      <p className="mb-1"><span className="font-black">कॅन संख्या:</span> {selectedCenter.material.milkCansCount || 0}</p>
                      {selectedCenter.cattleFeedBrand && <p className="mb-1"><span className="font-black">खाद्य:</span> {selectedCenter.cattleFeedBrand}</p>}
                      {selectedCenter.additionalNotes || "कोणतीही विशेष टिप्पणी नाही."}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 text-center p-10">
              <Warehouse className="h-12 w-12 text-muted-foreground/20" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">केंद्र निवडा</h4>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border-none">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-tight">{dialogMode === 'add' ? 'नवीन केंद्र' : 'माहिती बदला'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[85vh] p-3 sm:p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">केंद्राचे नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">कोड</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">ऑपरेटर</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">गाव/पत्ता</Label><Input value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[9px] uppercase font-black">रूट (Route)</Label>
                    <Select value={formData.routeId} onValueChange={v => setFormData({...formData, routeId: v})}>
                      <SelectTrigger className="h-9 text-xs bg-muted/20 border-none"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                      <SelectContent>
                        {routes.map(r => <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मुदत (Expiry)</Label><Input value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" placeholder="DD/MM/YYYY" /></div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">२) दूध संकलन (Avg)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 border rounded-lg bg-blue-50/20 space-y-1.5">
                      <p className="text-[9px] font-black text-blue-700 uppercase text-center">गाय दूध (Cow)</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center" placeholder="Qty" />
                        <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center" placeholder="Fat" />
                        <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center" placeholder="SNF" />
                      </div>
                    </div>
                    <div className="p-2 border rounded-lg bg-amber-50/20 space-y-1.5">
                      <p className="text-[9px] font-black text-amber-700 uppercase text-center">म्हेस दूध (Buf)</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center" placeholder="Qty" />
                        <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center" placeholder="Fat" />
                        <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center" placeholder="SNF" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">३) तांत्रिक व इन्व्हेंटरी</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">वजन काटा ब्रँड</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">केमिकल्स</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="computer" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="computer" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर उपलब्ध आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="ups" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर उपलब्ध आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="solar" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध आहे का?</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase">साहित्य यादी</Label><Button variant="outline" size="sm" onClick={() => setFormData({...formData, equipment: [...formData.equipment, {id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self'}]})} className="h-6 text-[8px] font-black rounded-md px-2">जोडा</Button></div>
                  <div className="space-y-1.5">
                    {formData.equipment.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-md">
                        <Input value={item.name} onChange={e => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, name: e.target.value} : i)})} className="col-span-6 h-7 text-[10px] px-2 bg-white border-none" placeholder="कॅन" />
                        <Input type="number" value={item.quantity} onChange={e => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, quantity: Number(e.target.value)} : i)})} className="col-span-2 h-7 text-[10px] px-0 text-center bg-white border-none" />
                        <Select value={item.ownership} onValueChange={v => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, ownership: v as any} : i)})}>
                          <SelectTrigger className="col-span-3 h-7 text-[8px] px-1 bg-white border-none"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, equipment: formData.equipment.filter(i => i.id !== item.id)})} className="col-span-1 h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">४) इतर</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">खाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">गाव स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">अतिरिक्त टिप्पणी</Label><Input value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex flex-row shrink-0 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-black h-9 text-[11px] px-5 rounded-lg">रद्द</Button>
            <Button onClick={handleSaveCenter} className="font-black h-9 text-[11px] px-8 rounded-lg">जतन करा (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
