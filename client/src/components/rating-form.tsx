import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertRating } from "@shared/schema";

interface RatingFormProps {
  courseId: string;
}

export function RatingForm({ courseId }: RatingFormProps) {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState([3]);
  const [quality, setQuality] = useState([3]);
  const [workload, setWorkload] = useState([3]);
  const [comment, setComment] = useState("");

  const createRatingMutation = useMutation({
    mutationFn: async (data: InsertRating) => {
      return await apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted",
        description: "Your course rating has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
      setDifficulty([3]);
      setQuality([3]);
      setWorkload([3]);
      setComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRatingMutation.mutate({
      courseId,
      userId: "current-user-id", // TODO: Replace with actual user ID
      difficulty: difficulty[0],
      quality: quality[0],
      workload: workload[0],
      comment: comment || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">Rate This Course</h3>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Quality</Label>
            <span className="text-sm font-semibold">{quality[0]}/5</span>
          </div>
          <Slider
            value={quality}
            onValueChange={setQuality}
            min={1}
            max={5}
            step={1}
            data-testid="slider-quality"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Difficulty</Label>
            <span className="text-sm font-semibold">{difficulty[0]}/5</span>
          </div>
          <Slider
            value={difficulty}
            onValueChange={setDifficulty}
            min={1}
            max={5}
            step={1}
            data-testid="slider-difficulty"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Workload</Label>
            <span className="text-sm font-semibold">{workload[0]}/5</span>
          </div>
          <Slider
            value={workload}
            onValueChange={setWorkload}
            min={1}
            max={5}
            step={1}
            data-testid="slider-workload"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Comment (Optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this course..."
          className="mt-2"
          data-testid="textarea-rating-comment"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={createRatingMutation.isPending}
        data-testid="button-submit-rating"
      >
        {createRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  );
}
