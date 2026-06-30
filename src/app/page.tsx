'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Leaf, Camera, Search, Settings, Plus, Droplets, Bug, AlertTriangle,
  CheckCircle2, XCircle, Clock, ChevronRight, Trash2, Edit3, Heart,
  ArrowLeft, FileText, Calendar, Sparkles, Shield, TrendingUp,
  Sun, Flower2, Shovel, Scissors, Beaker, X, Upload, Loader2,
  Info, ChevronDown, ChevronUp, Activity, Stethoscope, BookOpen, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app';
import { AuthDialog } from '@/components/auth-dialog';
import type { Plant, Diagnosis, CareReminder, CareActivity } from '@/types';
import { toast } from 'sonner';

// ============ HEALTH BADGE ============
function HealthBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string; pulse: string; icon: React.ReactNode }> = {
    healthy: { label: 'Healthy', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40', pulse: 'pulse-healthy', icon: <CheckCircle2 className="w-3 h-3" /> },
    warning: { label: 'Warning', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40', pulse: 'pulse-warning', icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { label: 'Critical', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40', pulse: 'pulse-critical', icon: <XCircle className="w-3 h-3" /> },
    unknown: { label: 'New', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', pulse: '', icon: <Leaf className="w-3 h-3" /> },
  };
  const c = config[status] || config.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.color} ${c.bg} ${c.pulse}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ============ CONFIDENCE BAR ============
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-medium text-muted-foreground w-12 text-right">{pct}%</span>
    </div>
  );
}

// ============ ACTIVITY ICON ============
function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    watering: <Droplets className="w-4 h-4 text-blue-500" />,
    fertilizing: <Beaker className="w-4 h-4 text-purple-500" />,
    repotting: <Flower2 className="w-4 h-4 text-orange-500" />,
    pruning: <Scissors className="w-4 h-4 text-green-500" />,
    other: <FileText className="w-4 h-4 text-gray-500" />,
  };
  return <>{icons[type] || icons.other}</>;
}

