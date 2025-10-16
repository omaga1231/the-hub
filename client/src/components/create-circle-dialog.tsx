import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertStudyCircleSchema } from "@shared/schema";
import { useLocation } from "wouter";

interface CreateCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
}

const formSchema = insertStudyCircleSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

export function CreateCircleDialog({ open, onOpenChange, courseId }: CreateCircleDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId,
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  const createCircleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/circles", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Study Circle Created",
        description: "Your study circle has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/circles"] });
      form.reset();
      onOpenChange(false);
      setLocation(`/circles/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create study circle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createCircleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Study Circle</DialogTitle>
          <DialogDescription>
            Create a new study circle for this course to collaborate with other students
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., CIS211 Study Group"
                      {...field}
                      data-testid="input-circle-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this study circle..."
                      {...field}
                      data-testid="textarea-circle-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Private Circle</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Only invited members can join
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-circle-private"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-circle"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCircleMutation.isPending}
                data-testid="button-create-circle-submit"
              >
                {createCircleMutation.isPending ? "Creating..." : "Create Circle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
