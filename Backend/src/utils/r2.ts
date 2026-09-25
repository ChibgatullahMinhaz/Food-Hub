import { env } from '@/config/env';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: env.R2.REGION || 'auto',
  ...(env.R2.ENDPOINT || env.R2.PUBLIC_URL
    ? { endpoint: env.R2.ENDPOINT || env.R2.PUBLIC_URL }
    : {}),
  // avoids virtual-hosted-style host mismatches that break presigned signatures on R2
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.R2.ACCESS_KEY_ID || '',
    secretAccessKey: env.R2.SECRET_ACCESS_KEY || '',
  },
});

// the S3 API endpoint is private; only a real r2.dev/custom domain is publicly browsable
export function getPublicUrlForKey(key: string) {
  const hasConfiguredPublicUrl = env.R2.PUBLIC_URL && !/[<>]/.test(env.R2.PUBLIC_URL);

  if (hasConfiguredPublicUrl) {
    return `${env.R2.PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  }

  if (env.R2.ENDPOINT && env.R2.BUCKET) {
    return `${env.R2.ENDPOINT.replace(/\/$/, '')}/${env.R2.BUCKET}/${key}`;
  }

  return key;
}

export async function uploadBufferToR2(key: string, body: Buffer, contentType = 'application/octet-stream') {
  const bucket = env.R2.BUCKET;
  if (!bucket) throw new Error('R2 bucket is not configured');

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getPublicUrlForKey(key);
}

// server signs the request with its own R2 credentials; the client only receives a short-lived URL
export async function getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 300) {
  const bucket = env.R2.BUCKET;
  if (!bucket) throw new Error('R2 bucket is not configured');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });

  return { uploadUrl, publicUrl: getPublicUrlForKey(key), key };
}

function normalizeKey(keyOrUrl: string) {
  if (!keyOrUrl) return keyOrUrl;

  // If a full public URL is provided, strip the public prefix
  if (env.R2.PUBLIC_URL && keyOrUrl.startsWith(env.R2.PUBLIC_URL)) {
    return keyOrUrl.replace(env.R2.PUBLIC_URL.replace(/\/$/, ''), '').replace(/^\//, '');
  }

  // If endpoint + bucket form is provided, strip that
  if (env.R2.ENDPOINT && env.R2.BUCKET) {
    const prefix = `${env.R2.ENDPOINT.replace(/\/$/, '')}/${env.R2.BUCKET}`;
    if (keyOrUrl.startsWith(prefix)) {
      return keyOrUrl.replace(prefix, '').replace(/^\//, '');
    }
  }

  return keyOrUrl;
}

export async function deleteFromR2(keyOrUrl: string) {
  const bucket = env.R2.BUCKET;
  if (!bucket) throw new Error('R2 bucket is not configured');

  const key = normalizeKey(keyOrUrl);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  return true;
}

export default { uploadBufferToR2, deleteFromR2 };
