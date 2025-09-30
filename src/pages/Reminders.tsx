import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Bell,
  Plus,
  Pill,
  Calendar,
  Trash2,
  Edit,
  Check,
  Clock,
} from "lucide-react";
import { useReminders, CreateReminderData } from "@/hooks/useReminders";
import { format } from "date-fns";

const Reminders = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  
  const { reminders, isLoading, createReminder, updateReminder, deleteReminder, markAsCompleted, isCreating } = useReminders();
  
  const [formData, setFormData] = useState<CreateReminderData>({
    title: "",
    description: "",
    reminder_type: "medicine",
    reminder_time: "",
    is_recurring: false,
    recurrence_pattern: null,
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.reminder_time) {
      return;
    }

    if (editingReminder) {
      updateReminder({
        id: editingReminder,
        updates: formData,
      });
      setShowEditDialog(false);
      setEditingReminder(null);
    } else {
      createReminder(formData);
      setShowCreateDialog(false);
    }
    
    setFormData({
      title: "",
      description: "",
      reminder_type: "medicine",
      reminder_time: "",
      is_recurring: false,
      recurrence_pattern: null,
    });
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder.id);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      reminder_type: reminder.reminder_type,
      reminder_time: reminder.reminder_time,
      is_recurring: reminder.is_recurring,
      recurrence_pattern: reminder.recurrence_pattern,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteReminder(id);
    }
  };

  const medicineReminders = reminders.filter(r => r.reminder_type === "medicine" && !r.is_completed);
  const appointmentReminders = reminders.filter(r => r.reminder_type === "appointment" && !r.is_completed);
  const allActiveReminders = reminders.filter(r => !r.is_completed);

  const ReminderCard = ({ reminder }: { reminder: any }) => (
    <Card className="card-hover">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {reminder.reminder_type === "medicine" ? (
                <Pill className="h-4 w-4 text-primary" />
              ) : (
                <Calendar className="h-4 w-4 text-secondary" />
              )}
              <h3 className="font-semibold">{reminder.title}</h3>
              <Badge variant={reminder.is_recurring ? "secondary" : "outline"}>
                {reminder.is_recurring ? "Recurring" : "One-time"}
              </Badge>
            </div>
            {reminder.description && (
              <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(reminder.reminder_time), "PPP 'at' p")}</span>
            </div>
            {reminder.is_recurring && reminder.recurrence_pattern && (
              <p className="text-xs text-muted-foreground mt-1">
                Repeats: {reminder.recurrence_pattern}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAsCompleted(reminder.id)}
              title="Mark as completed"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(reminder)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(reminder.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminders & Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medication reminders and appointments
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Reminder
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allActiveReminders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicine</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medicineReminders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentReminders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({allActiveReminders.length})</TabsTrigger>
            <TabsTrigger value="medicine">Medicine ({medicineReminders.length})</TabsTrigger>
            <TabsTrigger value="appointments">Appointments ({appointmentReminders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading reminders...</p>
                </CardContent>
              </Card>
            ) : allActiveReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active reminders</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first reminder to get started
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              allActiveReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>

          <TabsContent value="medicine" className="space-y-4">
            {medicineReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medicine reminders</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create reminders for your medications
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              medicineReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {appointmentReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your upcoming appointments
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              appointmentReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Reminder Dialog */}
        <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setEditingReminder(null);
            setFormData({
              title: "",
              description: "",
              reminder_type: "medicine",
              reminder_time: "",
              is_recurring: false,
              recurrence_pattern: null,
            });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingReminder ? "Edit Reminder" : "Create Reminder"}</DialogTitle>
              <DialogDescription>
                {editingReminder ? "Update reminder details" : "Set up a new reminder for medicine or appointment"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.reminder_type}
                  onValueChange={(value: "medicine" | "appointment") =>
                    setFormData({ ...formData, reminder_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">💊 Medicine</SelectItem>
                    <SelectItem value="appointment">📅 Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={formData.reminder_type === "medicine" ? "e.g., Take Blood Pressure Medication" : "e.g., Doctor's Appointment"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_time">Date & Time *</Label>
                <Input
                  id="reminder_time"
                  type="datetime-local"
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_recurring">Recurring?</Label>
                <Select
                  value={formData.is_recurring ? "yes" : "no"}
                  onValueChange={(value) => {
                    const isRecurring = value === "yes";
                    setFormData({ 
                      ...formData, 
                      is_recurring: isRecurring,
                      recurrence_pattern: isRecurring ? "daily" : null
                    });
                  }}
                >
                  <SelectTrigger id="is_recurring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">One-time</SelectItem>
                    <SelectItem value="yes">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_pattern">Repeat Pattern *</Label>
                  <Select
                    value={formData.recurrence_pattern || ""}
                    onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                  >
                    <SelectTrigger id="recurrence_pattern">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setEditingReminder(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || !formData.title || !formData.reminder_time}
              >
                {editingReminder ? "Update Reminder" : "Create Reminder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

export default Reminders;
