import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen } from "lucide-react";
import type { College } from "@shared/schema";

export default function Colleges() {
  const { data: colleges, isLoading } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Browse Colleges</h1>
        <p className="text-muted-foreground leading-relaxed">
          Select a college to explore courses and study circles
        </p>
      </div>

      {colleges?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Colleges Yet</h3>
            <p className="text-muted-foreground">
              Colleges will appear here once they're added to the platform
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges?.map((college) => (
            <Link key={college.id} href={`/colleges/${college.id}`}>
              <Card className="hover-elevate active-elevate-2 h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{college.abbreviation}</CardTitle>
                      <CardDescription className="mt-2">{college.name}</CardDescription>
                    </div>
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  {college.description && (
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {college.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" data-testid={`button-view-college-${college.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Courses
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
