import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Plus,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { useMedicines, CreateMedicineData } from "@/hooks/useMedicines";
import { useMedicineTracking } from "@/hooks/useMedicineTracking";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const Medicine = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedView, setSelectedView] = useState("list");
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
  
  const { medicines, isLoading, createMedicine, updateMedicine, deleteMedicine, isCreating } = useMedicines();
  const { getStatus, markStatus, isUpdating, trackingData } = useMedicineTracking();
  
  const [formData, setFormData] = useState<CreateMedicineData>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: null,
    notes: null,
  });

  // Calculate adherence based on actual tracking data
  const takenDoses = trackingData.filter(t => t.status === "taken").length;
  const missedDoses = trackingData.filter(t => t.status === "missed").length;
  const totalDoses = medicines.length;
  const trackedTotal = takenDoses + missedDoses;
  const adherencePercentage = trackedTotal > 0 ? Math.round((takenDoses / trackedTotal) * 100) : 0;

  const handleSubmit = () => {
    if (!formData.medicine_name || !formData.dosage || !formData.frequency || !formData.start_date) {
      return;
    }

    if (editingMedicine) {
      updateMedicine({
        id: editingMedicine,
        updates: formData,
      });
      setShowEditDialog(false);
      setEditingMedicine(null);
    } else {
      createMedicine(formData);
      setShowAddDialog(false);
    }
    
    setFormData({
      medicine_name: "",
      dosage: "",
      frequency: "",
      start_date: "",
      end_date: null,
      notes: null,
    });
  };

  const handleEdit = (medicine: any) => {
    setEditingMedicine(medicine.id);
    setFormData({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      start_date: medicine.start_date,
      end_date: medicine.end_date,
      notes: medicine.notes,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      deleteMedicine(id);
    }
  };

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
                  <p className="text-2xl font-bold text-error">{missedDoses}</p>
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
                <CardContent className="py-12 text-center">
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
                <CardHeader>
                  <CardTitle>Your Medicines</CardTitle>
                  <CardDescription>Manage all your medications in one place</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Today's Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicines.map((medicine) => {
                        const status = getStatus(medicine.id);
                        return (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                            <TableCell>{medicine.dosage}</TableCell>
                            <TableCell>{medicine.frequency}</TableCell>
                            <TableCell>{format(new Date(medicine.start_date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              {medicine.end_date ? format(new Date(medicine.end_date), "MMM dd, yyyy") : "Ongoing"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {status === "taken" ? (
                                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                    <Check className="h-3 w-3 mr-1" />
                                    Taken
                                  </Badge>
                                ) : status === "missed" ? (
                                  <Badge variant="destructive">
                                    <X className="h-3 w-3 mr-1" />
                                    Missed
                                  </Badge>
                                ) : (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                      onClick={() => markStatus({ medicineId: medicine.id, status: "taken" })}
                                      disabled={isUpdating}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Taken
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-red-500 text-red-600 hover:bg-red-50"
                                      onClick={() => markStatus({ medicineId: medicine.id, status: "missed" })}
                                      disabled={isUpdating}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Missed
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(medicine)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(medicine.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
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
                    <p className="text-muted-foreground">Timeline view coming soon...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Medicine Dialog */}
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            setEditingMedicine(null);
            setFormData({
              medicine_name: "",
              dosage: "",
              frequency: "",
              start_date: "",
              end_date: null,
              notes: null,
            });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
              <DialogDescription>
                {editingMedicine ? "Update medicine details" : "Add a new medicine to your tracking list"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicine_name">Medicine Name *</Label>
                <Input
                  id="medicine_name"
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
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
                setEditingMedicine(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || !formData.medicine_name || !formData.dosage || !formData.frequency || !formData.start_date}
              >
                {editingMedicine ? "Update Medicine" : "Add Medicine"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

export default Medicine;
