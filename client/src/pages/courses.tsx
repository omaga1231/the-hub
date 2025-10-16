import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Star, Filter } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseWithStats extends Course {
  _count?: {
    studyCircles: number;
    ratings: number;
  };
  avgDifficulty?: number;
  avgQuality?: number;
}

export default function Courses() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  const { data: courses, isLoading } = useQuery<CourseWithStats[]>({
    queryKey: ["/api/courses"],
  });

  // Get unique departments
  const departments = useMemo(() => {
    if (!courses) return [];
    const deptSet = new Set(courses.map(c => c.department).filter(Boolean));
    return Array.from(deptSet).sort();
  }, [courses]);

  // Filter courses by department
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (selectedDepartment === "all") return courses;
    return courses.filter(c => c.department === selectedDepartment);
  }, [courses, selectedDepartment]);

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
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Major:</span>
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[280px]" data-testid="select-department">
              <SelectValue placeholder="All Majors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Majors</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept!}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses?.length || 0} courses
          </span>
        </div>
      </div>

      {courses?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground">
              Courses will appear here once they're added to the platform
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
