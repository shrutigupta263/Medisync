import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReports = () => {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["health-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_reports")
        .select("id, title, file_url, file_type, file_size, upload_date, analysis_status")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const uploadReport = useMutation({
    mutationFn: async (file: File) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("health-reports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert record into database
      const { data, error: dbError } = await supabase
        .from("health_reports")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          file_url: fileName, // Store path, not public URL
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger AI analysis (will validate medical content internally)
      const { error: analysisError } = await supabase.functions.invoke('analyze-report', {
        body: { reportId: data.id }
      });

      if (analysisError) {
        console.warn('Auto-analysis failed:', analysisError);
        toast.info('Report uploaded. You can run AI analysis manually.');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-reports"] });
      toast.success("Report uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (report: { id: string; file_url: string | null }) => {
      // Delete file from storage if exists
      if (report.file_url) {
        await supabase.storage
          .from("health-reports")
          .remove([report.file_url]);
      }

      // Delete database record
      const { error } = await supabase
        .from("health_reports")
        .delete()
        .eq("id", report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-reports"] });
      toast.success("Report deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const downloadReport = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("health-reports")
        .download(fileUrl);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started");
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  return {
    reports,
    isLoading,
    uploadReport: uploadReport.mutate,
    isUploading: uploadReport.isPending,
    deleteReport: deleteReport.mutate,
    isDeleting: deleteReport.isPending,
    downloadReport,
  };
};
