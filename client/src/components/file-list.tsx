import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload } from "lucide-react";
import type { File } from "@shared/schema";

interface FileWithUser extends File {
  user: {
    username: string;
    fullName: string;
  };
}

interface FileListProps {
  circleId: string;
}

export function FileList({ circleId }: FileListProps) {
  const { data: files, isLoading } = useQuery<FileWithUser[]>({
    queryKey: ["/api/circles", circleId, "files"],
  });

  if (isLoading) {
    return <div>Loading files...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold">Files</h2>
        <Button data-testid="button-upload-file">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      {files?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload notes, slides, and study materials to share with your circle
            </p>
            <Button data-testid="button-upload-first-file">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {files?.map((file) => (
            <Card key={file.id} className="hover-elevate" data-testid={`file-${file.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.user.fullName} • {new Date(file.createdAt).toLocaleDateString()} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" data-testid={`button-download-${file.id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
