import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Plus,
  Pill,
  Calendar,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import { useReminders, CreateReminderData } from "@/hooks/useReminders";
import { format } from "date-fns";

const Reminders = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  
  const { reminders, isLoading, createReminder, updateReminder, deleteReminder, toggleComplete, isCreating } = useReminders();
  
  const [formData, setFormData] = useState<CreateReminderData>({
    title: "",
    description: null,
    reminder_type: "medicine",
    reminder_time: "",
    is_recurring: false,
    recurrence_pattern: null,
  });

  const medicineReminders = reminders.filter(r => r.reminder_type === "medicine");
  const appointmentReminders = reminders.filter(r => r.reminder_type === "appointment");

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
      description: null,
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
      reminder_time: reminder.reminder_time.substring(0, 16), // Format for datetime-local
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

  const ReminderCard = ({ reminder }: { reminder: any }) => {
    const reminderTime = new Date(reminder.reminder_time);
    const isPast = reminderTime < new Date();
    
    return (
      <Card className={`${reminder.is_completed ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={reminder.is_completed}
                onCheckedChange={() => toggleComplete({ id: reminder.id, isCompleted: reminder.is_completed })}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {reminder.reminder_type === "medicine" ? (
                    <Pill className="h-4 w-4 text-primary" />
                  ) : (
                    <Calendar className="h-4 w-4 text-secondary" />
                  )}
                  <h4 className={`font-semibold ${reminder.is_completed ? 'line-through' : ''}`}>
                    {reminder.title}
                  </h4>
                </div>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {reminder.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className={isPast && !reminder.is_completed ? 'text-destructive font-medium' : ''}>
                      {format(reminderTime, "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  {reminder.is_recurring && reminder.recurrence_pattern && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                      {reminder.recurrence_pattern}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminders & Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Never miss your medications or appointments
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Reminder
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({reminders.length})
            </TabsTrigger>
            <TabsTrigger value="medicine">
              Medicine ({medicineReminders.length})
            </TabsTrigger>
            <TabsTrigger value="appointments">
              Appointments ({appointmentReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading reminders...</p>
                </CardContent>
              </Card>
            ) : reminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reminders set</h3>
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
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="medicine" className="space-y-4">
            {medicineReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medicine reminders</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Set reminders for your medications
                  </p>
                  <Button onClick={() => {
                    setFormData({ ...formData, reminder_type: "medicine" });
                    setShowCreateDialog(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {medicineReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {appointmentReminders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add appointments to stay organized
                  </p>
                  <Button onClick={() => {
                    setFormData({ ...formData, reminder_type: "appointment" });
                    setShowCreateDialog(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointmentReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
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
              description: null,
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
                {editingReminder ? "Update your reminder details" : "Set up a new reminder for medicine or appointment"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.reminder_type}
                  onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}
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
                  placeholder={formData.reminder_type === "medicine" ? "e.g., Take Aspirin" : "e.g., Doctor Visit"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes..."
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked as boolean })}
                />
                <Label htmlFor="is_recurring" className="cursor-pointer">
                  Recurring reminder
                </Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recurrence Pattern *</Label>
                  <Select
                    value={formData.recurrence_pattern || ""}
                    onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                  >
                    <SelectTrigger id="recurrence">
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
