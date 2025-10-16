import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, BookOpen, Users, GraduationCap } from "lucide-react";
import type { Course, StudyCircle, College } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");

  const { data: searchResults } = useQuery<{
    colleges: College[];
    courses: Course[];
    circles: Array<StudyCircle & { course: { code: string; name: string } }>;
  }>({
    queryKey: [`/api/search?query=${encodeURIComponent(query)}`],
    enabled: query.length > 0,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-6">Search</h1>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for colleges, courses, or study circles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            data-testid="input-search"
          />
        </div>
      </div>

      {query.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground">
              Enter a search term to find colleges, courses, or study circles
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" data-testid="tab-all">All Results</TabsTrigger>
            <TabsTrigger value="colleges" data-testid="tab-colleges">Colleges</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
            <TabsTrigger value="circles" data-testid="tab-circles">Study Circles</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-6">
            {searchResults?.colleges && searchResults.colleges.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Colleges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.colleges.slice(0, 4).map((college) => (
                    <Link key={college.id} href={`/colleges/${college.id}`}>
                      <Card className="hover-elevate cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <div>
                              <CardTitle>{college.abbreviation}</CardTitle>
                              <CardDescription>{college.name}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults?.courses && searchResults.courses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.courses.slice(0, 4).map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <Card className="hover-elevate cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <div>
                              <CardTitle>{course.code}</CardTitle>
                              <CardDescription>{course.name}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults?.circles && searchResults.circles.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Study Circles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.circles.slice(0, 4).map((circle) => (
                    <Link key={circle.id} href={`/circles/${circle.id}`}>
                      <Card className="hover-elevate cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1">
                              <Users className="h-6 w-6 text-primary mt-1" />
                              <div>
                                <CardTitle>{circle.name}</CardTitle>
                                <CardDescription>
                                  {circle.course.code} - {circle.course.name}
                                </CardDescription>
                              </div>
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
              </div>
            )}

            {(!searchResults || (
              searchResults.colleges.length === 0 &&
              searchResults.courses.length === 0 &&
              searchResults.circles.length === 0
            )) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="colleges" className="mt-6">
            {searchResults?.colleges && searchResults.colleges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.colleges.map((college) => (
                  <Link key={college.id} href={`/colleges/${college.id}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle>{college.abbreviation}</CardTitle>
                            <CardDescription>{college.name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No colleges found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            {searchResults?.courses && searchResults.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.courses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle>{course.code}</CardTitle>
                            <CardDescription>{course.name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No courses found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="circles" className="mt-6">
            {searchResults?.circles && searchResults.circles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.circles.map((circle) => (
                  <Link key={circle.id} href={`/circles/${circle.id}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <Users className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <CardTitle>{circle.name}</CardTitle>
                              <CardDescription>
                                {circle.course.code} - {circle.course.name}
                              </CardDescription>
                            </div>
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
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No study circles found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
