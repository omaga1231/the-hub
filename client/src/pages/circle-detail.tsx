import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, FileText, Plus, ArrowLeft, Trash2, UserMinus } from "lucide-react";
import { DiscussionBoard } from "@/components/discussion-board";
import { ChatRoom } from "@/components/chat-room";
import { FileList } from "@/components/file-list";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StudyCircle, User, CircleMember } from "@shared/schema";

interface CircleWithDetails extends StudyCircle {
  course: {
    code: string;
    name: string;
  };
  _count?: {
    members: number;
    posts: number;
    messages: number;
  };
}

interface MemberWithUser extends CircleMember {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
  } | null;
}

export default function CircleDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({ queryKey: ["/api/auth/me"] });
  
  const { data: circle, isLoading } = useQuery<CircleWithDetails>({
    queryKey: ["/api/circles", id],
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/circles", id, "members"],
    enabled: !!id,
  });

  const currentUserMember = members?.find(m => m.userId === user?.id);
  const isAdmin = currentUserMember?.role === "admin";
  const isMember = !!currentUserMember;
  const canJoin = !isLoadingMembers && !isMember && !circle?.isPrivate;

  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/circles/${id}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/circles", id, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-circles"] });
      toast({ title: "Joined circle successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join circle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/circles/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Circle deleted successfully!" });
      navigate("/my-circles");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete circle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/circles/${id}/members/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/circles", id, "members"] });
      toast({ title: "Member removed successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Study Circle Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This study circle doesn't exist or has been removed
            </p>
            <Link href="/my-circles">
              <Button variant="default">View My Circles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/courses/${circle.courseId}`}>
        <Button variant="ghost" className="mb-6" data-testid="button-back-to-course">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{circle.name}</h1>
            <p className="text-muted-foreground mb-2">
              {circle.course.code} - {circle.course.name}
            </p>
            {circle.description && (
              <p className="text-muted-foreground leading-relaxed">{circle.description}</p>
            )}
          </div>
          {circle.isPrivate && (
            <Badge variant="secondary">Private</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="discussions" data-testid="tab-discussions">
                <MessageSquare className="mr-2 h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="files" data-testid="tab-files">
                <FileText className="mr-2 h-4 w-4" />
                Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-6">
              <DiscussionBoard circleId={id!} />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <ChatRoom circleId={id!} />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <FileList circleId={id!} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          {canJoin && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full" 
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  data-testid="button-join-circle"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {joinMutation.isPending ? "Joining..." : "Join Circle"}
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Members ({members?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {members?.map((member) => (
                <div key={member.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <div className="font-medium">{member.user?.fullName || "Unknown"}</div>
                      <div className="text-muted-foreground">@{member.user?.username || "unknown"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "admin" && (
                      <Badge variant="secondary" data-testid={`badge-admin-${member.userId}`}>Admin</Badge>
                    )}
                    {isAdmin && member.userId !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMemberMutation.mutate(member.userId)}
                        disabled={removeMemberMutation.isPending}
                        data-testid={`button-remove-${member.userId}`}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this circle? This action cannot be undone.")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-circle"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete Circle"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
