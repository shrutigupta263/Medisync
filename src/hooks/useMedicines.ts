import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Medicine {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineInsert {
  medicine_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
}

export const useMedicines = () => {
  const queryClient = useQueryClient();

  const { data: medicines = [], isLoading, error } = useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Medicine[];
    },
  });

  const addMedicine = useMutation({
    mutationFn: async (medicine: MedicineInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("medicines")
        .insert({
          ...medicine,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add medicine: ${error.message}`);
    },
  });

  const updateMedicine = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Medicine> & { id: string }) => {
      const { data, error } = await supabase
        .from("medicines")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update medicine: ${error.message}`);
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medicines")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete medicine: ${error.message}`);
    },
  });

  return {
    medicines,
    isLoading,
    error,
    addMedicine: addMedicine.mutate,
    updateMedicine: updateMedicine.mutate,
    deleteMedicine: deleteMedicine.mutate,
  };
};
