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
  if (!config.publicBaseUrl || !config.bucketPublicRead) return null;
  return `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
};

const shouldIgnoreBucketError = (err) =>
  ['BucketAlreadyExists', 'BucketAlreadyOwnedByYou'].includes(err.name);

const isObjectNotFoundError = (err) =>
  err.name === 'NoSuchKey' ||
  err.name === 'NotFound' ||
  err.$metadata?.httpStatusCode === 404;

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
      Metadata: metadata,
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
  contentDisposition = 'attachment',
}) => {
  try {
    const response = await getClient().send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
      })
    );

    return {
      mode: 'stream',
      contentDisposition,
      stream: response.Body,
    };
  } catch (err) {
    if (isObjectNotFoundError(err)) {
      const notFound = new Error('STORAGE_OBJECT_NOT_FOUND');
      notFound.status = 404;
      throw notFound;
    }

    throw err;
  }
};
