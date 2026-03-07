
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Phone, 
  Trash2, Edit, Package, Info, ChevronRight,
  Milk, Truck, PlusCircle, ShieldCheck, Battery, FlaskConical, MessageSquare, Target, X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CollectionCenter, EquipmentItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CentersPage() {
  const [centers, setCenters] = useState<CollectionCenter[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<CollectionCenter | null>(null)
  
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "", code: "", operatorName: "", mobile: "", village: "",
    fssaiNumber: "", fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", cattleFeedBrand: "", competition: "", additionalNotes: "",
    weighingScaleBrand: "", fatMachineBrand: "", chemicalsStock: "",
    batteryCondition: "", equipment: [] as EquipmentItem[]
  })

  useEffect(() => {
    setMounted(true)
    const storedCenters = JSON.parse(localStorage.getItem('procurepal_centers') || '[]')
    setCenters(storedCenters)
  }, [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", code: "", operatorName: "", mobile: "", village: "",
      fssaiNumber: "", fssaiExpiry: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", cattleFeedBrand: "", competition: "", additionalNotes: "",
      weighingScaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "",
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: CollectionCenter) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name, code: center.code, operatorName: center.operatorName,
      mobile: center.mobile, village: center.village,
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
      fssaiExpiry: formData.fssaiExpiry,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), cattleFeedBrand: formData.cattleFeedBrand,
      competition: formData.competition, additionalNotes: formData.additionalNotes,
      material: {
        weighingScaleBrand: formData.weighingScaleBrand,
        fatMachineBrand: formData.fatMachineBrand,
        chemicalsStock: formData.chemicalsStock,
        batteryCondition: formData.batteryCondition,
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

  const handleDeleteCenter = (id: string) => {
    if (!confirm("हटवायचे आहे का?")) return
    const updated = centers.filter(c => c.id !== id)
    setCenters(updated)
    localStorage.setItem('procurepal_centers', JSON.stringify(updated))
    if (selectedCenter?.id === id) setSelectedCenter(null)
  }

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black font-headline text-foreground flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" /> संकलन केंद्र (Centers)
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Management & Inventory</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> केंद्र जोडा (Add Center)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left List */}
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-2xl overflow-hidden ${selectedCenter ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="केंद्र शोधा... (Search...)" 
                className="pl-8 h-9 text-xs bg-muted/30 border-none rounded-xl" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[400px] lg:h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div 
                  key={center.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-all flex justify-between items-center ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="min-w-0">
                    <h4 className="font-black text-xs text-foreground truncate">{center.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[8px] uppercase font-black px-1.5 py-0 h-3.5">{center.code}</Badge>
                      <span className="text-[9px] text-muted-foreground font-bold truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {center.village}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Details */}
        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-2xl min-h-[500px] ${!selectedCenter ? 'hidden lg:flex lg:items-center lg:justify-center' : 'block'}`}>
          {selectedCenter ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-full" onClick={() => setSelectedCenter(null)}>
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex-1 lg:flex-none">
                  <h3 className="text-lg font-black leading-none">{selectedCenter.name}</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase mt-1">Code: {selectedCenter.code} | {selectedCenter.village}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleOpenEdit(selectedCenter)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-xl" onClick={() => handleDeleteCenter(selectedCenter.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[500px] lg:h-[600px]">
                <div className="p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><User className="h-3 w-3" /> ऑपरेटर व परवाना</h4>
                      <div className="bg-muted/20 p-3 rounded-xl border space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">नाव</p><p className="text-xs font-black">{selectedCenter.operatorName || "-"}</p></div>
                          <div><p className="text-[8px] font-black text-muted-foreground uppercase">संपर्क</p><p className="text-xs font-black">{selectedCenter.mobile || "-"}</p></div>
                        </div>
                        <div className="pt-2 border-t"><p className="text-[8px] font-black text-muted-foreground uppercase">FSSAI License</p><p className="text-xs font-black text-primary">{selectedCenter.fssaiNumber || "N/A"}</p></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Package className="h-3 w-3" /> तांत्रिक स्थिती</h4>
                      <div className="bg-muted/20 p-3 rounded-xl border grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2"><Truck className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[7px] font-black uppercase text-muted-foreground">काटा</p><p className="text-[10px] font-black truncate">{selectedCenter.material.weighingScaleBrand || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[7px] font-black uppercase text-muted-foreground">फॅट मशीन</p><p className="text-[10px] font-black truncate">{selectedCenter.material.fatMachineBrand || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><Battery className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[7px] font-black uppercase text-muted-foreground">बॅटरी</p><p className="text-[10px] font-black truncate">{selectedCenter.material.batteryCondition || "-"}</p></div></div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[7px] font-black uppercase text-muted-foreground">केमिकल्स</p><p className="text-[10px] font-black truncate">{selectedCenter.material.chemicalsStock || "-"}</p></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase text-primary">दूध संकलन सरांश (Avg Milk)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
                        <p className="text-[8px] font-black text-blue-600 uppercase">गाय (Cow)</p>
                        <p className="text-sm font-black text-blue-900">{selectedCenter.cowMilk?.quantity || 0} L</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                        <p className="text-[8px] font-black text-amber-600 uppercase">म्हेस (Buf)</p>
                        <p className="text-sm font-black text-amber-900">{selectedCenter.buffaloMilk?.quantity || 0} L</p>
                      </div>
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
                        <p className="text-[8px] font-black text-indigo-600 uppercase">बर्फ (Ice)</p>
                        <p className="text-sm font-black text-indigo-900">{selectedCenter.iceBlocks || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase text-primary">साहित्य यादी (Equipment)</h4>
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <Table>
                        <TableHeader><TableRow className="bg-muted/50 h-8"><TableHead className="text-[8px] font-black uppercase h-8 px-3">साहित्य</TableHead><TableHead className="text-[8px] font-black uppercase h-8 text-center">Qty</TableHead><TableHead className="text-[8px] font-black uppercase h-8 text-right px-3">मालकी</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedCenter.material.equipment?.map((item) => (
                            <TableRow key={item.id} className="h-10"><TableCell className="py-1 px-3 text-[10px] font-black">{item.name}</TableCell><TableCell className="py-1 text-center font-black text-[10px]">{item.quantity}</TableCell><TableCell className="py-1 px-3 text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[7px] h-4 font-black uppercase px-1">{item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></TableCell></TableRow>
                          ))}
                          {(!selectedCenter.material.equipment || selectedCenter.material.equipment.length === 0) && (<TableRow><TableCell colSpan={3} className="text-center text-[9px] italic py-4">नोंद नाही.</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase text-primary">इतर माहिती (Notes)</h4>
                    <div className="bg-muted/10 p-3 rounded-xl border border-dashed text-[11px] font-medium leading-relaxed italic">
                      {selectedCenter.additionalNotes || "कोणतीही विशेष टिप्पणी नाही."}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-4 text-center p-10">
              <Warehouse className="h-16 w-16 text-muted-foreground/20" />
              <div className="space-y-1">
                <h4 className="font-black text-muted-foreground">केंद्र निवडा (Select a Center)</h4>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">तपशील पाहण्यासाठी यादीतील एका केंद्रावर क्लिक करा.</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl sm:max-h-[90vh]">
          <DialogHeader className="p-4 bg-primary/5 border-b sticky top-0 z-10">
            <DialogTitle className="text-lg font-black">{dialogMode === 'add' ? 'नवीन केंद्र (Add Center)' : 'माहिती बदला (Edit Center)'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)] p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 pb-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती (Basic)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">केंद्राचे नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">कोड</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">ऑपरेटर</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">गाव/पत्ता</Label><Input value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">२) दूध संकलन (Metrics)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-xl bg-blue-50/30 space-y-2">
                      <Label className="text-[9px] font-black text-primary uppercase">गाय दूध (Cow)</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="Qty" />
                        <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="Fat" />
                        <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="SNF" />
                      </div>
                    </div>
                    <div className="p-3 border rounded-xl bg-amber-50/30 space-y-2">
                      <Label className="text-[9px] font-black text-amber-700 uppercase">म्हेस दूध (Buf)</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="Qty" />
                        <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="Fat" />
                        <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] p-1.5" placeholder="SNF" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">३) साहित्य व इन्व्हेंटरी (Inventory)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">वजन काटा ब्रँड</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">केमिकल्स</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[9px] font-black uppercase">इतर साहित्य यादी</Label>
                      <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, equipment: [...formData.equipment, {id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self'}]})} className="h-6 text-[8px] font-black gap-1 uppercase text-primary border border-primary/20 rounded-lg">
                        <PlusCircle className="h-3 w-3" /> जोडा (Add)
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.equipment.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center p-2 rounded-xl bg-muted/10 border">
                          <div className="col-span-6"><Input value={item.name} onChange={e => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, name: e.target.value} : i)})} className="h-8 text-[9px] rounded-lg" placeholder="उदा. कॅन" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, quantity: Number(e.target.value)} : i)})} className="h-8 text-[9px] text-center rounded-lg" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => setFormData({...formData, equipment: formData.equipment.map(i => i.id === item.id ? {...i, ownership: v as any} : i)})}>
                              <SelectTrigger className="h-8 text-[8px] px-1 rounded-lg"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => setFormData({...formData, equipment: formData.equipment.filter(i => i.id !== item.id)})} className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">४) लॉजिस्टिक व टिप्पणी (Misc)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फ (Ice Blocks)</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black">गाव स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">अतिरिक्त टिप्पणी (Notes)</Label><Input value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-9 text-xs rounded-xl" /></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/5 gap-2 sticky bottom-0 z-10">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="sm" className="font-black h-10 px-6 rounded-xl">रद्द करा</Button>
            <Button onClick={handleSaveCenter} size="sm" className="font-black h-10 px-10 rounded-xl shadow-lg shadow-primary/20">जतन करा (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
