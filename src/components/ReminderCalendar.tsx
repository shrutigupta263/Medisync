import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Pill, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useReminders } from "@/hooks/useReminders";
import { format, isSameDay, parseISO } from "date-fns";

const ReminderCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { reminders, isLoading } = useReminders();

  // Get reminders for selected date
  const getRemindersForDate = (date: Date | undefined) => {
    if (!date) return [];
    return reminders.filter((reminder) => {
      const reminderDate = parseISO(reminder.reminder_time);
      return isSameDay(reminderDate, date);
    });
  };

  // Get dates that have reminders
  const datesWithReminders = reminders.map((reminder) => parseISO(reminder.reminder_time));

  const selectedReminders = getRemindersForDate(selectedDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Reminders Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasReminder: datesWithReminders,
              }}
              modifiersClassNames={{
                hasReminder: "relative font-bold before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-1 before:h-1 before:rounded-full before:bg-primary",
                selected: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/90 shadow-md shadow-primary/20"
              }}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading reminders...</div>
            ) : selectedReminders.length > 0 ? (
              <div className="space-y-3">
                {selectedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {reminder.reminder_type === "medicine" ? (
                          <Pill className="h-4 w-4 text-primary" />
                        ) : (
                          <Stethoscope className="h-4 w-4 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{reminder.title}</p>
                          <Badge variant={reminder.reminder_type === "medicine" ? "default" : "secondary"}>
                            {reminder.reminder_type}
                          </Badge>
                        </div>
                        {reminder.description && (
                          <p className="text-xs text-muted-foreground">{reminder.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(reminder.reminder_time), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No reminders for this date
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCalendar;
