import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  TrendingUp,
  Calendar,
} from "lucide-react";
import mockData from "@/data/mockData.json";
import { toast } from "sonner";

const Medicine = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedView, setSelectedView] = useState("list");

  const handleMarkTaken = (medicineName: string) => {
    toast.success(`Marked ${medicineName} as taken`);
  };

  const handleSnooze = (medicineName: string) => {
    toast.info(`Snoozed reminder for ${medicineName}`);
  };

  const handleMarkMissed = (medicineName: string) => {
    toast.error(`Marked ${medicineName} as missed`);
  };

  // Calculate adherence
  const takenDoses = mockData.doseHistory.filter((d) => d.status === "taken").length;
  const totalDoses = mockData.doseHistory.length;
  const adherencePercentage = Math.round((takenDoses / totalDoses) * 100);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medicine Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medications and track adherence
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </div>

        {/* Adherence Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Adherence Overview</CardTitle>
            <CardDescription>Your medication tracking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Adherence</p>
                  <p className="text-3xl font-bold">{adherencePercentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <div className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">+5%</span>
                  </div>
                </div>
              </div>
              <Progress value={adherencePercentage} className="h-2" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{takenDoses}</p>
                  <p className="text-xs text-muted-foreground">Taken</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-error">
                    {totalDoses - takenDoses}
                  </p>
                  <p className="text-xs text-muted-foreground">Missed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalDoses}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-6">
            {mockData.medicines.map((medicine) => {
              const recentDose = mockData.doseHistory.find(
                (d) => d.medicineId === medicine.id
              );
              const nextDoseTime = medicine.times[0];

              return (
                <Card key={medicine.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                          <Pill className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{medicine.name}</CardTitle>
                          <CardDescription>
                            {medicine.strength} • {medicine.form}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground mt-1">
                            {medicine.notes}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{medicine.recurrence}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Schedule</p>
                        <div className="flex flex-wrap gap-2">
                          {medicine.times.map((time) => (
                            <Badge key={time} variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleMarkTaken(medicine.name)}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSnooze(medicine.name)}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Snooze
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkMissed(medicine.name)}
                          className="text-error hover:bg-error/10 hover:text-error hover:border-error"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Missed
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Timeline</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.medicines.flatMap((medicine) =>
                    medicine.times.map((time) => ({
                      medicine,
                      time,
                    }))
                  )
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(({ medicine, time }, idx) => (
                      <div key={`${medicine.id}-${time}`} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          {idx < mockData.medicines.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-lg">{time}</p>
                            <Badge variant="outline">Upcoming</Badge>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {medicine.strength} • {medicine.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Medicine Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Medicine</DialogTitle>
              <DialogDescription>
                Add a new medicine to your tracking list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input id="name" placeholder="e.g., Aspirin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strength">Strength *</Label>
                  <Input id="strength" placeholder="e.g., 500 mg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form">Form *</Label>
                  <Select>
                    <SelectTrigger id="form">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule *</Label>
                <Input id="schedule" placeholder="e.g., 08:00, 20:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence *</Label>
                <Select>
                  <SelectTrigger id="recurrence">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="e.g., Take after food" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Medicine added successfully");
                  setShowAddDialog(false);
                }}
              >
                Add Medicine
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

export default Medicine;
