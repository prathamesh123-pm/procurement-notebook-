
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ClipboardCheck, User, Briefcase, FileText, CheckCircle2, Truck, MapPin, Activity, Trash2, Plus, ShieldCheck, Settings, Target, MessageSquare, PhoneCall, Mail, IceCream, Database, AlertTriangle, SearchCode } from "lucide-react"

interface CenterVisit {
  id: string;
  name: string;
  topic: string;
  observation: string;
  suggestion: string;
  objectives: string[];
  compliance: string[];
  complianceRemarks: Record<string, string>;
  mixQty: string;
  mixFat: string;
  mixSnf: string;
  mixTemp: string;
  cowQty: string;
  cowFat: string;
  cowSnf: string;
  cowTemp: string;
  equipment: string[];
  equipmentRemarks: Record<string, string>;
  remark: string;
}

export default function DailyReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeReportType, setActiveReportType] = useState<string>("office")

  const createEmptyVisit = (): CenterVisit => ({
    id: crypto.randomUUID(),
    name: "",
    topic: "",
    observation: "",
    suggestion: "",
    objectives: [],
    compliance: [],
    complianceRemarks: {},
    mixQty: "",
    mixFat: "",
    mixSnf: "",
    mixTemp: "",
    cowQty: "",
    cowFat: "",
    cowSnf: "",
    cowTemp: "",
    equipment: [],
    equipmentRemarks: {},
    remark: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    designation: "",
    mobile: "",
    reportDate: new Date().toISOString().split('T')[0],
    shift: "Sakal",
    officeTasks: [] as string[],
    officeTaskDetail: "",
    meetingPerson: "",
    meetingOrg: "",
    meetingTimeFrom: "",
    meetingTimeTo: "",
    meetingSubject: "",
    meetingDecision: "",
    fieldRoute: "",
    vehicleType: "Company",
    vehicleNumber: "",
    odoStart: "",
    odoEnd: "",
    fieldTimeFrom: "",
    fieldTimeTo: "",
    centerVisits: [createEmptyVisit()] as CenterVisit[],
    achievements: "",
    problems: "",
    actionsTaken: "",
    additionalNotes: "",
    supervisorName: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalKm = (Number(formData.odoEnd) || 0) - (Number(formData.odoStart) || 0);

  const handleCheckboxChange = (field: 'officeTasks', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(t => t !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const updateCenter = (id: string, updates: Partial<CenterVisit>) => {
    setFormData(prev => ({
      ...prev,
      centerVisits: prev.centerVisits.map(v => v.id === id ? { ...v, ...updates } : v)
    }))
  }

  const toggleCenterCheckbox = (id: string, field: 'compliance' | 'equipment' | 'objectives', value: string) => {
    const visit = formData.centerVisits.find(v => v.id === id);
    if (!visit) return;
    const current = visit[field];
    const isSelected = current.includes(value);
    const updated = isSelected ? current.filter(v => v !== value) : [...current, value];
    const remarkField = field === 'compliance' ? 'complianceRemarks' : field === 'equipment' ? 'equipmentRemarks' : null;
    if (remarkField) {
      const updatedRemarks = { ...visit[remarkField] };
      if (isSelected) delete updatedRemarks[value]; else updatedRemarks[value] = "";
      updateCenter(id, { [field]: updated, [remarkField]: updatedRemarks });
    } else {
      updateCenter(id, { [field]: updated });
    }
  }

  const updateOptionRemark = (id: string, field: 'complianceRemarks' | 'equipmentRemarks', option: string, remark: string) => {
    const visit = formData.centerVisits.find(v => v.id === id);
    if (!visit) return;
    updateCenter(id, { [field]: { ...visit[field], [option]: remark } });
  }

  const addCenter = () => {
    setFormData(prev => ({ ...prev, centerVisits: [...prev.centerVisits, createEmptyVisit()] }))
  }

  const removeCenter = (id: string) => {
    if (formData.centerVisits.length <= 1) return;
    setFormData(prev => ({ ...prev, centerVisits: prev.centerVisits.filter(v => v.id !== id) }))
  }

  const handleSave = () => {
    const typeLabel = activeReportType === 'office' ? 'Daily Office Work' : 'Field Visit'
    const reportSummary = `प्रतिनिधी: ${formData.name}. रिपोर्ट प्रकार: ${typeLabel}. कामगिरी: ${formData.achievements}.`
    const newReport = {
      id: crypto.randomUUID(),
      type: typeLabel,
      date: formData.reportDate,
      workItemsCount: activeReportType === 'office' ? formData.officeTasks.length : formData.centerVisits.length,
      interactionsCount: (formData.meetingPerson ? 1 : 0) + formData.centerVisits.length,
      summary: reportSummary,
      fullData: { ...formData, reportType: activeReportType, totalKm }
    }
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    toast({ title: "अहवाल जतन केला", description: `${typeLabel} यशस्वीरित्या सेव्ह झाला आहे.` })
    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-0.5 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-headline font-bold text-foreground tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-5 md:h-6 w-5 md:w-6 text-primary" /> 
          संकलन विभाग - दैनिक कामकाज अहवाल
        </h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Collection Department - Daily Work Report</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden mx-4 md:mx-0">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> १) प्रतिनिधीची मूलभूत माहिती (Basic Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">नाव</Label>
            <Input className="h-8 text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="नाव" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">आयडी</Label>
            <Input className="h-8 text-xs" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} placeholder="ID" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">पदनाम</Label>
            <Input className="h-8 text-xs" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="पद" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">मोबाईल</Label>
            <Input className="h-8 text-xs" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Mobile" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">तारीख</Label>
            <Input className="h-8 text-xs" type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">शिफ्ट</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2 mt-1">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sakal" id="sakal" className="h-3 w-3" />
                <Label htmlFor="sakal" className="text-[10px]">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Sandhya" id="sandhya" className="h-3 w-3" />
                <Label htmlFor="sandhya" className="text-[10px]">संध्या</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeReportType} onValueChange={setActiveReportType} className="w-full px-4 md:px-0">
        <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger value="office" className="rounded-md font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Briefcase className="h-3.5 w-3.5" /> Office Work Report
          </TabsTrigger>
          <TabsTrigger value="field" className="rounded-md font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Truck className="h-3.5 w-3.5" /> Field Visit Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="office" className="space-y-4 mt-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-sm font-bold">भाग अ: ऑफिस वर्क (Office Work)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  { label: "दुग्ध नमुना नोंद तपासणी", icon: Database },
                  { label: "दरपत्रक तपासणी / मंजुरी", icon: FileText },
                  { label: "बिलिंग / पेमेंट मंजुरी", icon: FileText },
                  { label: "संकलन रजिस्टर तपासणी", icon: ClipboardCheck },
                  { label: "MIS रिपोर्ट अपडेट", icon: Activity },
                  { label: "ई-मेल / पत्रव्यवहार", icon: Mail },
                  { label: "कॉल करणे (Calls Made)", icon: PhoneCall },
                  { label: "पत्र पाठवणे (Letters Sent)", icon: Mail },
                  { label: "बर्फ वाढवणे (Ice Increase)", icon: IceCream },
                  { label: "वास दूध नोंदणी (Vas Milk Reg)", icon: AlertTriangle },
                  { label: "नवीन ERP कामकाज (New ERP Work)", icon: Settings },
                  { label: "एक्सपायरी तपासणी (Expiry Check)", icon: AlertTriangle },
                  { label: "इतर रिपोर्ट तयार करणे", icon: FileText }
                ].map((task) => (
                  <div key={task.label} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-muted/30 transition-colors">
                    <Checkbox 
                      id={task.label} 
                      checked={formData.officeTasks.includes(task.label)} 
                      onCheckedChange={() => handleCheckboxChange('officeTasks', task.label)} 
                      className="h-3.5 w-3.5"
                    />
                    <Label htmlFor={task.label} className="text-[10px] cursor-pointer font-semibold flex items-center gap-1.5">
                      <task.icon className="h-3 w-3 text-muted-foreground" />
                      {task.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">केलेल्या कामाचा संक्षिप्त तपशील</Label>
                <Textarea 
                  value={formData.officeTaskDetail} 
                  onChange={e => setFormData({...formData, officeTaskDetail: e.target.value})} 
                  placeholder="कॉल रिपोर्ट, पत्रव्यवहार, ERP मधील नोंदी किंवा इतर कामाचा तपशील येथे लिहा..." 
                  className="min-h-[80px] text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> महत्वाच्या भेटी / बैठका (Meetings)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">व्यक्ती / विभाग</Label>
                  <Input className="h-8 text-xs" value={formData.meetingPerson} onChange={e => setFormData({...formData, meetingPerson: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">पद / संस्था</Label>
                  <Input className="h-8 text-xs" value={formData.meetingOrg} onChange={e => setFormData({...formData, meetingOrg: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase">वेळ पासून</Label>
                    <Input className="h-8 text-xs" type="time" value={formData.meetingTimeFrom} onChange={e => setFormData({...formData, meetingTimeFrom: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase">ते</Label>
                    <Input className="h-8 text-xs" type="time" value={formData.meetingTimeTo} onChange={e => setFormData({...formData, meetingTimeTo: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">विषय</Label>
                  <Input className="h-8 text-xs" value={formData.meetingSubject} onChange={e => setFormData({...formData, meetingSubject: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase">निर्णय / पुढील कार्यवाही</Label>
                <Textarea className="min-h-[60px] text-xs" value={formData.meetingDecision} onChange={e => setFormData({...formData, meetingDecision: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field" className="space-y-4 mt-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-2 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> भाग ब: रूटवारी / फील्ड विसिट (Field Visit)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">आजचा रूट / क्षेत्र</Label>
                  <Input className="h-8 text-xs" value={formData.fieldRoute} onChange={e => setFormData({...formData, fieldRoute: e.target.value})} placeholder="रूटचे नाव" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">वाहन प्रकार</Label>
                  <RadioGroup value={formData.vehicleType} onValueChange={v => setFormData({...formData, vehicleType: v})} className="flex gap-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="Self" id="self-v" className="h-3 w-3" />
                      <Label htmlFor="self-v" className="text-[10px]">स्वतःची</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="Company" id="company-v" className="h-3 w-3" />
                      <Label htmlFor="company-v" className="text-[10px]">कंपनीची</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">वाहन क्रमांक</Label>
                  <Input className="h-8 text-xs" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 12 XX XXXX" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase">वेळ पासून</Label>
                    <Input className="h-8 text-xs" type="time" value={formData.fieldTimeFrom} onChange={e => setFormData({...formData, fieldTimeFrom: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase">ते</Label>
                    <Input className="h-8 text-xs" type="time" value={formData.fieldTimeTo} onChange={e => setFormData({...formData, fieldTimeTo: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">ओडोमीटर सुरुवात (KM)</Label>
                  <Input className="h-8 text-xs" type="number" value={formData.odoStart} onChange={e => setFormData({...formData, odoStart: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">ओडोमीटर शेवट (KM)</Label>
                  <Input className="h-8 text-xs" type="number" value={formData.odoEnd} onChange={e => setFormData({...formData, odoEnd: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase">एकूण (Total KM)</Label>
                  <div className="h-8 px-2 border rounded-md bg-muted/50 font-bold flex items-center text-xs text-primary">
                    {totalKm > 0 ? totalKm : 0} KM
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> केंद्रांची माहिती (Center Visits)
              </h3>
              <Button size="sm" onClick={addCenter} className="h-7 text-[10px] font-bold gap-1 px-3">
                <Plus className="h-3 w-3" /> केंद्राची माहिती जोडा
              </Button>
            </div>

            {formData.centerVisits.map((visit, index) => (
              <Card key={visit.id} className="border border-primary/10 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-1.5 px-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider">भेट {index + 1}: केंद्राची माहिती</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeCenter(visit.id)} className="h-6 w-6 text-destructive" disabled={formData.centerVisits.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase font-bold text-muted-foreground">नाव / केंद्र</Label>
                          <Input value={visit.name} onChange={e => updateCenter(visit.id, { name: e.target.value })} className="h-7 text-xs" placeholder="केंद्राचे नाव" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase font-bold text-muted-foreground">विषय / उद्देश</Label>
                          <Input value={visit.topic} onChange={e => updateCenter(visit.id, { topic: e.target.value })} className="h-7 text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase font-bold text-muted-foreground">निरीक्षण</Label>
                          <Input value={visit.observation} onChange={e => updateCenter(visit.id, { observation: e.target.value })} className="h-7 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase font-bold text-muted-foreground">सूचना</Label>
                          <Input value={visit.suggestion} onChange={e => updateCenter(visit.id, { suggestion: e.target.value })} className="h-7 text-xs" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/10 p-2 rounded-md border border-dashed">
                      <Label className="text-[8px] font-bold text-primary flex items-center gap-1 uppercase mb-1.5">
                        <Target className="h-2.5 w-2.5" /> रूट उद्दिष्ट (Objectives)
                      </Label>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {[
                          "दूध संकलन तपासणी",
                          "उपकरणे / मशीन तपासणी",
                          "तक्रार निराकरण",
                          "शेतकरी / केंद्र चर्चा",
                          "इतर"
                        ].map(obj => (
                          <div key={obj} className="flex items-center space-x-1">
                            <Checkbox id={`obj-${visit.id}-${obj}`} checked={visit.objectives.includes(obj)} onCheckedChange={() => toggleCenterCheckbox(visit.id, 'objectives', obj)} className="h-3 w-3" />
                            <Label htmlFor={`obj-${visit.id}-${obj}`} className="text-[9px] font-medium leading-none">{obj}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="p-2 rounded-md bg-blue-50/40 border border-blue-100">
                      <Label className="text-[8px] font-bold text-blue-700 flex items-center gap-1 uppercase mb-1.5 tracking-wider">
                        <Activity className="h-2.5 w-2.5" /> गुणवत्ता व संकलन
                      </Label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1.5 items-end">
                          <div className="col-span-1 text-[8px] font-bold text-blue-800">Mix Milk:</div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">Qty(L)</Label>
                            <Input value={visit.mixQty} onChange={e => updateCenter(visit.id, { mixQty: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">FAT%</Label>
                            <Input value={visit.mixFat} onChange={e => updateCenter(visit.id, { mixFat: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">SNF%</Label>
                            <Input value={visit.mixSnf} onChange={e => updateCenter(visit.id, { mixSnf: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 items-end">
                          <div className="col-span-1 text-[8px] font-bold text-blue-800">Cow Milk:</div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">Qty(L)</Label>
                            <Input value={visit.cowQty} onChange={e => updateCenter(visit.id, { cowQty: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">FAT%</Label>
                            <Input value={visit.cowFat} onChange={e => updateCenter(visit.id, { cowFat: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                          <div className="space-y-0.5">
                            <Label className="text-[7px]">SNF%</Label>
                            <Input value={visit.cowSnf} onChange={e => updateCenter(visit.id, { cowSnf: e.target.value })} className="h-6 text-[10px] px-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-md bg-green-50/40 border border-green-100">
                      <Label className="text-[8px] font-bold text-green-700 flex items-center gap-1 uppercase mb-1.5 tracking-wider">
                        <ShieldCheck className="h-2.5 w-2.5" /> स्वच्छता व FSSAI
                      </Label>
                      <div className="space-y-1.5">
                        {[ "परिसर स्वच्छता", "भांडी स्वच्छता", "FSSAI डिस्प्ले", "कर्मचारी स्वच्छता" ].map(check => (
                          <div key={check} className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id={`comp-${visit.id}-${check}`} checked={visit.compliance.includes(check)} onCheckedChange={() => toggleCenterCheckbox(visit.id, 'compliance', check)} className="h-3 w-3" />
                              <Label htmlFor={`comp-${visit.id}-${check}`} className="text-[9px] font-bold leading-none">{check}</Label>
                            </div>
                            {visit.compliance.includes(check) && (
                              <Input placeholder="शेरा..." value={visit.complianceRemarks[check] || ""} onChange={(e) => updateOptionRemark(visit.id, 'complianceRemarks', check, e.target.value)} className="h-6 text-[9px] px-1.5 ml-4.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded-md bg-amber-50/40 border border-amber-100">
                      <Label className="text-[8px] font-bold text-amber-700 flex items-center gap-1 uppercase mb-1.5 tracking-wider">
                        <Settings className="h-2.5 w-2.5" /> उपकरण तपासणी
                      </Label>
                      <div className="space-y-1.5">
                        {[ "वजन काटा", "फॅट मशीन", "BMC मशीन", "कॅन कुलर" ].map(eq => (
                          <div key={eq} className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <Checkbox id={`eq-${visit.id}-${eq}`} checked={visit.equipment.includes(eq)} onCheckedChange={() => toggleCenterCheckbox(visit.id, 'equipment', eq)} className="h-3 w-3" />
                              <Label htmlFor={`eq-${visit.id}-${eq}`} className="text-[9px] font-bold leading-none">{eq}</Label>
                            </div>
                            {visit.equipment.includes(eq) && (
                              <Input placeholder="शेरा..." value={visit.equipmentRemarks[eq] || ""} onChange={(e) => updateOptionRemark(visit.id, 'equipmentRemarks', eq, e.target.value)} className="h-6 text-[9px] px-1.5 ml-4.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 border-t pt-2">
                    <Label className="text-[8px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                      <MessageSquare className="h-2.5 w-2.5" /> शेरा / सूचना (Remarks)
                    </Label>
                    <Textarea value={visit.remark} onChange={e => updateCenter(visit.id, { remark: e.target.value })} placeholder="केंद्र चालकास दिलेल्या सूचना किंवा इतर नोंदी लिहा..." className="min-h-[50px] text-[10px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-sm bg-white overflow-hidden mx-4 md:mx-0">
        <CardHeader className="bg-primary/5 border-b py-2 px-4">
          <CardTitle className="text-sm font-bold">भाग क: दिवसाचा सारांश (Day Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-green-600">आजची प्रमुख कामगिरी (Achievements)</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="आज पूर्ण केलेली महत्वाची कामे..." className="min-h-[60px] text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-red-600">आलेल्या समस्या (Problems)</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="काम करताना आलेल्या अडचणी..." className="min-h-[60px] text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-blue-600">केलेली कार्यवाही (Actions Taken)</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} placeholder="समस्यांवर केलेली मात किंवा कार्यवाही..." className="min-h-[60px] text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase">अतिरिक्त नोंदी</Label>
              <Input className="h-8 text-xs" value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} placeholder="इतर माहिती" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase">सुपरवायझरचे नाव</Label>
              <div className="flex gap-2">
                <Input className="h-8 text-xs" value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} placeholder="Supervisor Name" />
                <Button onClick={handleSave} className="h-8 font-bold text-xs gap-1.5 px-6 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" /> रिपोर्ट जतन करा (Save Report)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
