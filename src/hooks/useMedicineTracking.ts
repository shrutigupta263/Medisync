import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicineTracking {
  id: string;
  medicine_id: string;
  user_id: string;
  date: string;
  status: "taken" | "missed";
  created_at: string;
  updated_at: string;
}

export const useMedicineTracking = () => {
  const queryClient = useQueryClient();

  // Fetch today's tracking status for all medicines
  const { data: trackingData = [], isLoading } = useQuery({
    queryKey: ["medicine-tracking"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("medicine_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);

      if (error) throw error;
      return data as MedicineTracking[];
    },
  });

  // Mark medicine as taken or missed
  const markStatus = useMutation({
    mutationFn: async ({ 
      medicineId, 
      status 
    }: { 
      medicineId: string; 
      status: "taken" | "missed" 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];

      // Check if entry exists for today
      const { data: existing } = await supabase
        .from("medicine_tracking")
        .select("*")
        .eq("medicine_id", medicineId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from("medicine_tracking")
          .update({ status })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from("medicine_tracking")
          .insert({
            medicine_id: medicineId,
            user_id: user.id,
            date: today,
            status,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-tracking"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Get status for a specific medicine
  const getStatus = (medicineId: string): "taken" | "missed" | null => {
    const tracking = trackingData.find(t => t.medicine_id === medicineId);
    return tracking ? tracking.status : null;
  };

  return {
    trackingData,
    isLoading,
    markStatus: markStatus.mutate,
    isUpdating: markStatus.isPending,
    getStatus,
  };
};
