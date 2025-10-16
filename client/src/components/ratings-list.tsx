import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Rating } from "@shared/schema";

interface RatingsListProps {
  courseId: string;
  ratings: Rating[];
}

export function RatingsList({ courseId, ratings }: RatingsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      return await apiRequest("DELETE", `/api/ratings/${ratingId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Rating Deleted",
        description: "The rating has been successfully removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
        variant: "destructive",
      });
    },
  });
  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Ratings Yet</h3>
          <p className="text-muted-foreground">
            Be the first to rate this course and help other students
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Student</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {user?.isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRatingMutation.mutate(rating.id)}
                      disabled={deleteRatingMutation.isPending}
                      data-testid={`button-delete-rating-${rating.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Quality</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating.quality
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating.difficulty
                              ? "fill-chart-4 text-chart-4"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Workload</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating.workload
                              ? "fill-chart-5 text-chart-5"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {rating.comment && (
                  <p className="text-sm text-foreground leading-relaxed">{rating.comment}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
