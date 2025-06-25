import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Params {
  filename: string;
  contentType: string;
}

export async function getPresignedPost({ filename, contentType }: Params) {
  const Key = `${Date.now()}_${filename}`;
  return createPresignedPost(s3, {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key,
    Conditions: [["starts-with", "$Content-Type", ""]],
    Fields: { "Content-Type": contentType },
    Expires: 600, // seconds
  });
}
