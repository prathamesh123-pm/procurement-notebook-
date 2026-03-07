"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Phone, 
  Trash2, Edit, Package, Info, ChevronRight,
  Milk, Truck, PlusCircle, ShieldCheck, Battery, FlaskConical
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
          <p className="text-muted-foreground font-medium">केंद्राची माहिती, साहित्य आणि तांत्रिक बाबींची नोंद.</p>
        </div>
        <Button onClick={handleOpenAdd} className="font-bold h-11 px-8 gap-2">
          <Plus className="h-5 w-5" /> केंद्र जोडा
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white overflow-hidden flex flex-col h-[750px]">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="केंद्र शोधा..." 
                className="pl-10 bg-muted/30 border-none" 
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
                      <Badge variant="secondary" className="text-[9px] uppercase font-bold py-0 h-4">{center.code}</Badge>
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
        <Card className="lg:col-span-8 border-none shadow-sm bg-white min-h-[750px]">
          {selectedCenter ? (
            <ScrollArea className="h-[750px]">
              <CardContent className="p-6 sm:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold font-headline text-foreground">{selectedCenter.name}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-bold border-primary text-primary">CODE: {selectedCenter.code}</Badge>
                      <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" /> {selectedCenter.village}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-bold" onClick={() => handleOpenEdit(selectedCenter)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="font-bold text-destructive hover:bg-destructive/5" onClick={() => handleDeleteCenter(selectedCenter.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> ऑपरेटर व परवाना माहिती
                    </h4>
                    <div className="space-y-4 bg-muted/20 p-5 rounded-xl border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">नाव</Label>
                          <p className="text-sm font-bold">{selectedCenter.operatorName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">संपर्क</Label>
                          <p className="text-sm font-bold">{selectedCenter.mobile || "N/A"}</p>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> FSSAI License</Label>
                        <p className="text-sm font-bold">{selectedCenter.fssaiNumber || "N/A"}</p>
                        {selectedCenter.fssaiExpiry && <p className="text-[10px] text-destructive font-bold mt-1">Expiry: {selectedCenter.fssaiExpiry}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" /> साहित्य व तांत्रिक स्थिती
                    </h4>
                    <div className="p-4 border rounded-xl bg-muted/5 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs font-bold border-b pb-3">
                        <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-primary" /> Scale: {selectedCenter.material.weighingScaleBrand || "N/A"}</div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-primary" /> Fat M/C: {selectedCenter.material.fatMachineBrand || "N/A"}</div>
                        <div className="flex items-center gap-2"><Battery className="h-3.5 w-3.5 text-primary" /> Battery: {selectedCenter.material.batteryCondition || "N/A"}</div>
                        <div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-primary" /> Chem: {selectedCenter.material.chemicalsStock || "N/A"}</div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="h-8 text-[10px] font-bold uppercase">साहित्य</TableHead>
                            <TableHead className="h-8 text-[10px] font-bold uppercase text-center">Qty</TableHead>
                            <TableHead className="h-8 text-[10px] font-bold uppercase text-right">मालकी</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCenter.material.equipment?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="py-2"><p className="font-bold text-xs">{item.name}</p></TableCell>
                              <TableCell className="py-2 text-center font-bold">{item.quantity}</TableCell>
                              <TableCell className="py-2 text-right">
                                <Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[8px] uppercase">
                                  {item.ownership === 'Self' ? 'स्वतःचे' : 'डेअरी'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {(!selectedCenter.material.equipment || selectedCenter.material.equipment.length === 0) && (
                            <TableRow><TableCell colSpan={3} className="text-center text-[10px] italic text-muted-foreground py-4">नोंद नाही.</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">दूध संकलन व लॉजिस्टिक</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-xl p-4 bg-blue-50/20">
                      <p className="text-[10px] font-bold text-primary uppercase mb-3">दूध आकडेवारी (Avg)</p>
                      <div className="flex justify-between items-center">
                        <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Cow Qty</p><p className="font-bold">{selectedCenter.cowMilk?.quantity || 0} L</p></div>
                        <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Buf Qty</p><p className="font-bold">{selectedCenter.buffaloMilk?.quantity || 0} L</p></div>
                        <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Ice</p><p className="font-bold">{selectedCenter.iceBlocks || 0}</p></div>
                      </div>
                    </div>
                    <div className="border rounded-xl p-4 bg-amber-50/20">
                      <p className="text-[10px] font-bold text-amber-700 uppercase mb-3">लॉजिस्टिक माहिती</p>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold">पशुखाद्य: <span className="text-foreground">{selectedCenter.cattleFeedBrand || "N/A"}</span></p>
                        <p className="text-[10px] text-muted-foreground font-bold">स्पर्धा: <span className="text-foreground">{selectedCenter.competition || "N/A"}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-5">
              <Warehouse className="h-20 w-20 text-muted-foreground/20" />
              <h4 className="text-xl font-bold">केंद्र निवडा</h4>
              <Button onClick={handleOpenAdd} variant="outline" className="font-bold border-primary text-primary">नवीन केंद्र जोडा</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl p-0 bg-white">
          <DialogHeader className="p-4 bg-primary/5 border-b">
            <DialogTitle className="text-xl font-bold">{dialogMode === 'add' ? 'नवीन केंद्र जोडा' : 'केंद्राची माहिती अपडेट करा'}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-h-[80vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Info className="h-4 w-4" /> १) केंद्राची प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">कोड</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">ऑपरेटर</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">FSSAI Number</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" placeholder="14-digit license" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">FSSAI Expiry</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-bold">गाव</Label><Input value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Milk className="h-4 w-4" /> २) दूध संकलन सरांश</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-xl bg-blue-50/30">
                    <Label className="text-[10px] font-bold text-primary uppercase">गाय</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Input placeholder="Qty" type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-xs" />
                      <Input placeholder="Fat" type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-xs" />
                      <Input placeholder="SNF" type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-amber-50/30">
                    <Label className="text-[10px] font-bold text-amber-700 uppercase">म्हेस</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Input placeholder="Qty" type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-xs" />
                      <Input placeholder="Fat" type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-xs" />
                      <Input placeholder="SNF" type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Package className="h-4 w-4" /> ३) मटेरिअल आणि साहित्य</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddEquipmentRow} className="h-7 text-[9px] font-bold uppercase gap-1 text-primary"><PlusCircle className="h-3 w-3" /> Add Item</Button>
                </div>
                
                <div className="space-y-3">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-muted/10 border relative group">
                      <div className="col-span-6 space-y-1">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground">साहित्याचे नाव</Label>
                        <Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="h-8 text-[10px] bg-white" placeholder="उदा. वजन काटा" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground">Qty</Label>
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] bg-white text-center" />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground">मालकी</Label>
                        <Select value={item.ownership} onValueChange={(v: any) => updateEquipmentItem(item.id, {ownership: v})}>
                          <SelectTrigger className="h-8 text-[9px] bg-white px-1"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self">स्वतःचे</SelectItem><SelectItem value="Company">डेअरी</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  {formData.equipment.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/5 flex flex-col items-center gap-2">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">साहित्य जोडा.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Truck className="h-4 w-4" /> ४) इन्फ्रास्ट्रक्चर व लॉजिस्टिक</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">वजन काटा ब्रँड</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">केमिकल्स साठा</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" placeholder="उदा. OK, Low" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" placeholder="उदा. Good, Poor" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">बर्फाचे प्रमाण</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">पशुखाद्य</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-bold">अतिरिक्त टिप्पणी</Label><Input value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-9 bg-muted/20 border-none text-xs" /></div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">रद्द करा</Button>
            <Button onClick={handleSaveCenter} className="font-bold px-10">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
