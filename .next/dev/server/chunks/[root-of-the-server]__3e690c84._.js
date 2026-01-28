module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/GitHub/gemini_hackathon/paper-video-web-ui/app/api/convert/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$gemini_hackathon$2f$paper$2d$video$2d$web$2d$ui$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/gemini_hackathon/paper-video-web-ui/node_modules/next/server.js [app-route] (ecmascript)");
;
// TODO: Replace with your actual backend URL
const BACKEND_URL = "https://your-backend-api.com/api/pdf-to-video";
async function POST(request) {
    try {
        const formData = await request.formData();
        const pdfFile = formData.get("pdf");
        if (!pdfFile) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$gemini_hackathon$2f$paper$2d$video$2d$web$2d$ui$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No PDF file provided"
            }, {
                status: 400
            });
        }
        // Validate file type
        if (pdfFile.type !== "application/pdf") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$gemini_hackathon$2f$paper$2d$video$2d$web$2d$ui$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid file type. Only PDF files are accepted."
            }, {
                status: 400
            });
        }
        // Option 1: Forward the request to your backend
        // Uncomment this section when you have a backend ready
        /*
    const backendFormData = new FormData()
    backendFormData.append("pdf", pdfFile)
    
    const backendResponse = await fetch(BACKEND_URL, {
      method: "POST",
      body: backendFormData,
      // Add any authentication headers your backend requires
      // headers: {
      //   "Authorization": `Bearer ${process.env.BACKEND_API_KEY}`,
      // },
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return NextResponse.json(
        { error: error.message || "Backend processing failed" },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
    */ // Option 2: Mock response for development/testing
        // Remove this section when you have a real backend
        // Simulating backend processing delay
        await new Promise((resolve)=>setTimeout(resolve, 2000));
        // Mock response with sample video data
        const mockVideos = [
            {
                id: "video-1",
                title: "Introduction - " + pdfFile.name.replace(".pdf", ""),
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "/thumbnails/video-1.jpg",
                duration: "2:30"
            },
            {
                id: "video-2",
                title: "Key Points Overview",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "/thumbnails/video-2.jpg",
                duration: "3:15"
            },
            {
                id: "video-3",
                title: "Summary & Conclusion",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "/thumbnails/video-3.jpg",
                duration: "1:45"
            },
            {
                id: "video-4",
                title: "Deep Dive Analysis",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "/thumbnails/video-4.jpg",
                duration: "4:20"
            },
            {
                id: "video-5",
                title: "Case Studies",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "/thumbnails/video-5.jpg",
                duration: "2:55"
            },
            {
                id: "video-6",
                title: "Final Thoughts",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "/thumbnails/video-6.jpg",
                duration: "1:30"
            }
        ];
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$gemini_hackathon$2f$paper$2d$video$2d$web$2d$ui$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "PDF converted successfully",
            videos: mockVideos
        });
    } catch (error) {
        console.error("Error processing PDF:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$gemini_hackathon$2f$paper$2d$video$2d$web$2d$ui$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to process PDF"
        }, {
            status: 500
        });
    }
} /*
Expected Backend Response Format:
{
  "success": true,
  "message": "PDF converted successfully",
  "videos": [
    {
      "id": "unique-video-id",
      "title": "Video Title",
      "url": "https://your-cdn.com/videos/video-1.mp4",
      "thumbnail": "https://your-cdn.com/thumbnails/video-1.jpg",
      "duration": "2:30"
    },
    // ... more video clips
  ]
}
*/ 
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e690c84._.js.map