
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
import { ClipboardCheck, User, Briefcase, FileText, CheckCircle2, Truck, MapPin, Activity, Trash2, Plus, ShieldCheck, Settings, Target } from "lucide-react"

interface CenterVisit {
  id: string;
  name: string;
  topic: string;
  observation: string;
  suggestion: string;
  objectives: string[];
  compliance: string[];
  mixFat: string;
  mixSnf: string;
  mixTemp: string;
  cowFat: string;
  cowSnf: string;
  cowTemp: string;
  equipment: string[];
}

export default function DailyReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeReportType, setActiveReportType] = useState<string>("office")

  // Initial center visit object
  const createEmptyVisit = (): CenterVisit => ({
    id: crypto.randomUUID(),
    name: "",
    topic: "",
    observation: "",
    suggestion: "",
    objectives: [],
    compliance: [],
    mixFat: "",
    mixSnf: "",
    mixTemp: "",
    cowFat: "",
    cowSnf: "",
    cowTemp: "",
    equipment: []
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    designation: "",
    mobile: "",
    reportDate: new Date().toISOString().split('T')[0],
    shift: "Sakal",
    
    // Part A: Office Work
    officeTasks: [] as string[],
    officeTaskDetail: "",
    
    // Meetings
    meetingPerson: "",
    meetingOrg: "",
    meetingTimeFrom: "",
    meetingTimeTo: "",
    meetingSubject: "",
    meetingDecision: "",
    
    // Part B: Route / Field Visit
    fieldRoute: "",
    vehicleType: "Company",
    vehicleNumber: "",
    odoStart: "",
    odoEnd: "",
    fieldTimeFrom: "",
    fieldTimeTo: "",
    
    // Dynamic Center Visits
    centerVisits: [createEmptyVisit()] as CenterVisit[],

    // Summary
    achievements: "",
    problems: "",
    actionsTaken: "",
    tomorrowFollowUp: "",
    additionalNotes: "",
    supervisorName: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckboxChange = (field: 'officeTasks', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(t => t !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  // Handle Dynamic Center Changes
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
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    updateCenter(id, { [field]: updated });
  }

  const addCenter = () => {
    setFormData(prev => ({
      ...prev,
      centerVisits: [...prev.centerVisits, createEmptyVisit()]
    }))
  }

  const removeCenter = (id: string) => {
    if (formData.centerVisits.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      centerVisits: prev.centerVisits.filter(v => v.id !== id)
    }))
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
      fullData: { ...formData, reportType: activeReportType }
    }

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))

    toast({
      title: "अहवाल जतन केला",
      description: `${typeLabel} यशस्वीरित्या सेव्ह झाला आहे.`,
    })

    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary" /> 
          📝 संकलन विभाग - दैनिक कामकाज अहवाल
        </h2>
        <p className="text-muted-foreground font-medium">Collection Department - Daily Work Report</p>
      </div>

      {/* १) प्रतिनिधीची मूलभूत माहिती */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b py-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> १) प्रतिनिधीची मूलभूत माहिती (Basic Info)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">प्रतिनिधीचे नाव</Label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="प्रतिनिधीचे नाव" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">आयडी क्रमांक</Label>
            <Input value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} placeholder="ID Number" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">पदनाम</Label>
            <Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Designation" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">मोबाईल नंबर</Label>
            <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Mobile Number" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">रिपोर्टची तारीख</Label>
            <Input type="date" value={formData.reportDate} onChange={e => setFormData({...formData, reportDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">शिफ्ट (Shift)</Label>
            <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sakal" id="sakal" />
                <Label htmlFor="sakal">सकाळ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sandhya" id="sandhya" />
                <Label htmlFor="sandhya">संध्या</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* २) अहवाल प्रकार निवड */}
      <Tabs value={activeReportType} onValueChange={setActiveReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="office" className="rounded-lg font-bold text-base gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Briefcase className="h-5 w-5" /> Office Work Report
          </TabsTrigger>
          <TabsTrigger value="field" className="rounded-lg font-bold text-base gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Truck className="h-5 w-5" /> Field Visit Report
          </TabsTrigger>
        </TabsList>

        {/* ऑफिस वर्क फॉर्म */}
        <TabsContent value="office" className="space-y-6 mt-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-lg font-bold">भाग अ: ऑफिस वर्क (Office Work)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "दुग्ध नमुना नोंद तपासणी",
                  "दरपत्रक तपासणी / मंजुरी",
                  "बिलिंग / पेमेंट मंजुरी",
                  "संकलन रजिस्टर तपासणी",
                  "MIS रिपोर्ट अपडेट",
                  "ई-मेल / पत्रव्यवहार"
                ].map((task) => (
                  <div key={task} className="flex items-center space-x-2 border p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <Checkbox 
                      id={task} 
                      checked={formData.officeTasks.includes(task)} 
                      onCheckedChange={() => handleCheckboxChange('officeTasks', task)} 
                    />
                    <Label htmlFor={task} className="text-sm cursor-pointer font-medium">{task}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">केलेल्या कामाचा संक्षिप्त तपशील</Label>
                <Textarea 
                  value={formData.officeTaskDetail} 
                  onChange={e => setFormData({...formData, officeTaskDetail: e.target.value})} 
                  placeholder="तपशील लिहा..." 
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> महत्वाच्या भेटी / बैठका (Meetings)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">व्यक्ती / विभाग</Label>
                  <Input value={formData.meetingPerson} onChange={e => setFormData({...formData, meetingPerson: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">पद / संस्था</Label>
                  <Input value={formData.meetingOrg} onChange={e => setFormData({...formData, meetingOrg: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">वेळ पासून</Label>
                    <Input type="time" value={formData.meetingTimeFrom} onChange={e => setFormData({...formData, meetingTimeFrom: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">ते</Label>
                    <Input type="time" value={formData.meetingTimeTo} onChange={e => setFormData({...formData, meetingTimeTo: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">चर्चेचा विषय</Label>
                  <Input value={formData.meetingSubject} onChange={e => setFormData({...formData, meetingSubject: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">निर्णय / पुढील कार्यवाही</Label>
                <Textarea value={formData.meetingDecision} onChange={e => setFormData({...formData, meetingDecision: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* फील्ड विसिट फॉर्म */}
        <TabsContent value="field" className="space-y-6 mt-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> भाग ब: रूटवारी / फील्ड विसिट (Field Visit)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">आजचा रूट / क्षेत्र</Label>
                  <Input value={formData.fieldRoute} onChange={e => setFormData({...formData, fieldRoute: e.target.value})} placeholder="रूटचे नाव" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">वाहन प्रकार</Label>
                  <RadioGroup value={formData.vehicleType} onValueChange={v => setFormData({...formData, vehicleType: v})} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Self" id="self-v" />
                      <Label htmlFor="self-v">स्वतःची</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Company" id="company-v" />
                      <Label htmlFor="company-v">कंपनीची</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">वाहन क्रमांक</Label>
                  <Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="MH 12 XX XXXX" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">वेळ पासून</Label>
                    <Input type="time" value={formData.fieldTimeFrom} onChange={e => setFormData({...formData, fieldTimeFrom: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">ते</Label>
                    <Input type="time" value={formData.fieldTimeTo} onChange={e => setFormData({...formData, fieldTimeTo: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">ओडोमीटर सुरुवात (KM)</Label>
                  <Input type="number" value={formData.odoStart} onChange={e => setFormData({...formData, odoStart: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">ओडोमीटर शेवट (KM)</Label>
                  <Input type="number" value={formData.odoEnd} onChange={e => setFormData({...formData, odoEnd: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Center Visits */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> केंद्रांची माहिती (Center Visits)
              </h3>
              <button onClick={addCenter} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm shadow-sm hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> केंद्राची माहिती जोडा
              </button>
            </div>

            {formData.centerVisits.map((visit, index) => (
              <Card key={visit.id} className="border border-primary/10 shadow-md bg-white overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-3 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold">भेट {index + 1}: केंद्राची माहिती</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCenter(visit.id)} 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    disabled={formData.centerVisits.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  {/* Basic Visit Info & Objectives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold">नाव / केंद्र</Label>
                          <Input value={visit.name} onChange={e => updateCenter(visit.id, { name: e.target.value })} className="h-9" placeholder="केंद्राचे नाव" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold">चर्चेचा विषय / उद्देश</Label>
                          <Input value={visit.topic} onChange={e => updateCenter(visit.id, { topic: e.target.value })} className="h-9" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold">निरीक्षण / समस्या</Label>
                          <Input value={visit.observation} onChange={e => updateCenter(visit.id, { observation: e.target.value })} className="h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold">सूचना / शिफारस</Label>
                          <Input value={visit.suggestion} onChange={e => updateCenter(visit.id, { suggestion: e.target.value })} className="h-9" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-muted/20 p-3 rounded-lg border">
                      <Label className="text-xs font-bold text-primary flex items-center gap-2">
                        <Target className="h-3.5 w-3.5" /> रूट उद्दिष्ट (Objectives)
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "दूध संकलन तपासणी",
                          "उपकरणे / मशीन तपासणी",
                          "तक्रार निराकरण",
                          "शेतकरी / केंद्र चर्चा",
                          "इतर"
                        ].map(obj => (
                          <div key={obj} className="flex items-center space-x-1.5">
                            <Checkbox 
                              id={`obj-${visit.id}-${obj}`} 
                              checked={visit.objectives.includes(obj)} 
                              onCheckedChange={() => toggleCenterCheckbox(visit.id, 'objectives', obj)} 
                              className="h-3.5 w-3.5"
                            />
                            <Label htmlFor={`obj-${visit.id}-${obj}`} className="text-[10px] font-medium leading-tight">{obj}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Quality Metrics */}
                    <div className="lg:col-span-4 space-y-3 p-3 rounded-lg bg-blue-50/40 border border-blue-100">
                      <Label className="text-[10px] font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Activity className="h-3.5 w-3.5" /> गुणवत्ता तपासणी
                      </Label>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="space-y-1 col-span-2 border-b pb-1 mb-1">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">मिश्र दूध (Mix Milk)</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] font-bold">Avg. FAT (%)</Label>
                          <Input type="number" step="0.1" value={visit.mixFat} onChange={e => updateCenter(visit.id, { mixFat: e.target.value })} className="h-8 px-2" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] font-bold">Avg. SNF (%)</Label>
                          <Input type="number" step="0.1" value={visit.mixSnf} onChange={e => updateCenter(visit.id, { mixSnf: e.target.value })} className="h-8 px-2" />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <Label className="text-[9px] font-bold">Temp (°C)</Label>
                          <Input type="number" step="0.1" value={visit.mixTemp} onChange={e => updateCenter(visit.id, { mixTemp: e.target.value })} className="h-8 px-2" />
                        </div>
                        
                        <div className="space-y-1 col-span-2 border-b pb-1 mt-1 mb-1">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">गाय दूध (Cow Milk)</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] font-bold">Avg. FAT (%)</Label>
                          <Input type="number" step="0.1" value={visit.cowFat} onChange={e => updateCenter(visit.id, { cowFat: e.target.value })} className="h-8 px-2" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] font-bold">Avg. SNF (%)</Label>
                          <Input type="number" step="0.1" value={visit.cowSnf} onChange={e => updateCenter(visit.id, { cowSnf: e.target.value })} className="h-8 px-2" />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <Label className="text-[9px] font-bold">Temp (°C)</Label>
                          <Input type="number" step="0.1" value={visit.cowTemp} onChange={e => updateCenter(visit.id, { cowTemp: e.target.value })} className="h-8 px-2" />
                        </div>
                      </div>
                    </div>

                    {/* FSSAI & Cleanliness */}
                    <div className="lg:col-span-4 space-y-3 p-3 rounded-lg bg-green-50/40 border border-green-100">
                      <Label className="text-[10px] font-bold text-green-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" /> स्वच्छता व FSSAI तपासणी
                      </Label>
                      <div className="grid grid-cols-1 gap-y-2">
                        {[
                          "परिसर स्वच्छता",
                          "भांडी स्वच्छता",
                          "FSSAI डिस्प्ले",
                          "कर्मचारी स्वच्छता",
                          "पाण्याची स्वच्छता"
                        ].map(check => (
                          <div key={check} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`comp-${visit.id}-${check}`} 
                              checked={visit.compliance.includes(check)} 
                              onCheckedChange={() => toggleCenterCheckbox(visit.id, 'compliance', check)} 
                              className="h-3.5 w-3.5"
                            />
                            <Label htmlFor={`comp-${visit.id}-${check}`} className="text-[10px] font-medium leading-tight">{check}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="lg:col-span-4 space-y-3 p-3 rounded-lg bg-amber-50/40 border border-amber-100">
                      <Label className="text-[10px] font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Settings className="h-3.5 w-3.5" /> उपकरण तपासणी
                      </Label>
                      <div className="grid grid-cols-1 gap-y-2">
                        {[
                          "वजन काटा",
                          "फॅट मशीन",
                          "SNF मशीन",
                          "स्वच्छता"
                        ].map(eq => (
                          <div key={eq} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`eq-${visit.id}-${eq}`} 
                              checked={visit.equipment.includes(eq)} 
                              onCheckedChange={() => toggleCenterCheckbox(visit.id, 'equipment', eq)} 
                              className="h-3.5 w-3.5"
                            />
                            <Label htmlFor={`eq-${visit.id}-${eq}`} className="text-[10px] font-medium leading-tight">{eq}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* भाग क: दिवसाचा सारांश */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b py-4">
          <CardTitle className="text-lg font-bold">भाग क: दिवसाचा सारांश (Day Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-green-600">८) आजची प्रमुख कामगिरी (Achievements)</Label>
              <Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="उदा. १. कामगिरी १, २. कामगिरी २" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-red-600">आलेल्या समस्या (Problems)</Label>
              <Textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} placeholder="उदा. १. समस्या १" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-blue-600">केलेली कार्यवाही (Actions Taken)</Label>
              <Textarea value={formData.actionsTaken} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} placeholder="उदा. १. कार्यवाही १" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">उद्याचा Follow-up</Label>
              <Textarea value={formData.tomorrowFollowUp} onChange={e => setFormData({...formData, tomorrowFollowUp: e.target.value})} placeholder="उदा. १. फॉलो-अप १" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">९) अतिरिक्त नोंदी</Label>
            <Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      {/* प्रमाणीकरण */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b py-4">
          <CardTitle className="text-lg font-bold">१०) प्रमाणीकरण (Validation)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">सुपरवायझरचे नाव</Label>
            <Input value={formData.supervisorName} onChange={e => setFormData({...formData, supervisorName: e.target.value})} placeholder="Supervisor Name" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSave} className="w-full h-12 text-lg font-bold gap-2 shadow-lg">
              <CheckCircle2 className="h-5 w-5" /> रिपोर्ट जतन करा (Save Report)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
