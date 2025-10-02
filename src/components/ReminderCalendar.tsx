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
              className="rounded-lg pointer-events-auto"
              modifiers={{
                hasReminder: datesWithReminders,
              }}
              modifiersClassNames={{
                hasReminder: "relative font-bold before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-400",
                selected: "bg-gradient-to-br from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 rounded-lg"
              }}
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors",
                day_selected: "bg-gradient-to-br from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 rounded-lg",
                day_today: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold rounded-lg",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
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
