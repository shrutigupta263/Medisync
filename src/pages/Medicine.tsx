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
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const Medicine = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedView, setSelectedView] = useState("list");
  const [medicines, setMedicines] = useState<any[]>([]);

  const takenDoses = 0;
  const totalDoses = 0;
  const adherencePercentage = 0;

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
                    <span className="font-semibold">+0%</span>
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
            {medicines.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medicines added yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your first medicine to start tracking
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </CardContent>
              </Card>
            ) : (
              medicines.map((medicine) => (
                <Card key={medicine.id} className="card-hover">
                  {/* Medicine card content */}
                </Card>
              ))
            )}
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
                {medicines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No medicines scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Timeline content */}
                  </div>
                )}
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
