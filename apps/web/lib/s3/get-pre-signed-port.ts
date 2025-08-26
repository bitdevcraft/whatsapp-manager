import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { env } from "@/env/server";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
  region: env.AWS_REGION,
});

interface Params {
  contentType: string;
  filename: string;
}

export async function getPresignedPost({ contentType, filename }: Params) {
  const Key = `${Date.now()}_${filename}`;
  return createPresignedPost(s3, {
    Bucket: env.AWS_BUCKET_NAME!,
    Conditions: [["starts-with", "$Content-Type", ""]],
    Expires: 600, // seconds
    Fields: { "Content-Type": contentType },
    Key,
  });
}
