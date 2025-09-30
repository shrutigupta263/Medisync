import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hook for managing health reminders
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  reminder_time: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string | null;
  reminder_type: "medicine" | "appointment";
  reminder_time: string;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
}

export const useReminders = () => {
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_reminders")
        .select("*")
        .order("reminder_time", { ascending: true });

      if (error) throw error;
      return data as Reminder[];
    },
  });

  const createReminder = useMutation({
    mutationFn: async (reminderData: CreateReminderData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("health_reminders")
        .insert({
          ...reminderData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create reminder: " + error.message);
    },
  });

  const updateReminder = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateReminderData> }) => {
      const { data, error } = await supabase
        .from("health_reminders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update reminder: " + error.message);
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("health_reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete reminder: " + error.message);
    },
  });

  const markAsCompleted = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("health_reminders")
        .update({ is_completed: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder marked as completed");
    },
    onError: (error: Error) => {
      toast.error("Failed to update reminder: " + error.message);
    },
  });

  return {
    reminders,
    isLoading,
    createReminder: createReminder.mutate,
    updateReminder: updateReminder.mutate,
    deleteReminder: deleteReminder.mutate,
    markAsCompleted: markAsCompleted.mutate,
    isCreating: createReminder.isPending,
    isUpdating: updateReminder.isPending,
    isDeleting: deleteReminder.isPending,
  };
};
