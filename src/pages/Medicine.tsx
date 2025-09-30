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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Plus,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMedicines, type MedicineInsert } from "@/hooks/useMedicines";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Medicine = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedView, setSelectedView] = useState("list");
  const [formData, setFormData] = useState<MedicineInsert>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: null,
    notes: null,
  });

  const { medicines, isLoading, addMedicine, deleteMedicine } = useMedicines();

  const handleSubmit = () => {
    if (!formData.medicine_name || !formData.dosage || !formData.frequency || !formData.start_date) {
      return;
    }
    
    addMedicine(formData);
    setShowAddDialog(false);
    setFormData({
      medicine_name: "",
      dosage: "",
      frequency: "",
      start_date: "",
      end_date: null,
      notes: null,
    });
  };

  const takenDoses = 0;
  const totalDoses = medicines.length;
  const adherencePercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

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
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading medicines...</p>
                </CardContent>
              </Card>
            ) : medicines.length === 0 ? (
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
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                        <TableCell>{medicine.dosage}</TableCell>
                        <TableCell>{medicine.frequency}</TableCell>
                        <TableCell>{new Date(medicine.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{medicine.end_date ? new Date(medicine.end_date).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{medicine.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMedicine(medicine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
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
                <Input
                  id="name"
                  placeholder="e.g., Aspirin"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 500 mg"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  placeholder="e.g., 2 times/day"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Take after food"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
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
