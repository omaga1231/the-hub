import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, ArrowLeft, Users } from "lucide-react";
import type { College, Course } from "@shared/schema";

interface CollegeWithCourses extends College {
  courses: Array<Course & {
    _count?: {
      studyCircles: number;
    };
  }>;
}

export default function CollegeDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: college, isLoading } = useQuery<CollegeWithCourses>({
    queryKey: ["/api/colleges", id],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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

  if (!college) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">College Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This college doesn't exist or has been removed
            </p>
            <Link href="/colleges">
              <Button variant="default">Browse Colleges</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/colleges">
        <Button variant="ghost" className="mb-6" data-testid="button-back-to-colleges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Colleges
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{college.abbreviation}</h1>
        <p className="text-xl text-muted-foreground mb-4">{college.name}</p>
        {college.description && (
          <p className="text-muted-foreground leading-relaxed">{college.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Courses</h2>
        
        {college.courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground">
                Courses will appear here once they're added to this college
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {college.courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover-elevate active-elevate-2 h-full cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{course.code}</CardTitle>
                        <CardDescription className="mt-2">{course.name}</CardDescription>
                        {course.department && (
                          <p className="text-sm text-muted-foreground mt-2">{course.department}</p>
                        )}
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course._count?.studyCircles || 0} study circles</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
