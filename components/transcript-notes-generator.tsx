"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Download, Eye, Pencil, Youtube, Key } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TranscriptNotesGenerator() {
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [keySentences, setKeySentences] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const generateThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  };

  useEffect(() => {
    const videoId = extractVideoId(url);
    if (videoId) {
      setThumbnailUrl(generateThumbnailUrl(videoId));
    } else {
      setThumbnailUrl("");
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://legislative-alida-asdasdf-7947af67.koyeb.app/generate_transcript",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ video_url: url }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTranscript(data.transcript);
      setKeySentences(data.key_sentences);
      setKeywords(data.keywords);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          `An error occurred: ${err.message}. Please ensure the backend server is running and CORS is properly configured.`
        );
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadTranscript = () => {
    handleDownloadFile("transcript.txt", transcript);
  };

  const handleDownloadNotes = () => {
    const notesContent = `Key Sentences:\n${keySentences.join(
      "\n"
    )}\n\nKeywords:\n${keywords.join(", ")}`;
    handleDownloadFile("notes.txt", notesContent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            EduNotes Generator
          </h1>
          <p className="text-xl text-blue-600">
            Transform YouTube videos into concise study notes!
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="video-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                YouTube Video URL
              </label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {thumbnailUrl && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Youtube className="h-16 w-16 text-white opacity-75" />
                  </div>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <BookOpen className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Notes"}
            </Button>
          </form>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {keySentences.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
              <Pencil className="mr-2 h-6 w-6" /> Key Sentences
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {keySentences.map((sentence, index) => (
                <li key={index}>{sentence}</li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleDownloadNotes}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Download Notes
              </Button>
            </div>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
              <Key className="mr-2 h-6 w-6" /> Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {transcript && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" /> Transcript
            </h2>
            <div className="flex space-x-4 mb-4">
              <Button
                onClick={handleViewTranscript}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />{" "}
                {showTranscript ? "Hide" : "View"} Transcript
              </Button>
              <Button
                onClick={handleDownloadTranscript}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Download Transcript
              </Button>
            </div>
            {showTranscript && (
              <Textarea
                value={transcript}
                readOnly
                className="w-full h-64 p-4 border rounded"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
