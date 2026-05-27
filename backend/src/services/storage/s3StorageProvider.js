'use strict';

const {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  PutBucketPolicyCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const config = require('./storageConfig');

let client;
let bucketReadyPromise;

const getClient = () => {
  if (client) return client;

  const clientConfig = {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
  };

  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
  }

  if (config.accessKeyId && config.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    };
  }

  client = new S3Client(clientConfig);
  return client;
};

const buildPublicUrl = (objectKey) => {
  if (!config.publicBaseUrl) return null;
  return `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
};

const buildContentDisposition = (type, filename) => {
  const fallback = String(filename || 'file').replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename || 'file');
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

const shouldIgnoreBucketError = (err) =>
  ['BucketAlreadyExists', 'BucketAlreadyOwnedByYou'].includes(err.name);

const setPublicReadPolicy = async () => {
  if (!config.bucketPublicRead) return;

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${config.bucket}/*`],
      },
    ],
  };

  await getClient().send(
    new PutBucketPolicyCommand({
      Bucket: config.bucket,
      Policy: JSON.stringify(policy),
    })
  );
};

const ensureBucket = async () => {
  if (!config.autoCreateBucket) return;

  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      try {
        await getClient().send(new HeadBucketCommand({ Bucket: config.bucket }));
      } catch (err) {
        if (err.$metadata?.httpStatusCode !== 404 && err.name !== 'NotFound') {
          throw err;
        }

        try {
          await getClient().send(new CreateBucketCommand({ Bucket: config.bucket }));
        } catch (createErr) {
          if (!shouldIgnoreBucketError(createErr)) throw createErr;
        }
      }

      await setPublicReadPolicy();
    })();
  }

  return bucketReadyPromise;
};

exports.uploadObject = async ({ objectKey, buffer, mimeType, metadata = {} }) => {
  await ensureBucket();

  await getClient().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
      Métadonnées: metadata,
    })
  );

  return {
    bucket: config.bucket,
    objectKey,
    publicUrl: buildPublicUrl(objectKey),
  };
};

exports.deleteObject = async (objectKey) => {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    })
  );
};

exports.getDownloadTarget = async ({
  objectKey,
  originalName,
  mimeType,
  contentDisposition = 'attachment',
}) => {
  const dispositionType = contentDisposition === 'inline' ? 'inline' : 'attachment';
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ResponseContentType: mimeType,
    ResponseContentDisposition: buildContentDisposition(dispositionType, originalName),
  });

  const url = await getSignedUrl(getClient(), command, {
    expiresIn: config.signedUrlTtlSeconds,
  });

  return { mode: 'redirect', url };
};
