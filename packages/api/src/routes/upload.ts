import { type Elysia, t } from "elysia";
import { supabase } from "@persona/db/config";

// Define the upload model schema
const UploadModel = t.Object({
  image: t.File(),
});

async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const fileName = `${timestamp}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("posts_images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("posts_images").getPublicUrl(fileName);

  return { url: publicUrl };
}

export const uploadRoutes = (app: Elysia) =>
  app.group("/upload", (upload) => {
    upload.post(
      "/",
      async ({ body }) => {
        try {
          const { image } = body;
          if (!image) {
            throw new Error("No image file provided");
          }
          // Optional: Add file size validation
          if (image.size > 10 * 1024 * 1024) {
            // 10MB limit
            throw new Error("File size exceeds 10MB limit");
          }
          const data = await uploadImage(image);
          return {
            success: true,
            ...data,
          };
        } catch (error) {
          console.error("Upload error:", error);
          if (error instanceof Error) {
            if (error.message.includes("failed to fetch")) {
              throw new Error("Upload service unavailable");
            }
            throw error;
          }
          throw new Error("Upload failed");
        }
      },
      {
        body: UploadModel,
        type: "multipart/form-data",
        error({ error }) {
          if (error instanceof Error) {
            if (error.message.includes("Upload service unavailable")) {
              return {
                success: false,
                error: error.message,
                status: 503,
              };
            }
            if (error.message.includes("File size exceeds")) {
              return {
                success: false,
                error: error.message,
                status: 413,
              };
            }
            if (error.message.includes("No image file")) {
              return {
                success: false,
                error: error.message,
                status: 400,
              };
            }
          }
          return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
            status: 500,
          };
        },
        plugins: {
          // Set maximum file size to 10MB
          maxFileSize: 10 * 1024 * 1024,
        },
      }
    );
    return upload;
  });
