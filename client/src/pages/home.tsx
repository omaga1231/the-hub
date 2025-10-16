import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, Star, Search, GraduationCap } from "lucide-react";
import heroImage from "@assets/generated_images/Students_collaborating_in_study_space_e06aa580.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Study Community
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join course-specific study circles, share materials, and collaborate with students across colleges
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/colleges">
              <Button size="lg" variant="default" data-testid="button-browse-colleges">
                <GraduationCap className="mr-2 h-5 w-5" />
                Browse Colleges
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm" data-testid="button-browse-courses">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Hub brings together all the tools you need for academic collaboration in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Study Circles</CardTitle>
              <CardDescription>
                Join course-specific groups to collaborate with classmates and share study materials
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Star className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Course Ratings</CardTitle>
              <CardDescription>
                Rate difficulty, quality, and workload. Get advice from students who've taken the course
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Discussion Boards</CardTitle>
              <CardDescription>
                Ask questions, share insights, and engage in threaded conversations with your study group
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Resource Sharing</CardTitle>
              <CardDescription>
                Upload and share notes, slides, and study materials within your circle
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Collaborate in real-time with live messaging before exams and during study sessions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Discovery</CardTitle>
              <CardDescription>
                Find the right courses and study circles across multiple colleges with powerful search
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join thousands of students collaborating on The Hub
          </p>
          <Link href="/search">
            <Button size="lg" data-testid="button-get-started">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
