
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ClipboardCheck, Calendar, Clock, User, Briefcase, FileText, CheckCircle2, Truck, MapPin, Activity, ShieldCheck, Camera } from "lucide-react"

export default function DailyReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    designation: "",
    mobile: "",
    reportDate: new Date().toISOString().split('T')[0],
    shift: "Sakal",
    workType: "Office",
    
    // Part A: Office Work
    officeTasks: [] as string[],
    officeTaskDetail: "",
    
    // Section 4: Meetings
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
    totalKm: "",
    fieldTimeFrom: "",
    fieldTimeTo: "",
    fieldObjectives: [] as string[],
    
    visit1: { name: "", topic: "", observation: "", suggestion: "", media: false },
    visit2: { name: "", topic: "", observation: "", suggestion: "", media: false },
    
    qcSnf: "",
    qcFat: "",
    qcTemp: "",
    qcEquipment: [] as string[],
    qcConclusion: "",

    // Part C: Day Summary
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

  const handleCheckboxChange = (field: 'officeTasks' | 'fieldObjectives' | 'qcEquipment', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(t => t !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const handleSave = () => {
    const reportSummary = `
      प्रतिनिधी: ${formData.name} (${formData.idNumber})
      आजचा कामाचा प्रकार: ${formData.workType}
      रूट/क्षेत्र: ${formData.fieldRoute || 'N/A'}
      प्रमुख कामगिरी: ${formData.achievements}
      आलेल्या समस्या: ${formData.problems}
    `

    const newReport = {
      id: crypto.randomUUID(),
      type: formData.workType === 'Office' ? 'Daily Log' : 'Field Visit',
      date: formData.reportDate,
      workItemsCount: formData.officeTasks.length + formData.fieldObjectives.length || 1,
      interactionsCount: (formData.meetingPerson ? 1 : 0) + (formData.visit1.name ? 1 : 0) + (formData.visit2.name ? 1 : 0),
      summary: reportSummary,
      fullData: formData
    }

    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))

    toast({
      title: "अहवाल जतन केला",
      description: "तुमचा दैनिक अहवाल यशस्वीरित्या सेव्ह झाला आहे.",
    })

    router.push('/reports')
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary" /> 
          📝 संकलन विभाग - दैनिक कामकाज अहवाल
        </h2>
        <p className="text-muted-foreground font-medium">Collection Department - Daily Work Report</p>
      </div>

      {/* १) प्रतिनिधीची मूलभूत माहिती */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
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

      {/* २) आजचा कामाचा प्रकार */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> २) आजचा कामाचा प्रकार (Work Type)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RadioGroup value={formData.workType} onValueChange={v => setFormData({...formData, workType: v})} className="flex flex-wrap gap-8">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Office" id="office" />
              <Label htmlFor="office" className="font-bold">ऑफिस वर्क</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Field" id="field" />
              <Label htmlFor="field" className="font-bold">फील्ड विसिट</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Mixed" id="mixed" />
              <Label htmlFor="mixed" className="font-bold">मिश्र</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* भाग अ: ऑफिस वर्क */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold">भाग अ: ऑफिस वर्क (Office Work)</CardTitle>
          <CardDescription>३) ऑफिसमध्ये केलेली प्रमुख कार्ये</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "दुग्ध नमुना नोंद तपासणी",
              "दरपत्रक तपासणी / मंजुरी",
              "बिलिंग / पेमेंट मंजुरी",
              "संकलन रजिस्टर तपासणी",
              "MIS रिपोर्ट अपडेट",
              "ई-मेल / पत्रव्यवहार"
            ].map((task) => (
              <div key={task} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox 
                  id={task} 
                  checked={formData.officeTasks.includes(task)} 
                  onCheckedChange={() => handleCheckboxChange('officeTasks', task)} 
                />
                <Label htmlFor={task} className="text-sm cursor-pointer">{task}</Label>
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

      {/* ४) महत्वाच्या भेटी / बैठका */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> ४) महत्वाच्या भेटी / बैठका (Meetings)
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
                <Label className="text-xs font-bold uppercase">वेळ पर्यंत</Label>
                <Input type="time" value={formData.meetingTimeTo} onChange={e => setFormData({...formData, meetingTimeTo: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">चर्चेचा विषय</Label>
            <Input value={formData.meetingSubject} onChange={e => setFormData({...formData, meetingSubject: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">निर्णय / पुढील कार्यवाही</Label>
            <Textarea value={formData.meetingDecision} onChange={e => setFormData({...formData, meetingDecision: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      {/* भाग ब: रूटवारी / फील्ड विसिट */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> भाग ब: रूटवारी / फील्ड विसिट (Field Visit)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* ५) रूटवारीची माहिती */}
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-md text-primary">५) रूटवारीची माहिती</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">आजचा रूट / क्षेत्र</Label>
                <Input value={formData.fieldRoute} onChange={e => setFormData({...formData, fieldRoute: e.target.value})} placeholder="रूट / क्षेत्र" />
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
                <Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="वाहन क्रमांक" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">ओडोमीटर सुरुवात (KM)</Label>
                <Input type="number" value={formData.odoStart} onChange={e => setFormData({...formData, odoStart: e.target.value})} placeholder="Start KM" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">ओडोमीटर शेवट (KM)</Label>
                <Input type="number" value={formData.odoEnd} onChange={e => setFormData({...formData, odoEnd: e.target.value})} placeholder="End KM" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">एकूण KM</Label>
                <Input type="number" value={formData.totalKm} onChange={e => setFormData({...formData, totalKm: e.target.value})} placeholder="Total KM" />
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

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase">रूट उद्दिष्ट</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "दूध संकलन तपासणी",
                  "उपकरणे / मशीन तपासणी",
                  "तक्रार निराकरण",
                  "शेतकरी / केंद्र चर्चा",
                  "इतर"
                ].map((obj) => (
                  <div key={obj} className="flex items-center space-x-2 border p-2 rounded-lg">
                    <Checkbox 
                      id={`obj-${obj}`} 
                      checked={formData.fieldObjectives.includes(obj)} 
                      onCheckedChange={() => handleCheckboxChange('fieldObjectives', obj)} 
                    />
                    <Label htmlFor={`obj-${obj}`} className="text-xs">{obj}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* ६) भेटी / निरीक्षणे */}
          <div className="space-y-6">
            <h4 className="font-bold flex items-center gap-2 text-md text-primary">६) भेटी / निरीक्षणे</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Visit 1 */}
              <div className="space-y-4 border p-4 rounded-xl bg-muted/10">
                <h5 className="font-bold text-sm border-b pb-2">भेट १</h5>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">नाव / केंद्र</Label>
                    <Input value={formData.visit1.name} onChange={e => setFormData({...formData, visit1: {...formData.visit1, name: e.target.value}})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">चर्चेचा विषय / उद्देश</Label>
                    <Input value={formData.visit1.topic} onChange={e => setFormData({...formData, visit1: {...formData.visit1, topic: e.target.value}})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">निरीक्षण / समस्या</Label>
                    <Textarea value={formData.visit1.observation} onChange={e => setFormData({...formData, visit1: {...formData.visit1, observation: e.target.value}})} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">सूचना / शिफारस</Label>
                    <Textarea value={formData.visit1.suggestion} onChange={e => setFormData({...formData, visit1: {...formData.visit1, suggestion: e.target.value}})} rows={2} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox id="v1-media" checked={formData.visit1.media} onCheckedChange={v => setFormData({...formData, visit1: {...formData.visit1, media: !!v}})} />
                    <Label htmlFor="v1-media" className="text-xs flex items-center gap-1"><Camera className="h-3 w-3" /> फोटो / व्हिडिओ (हो)</Label>
                  </div>
                </div>
              </div>

              {/* Visit 2 */}
              <div className="space-y-4 border p-4 rounded-xl bg-muted/10">
                <h5 className="font-bold text-sm border-b pb-2">भेट २</h5>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">नाव / केंद्र</Label>
                    <Input value={formData.visit2.name} onChange={e => setFormData({...formData, visit2: {...formData.visit2, name: e.target.value}})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">चर्चेचा विषय / उद्देश</Label>
                    <Input value={formData.visit2.topic} onChange={e => setFormData({...formData, visit2: {...formData.visit2, topic: e.target.value}})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">निरीक्षण / समस्या</Label>
                    <Textarea value={formData.visit2.observation} onChange={e => setFormData({...formData, visit2: {...formData.visit2, observation: e.target.value}})} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">सूचना / शिफारस</Label>
                    <Textarea value={formData.visit2.suggestion} onChange={e => setFormData({...formData, visit2: {...formData.visit2, suggestion: e.target.value}})} rows={2} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox id="v2-media" checked={formData.visit2.media} onCheckedChange={v => setFormData({...formData, visit2: {...formData.visit2, media: !!v}})} />
                    <Label htmlFor="v2-media" className="text-xs flex items-center gap-1"><Camera className="h-3 w-3" /> फोटो / व्हिडिओ (हो)</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ७) गुणवत्ता तपासणी */}
          <div className="space-y-6">
            <h4 className="font-bold flex items-center gap-2 text-md text-primary">७) गुणवत्ता तपासणी (Quality Check)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-1"><Activity className="h-3 w-3 text-blue-500" /> SNF (%)</Label>
                <Input type="number" step="0.1" value={formData.qcSnf} onChange={e => setFormData({...formData, qcSnf: e.target.value})} placeholder="SNF %" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-1"><Activity className="h-3 w-3 text-amber-500" /> FAT (%)</Label>
                <Input type="number" step="0.1" value={formData.qcFat} onChange={e => setFormData({...formData, qcFat: e.target.value})} placeholder="FAT %" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-1"><Activity className="h-3 w-3 text-red-500" /> तापमान (°C)</Label>
                <Input type="number" step="0.1" value={formData.qcTemp} onChange={e => setFormData({...formData, qcTemp: e.target.value})} placeholder="Temp °C" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase">उपकरण तपासणी</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "वजन काटा",
                  "फॅट मशीन",
                  "SNF मशीन",
                  "ढक्कन/गंज/साफसफाई"
                ].map((eq) => (
                  <div key={eq} className="flex items-center space-x-2 border p-2 rounded-lg">
                    <Checkbox 
                      id={`eq-${eq}`} 
                      checked={formData.qcEquipment.includes(eq)} 
                      onCheckedChange={() => handleCheckboxChange('qcEquipment', eq)} 
                    />
                    <Label htmlFor={`eq-${eq}`} className="text-xs">{eq}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">निरीक्षण निष्कर्ष</Label>
              <Textarea value={formData.qcConclusion} onChange={e => setFormData({...formData, qcConclusion: e.target.value})} placeholder="गुणवत्ता तपासणी निष्कर्ष..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* भाग क: दिवसाचा सारांश */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold">भाग क: दिवसाचा सारांश (Day Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">९) अतिरिक्त नोंदी</Label>
            <Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      {/* १०) प्रमाणीकरण */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="bg-primary/5 border-b">
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
