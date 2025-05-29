import { FileIcon, Image } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewStore } from "@/store/viewStore";

// Types for media content
interface MediaItem {
  id: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  url: string;
  type: string;
}

// Mock data - would be replaced with actual API calls
const mockImages = [
  {
    id: "1",
    url: "https://placehold.co/80x80",
    name: "Image 1",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    url: "https://placehold.co/80x80",
    name: "Image 2",
    createdAt: "2023-05-14T08:20:00Z",
  },
  {
    id: "3",
    url: "https://placehold.co/80x80",
    name: "Image 3",
    createdAt: "2023-05-12T14:45:00Z",
  },
  {
    id: "4",
    url: "https://placehold.co/80x80",
    name: "Image 4",
    createdAt: "2023-05-10T09:15:00Z",
  },
  {
    id: "5",
    url: "https://placehold.co/80x80",
    name: "Image 5",
    createdAt: "2023-05-08T16:30:00Z",
  },
  {
    id: "6",
    url: "https://placehold.co/80x80",
    name: "Image 6",
    createdAt: "2023-05-05T11:10:00Z",
  },
];

const mockFiles = [
  {
    id: "1",
    name: "Document.pdf",
    size: "2.3 MB",
    date: "May 10, 2023",
    url: "#",
    type: "pdf",
  },
  {
    id: "2",
    name: "Presentation.pptx",
    size: "5.1 MB",
    date: "Apr 22, 2023",
    url: "#",
    type: "pptx",
  },
  {
    id: "3",
    name: "Spreadsheet.xlsx",
    size: "1.8 MB",
    date: "Mar 15, 2023",
    url: "#",
    type: "xlsx",
  },
];

const MediaAndFiles = () => {
  const { selectedChatId } = useViewStore();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaAndFiles = async () => {
      if (!selectedChatId) return;

      setIsLoadingMedia(true);
      setIsLoadingFiles(true);
      setError(null);

      try {
        // In a real implementation, these would be API calls
        // const mediaResponse = await fetchMediaForChat(selectedChatId);
        // const filesResponse = await fetchFilesForChat(selectedChatId);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Use mock data for now
        setImages(mockImages);
        setFiles(mockFiles);
      } catch (err) {
        console.error("Error fetching media and files:", err);
        setError("Failed to load media and files. Please try again.");
      } finally {
        setIsLoadingMedia(false);
        setIsLoadingFiles(false);
      }
    };

    fetchMediaAndFiles();
  }, [selectedChatId]);

  const handleMediaClick = (mediaItem: MediaItem) => {
    // In a real implementation, this would open a modal or lightbox
    window.open(mediaItem.url, "_blank");
  };

  const handleFileClick = (fileItem: FileItem) => {
    // In a real implementation, this would download or open the file
    window.open(fileItem.url, "_blank");
  };

  return (
    <div className="mt-6">
      <h4 className="font-medium mb-3 text-sm">Media and Files</h4>

      {error ? (
        <div className="text-sm text-red-500 p-2 rounded bg-red-50 dark:bg-red-950/30">
          {error}
          <Button
            variant="link"
            size="sm"
            className="ml-2 p-0 h-auto"
            onClick={() => {
              setIsLoadingMedia(true);
              setIsLoadingFiles(true);
              setError(null);
              // Re-fetch data logic would go here
              setTimeout(() => {
                setImages(mockImages);
                setFiles(mockFiles);
                setIsLoadingMedia(false);
                setIsLoadingFiles(false);
              }, 1000);
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="mt-2">
            <ScrollArea className="h-[200px]">
              {isLoadingMedia ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton
                        key={index}
                        className="w-full aspect-square rounded-md"
                      />
                    ))}
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Skeleton className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">
                    No media files shared in this conversation
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer overflow-hidden rounded-md"
                      onClick={() => handleMediaClick(image)}
                    >
                      <Image
                        src={image.url}
                        alt={image.name}
                        className="w-full h-auto object-cover aspect-square"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white h-8 w-8"
                        >
                          <Skeleton className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="mt-2">
            <ScrollArea className="h-[200px]">
              {isLoadingFiles ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="flex items-center gap-2 p-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <FileIcon className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">
                    No files shared in this conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/30 cursor-pointer"
                      onClick={() => handleFileClick(file)}
                    >
                      <FileIcon className="h-8 w-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{file.size}</span>
                          <span className="mx-1">•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MediaAndFiles;
