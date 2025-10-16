import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, FileText, Plus, ArrowLeft } from "lucide-react";
import { DiscussionBoard } from "@/components/discussion-board";
import { ChatRoom } from "@/components/chat-room";
import { FileList } from "@/components/file-list";
import type { StudyCircle } from "@shared/schema";

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

export default function CircleDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: circle, isLoading } = useQuery<CircleWithDetails>({
    queryKey: ["/api/circles", id],
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Circle Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="font-semibold">{circle._count?.members || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Discussions</span>
                <span className="font-semibold">{circle._count?.posts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messages</span>
                <span className="font-semibold">{circle._count?.messages || 0}</span>
              </div>

              <div className="border-t pt-4">
                <Button className="w-full" variant="outline" data-testid="button-invite-members">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Members
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
