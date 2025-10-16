import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Star, GraduationCap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Course, Program } from "@shared/schema";

interface CourseWithStats extends Course {
  _count?: {
    studyCircles: number;
    ratings: number;
  };
  avgDifficulty?: number;
  avgQuality?: number;
}

export default function Courses() {
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  
  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithStats[]>({
    queryKey: ["/api/courses"],
  });

  const { data: programs, isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const { data: programCourses, isLoading: programCoursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/programs/${selectedProgram}/courses`],
    enabled: selectedProgram !== "all",
  });

  // Filter courses by program
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (selectedProgram === "all") return courses;
    if (!programCourses) return [];
    
    // Get the course IDs from the program's required courses
    const programCourseIds = new Set(programCourses.map(c => c.id));
    return courses.filter(c => programCourseIds.has(c.id));
  }, [courses, selectedProgram, programCourses]);

  const isLoading = coursesLoading || programsLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
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

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty <= 2) return { label: "Easy", className: "bg-chart-2 text-white" };
    if (difficulty <= 3.5) return { label: "Medium", className: "bg-chart-4 text-white" };
    return { label: "Hard", className: "bg-chart-5 text-white" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Browse Courses</h1>
        <p className="text-muted-foreground leading-relaxed">
          Discover courses, join study circles, and see what other students are saying
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Program/Major:</span>
          </div>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-[350px]" data-testid="select-program">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs - Show All Courses</SelectItem>
              {programs?.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name} ({program.degree})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {selectedProgram === "all" 
              ? `Showing all ${courses?.length || 0} courses`
              : `Showing ${filteredCourses.length} required courses`
            }
          </span>
        </div>
      </div>

      {programCoursesLoading && selectedProgram !== "all" ? (
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
      ) : courses?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground">
              Courses will appear here once they're added to the platform
            </p>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 && selectedProgram !== "all" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Required Courses Found</h3>
            <p className="text-muted-foreground">
              This program has no required courses listed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const difficultyBadge = course.avgDifficulty ? getDifficultyBadge(course.avgDifficulty) : null;
            
            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover-elevate active-elevate-2 h-full cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <CardTitle className="text-xl">{course.code}</CardTitle>
                          {difficultyBadge && (
                            <Badge className={difficultyBadge.className}>
                              {difficultyBadge.label}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{course.name}</CardDescription>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course._count?.studyCircles || 0} study circles</span>
                      </div>
                      {course._count?.ratings ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{course._count.ratings} ratings</span>
                        </div>
                      ) : null}
                    </div>
                    <Button variant="default" className="w-full" data-testid={`button-view-course-${course.id}`}>
                      View Course Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
