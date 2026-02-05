"use client"

import { useEffect, useState } from "react"

export function useRunPipeline(jobId: string | null) {
  const [jobStatusText, setJobStatusText] = useState("")
  const [startedRun, setStartedRun] = useState(false)

  useEffect(() => {
    if (!jobId || startedRun) return
    setStartedRun(true)

    ;(async () => {
      try {
        setJobStatusText("Starting pipeline...")
        const resp = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_id: jobId,
            target: "merge",
            force: false,
            video_request: {
              scene_ids: [],
              dry_run: false,
              save_prompts: true,
            },
          }),
        })
        if (!resp.ok) throw new Error(`run failed: ${resp.status} ${await resp.text()}`)
        setJobStatusText("Pipeline running (listening for updates)...")
      } catch (e: any) {
        setJobStatusText(`Error starting run: ${e?.message ?? String(e)}`)
      }
    })()
  }, [jobId, startedRun])

  return { jobStatusText, setJobStatusText }
}