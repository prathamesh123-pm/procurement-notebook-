"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Settings2, Plus, Trash2, Save, FileText, ChevronRight, GripVertical, Type, Hash, Calendar, AlignLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { FormDefinition, FormField, FieldType } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FormBuilderPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const formsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'formDefinitions')
  }, [db, user])

  const { data: forms, isLoading } = useCollection<FormDefinition>(formsQuery)
  
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<FormField[]>([])

  useEffect(() => setMounted(true), [])

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: "नवीन रकाना",
      type: 'text',
      required: false
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const handleSaveForm = () => {
    if (!title || fields.length === 0 || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि किमान एक रकाना आवश्यक आहे.", variant: "destructive" })
      return
    }

    const formData = {
      title,
      fields,
      updatedAt: new Date().toISOString()
    }

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'formDefinitions', editingId)
      updateDocumentNonBlocking(docRef, formData)
      toast({ title: "यशस्वी", description: "फॉर्म अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'formDefinitions')
      addDocumentNonBlocking(colRef, { ...formData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "नवीन फॉर्म तयार झाला." })
    }
    resetBuilder()
  }

  const handleDeleteForm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!db || !user || !confirm("तुम्हाला हा फॉर्म कायमचा हटवायचा आहे?")) return
    const docRef = doc(db, 'users', user.uid, 'formDefinitions', id)
    deleteDocumentNonBlocking(docRef)
    if (editingId === id) resetBuilder()
    toast({ title: "यशस्वी", description: "फॉर्म हटवण्यात आला." })
  }

  const resetBuilder = () => {
    setEditingId(null)
    setTitle("")
    setFields([])
  }

  const loadForm = (form: FormDefinition) => {
    setEditingId(form.id)
    setTitle(form.title)
    setFields(form.fields)
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-3 px-1">
        <h2 className="text-xl font-black flex items-center gap-2 text-primary uppercase tracking-tight">
          <Settings2 className="h-6 w-6" /> फॉर्म बिल्डर (FORM BUILDER)
        </h2>
        <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] ml-1">Create Custom Data Entry Forms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Builder Panel */}
        <Card className="lg:col-span-8 border shadow-none bg-white rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">फॉर्मची रचना (DESIGN)</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold">रकाने आणि इनपुट प्रकार निवडा.</CardDescription>
            </div>
            {editingId && <Button variant="ghost" size="sm" onClick={resetBuilder} className="h-7 text-[9px] font-black uppercase">नवीन फॉर्म</Button>}
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">फॉर्मचे नाव (FORM TITLE)</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="h-11 text-[11px] bg-muted/20 border-none font-black rounded-xl p-4 shadow-inner" 
                placeholder="उदा. मशिनरी दुरुस्ती नोंद" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">रकाने (FIELDS)</span>
                <Button size="sm" onClick={addField} className="h-8 text-[9px] font-black uppercase rounded-lg shadow-md"><Plus className="h-3.5 w-3.5 mr-1" /> रकाना जोडा</Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center bg-muted/10 p-3 rounded-2xl border border-muted-foreground/5 group hover:bg-primary/5 transition-all">
                    <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input 
                        value={field.label} 
                        onChange={e => updateField(field.id, { label: e.target.value })} 
                        className="h-9 text-[11px] font-black bg-white border-none rounded-xl" 
                        placeholder="रकान्याचे नाव" 
                      />
                      <Select 
                        value={field.type} 
                        onValueChange={(val: FieldType) => updateField(field.id, { type: val })}
                      >
                        <SelectTrigger className="h-9 text-[11px] font-black bg-white border-none rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text" className="text-[11px] font-black uppercase"><div className="flex items-center gap-2"><Type className="h-3.5 w-3.5" /> मजकूर (Text)</div></SelectItem>
                          <SelectItem value="number" className="text-[11px] font-black uppercase"><div className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> संख्या (Number)</div></SelectItem>
                          <SelectItem value="date" className="text-[11px] font-black uppercase"><div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> तारीख (Date)</div></SelectItem>
                          <SelectItem value="textarea" className="text-[11px] font-black uppercase"><div className="flex items-center gap-2"><AlignLeft className="h-3.5 w-3.5" /> सविस्तर (Textarea)</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed rounded-3xl opacity-30 flex flex-col items-center gap-2">
                    <Plus className="h-8 w-8" />
                    <p className="text-[10px] font-black uppercase">एकही रकाना जोडलेला नाही</p>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSaveForm} className="w-full font-black h-12 shadow-xl shadow-primary/20 rounded-2xl uppercase text-[11px]">
              <Save className="h-4 w-4 mr-2" /> फॉर्म जतन करा (SAVE FORM)
            </Button>
          </CardContent>
        </Card>

        {/* List Panel */}
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-2xl overflow-hidden">
          <div className="bg-muted/10 py-3 px-4 border-b font-black text-[10px] uppercase flex items-center gap-2 tracking-[0.2em]">
            <FileText className="h-4 w-4 opacity-50" /> तुमचे फॉर्म्स (SAVED)
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-3 space-y-2">
              {forms?.map((form) => (
                <div key={form.id} className={`p-3 flex items-center justify-between border shadow-none rounded-2xl cursor-pointer group transition-all ${editingId === form.id ? 'bg-primary/5 border-primary/20' : 'bg-white hover:bg-slate-50 border-muted-foreground/5'}`} onClick={() => loadForm(form)}>
                  <div className="min-w-0">
                    <h4 className="font-black text-[11px] uppercase truncate tracking-tight">{form.title}</h4>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">{form.fields.length} रकाने | {new Date(form.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={(e) => handleDeleteForm(e, form.id)} className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ))}
              {forms?.length === 0 && (
                <div className="text-center py-20 opacity-20 font-black uppercase text-[9px] tracking-widest">फॉर्म्स शून्य</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