// ============ BOTTOM NAV ============
function BottomNav() {
  const { currentView, setCurrentView } = useAppStore();
  const items = [
    { id: 'home' as const, icon: Leaf, label: 'My Plants', activeColor: 'text-emerald-400', activeBg: 'bg-emerald-400/15', glow: 'rgba(52,211,153,0.15)' },
    { id: 'diagnose' as const, icon: Stethoscope, label: 'Diagnose', activeColor: 'text-sky-400', activeBg: 'bg-sky-400/15', glow: 'rgba(56,189,248,0.15)' },
    { id: 'guide' as const, icon: BookOpen, label: 'Guide', activeColor: 'text-amber-400', activeBg: 'bg-amber-400/15', glow: 'rgba(251,191,36,0.15)' },
    { id: 'settings' as const, icon: Settings, label: 'Settings', activeColor: 'text-purple-400', activeBg: 'bg-purple-400/15', glow: 'rgba(192,132,252,0.15)' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const active = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-300 min-w-[68px] ${
                active
                  ? `${item.activeColor} ${item.activeBg} scale-105`
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
              style={active ? { boxShadow: `0 0 20px ${item.glow}` } : {}}
            >
              <Icon className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-110 drop-shadow-lg' : ''}`} />
              <span className={`text-[10px] font-medium transition-all duration-300 ${active ? 'font-bold tracking-wide' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============ HOME VIEW ============
function HomeView() {
  const { plants, setPlants, setShowAddPlant, selectPlant, setCurrentView, setCurrentPlant, setReminders, setActivities } = useAppStore();
  const [loading, setLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    try {
      const res = await fetch('/api/plants');
      const data = await res.json();
      setPlants(data.plants || []);
    } catch {
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  }, [setPlants]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  const openPlantDetail = async (plant: Plant) => {
    try {
      const res = await fetch(`/api/plants/${plant.id}`);
      const data = await res.json();
      setCurrentPlant(data.plant);
      setReminders(data.plant.careReminders || []);
      setActivities(data.plant.careActivities || []);
      selectPlant(plant.id);
      setCurrentView('plant-detail');
    } catch {
      toast.error('Failed to load plant details');
    }
  };

  const deletePlant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/plants/${id}`, { method: 'DELETE' });
      toast.success('Plant removed');
      fetchPlants();
    } catch {
      toast.error('Failed to delete plant');
    }
  };

  const isOverdue = (nextDue: string | null) => {
    if (!nextDue) return false;
    return new Date(nextDue) < new Date();
  };

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" /> Orion PlantWise
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your smart plant health companion</p>
        </div>
        <Button
          onClick={() => setShowAddPlant(true)}
          size="sm"
          className="rounded-full gap-1.5 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Plants', value: plants.length, icon: Flower2, color: 'text-primary' },
          { label: 'Warnings', value: plants.filter(p => p.healthStatus === 'warning').length, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Critical', value: plants.filter(p => p.healthStatus === 'critical').length, icon: XCircle, color: 'text-red-500' },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 border-none bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-garden h-40 rounded-2xl" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl garden-card-glow p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute top-6 left-8 w-12 h-12 text-emerald-400/30 leaf-float" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8-2 8-6.5 0-2-.92-3.69-2.5-5.5C13 10 12 12 10 14c1.5-1.5 2-3.5 2-5.5C12 4.5 9 2 5 2c0 0 6 1 12 6 0 0-2-1.5-4-2.5C12.5 5.5 14 7 14 9c0 3-2 5-4 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 0 4-4 6-8 6-5 0-9-3-9-8 0-4 2-7 6-9z"/>
            </svg>
            <svg className="absolute top-10 right-10 w-10 h-10 text-pink-400/25 flower-float" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '1.5s' }}>
              <path d="M12 2C9 2 7 4 7 7c0 1.5.5 2.8 1.5 3.8C7.5 11.5 6 13 6 15c0 1.5.8 2.8 2 3.5-1.2.7-2 2-2 3.5 0 2 2 4 4 4s4-2 4-4c0-1.5-.8-2.8-2-3.5 1.2-.7 2-2 2-3.5 0-2-1.5-3.5-2.5-4.2.8-.8 1.5-2 1.5-3.8 0-3-2-5-5-5z"/>
            </svg>
            <svg className="absolute bottom-20 left-12 w-8 h-8 text-amber-400/25 leaf-float" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '3s' }}>
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8-2 8-6.5 0-2-.92-3.69-2.5-5.5C13 10 12 12 10 14c1.5-1.5 2-3.5 2-5.5C12 4.5 9 2 5 2c0 0 6 1 12 6 0 0-2-1.5-4-2.5C12.5 5.5 14 7 14 9c0 3-2 5-4 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 0 4-4 6-8 6-5 0-9-3-9-8 0-4 2-7 6-9z"/>
            </svg>
            <svg className="absolute bottom-32 right-16 w-9 h-9 text-emerald-400/20 flower-float" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '4.5s' }}>
              <path d="M12 2C9 2 7 4 7 7c0 1.5.5 2.8 1.5 3.8C7.5 11.5 6 13 6 15c0 1.5.8 2.8 2 3.5-1.2.7-2 2-2 3.5 0 2 2 4 4 4s4-2 4-4c0-1.5-.8-2.8-2-3.5 1.2-.7 2-2 2-3.5 0-2-1.5-3.5-2.5-4.2.8-.8 1.5-2 1.5-3.8 0-3-2-5-5-5z"/>
            </svg>
          </div>
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full garden-cta flex items-center justify-center pulse-glow">
              <Leaf className="w-10 h-10 text-black/80" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to Your Garden</h3>
            <p className="text-sm text-muted-foreground/80 mb-6 max-w-xs mx-auto">
              Add your first plant and let AI help you nurture a thriving indoor jungle.
            </p>
            <Button onClick={() => setShowAddPlant(true)} className="rounded-full gap-2 garden-cta text-black/80 font-bold px-8 py-5 text-base shadow-lg">
              <Plus className="w-5 h-5" /> Plant Your First Seed
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {plants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group border-border/50 h-40"
                  onClick={() => openPlantDetail(plant)}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                        {plant.species?.includes('Monstera') ? '🪴' :
                         plant.species?.includes('Fern') ? '🌿' :
                         plant.species?.includes('Succulent') || plant.species?.includes('Cactus') ? '🌵' :
                         plant.species?.includes('Orchid') ? '🌸' :
                         plant.species?.includes('Rose') ? '🌹' :
                         plant.species?.includes('Tomato') ? '🍅' :
                         plant.species?.includes('Basil') || plant.species?.includes('Mint') ? '🌱' :
                         plant.healthStatus === 'critical' ? '🥀' :
                         plant.healthStatus === 'warning' ? '🍃' : '🌱'}
                      </div>
                      <HealthBadge status={plant.healthStatus} />
                    </div>
                    <div className="mt-3 flex-1 min-h-0">
                      <h3 className="font-semibold text-sm truncate">{plant.name}</h3>
                      {plant.species && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{plant.species}</p>
                      )}
                      {plant.location && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                          <Sun className="w-3 h-3" /> {plant.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {plant._count.diagnoses} scans
                      </span>
                      {plant.careReminders[0]?.nextDue && isOverdue(plant.careReminders[0].nextDue) && (
                        <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
                          <Clock className="w-2.5 h-2.5 mr-0.5" /> Overdue
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={(e) => deletePlant(plant.id, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============ DIAGNOSE VIEW ============
function DiagnoseView() {
  const { isDiagnosing, setIsDiagnosing, currentDiagnosis, setCurrentDiagnosis, plants, diagnosisPreview, setDiagnosisPreview } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setDiagnosisPreview(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setDiagnosisPreview(url);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsDiagnosing(true);
    setCurrentDiagnosis(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (selectedPlantId) formData.append('plantId', selectedPlantId);

    try {
      const res = await fetch('/api/diagnose', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setCurrentDiagnosis(data.diagnosis);
        toast.success('Diagnosis complete!');
      }
    } catch {
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const resetDiagnosis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDiagnosisPreview(null);
    setCurrentDiagnosis(null);
  };

  const parsedIssues = currentDiagnosis?.issues ? (typeof currentDiagnosis.issues === 'string' ? JSON.parse(currentDiagnosis.issues) : currentDiagnosis.issues) : [];

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-primary" /> AI Diagnosis
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Take a photo or upload an image for instant plant health analysis
        </p>
      </div>

      {!currentDiagnosis ? (
        <>
          {/* Plant selector */}
          {plants.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-1.5 block">Link to Plant (optional)</Label>
              <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a plant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No plant (scan only)</SelectItem>
                  {plants.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} {p.species ? `(${p.species})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-muted-foreground">Tap to change image</p>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Take a Photo or Upload</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag & drop or tap to select an image
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Camera</span>
                  <span className="flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Upload</span>
                </div>
              </div>
            )}
          </div>

          {/* Diagnose button */}
          <Button
            onClick={handleDiagnose}
            disabled={!selectedFile || isDiagnosing}
            className="w-full mt-6 py-6 rounded-xl text-base font-semibold gap-2 shadow-lg shadow-primary/20"
            size="lg"
          >
            {isDiagnosing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Diagnose Plant
              </>
            )}
          </Button>

          {isDiagnosing && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">AI Analysis in Progress</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Uploading image...
                </p>
                <p className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing with Vision AI...
                </p>
                <p className="flex items-center gap-2 text-muted-foreground/50">
                  <Clock className="w-3 h-3" /> Searching plant pathology databases...
                </p>
                <p className="flex items-center gap-2 text-muted-foreground/50">
                  <Clock className="w-3 h-3" /> Generating treatment plan...
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Diagnosis Results */
        <div className="space-y-4">
          <Button variant="ghost" onClick={resetDiagnosis} className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" /> New Diagnosis
          </Button>

          {/* Species & Confidence */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  {currentDiagnosis.vlmRaw?.overallHealth === 'healthy' ? '🌿' :
                   currentDiagnosis.vlmRaw?.overallHealth === 'critical' ? '🥀' : '🍃'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg truncate">
                    {currentDiagnosis.species || 'Unknown Plant'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentDiagnosis.vlmRaw?.leafDetails || 'Plant analysis complete'}
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health</span>
                <HealthBadge status={currentDiagnosis.vlmRaw?.overallHealth || 'unknown'} />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Confidence</div>
                <ConfidenceBar value={currentDiagnosis.confidence} />
              </div>
              {currentDiagnosis.vlmRaw?.speciesConfidence && (
                <div>
                  <div className="text-sm font-medium mb-1">Species ID Confidence</div>
                  <ConfidenceBar value={currentDiagnosis.vlmRaw.speciesConfidence} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues Found */}
          {parsedIssues.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Issues Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedIssues.map((issue: { name: string; severity: string; description: string; causes: string }, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{issue.name}</span>
                      <Badge variant={issue.severity === 'severe' ? 'destructive' : issue.severity === 'moderate' ? 'default' : 'secondary'} className="text-[10px]">
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    {issue.causes && (
                      <p className="text-xs text-muted-foreground/70 italic">Causes: {issue.causes}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {currentDiagnosis.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Diagnosis Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-line">{currentDiagnosis.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Fix Recommendations */}
          {currentDiagnosis.fixes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" /> Treatment Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{currentDiagnosis.fixes}</ReactMarkdown>
              </CardContent>
            </Card>
          )}

          {/* Species Info */}
          {currentDiagnosis.speciesInfo && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Species Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{currentDiagnosis.speciesInfo}</ReactMarkdown>
              </CardContent>
            </Card>
          )}

          {/* RAG Sources */}
          {currentDiagnosis.ragContext && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Enhanced with external plant pathology data</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ============ GUIDE VIEW ============
function GuideView() {
  const { guideResult, setGuideResult, isSearchingGuide, setIsSearchingGuide } = useAppStore();
  const [query, setQuery] = useState('');
  const [popularSearches] = useState([
    'Monstera deliciosa', 'Snake plant care', 'Fiddle leaf fig',
    'Pothos yellow leaves', 'Succulent watering', 'Peace lily brown tips',
    'Rubber plant', 'Aloe vera care'
  ]);

  const searchGuide = async (searchQuery: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearchingGuide(true);
    setGuideResult(null);
    setQuery(q);

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setGuideResult(data.result);
    } catch {
      toast.error('Failed to search plant guide');
    } finally {
      setIsSearchingGuide(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" /> Plant Guide
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search and learn about any plant species
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchGuide()}
            placeholder="Search any plant species..."
            className="pl-10 rounded-xl h-11"
          />
        </div>
        <Button
          onClick={() => searchGuide()}
          disabled={isSearchingGuide || !query.trim()}
          className="rounded-xl px-4 h-11"
        >
          {isSearchingGuide ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {isSearchingGuide ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <div className="h-6" />
          <Skeleton className="h-6 w-1/2 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
      ) : guideResult ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-sm max-w-none dark:prose-invert
            prose-headings:text-foreground prose-headings:font-bold
            prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-2 prose-h2:flex prose-h2:items-center prose-h2:gap-2
            prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-ul:my-2 prose-ol:my-2
            prose-hr:border-border
            [&_h2]:scroll-mt-4"
        >
          <ReactMarkdown>{guideResult}</ReactMarkdown>
        </motion.div>
      ) : (
        <>
          {/* Popular Searches */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => searchGuide(term)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-sm text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Guide Info Card */}
          <Card className="mt-6 bg-gradient-to-br from-primary/5 to-primary/0">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI-Powered Plant Encyclopedia</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our guide uses AI to search and compile the most relevant plant care information
                    from botanical databases, providing you with accurate, up-to-date care instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ============ SETTINGS VIEW ============
function SettingsView() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customise your PlantWise experience
        </p>
      </div>

      {/* Appearance */}
      <Card className="garden-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <Sun className="w-4 h-4" /> Appearance
          </CardTitle>
        </div>
        <CardContent className="p-4 pt-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Deep garden theme at night</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={(c) => {
                document.documentElement.classList.toggle('dark', c);
                setTheme(c ? 'dark' : 'light');
              }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="garden-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <Bell className="w-4 h-4" /> Notifications
          </CardTitle>
        </div>
        <CardContent className="p-4 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Watering Reminders</p>
              <p className="text-xs text-muted-foreground">Get reminded when plants need water</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Care Tips</p>
              <p className="text-xs text-muted-foreground">Weekly plant care suggestions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card className="garden-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <Droplets className="w-4 h-4" /> Units
          </CardTitle>
        </div>
        <CardContent className="p-4 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-xs text-muted-foreground">Display temperature in Celsius</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/5 rounded-lg p-0.5">
              <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary font-medium">°C</span>
              <span className="px-2.5 py-1 rounded-md text-muted-foreground">°F</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="garden-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <Leaf className="w-4 h-4" /> About
          </CardTitle>
        </div>
        <CardContent className="p-4 pt-3 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full garden-cta flex items-center justify-center pulse-glow">
            <Leaf className="w-8 h-8 text-black/80" />
          </div>
          <h3 className="font-semibold text-lg">Orion PlantWise</h3>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
          <p className="text-xs text-muted-foreground/70 mt-3 leading-relaxed max-w-xs mx-auto">
            AI-powered plant health companion. Diagnose diseases, track care, and nurture your garden.
          </p>
          <p className="text-[11px] text-muted-foreground/50 mt-4">
            Powered by Cloudflare Workers AI
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ PLANT DETAIL VIEW ============
function PlantDetailView() {
  const {
    currentPlant, setCurrentPlant, setCurrentView, selectPlant,
    reminders, setReminders, activities, setActivities,
    showLogActivity, setShowLogActivity, showAddReminder, setShowAddReminder
  } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchPlantData = useCallback(async (plantId: string) => {
    if (!plantId) return;
    try {
      const res = await fetch(`/api/plants/${plantId}`);
      const data = await res.json();
      setCurrentPlant(data.plant);
      setReminders(data.plant.careReminders || []);
      setActivities(data.plant.careActivities || []);
    } catch {
      toast.error('Failed to refresh plant data');
    }
  }, [setCurrentPlant, setReminders, setActivities]);

  const deletePlant = async () => {
    if (!currentPlant?.id) return;
    try {
      await fetch(`/api/plants/${currentPlant.id}`, { method: 'DELETE' });
      toast.success('Plant deleted');
      setCurrentPlant(null);
      selectPlant(null);
      setCurrentView('home');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const markReminderDone = async (reminder: CareReminder) => {
    try {
      await fetch(`/api/plants/${currentPlant!.id}/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markDone: true }),
      });
      toast.success(`${reminder.type} marked as done`);
      fetchPlantData(currentPlant!.id);
    } catch {
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`/api/plants/${currentPlant!.id}/reminders/${id}`, { method: 'DELETE' });
      toast.success('Reminder deleted');
      fetchPlantData(currentPlant!.id);
    } catch {
      toast.error('Failed to delete reminder');
    }
  };

  const isOverdue = (nextDue: string | null) => {
    if (!nextDue) return false;
    return new Date(nextDue) < new Date();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const frequencyLabel = (f: string) => {
    const map: Record<string, string> = {
      daily: 'Every day', every_2_days: 'Every 2 days', every_3_days: 'Every 3 days',
      weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly',
    };
    return map[f] || f;
  };

  if (!currentPlant) {
    setCurrentView('home');
    return null;
  }

  const parsedDiagnoses = currentPlant.diagnoses?.map((d: Diagnosis) => ({
    ...d,
    parsedIssues: typeof d.issues === 'string' ? JSON.parse(d.issues) : d.issues,
  })) || [];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => { setCurrentView('home'); selectPlant(null); }} className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Plant Hero */}
      <div className="px-4 pt-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-primary/10">
            {currentPlant.species?.includes('Monstera') ? '🪴' :
             currentPlant.species?.includes('Fern') ? '🌿' :
             currentPlant.species?.includes('Succulent') || currentPlant.species?.includes('Cactus') ? '🌵' :
             currentPlant.species?.includes('Orchid') ? '🌸' :
             currentPlant.species?.includes('Rose') ? '🌹' :
             currentPlant.healthStatus === 'critical' ? '🥀' : '🌱'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{currentPlant.name}</h1>
            {currentPlant.species && (
              <p className="text-sm text-muted-foreground italic">{currentPlant.species}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <HealthBadge status={currentPlant.healthStatus} />
              {currentPlant.location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sun className="w-3 h-3" /> {currentPlant.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {currentPlant.notes && (
          <Card className="mb-4 bg-muted/30">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">{currentPlant.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full grid grid-cols-4 h-10 mb-4">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs relative">
            Reminders
            {reminders.some(r => r.enabled && isOverdue(r.nextDue)) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 rounded-xl"
              onClick={() => setShowLogActivity(true)}
            >
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-xs">Log Watering</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 rounded-xl"
              onClick={() => setShowLogActivity(true)}
            >
              <Beaker className="w-5 h-5 text-purple-500" />
              <span className="text-xs">Log Fertilizing</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 rounded-xl"
              onClick={() => setShowLogActivity(true)}
            >
              <Shovel className="w-5 h-5 text-orange-500" />
              <span className="text-xs">Log Repotting</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1 rounded-xl"
              onClick={() => setShowAddReminder(true)}
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-xs">Set Reminder</span>
            </Button>
          </div>

          {/* Recent Diagnoses */}
          {parsedDiagnoses.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Latest Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{parsedDiagnoses[0].species || 'Unknown'}</span>
                    <HealthBadge status={currentPlant.healthStatus} />
                  </div>
                  <ConfidenceBar value={parsedDiagnoses[0].confidence} />
                  <p className="text-xs text-muted-foreground line-clamp-2">{parsedDiagnoses[0].description}</p>
                  <p className="text-[10px] text-muted-foreground/60">{formatDate(parsedDiagnoses[0].createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Reminders */}
          {reminders.filter(r => r.enabled).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Upcoming Care
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reminders.filter(r => r.enabled).slice(0, 3).map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2.5">
                      <ActivityIcon type={reminder.type} />
                      <div>
                        <p className="text-sm font-medium capitalize">{reminder.type}</p>
                        <p className="text-[10px] text-muted-foreground">{frequencyLabel(reminder.frequency)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {reminder.nextDue && (
                        <Badge variant={isOverdue(reminder.nextDue) ? 'destructive' : 'secondary'} className="text-[10px]">
                          {isOverdue(reminder.nextDue) ? 'Overdue' : new Date(reminder.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                      )}
                      <Button
                        variant="ghost" size="sm"
                        className="h-6 px-2 text-[10px] mt-0.5"
                        onClick={() => markReminderDone(reminder)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {parsedDiagnoses.length === 0 ? (
            <Card className="p-6 text-center">
              <Stethoscope className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No diagnoses yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Go to the Diagnose tab and scan this plant</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {parsedDiagnoses.map((diag: Diagnosis & { parsedIssues: Array<{ name: string; severity: string }> }) => (
                <Card key={diag.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{diag.species || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(diag.createdAt)}</p>
                      </div>
                      <ConfidenceBar value={diag.confidence} />
                    </div>
                    {diag.parsedIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {diag.parsedIssues.map((issue: { name: string; severity: string }, i: number) => (
                          <Badge key={i} variant={issue.severity === 'severe' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {issue.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-3">{diag.description}</p>
                    {diag.fixes && (
                      <details className="group">
                        <summary className="text-xs text-primary cursor-pointer flex items-center gap-1 hover:underline">
                          View treatment plan
                          <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="mt-2 text-xs text-muted-foreground prose prose-xs max-w-none dark:prose-invert">
                          <ReactMarkdown>{diag.fixes}</ReactMarkdown>
                        </div>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Care Schedule</h3>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7 rounded-lg" onClick={() => setShowAddReminder(true)}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {reminders.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No reminders set</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Set watering and fertilizing schedules</p>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {reminders.map(reminder => (
                <Card key={reminder.id} className={`transition-opacity ${!reminder.enabled ? 'opacity-50' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ActivityIcon type={reminder.type} />
                        <div>
                          <p className="text-sm font-medium capitalize">{reminder.type}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {frequencyLabel(reminder.frequency)}
                            {reminder.lastDone && ` · Last: ${new Date(reminder.lastDue || reminder.lastDone).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {reminder.nextDue && (
                          <Badge variant={isOverdue(reminder.nextDue) ? 'destructive' : 'outline'} className="text-[10px] mr-1">
                            {isOverdue(reminder.nextDue) ? 'Overdue!' : `Due: ${new Date(reminder.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </Badge>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteReminder(reminder.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      <Button size="sm" className="h-7 text-xs rounded-lg flex-1" onClick={() => markReminderDone(reminder)}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Done
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Care Activity Log</h3>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7 rounded-lg" onClick={() => setShowLogActivity(true)}>
              <Plus className="w-3 h-3" /> Log Activity
            </Button>
          </div>
          {activities.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activities logged</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Track your plant care routine here</p>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {activities.map(activity => (
                <Card key={activity.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <ActivityIcon type={activity.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{activity.type}</p>
                      {activity.notes && <p className="text-xs text-muted-foreground truncate">{activity.notes}</p>}
                      <p className="text-[10px] text-muted-foreground/60">{formatDate(activity.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plant?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{currentPlant.name}&rdquo; and all its diagnosis history, reminders, and activity logs. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={deletePlant}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <LogActivityDialog />
      {/* Add Reminder Dialog */}
      <AddReminderDialog />
    </div>
  );
}

// ============ LOG ACTIVITY DIALOG ============
function LogActivityDialog() {
  const { showLogActivity, setShowLogActivity, currentPlant, setActivities, activities } = useAppStore();
  const [type, setType] = useState('watering');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPlant?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/plants/${currentPlant.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, notes: notes || null }),
      });
      const data = await res.json();
      if (data.activity) {
        setActivities([data.activity, ...activities]);
        toast.success(`${type} logged successfully`);
        setType('watering');
        setNotes('');
        setShowLogActivity(false);
      }
    } catch {
      toast.error('Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showLogActivity} onOpenChange={setShowLogActivity}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Care Activity</DialogTitle>
          <DialogDescription>Record a care activity for {currentPlant?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Activity Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="watering">💧 Watering</SelectItem>
                <SelectItem value="fertilizing">🧪 Fertilizing</SelectItem>
                <SelectItem value="repotting">🪴 Repotting</SelectItem>
                <SelectItem value="pruning">✂️ Pruning</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations or details..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Log Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ADD REMINDER DIALOG ============
function AddReminderDialog() {
  const { showAddReminder, setShowAddReminder, currentPlant, setReminders, reminders } = useAppStore();
  const [type, setType] = useState('watering');
  const [frequency, setFrequency] = useState('weekly');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPlant?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/plants/${currentPlant.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, frequency, notes: notes || null }),
      });
      const data = await res.json();
      if (data.reminder) {
        setReminders([...reminders, data.reminder]);
        toast.success('Reminder created');
        setType('watering');
        setFrequency('weekly');
        setNotes('');
        setShowAddReminder(false);
      }
    } catch {
      toast.error('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Care Reminder</DialogTitle>
          <DialogDescription>Create a care schedule for {currentPlant?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reminder Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="watering">💧 Watering</SelectItem>
                <SelectItem value="fertilizing">🧪 Fertilizing</SelectItem>
                <SelectItem value="repotting">🪴 Repotting</SelectItem>
                <SelectItem value="pruning">✂️ Pruning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="every_2_days">Every 2 days</SelectItem>
                <SelectItem value="every_3_days">Every 3 days</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Use filtered water, half-strength fertilizer..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ADD PLANT DIALOG ============
function AddPlantDialog() {
  const { showAddPlant, setShowAddPlant, plants, setPlants } = useAppStore();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Plant name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          species: species.trim() || null,
          location: location.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.plant) {
        setPlants([data.plant, ...plants]);
        toast.success(`${name} added to your collection!`);
        setName(''); setSpecies(''); setLocation(''); setNotes('');
        setShowAddPlant(false);
      }
    } catch {
      toast.error('Failed to add plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAddPlant} onOpenChange={setShowAddPlant}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" /> Add New Plant
          </DialogTitle>
          <DialogDescription>Add a plant to start tracking its health</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plant Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Monstera" />
          </div>
          <div className="space-y-1.5">
            <Label>Species (optional)</Label>
            <Input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g., Monstera deliciosa" />
          </div>
          <div className="space-y-1.5">
            <Label>Location (optional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Living room, Balcony" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add Plant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ MAIN PAGE ============
export default function HomePage() {
  const { currentView, checkAuth, isAuthLoading, user } = useAppStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-lg mx-auto garden-glow gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 shadow-lg shadow-emerald-500/20">
          <Leaf size={32} className="text-white" />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
        </div>
        <p className="text-sm text-white/40">Loading your garden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative garden-glow">
      <AuthDialog />
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="absolute -top-20 -left-20 w-64 h-64 text-emerald-500/3 rotate-45" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8-2 8-6.5 0-2-.92-3.69-2.5-5.5C13 10 12 12 10 14c1.5-1.5 2-3.5 2-5.5C12 4.5 9 2 5 2c0 0 6 1 12 6 0 0-2-1.5-4-2.5C12.5 5.5 14 7 14 9c0 3-2 5-4 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 0 4-4 6-8 6-5 0-9-3-9-8 0-4 2-7 6-9z"/>
        </svg>
        <svg className="absolute top-1/3 -right-16 w-48 h-48 text-pink-500/3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9 2 7 4 7 7c0 1.5.5 2.8 1.5 3.8C7.5 11.5 6 13 6 15c0 1.5.8 2.8 2 3.5-1.2.7-2 2-2 3.5 0 2 2 4 4 4s4-2 4-4c0-1.5-.8-2.8-2-3.5 1.2-.7 2-2 2-3.5 0-2-1.5-3.5-2.5-4.2.8-.8 1.5-2 1.5-3.8 0-3-2-5-5-5z"/>
        </svg>
        <svg className="absolute bottom-1/4 -left-12 w-40 h-40 text-amber-500/3 rotate-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8-2 8-6.5 0-2-.92-3.69-2.5-5.5C13 10 12 12 10 14c1.5-1.5 2-3.5 2-5.5C12 4.5 9 2 5 2c0 0 6 1 12 6 0 0-2-1.5-4-2.5C12.5 5.5 14 7 14 9c0 3-2 5-4 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 1 1 2 2 2 4 0 3-3 5-5 5 2 0 4-1 5-2 0 4-4 6-8 6-5 0-9-3-9-8 0-4 2-7 6-9z"/>
        </svg>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-emerald-500/3 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-amber-500/3 blur-3xl" />
      </div>
      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: currentView === 'plant-detail' ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentView === 'plant-detail' ? -20 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'home' && <HomeView />}
            {currentView === 'diagnose' && <DiagnoseView />}
            {currentView === 'guide' && <GuideView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'plant-detail' && <PlantDetailView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Global Dialogs */}
      <AddPlantDialog />

      {/* Footer */}
      <footer className="fixed bottom-16 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-[10px] text-center text-muted-foreground/40 pb-2">
            PlantWise AI — Smart Plant Health Companion
          </p>
        </div>
      </footer>
    </div>
  );
}