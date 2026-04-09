import { auth } from "@/auth";
import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { filename, contentType } = await request.json();

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "nobshomes";

  if (!accountName || !accountKey) {
    return new Response("Azure storage not configured", { status: 500 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const blobName = `gallery/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + 15);

  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("cw"),
    startsOn: new Date(),
    expiresOn,
    contentType,
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
  const permanentUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

  // For public-access-blocked containers, we generate a long-lived read SAS (1 year)
  const readExpiresOn = new Date();
  readExpiresOn.setFullYear(readExpiresOn.getFullYear() + 1);

  const readSasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: readExpiresOn,
    },
    sharedKeyCredential
  ).toString();

  const readSasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${readSasToken}`;

  // For the blob URL stored in DB, we store the read SAS URL (1-year expiry)
  return Response.json({ sasUrl, permanentUrl: readSasUrl, blobName });
}
