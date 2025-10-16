import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Star, Plus, ArrowLeft } from "lucide-react";
import { RatingForm } from "@/components/rating-form";
import { RatingsList } from "@/components/ratings-list";
import { CreateCircleDialog } from "@/components/create-circle-dialog";
import { useState } from "react";
import type { Course, Rating, StudyCircle } from "@shared/schema";

interface CourseWithDetails extends Course {
  ratings: Rating[];
  studyCircles: StudyCircle[];
  _count?: {
    studyCircles: number;
    ratings: number;
  };
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [showCreateCircle, setShowCreateCircle] = useState(false);

  const { data: course, isLoading } = useQuery<CourseWithDetails>({
    queryKey: ["/api/courses", id],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This course doesn't exist or has been removed
            </p>
            <Link href="/courses">
              <Button variant="default">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgDifficulty = course.ratings.length
    ? course.ratings.reduce((sum, r) => sum + r.difficulty, 0) / course.ratings.length
    : 0;

  const avgQuality = course.ratings.length
    ? course.ratings.reduce((sum, r) => sum + r.quality, 0) / course.ratings.length
    : 0;

  const avgWorkload = course.ratings.length
    ? course.ratings.reduce((sum, r) => sum + r.workload, 0) / course.ratings.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/courses">
        <Button variant="ghost" className="mb-6" data-testid="button-back-to-courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{course.code}</h1>
            <p className="text-xl text-muted-foreground">{course.name}</p>
            {course.department && (
              <p className="text-sm text-muted-foreground mt-2">{course.department}</p>
            )}
          </div>
        </div>

        {course.description && (
          <p className="text-muted-foreground leading-relaxed mt-4">{course.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="circles" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="circles" data-testid="tab-study-circles">Study Circles</TabsTrigger>
              <TabsTrigger value="ratings" data-testid="tab-ratings">Ratings</TabsTrigger>
            </TabsList>

            <TabsContent value="circles" className="mt-6">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h2 className="text-2xl font-semibold">Study Circles</h2>
                <Button onClick={() => setShowCreateCircle(true)} data-testid="button-create-circle">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Circle
                </Button>
              </div>

              {course.studyCircles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Study Circles Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to create a study circle for this course
                    </p>
                    <Button onClick={() => setShowCreateCircle(true)} data-testid="button-create-first-circle">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Circle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {course.studyCircles.map((circle) => (
                    <Link key={circle.id} href={`/circles/${circle.id}`}>
                      <Card className="hover-elevate active-elevate-2 cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1">
                              <CardTitle>{circle.name}</CardTitle>
                              <CardDescription className="mt-2">{circle.description}</CardDescription>
                            </div>
                            {circle.isPrivate && (
                              <Badge variant="secondary">Private</Badge>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ratings" className="mt-6">
              <RatingsList courseId={id!} ratings={course.ratings} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Study Circles</span>
                  <span className="font-semibold">{course.studyCircles.length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Ratings</span>
                  <span className="font-semibold">{course.ratings.length}</span>
                </div>
              </div>

              {course.ratings.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Average Ratings</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Quality</span>
                          <span className="font-semibold">{avgQuality.toFixed(1)}/5</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(avgQuality / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Difficulty</span>
                          <span className="font-semibold">{avgDifficulty.toFixed(1)}/5</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-4" 
                            style={{ width: `${(avgDifficulty / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Workload</span>
                          <span className="font-semibold">{avgWorkload.toFixed(1)}/5</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-5" 
                            style={{ width: `${(avgWorkload / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <RatingForm courseId={id!} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateCircleDialog
        open={showCreateCircle}
        onOpenChange={setShowCreateCircle}
        courseId={id!}
      />
    </div>
  );
}
