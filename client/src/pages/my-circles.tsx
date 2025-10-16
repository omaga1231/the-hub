import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, FileText } from "lucide-react";
import type { StudyCircle } from "@shared/schema";

interface CircleWithCourse extends StudyCircle {
  course: {
    code: string;
    name: string;
  };
  _count?: {
    members: number;
    posts: number;
  };
}

export default function MyCircles() {
  const { data: circles, isLoading } = useQuery<CircleWithCourse[]>({
    queryKey: ["/api/my-circles"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Study Circles</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your active study circles and collaboration groups
        </p>
      </div>

      {circles?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Circles Yet</h3>
            <p className="text-muted-foreground mb-4">
              Join or create a study circle to start collaborating with other students
            </p>
            <Link href="/courses">
              <a className="text-primary hover:underline">Browse Courses</a>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles?.map((circle) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <Card className="hover-elevate active-elevate-2 h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{circle.name}</CardTitle>
                    {circle.isPrivate && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {circle.course.code} - {circle.course.name}
                  </CardDescription>
                  {circle.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {circle.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{circle._count?.members || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{circle._count?.posts || 0} posts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
