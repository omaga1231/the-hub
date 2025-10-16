import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Plus, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, Comment } from "@shared/schema";

interface PostWithDetails extends Post {
  user: {
    username: string;
    fullName: string;
  };
  _count?: {
    comments: number;
  };
  comments?: Comment[];
}

interface DiscussionBoardProps {
  circleId: string;
}

export function DiscussionBoard({ circleId }: DiscussionBoardProps) {
  const { toast } = useToast();
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: posts, isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/circles", circleId, "posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return await apiRequest("POST", "/api/posts", {
        circleId,
        userId: "current-user-id", // TODO: Replace with actual user ID
        title: data.title,
        content: data.content,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your discussion post has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/circles", circleId, "posts"] });
      setTitle("");
      setContent("");
      setShowNewPost(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      createPostMutation.mutate({ title, content });
    }
  };

  if (isLoading) {
    return <div>Loading discussions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold">Discussions</h2>
        <Button onClick={() => setShowNewPost(!showNewPost)} data-testid="button-new-post">
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Discussion title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-post-title"
              />
              <Textarea
                placeholder="What would you like to discuss?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                data-testid="textarea-post-content"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewPost(false)}
                  data-testid="button-cancel-post"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPostMutation.isPending || !title.trim() || !content.trim()}
                  data-testid="button-submit-post"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Discussions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start the conversation by creating the first discussion post
            </p>
            <Button onClick={() => setShowNewPost(true)} data-testid="button-create-first-post">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id} className="hover-elevate cursor-pointer" data-testid={`post-${post.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback>{post.user.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {post.user.fullName} • {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <CardDescription className="mt-2 leading-relaxed">
                        {post.content}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post._count?.comments || 0} comments</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
