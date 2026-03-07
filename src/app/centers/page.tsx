
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Phone, 
  Trash2, Edit, Package, Info, ChevronRight,
  Milk, Truck, PlusCircle, ShieldCheck, Battery, FlaskConical, MessageSquare, Target
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

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    operatorName: "",
    mobile: "",
    village: "",
    fssaiNumber: "",
    fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0",
    cattleFeedBrand: "",
    competition: "",
    additionalNotes: "",
    weighingScaleBrand: "",
    fatMachineBrand: "",
    chemicalsStock: "",
    batteryCondition: "",
    equipment: [] as EquipmentItem[]
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
      name: center.name,
      code: center.code,
      operatorName: center.operatorName,
      mobile: center.mobile,
      village: center.village,
      fssaiNumber: center.fssaiNumber || "",
      fssaiExpiry: center.fssaiExpiry || "",
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

  const handleSaveCenter = () => {
    if (!formData.name || !formData.code) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड भरणे आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData: CollectionCenter = {
      id: editingId || crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      operatorName: formData.operatorName,
      mobile: formData.mobile,
      village: formData.village,
      fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks),
      cattleFeedBrand: formData.cattleFeedBrand,
      competition: formData.competition,
      additionalNotes: formData.additionalNotes,
      material: {
        weighingScaleBrand: formData.weighingScaleBrand,
        fatMachineBrand: formData.fatMachineBrand,
        chemicalsStock: formData.chemicalsStock,
        batteryCondition: formData.batteryCondition,
        equipment: formData.equipment
      }
    }

    let updatedCenters: CollectionCenter[]
    if (dialogMode === 'add') {
      updatedCenters = [...centers, centerData]
      toast({ title: "यशस्वी", description: "नवीन केंद्र जोडले गेले." })
    } else {
      updatedCenters = centers.map(c => c.id === editingId ? centerData : c)
      toast({ title: "यशस्वी", description: "केंद्राची माहिती अद्ययावत केली." })
    }

    setCenters(updatedCenters)
    localStorage.setItem('procurepal_centers', JSON.stringify(updatedCenters))
    if (selectedCenter?.id === centerData.id) setSelectedCenter(centerData)
    setIsDialogOpen(false)
  }

  const handleDeleteCenter = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) return
    const updated = centers.filter(c => c.id !== id)
    setCenters(updated)
    localStorage.setItem('procurepal_centers', JSON.stringify(updated))
    if (selectedCenter?.id === id) setSelectedCenter(null)
    toast({ title: "हटवले", description: "केंद्र काढून टाकले आहे." })
  }

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.village.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-primary" /> संकलन केंद्र (Centers)
          </h2>
          <p className="text-muted-foreground font-medium text-sm">केंद्राची माहिती, साहित्य आणि तांत्रिक बाबींची नोंद.</p>
        </div>
        <Button onClick={handleOpenAdd} className="font-bold h-11 px-8 gap-2 rounded-xl">
          <Plus className="h-5 w-5" /> केंद्र जोडा (Add Center)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white overflow-hidden flex flex-col h-[750px] rounded-2xl">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="केंद्र शोधा... (Search...)" 
                className="pl-10 bg-muted/30 border-none rounded-xl" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div 
                  key={center.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center group ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{center.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] uppercase font-black py-0 h-4">{center.code}</Badge>
                      <span className="text-[10px] text-muted-foreground font-bold truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {center.village}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Details */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white min-h-[750px] rounded-2xl">
          {selectedCenter ? (
            <ScrollArea className="h-[750px]">
              <CardContent className="p-6 sm:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black font-headline text-foreground">{selectedCenter.name}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-black border-primary text-primary">कोड (CODE): {selectedCenter.code}</Badge>
                      <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" /> {selectedCenter.village}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-bold rounded-xl" onClick={() => handleOpenEdit(selectedCenter)}>
                      <Edit className="h-4 w-4 mr-2" /> बदला (Edit)
                    </Button>
                    <Button variant="ghost" size="sm" className="font-bold text-destructive hover:bg-destructive/5 rounded-xl" onClick={() => handleDeleteCenter(selectedCenter.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> ऑपरेटर व परवाना माहिती (Operator & License)
                    </h4>
                    <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[9px] uppercase font-black text-muted-foreground">ऑपरेटर नाव (Name)</Label>
                          <p className="text-sm font-bold">{selectedCenter.operatorName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase font-black text-muted-foreground">संपर्क (Mobile)</Label>
                          <p className="text-sm font-bold">{selectedCenter.mobile || "N/A"}</p>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <Label className="text-[9px] uppercase font-black text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> FSSAI परवाना क्रमांक (License)</Label>
                        <p className="text-sm font-bold">{selectedCenter.fssaiNumber || "N/A"}</p>
                        {selectedCenter.fssaiExpiry && <p className="text-[10px] text-destructive font-black mt-1 uppercase">वैधता संपण्याची तारीख (Expiry): {selectedCenter.fssaiExpiry}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" /> साहित्य व तांत्रिक स्थिती (Material & Tech)
                    </h4>
                    <div className="p-4 border rounded-2xl bg-muted/5 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase border-b pb-3">
                        <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-primary" /> काटा (Scale): {selectedCenter.material.weighingScaleBrand || "N/A"}</div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-primary" /> फॅट मशीन (Fat M/C): {selectedCenter.material.fatMachineBrand || "N/A"}</div>
                        <div className="flex items-center gap-2"><Battery className="h-3.5 w-3.5 text-primary" /> बॅटरी (Battery): {selectedCenter.material.batteryCondition || "N/A"}</div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-primary" /> केमिकल्स (Chem): {selectedCenter.material.chemicalsStock || "N/A"}</div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="h-8 text-[9px] font-black uppercase">साहित्य (Item)</TableHead>
                            <TableHead className="h-8 text-[9px] font-black uppercase text-center">संख्या (Qty)</TableHead>
                            <TableHead className="h-8 text-[9px] font-black uppercase text-right">मालकी (Owner)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCenter.material.equipment?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="py-2"><p className="font-bold text-xs">{item.name}</p></TableCell>
                              <TableCell className="py-2 text-center font-bold">{item.quantity}</TableCell>
                              <TableCell className="py-2 text-right">
                                <Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[8px] uppercase font-black">
                                  {item.ownership === 'Self' ? 'स्वतःचे' : 'डेअरी'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {(!selectedCenter.material.equipment || selectedCenter.material.equipment.length === 0) && (
                            <TableRow><TableCell colSpan={3} className="text-center text-[10px] italic text-muted-foreground py-4">साहित्याची नोंद नाही.</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">दूध संकलन सरांश (Milk Metrics)</h4>
                    <div className="border rounded-2xl p-5 bg-blue-50/20">
                      <p className="text-[9px] font-black text-primary uppercase mb-3 tracking-widest">दूध सरासरी आकडेवारी (Milk Avg)</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">गाय (Cow)</p><p className="font-black text-blue-900">{selectedCenter.cowMilk?.quantity || 0} L</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">म्हेस (Buffalo)</p><p className="font-black text-amber-900">{selectedCenter.buffaloMilk?.quantity || 0} L</p></div>
                        <div><p className="text-[8px] text-muted-foreground uppercase font-black">बर्फ (Ice)</p><p className="font-black">{selectedCenter.iceBlocks || 0}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">लॉजिस्टिक आणि गाव माहिती (Logistics & Village)</h4>
                    <div className="border rounded-2xl p-5 bg-amber-50/20 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-amber-700 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">पशुखाद्य (Cattle Feed)</p>
                            <p className="text-sm font-bold">{selectedCenter.cattleFeedBrand || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-amber-700 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">गाव स्पर्धा (Competition)</p>
                            <p className="text-sm font-bold">{selectedCenter.competition || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 border-t pt-2">
                          <MessageSquare className="h-4 w-4 text-amber-700 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">अतिरिक्त टिप्पणी (Notes)</p>
                            <p className="text-sm font-medium italic">{selectedCenter.additionalNotes || "कोणतीही टिप्पणी नाही."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-5">
              <Warehouse className="h-20 w-20 text-muted-foreground/20" />
              <h4 className="text-xl font-black text-muted-foreground">केंद्र निवडा (Select a Center)</h4>
              <Button onClick={handleOpenAdd} variant="outline" className="font-black border-primary text-primary rounded-xl px-8">नवीन केंद्र जोडा</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl p-0 bg-white rounded-3xl overflow-hidden">
          <DialogHeader className="p-5 bg-primary/5 border-b">
            <DialogTitle className="text-xl font-black">{dialogMode === 'add' ? 'नवीन केंद्र जोडा (Add New Center)' : 'केंद्राची माहिती अपडेट करा (Edit Center)'}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-h-[80vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Info className="h-4 w-4" /> १) केंद्राची प्राथमिक माहिती (Basic Info)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">केंद्राचे नाव (Center Name)</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">कोड (Code)</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">ऑपरेटर नाव (Operator)</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">मोबाईल (Mobile)</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">FSSAI क्रमांक (License No)</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" placeholder="14-अंकी परवाना" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">परवाना मुदत (Expiry Date)</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-black">गाव/पत्ता (Village/Address)</Label><Input value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Milk className="h-4 w-4" /> २) दूध संकलन सरांश (Milk Metrics)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-2xl bg-blue-50/30">
                    <Label className="text-[10px] font-black text-primary uppercase">गाय दूध (Cow Milk)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">Qty</Label><Input placeholder="Qty" type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">Fat</Label><Input placeholder="Fat" type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">SNF</Label><Input placeholder="SNF" type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-2xl bg-amber-50/30">
                    <Label className="text-[10px] font-black text-amber-700 uppercase">म्हेस दूध (Buffalo Milk)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">Qty</Label><Input placeholder="Qty" type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">Fat</Label><Input placeholder="Fat" type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase font-bold">SNF</Label><Input placeholder="SNF" type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-xs rounded-lg" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Package className="h-4 w-4" /> ३) मटेरिअल आणि साहित्य (Equipment Inventory)</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddEquipmentRow} className="h-7 text-[9px] font-black uppercase gap-1 text-primary"><PlusCircle className="h-3.5 w-3.5" /> साहित्य जोडा (Add Item)</Button>
                </div>
                
                <div className="space-y-3">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl bg-muted/10 border relative group">
                      <div className="col-span-6 space-y-1">
                        <Label className="text-[8px] font-black uppercase text-muted-foreground">साहित्याचे नाव (Item Name)</Label>
                        <Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="h-9 text-[10px] bg-white rounded-lg" placeholder="उदा. वजन काटा" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[8px] font-black uppercase text-muted-foreground">संख्या (Qty)</Label>
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="h-9 text-[10px] bg-white text-center rounded-lg" />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[8px] font-black uppercase text-muted-foreground">मालकी (Owner)</Label>
                        <Select value={item.ownership} onValueChange={(v: any) => updateEquipmentItem(item.id, {ownership: v})}>
                          <SelectTrigger className="h-9 text-[9px] bg-white px-1 rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self">स्वतःचे (Self)</SelectItem><SelectItem value="Company">डेअरी (Dairy)</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="h-9 w-9 text-destructive rounded-full"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {formData.equipment.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-2">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                      <p className="text-[9px] font-black text-muted-foreground uppercase">कोणतेही साहित्य जोडलेले नाही (No Items).</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Truck className="h-4 w-4" /> ४) इन्फ्रास्ट्रक्चर व लॉजिस्टिक (Logistics)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">वजन काटा ब्रँड (Scale Brand)</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">फॅट मशीन ब्रँड (Fat M/C Brand)</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">केमिकल्स साठा (Chem Stock)</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" placeholder="उदा. OK, Low" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">बॅटरी स्थिती (Battery Status)</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" placeholder="उदा. Good, Poor" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">बर्फाचे प्रमाण (Ice Blocks)</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">पशुखाद्य (Cattle Feed)</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">गाव स्पर्धा (Competition)</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" placeholder="उदा. इतर स्थानिक डेअरी" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black">अतिरिक्त टिप्पणी (Notes)</Label><Input value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-10 bg-muted/20 border-none text-xs rounded-xl" placeholder="काही विशेष माहिती..." /></div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-5 border-t bg-muted/5 gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-black h-11 px-8 rounded-xl">रद्द करा (Cancel)</Button>
            <Button onClick={handleSaveCenter} className="font-black h-11 px-12 rounded-xl shadow-lg shadow-primary/20">जतन करा (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
