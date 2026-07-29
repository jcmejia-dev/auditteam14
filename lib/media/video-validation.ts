export const MAX_VIDEO_BYTES = 52_428_800;

export const supportedVideoTypes = [
  "video/mp4",
  "video/webm",
] as const;

export type SupportedVideoType = (typeof supportedVideoTypes)[number];
export type SupportedVideoExtension = "mp4" | "webm";

export type VideoFileDescriptor = {
  size: number;
  contentType: string;
  extension: string;
};

type VideoDescriptorValidation =
  | {
      success: true;
      contentType: SupportedVideoType;
      extension: SupportedVideoExtension;
    }
  | { success: false; message: string };

function matches(
  bytes: Uint8Array,
  expected: readonly number[],
  offset = 0,
) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export function validateVideoFileDescriptor(
  descriptor: VideoFileDescriptor,
): VideoDescriptorValidation {
  if (
    !Number.isSafeInteger(descriptor.size) ||
    descriptor.size <= 0 ||
    descriptor.size > MAX_VIDEO_BYTES
  ) {
    return {
      success: false,
      message: "Choose a video that is no larger than 50 MB.",
    };
  }

  const contentType = descriptor.contentType.trim().toLowerCase();
  const extension = descriptor.extension.trim().toLowerCase();
  const validPair =
    (contentType === "video/mp4" && extension === "mp4") ||
    (contentType === "video/webm" && extension === "webm");

  if (!validPair) {
    return {
      success: false,
      message:
        "Use an MP4 (.mp4) or WebM (.webm) file whose type and extension match.",
    };
  }

  return {
    success: true,
    contentType,
    extension,
  };
}

export async function validateVideoFile(file: File):
  Promise<
    | {
        success: true;
        contentType: SupportedVideoType;
        extension: SupportedVideoExtension;
      }
    | { success: false; message: string }
  > {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const descriptor = validateVideoFileDescriptor({
    size: file.size,
    contentType: file.type,
    extension,
  });

  if (!descriptor.success) {
    return descriptor;
  }

  const header = new Uint8Array(
    await file.slice(0, Math.min(file.size, 4096)).arrayBuffer(),
  );
  const isMp4 =
    header.length >= 12 &&
    matches(header, [0x66, 0x74, 0x79, 0x70], 4);
  const isWebm =
    header.length >= 4 &&
    matches(header, [0x1a, 0x45, 0xdf, 0xa3]) &&
    new TextDecoder("ascii")
      .decode(header)
      .toLowerCase()
      .includes("webm");
  const signatureMatches =
    (descriptor.contentType === "video/mp4" && isMp4) ||
    (descriptor.contentType === "video/webm" && isWebm);

  if (!signatureMatches) {
    return {
      success: false,
      message:
        "The file contents do not match the selected MP4 or WebM format.",
    };
  }

  return descriptor;
}

export function formatVideoBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 bytes";
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
