"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Loader2, Video, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileError, setFileError] = useState<string>("")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    if (droppedFile.type === "application/pdf") {
      setFile(droppedFile)
      setFileError("")
    } else {
      setFile(null)
      setFileError("Sorry — we currently only support PDF uploads.")
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setFileError("")
    } else {
      setFile(null)
      setFileError("Sorry — we currently only support PDF uploads.")
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("pdf", file)

    try {
      // progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10))
      }, 200)

      // Just upload to /api/upload
      const up = await fetch("/api/upload", { method: "POST", body: formData })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!up.ok) throw new Error(`upload failed: ${up.status} ${await up.text()}`)

      const upJson = await up.json()
      const jobId = upJson.job_id
      if (!jobId) throw new Error(`upload response missing gcs uri: ${JSON.stringify(upJson)}`)

      // direct to /videos with gcs_uri param immediately after upload
      router.push(`/videos?job_id=${encodeURIComponent(jobId)}`)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMyVideos = React.useCallback(() => {
    try {
      const last = sessionStorage.getItem("last_job_id")
      if (last) {
        router.push(`/videos?job_id=${encodeURIComponent(last)}`)
      } else {
        router.push("/videos") // will render <EmptyState />
      }
    } catch {
      router.push("/videos")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground">Demo The BoardBook — Research, a video story for everyone</span>
          </div>
          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleMyVideos}
              className="font-medium text-muted-foreground hover:text-accent transition-colors"
            >
              My Videos
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[40px] lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Turn a research paper into a video story anyone can understand
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Upload a research paper or technical PDF. We understand it first — then generate a ~60–90s explainer video to help non-experts grasp the core idea.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-border bg-card p-8">
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Step 1: Upload File
            </h2>
            <p className="text-muted-foreground">
              Upload your PDF document to begin the conversion process.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-all ${
                isDragging
                  ? "border-accent bg-accent/5"
                  : file
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent hover:bg-muted/50"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <FileText className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Remove file
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      Drag & Drop your PDF here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              )}
            </div>

            {fileError && (
              <div className="text-sm text-red-600">
                {fileError}
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-medium text-foreground">{uploadProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-6 text-base"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Converting to Videos...
                </>
              ) : (
                <>
                  Convert to Videos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Upload a Paper",
              description: "Select a research or technical PDF to get started.",
            },
            {
              title: "Understand, Then Explain",
              description: "We read the paper, then reframe it into a story anyone can follow.",
            },
            {
              title: "Get Explainer Video",
              description: "A short video that makes the paper easy to grasp.",
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card font-bold text-foreground">
                {index + 1}
              </div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
