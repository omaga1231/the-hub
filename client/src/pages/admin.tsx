import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCollegeSchema, insertCourseSchema, type InsertCollege, type InsertCourse, type College } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, BookOpen, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to access this page. Admin privileges are required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState("colleges");

  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const collegeForm = useForm<InsertCollege>({
    resolver: zodResolver(insertCollegeSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      description: "",
    },
  });

  const courseForm = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      collegeId: "",
      code: "",
      name: "",
      description: "",
      department: "",
    },
  });

  const createCollegeMutation = useMutation({
    mutationFn: async (data: InsertCollege) => {
      return await apiRequest("POST", "/api/colleges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colleges"] });
      collegeForm.reset();
      toast({
        title: "Success",
        description: "College created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create college",
        variant: "destructive",
      });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      return await apiRequest("POST", "/api/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      courseForm.reset();
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const onCollegeSubmit = (data: InsertCollege) => {
    createCollegeMutation.mutate(data);
  };

  const onCourseSubmit = (data: InsertCourse) => {
    createCourseMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage colleges and courses on The Hub
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colleges" data-testid="tab-colleges">
            <Building2 className="w-4 h-4 mr-2" />
            Add College
          </TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Add Course
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colleges">
          <Card>
            <CardHeader>
              <CardTitle>Create New College</CardTitle>
              <CardDescription>
                Add a new college to The Hub platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...collegeForm}>
                <form onSubmit={collegeForm.handleSubmit(onCollegeSubmit)} className="space-y-4">
                  <FormField
                    control={collegeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Delaware Technical Community College"
                            data-testid="input-college-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={collegeForm.control}
                    name="abbreviation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abbreviation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., DTCC"
                            data-testid="input-college-abbreviation"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={collegeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the college..."
                            data-testid="input-college-description"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    data-testid="button-create-college"
                    disabled={createCollegeMutation.isPending}
                  >
                    {createCollegeMutation.isPending ? "Creating..." : "Create College"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>
                Add a new course to a college
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4">
                  <FormField
                    control={courseForm.control}
                    name="collegeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-college">
                              <SelectValue placeholder="Select a college" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colleges.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name} ({college.abbreviation})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., CS-101"
                            data-testid="input-course-code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Introduction to Computer Science"
                            data-testid="input-course-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Computer Science"
                            data-testid="input-course-department"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the course..."
                            data-testid="input-course-description"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    data-testid="button-create-course"
                    disabled={createCourseMutation.isPending}
                  >
                    {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
