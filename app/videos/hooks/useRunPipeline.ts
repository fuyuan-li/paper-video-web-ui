"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function useRunPipeline(jobId: string | null) {
  const [jobStatusText, setJobStatusText] = useState("")
  const [checkedForThisJob, setCheckedForThisJob] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    if (checkedForThisJob === jobId) return
    setCheckedForThisJob(jobId)

    ;(async () => {
      try {
        const ref = doc(db, "jobs", jobId)
        const snap = await getDoc(ref)

        // Most conservative: if doc doesn't exist, don't run yet (avoid false triggers)
        if (!snap.exists()) {
          setJobStatusText("Waiting for job record (listening for updates)...")
          return
        }

        const data: any = snap.data()
        const status = String(data.status ?? "").toUpperCase()

        // ✅ SUCCEEDED: never rerun
        if (status === "SUCCEEDED") {
          setJobStatusText("Pipeline succeeded (resuming view)...")
          return
        }

        // ✅ RECEIVED: start first run
        if (status === "RECEIVED" || !status) {
          setJobStatusText("Pipeline — starting...")
          // Continue to fetch /api/run
        } else if (status !== "FAILED") {
          // ✅ Non-FAILED and not RECEIVED: assume already started
          setJobStatusText(`Pipeline ${status.toLowerCase()} (listening for updates)...`)
          return
        } else {
          // ✅ FAILED: allow rerun
          setJobStatusText("Pipeline failed — restarting...")
          // Continue to fetch /api/run // TODO: need force=true?
        }

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
        setJobStatusText("Pipeline restarted (listening for updates)...")
      } catch (e: any) {
        setJobStatusText(`Error checking/starting run: ${e?.message ?? String(e)}`)
      }
    })()
  }, [jobId, checkedForThisJob])

  return { jobStatusText, setJobStatusText }
}