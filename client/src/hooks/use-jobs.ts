import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/jobs/:id
export function useJob(id: number) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch job');
      }
      
      return api.jobs.get.responses[200].parse(await res.json());
    },
    // Poll every 2 seconds if the job is active
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'processing' ? 2000 : false;
    },
    refetchOnWindowFocus: false,
  });
}

// POST /api/upload
export function useUploadJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(api.jobs.upload.path, {
        method: api.jobs.upload.method,
        body: formData, // FormData doesn't need Content-Type header manually set
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.jobs.upload.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Upload failed');
      }

      return api.jobs.upload.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
