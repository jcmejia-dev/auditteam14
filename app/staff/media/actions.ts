"use server";

import { randomBytes, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import {
  getStaffAlbum,
  getStaffMediaItem,
  getStaffMediaItems,
  getStaffVideoItem,
} from "@/lib/media/data";
import {
  isVideoStorageReady,
  MEDIA_BUCKET,
  verifyStoredVideoObject,
  VIDEO_BUCKET,
} from "@/lib/media/storage";
import { isMediaUuid } from "@/lib/media/types";
import {
  type AlbumFieldErrors,
  type MediaItemFieldErrors,
  validateAlbumForm,
  validateImageUpload,
  validateMediaItemForm,
} from "@/lib/media/validation";
import {
  validateVideoFileDescriptor,
  type SupportedVideoType,
} from "@/lib/media/video-validation";

export type MediaActionState = {
  message: string | null;
  albumFieldErrors?: AlbumFieldErrors;
  itemFieldErrors?: MediaItemFieldErrors;
};

export type VideoUploadRequest = {
  title: string;
  accessibleDescription: string;
  caption: string;
  eventDate: string;
  displayOrder: number;
  albumId: string | null;
  fileSize: number;
  contentType: string;
  extension: string;
};

export type VideoUploadActionResult =
  | {
      success: true;
      message: string;
      reservation: {
        mediaId: string;
        storagePath: string;
        contentType: SupportedVideoType;
      };
    }
  | {
      success: false;
      message: string;
      fieldErrors?: MediaItemFieldErrors;
    };

export type VideoUploadCompletionResult = {
  success: boolean;
  message: string;
  editPath?: string;
};

const GENERIC_SAVE_ERROR =
  "The media record could not be saved. Check your entries and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this media action.";

async function getActionContext() {
  const context = await getStaffContext();

  if (context.access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (context.access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  return {
    role: context.access.staff.role,
    supabase: context.supabase,
  };
}

function canEditDrafts(role: StaffRole) {
  return role === "admin" || role === "editor";
}

function revalidateMediaPaths(albumSlug?: string) {
  revalidatePath("/");
  revalidatePath("/photos");
  revalidatePath("/videos");
  revalidatePath("/staff/media");

  if (albumSlug) {
    revalidatePath(`/photos/${albumSlug}`);
  }
}

function databaseErrorMessage(code: string | undefined) {
  if (code === "23505") {
    return "That web address name is already in use. Choose another slug.";
  }

  if (code === "23503") {
    return "Remove the album's media items before deleting the album.";
  }

  return GENERIC_SAVE_ERROR;
}

function mediaItemDestination(item: {
  albumId: string | null;
  mediaType: "image" | "video";
}) {
  return item.albumId
    ? `/staff/media/albums/${item.albumId}/edit`
    : "/staff/media";
}

function appendNotice(path: string, notice: string) {
  return `${path}?notice=${notice}`;
}

function videoMetadataFormData(input: VideoUploadRequest) {
  const formData = new FormData();
  formData.set("title", input.title);
  formData.set("altText", input.accessibleDescription);
  formData.set("caption", input.caption);
  formData.set("eventDate", input.eventDate);
  formData.set("displayOrder", String(input.displayOrder));
  return formData;
}

function isVideoUploadRequest(value: unknown): value is VideoUploadRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.title === "string" &&
    typeof input.accessibleDescription === "string" &&
    typeof input.caption === "string" &&
    typeof input.eventDate === "string" &&
    typeof input.displayOrder === "number" &&
    (input.albumId === null || typeof input.albumId === "string") &&
    typeof input.fileSize === "number" &&
    typeof input.contentType === "string" &&
    typeof input.extension === "string"
  );
}

export async function createAlbumAction(
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getActionContext();

  if (!canEditDrafts(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const validation = validateAlbumForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      albumFieldErrors: validation.errors,
    };
  }

  const { data, error } = await context.supabase
    .from("albums")
    .insert({ ...validation.databaseValues, status: "draft" })
    .select("id")
    .single();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidateMediaPaths();
  redirect("/staff/media?notice=album-created");
}

export async function updateAlbumAction(
  id: string,
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getActionContext();

  if (!isMediaUuid(id) || !canEditDrafts(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const intent = formData.get("intent");

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const album = await getStaffAlbum(context.supabase, id);

  if (!album) {
    return {
      message: "The album is unavailable or your account cannot access it.",
    };
  }

  if (
    context.role === "editor" &&
    (album.status !== "draft" || intent !== "save")
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent === "publish" && context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const validation = validateAlbumForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      albumFieldErrors: validation.errors,
    };
  }

  if (intent === "publish") {
    const { items, error } = await getStaffMediaItems(
      context.supabase,
      album.id,
    );
    const hasPublishedPhoto = items.some(
      (item) =>
        item.mediaType === "image" &&
        item.status === "published" &&
        item.storagePath !== null,
    );

    if (error || !hasPublishedPhoto) {
      return {
        message:
          "Publish at least one approved photo before publishing this album.",
      };
    }
  }

  const values =
    intent === "publish"
      ? {
          ...validation.databaseValues,
          status: "published",
          published_at: null,
        }
      : validation.databaseValues;
  const { data, error } = await context.supabase
    .from("albums")
    .update(values)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidateMediaPaths(validation.values.slug);
  revalidatePath(`/staff/media/albums/${id}/edit`);
  redirect(
    intent === "publish"
      ? "/staff/media?notice=album-published"
      : "/staff/media?notice=album-updated",
  );
}

export async function archiveAlbumAction(
  id: string,
  _previousState: MediaActionState,
  _formData: FormData,
): Promise<MediaActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isMediaUuid(id) || context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const album = await getStaffAlbum(context.supabase, id);

  if (!album) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const { data, error } = await context.supabase
    .from("albums")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidateMediaPaths(album.slug);
  redirect("/staff/media?notice=album-archived");
}

export async function deleteAlbumAction(
  id: string,
  _previousState: MediaActionState,
  _formData: FormData,
): Promise<MediaActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isMediaUuid(id) || context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const album = await getStaffAlbum(context.supabase, id);

  if (!album) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const { items, error: itemsError } = await getStaffMediaItems(
    context.supabase,
    id,
  );

  if (itemsError || items.length > 0) {
    return {
      message:
        "Delete every media item in this album before deleting the album.",
    };
  }

  const { data, error } = await context.supabase
    .from("albums")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidateMediaPaths(album.slug);
  redirect("/staff/media?notice=album-deleted");
}

export async function uploadPhotoAction(
  albumId: string,
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getActionContext();

  if (!isMediaUuid(albumId) || !canEditDrafts(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const album = await getStaffAlbum(context.supabase, albumId);

  if (
    !album ||
    (context.role === "editor" && album.status !== "draft")
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const itemValidation = validateMediaItemForm(formData);

  if (!itemValidation.success) {
    return {
      message: "Review the highlighted fields before uploading.",
      itemFieldErrors: itemValidation.errors,
    };
  }

  const imageValidation = await validateImageUpload(formData);

  if (!imageValidation.success) {
    return {
      message: imageValidation.error,
      itemFieldErrors: { file: imageValidation.error },
    };
  }

  const mediaId = randomUUID();
  const storagePath = `${albumId}/${mediaId}.${imageValidation.upload.extension}`;
  const { error: uploadError } = await context.supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, imageValidation.upload.bytes, {
      cacheControl: "3600",
      contentType: imageValidation.upload.contentType,
      upsert: false,
    });

  if (uploadError) {
    return {
      message:
        "The image could not be uploaded. Storage may not be ready; try again later.",
    };
  }

  const { data, error } = await context.supabase
    .from("media_items")
    .insert({
      id: mediaId,
      album_id: albumId,
      media_type: "image",
      ...itemValidation.databaseValues,
      storage_path: storagePath,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    const { error: cleanupError } = await context.supabase.storage
      .from(MEDIA_BUCKET)
      .remove([storagePath]);

    return {
      message: cleanupError
        ? "The media record was not saved and the temporary upload could not be cleaned up. Ask an administrator to review Storage."
        : GENERIC_SAVE_ERROR,
    };
  }

  revalidateMediaPaths(album.slug);
  revalidatePath(`/staff/media/albums/${albumId}/edit`);
  redirect(
    `/staff/media/albums/${albumId}/edit?notice=photo-uploaded`,
  );
}

export async function prepareVideoUploadAction(
  untrustedInput: unknown,
): Promise<VideoUploadActionResult> {
  const context = await getActionContext();

  if (
    !canEditDrafts(context.role) ||
    !isVideoUploadRequest(untrustedInput)
  ) {
    return { success: false, message: GENERIC_PERMISSION_ERROR };
  }

  const input = untrustedInput;
  const descriptor = validateVideoFileDescriptor({
    size: input.fileSize,
    contentType: input.contentType,
    extension: input.extension,
  });

  if (!descriptor.success) {
    return {
      success: false,
      message: descriptor.message,
      fieldErrors: { file: descriptor.message },
    };
  }

  const metadata = validateMediaItemForm(
    videoMetadataFormData(input),
    "video",
  );

  if (!metadata.success) {
    return {
      success: false,
      message: "Review the highlighted details before uploading.",
      fieldErrors: metadata.errors,
    };
  }

  const albumId = input.albumId?.trim() || null;

  if (albumId && !isMediaUuid(albumId)) {
    return {
      success: false,
      message: "Choose a valid album or leave the album selection empty.",
    };
  }

  if (albumId) {
    const album = await getStaffAlbum(context.supabase, albumId);

    if (
      !album ||
      (context.role === "editor" && album.status !== "draft")
    ) {
      return { success: false, message: GENERIC_PERMISSION_ERROR };
    }
  }

  if (!(await isVideoStorageReady(context.supabase))) {
    return {
      success: false,
      message:
        "Secure video Storage is not ready. Ask an administrator to verify the reviewed migration.",
    };
  }

  const mediaId = randomUUID();
  const objectToken = randomBytes(16).toString("hex");
  const storagePath = `${objectToken}/${objectToken}.${descriptor.extension}`;
  const { data, error } = await context.supabase
    .from("media_items")
    .insert({
      id: mediaId,
      album_id: albumId,
      media_type: "video",
      ...metadata.databaseValues,
      storage_path: storagePath,
      status: "draft",
      video_upload_completed_at: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/media");

  return {
    success: true,
    message: "The secure draft path is ready. Starting the upload now.",
    reservation: {
      mediaId,
      storagePath,
      contentType: descriptor.contentType,
    },
  };
}

export async function finalizeVideoUploadAction(
  mediaId: string,
): Promise<VideoUploadCompletionResult> {
  const context = await getActionContext();

  if (!isMediaUuid(mediaId) || !canEditDrafts(context.role)) {
    return { success: false, message: GENERIC_PERMISSION_ERROR };
  }

  const item = await getStaffVideoItem(context.supabase, mediaId);

  if (
    !item ||
    item.status !== "draft" ||
    !item.storagePath ||
    item.videoUploadCompletedAt
  ) {
    return {
      success: false,
      message:
        "The video draft is unavailable or has already been verified.",
    };
  }

  if (
    !(await verifyStoredVideoObject(
      context.supabase,
      item.storagePath,
    ))
  ) {
    return {
      success: false,
      message:
        "The upload finished, but Storage could not verify the completed MP4/WebM object yet. Use Retry verification.",
    };
  }

  const { data, error } = await context.supabase
    .from("media_items")
    .update({ video_upload_completed_at: new Date().toISOString() })
    .eq("id", item.id)
    .eq("status", "draft")
    .is("video_upload_completed_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message:
        "The video is stored safely, but its draft could not be finalized. Use Retry verification.",
    };
  }

  revalidateMediaPaths();
  revalidatePath(`/staff/media/items/${item.id}/edit`);

  return {
    success: true,
    message: "The video was uploaded and saved as a draft.",
    editPath: `/staff/media/items/${item.id}/edit?notice=video-uploaded`,
  };
}

export async function cancelVideoUploadAction(
  mediaId: string,
): Promise<VideoUploadCompletionResult> {
  const context = await getActionContext();

  if (!isMediaUuid(mediaId) || !canEditDrafts(context.role)) {
    return { success: false, message: GENERIC_PERMISSION_ERROR };
  }

  const item = await getStaffVideoItem(context.supabase, mediaId);

  if (
    !item ||
    item.status !== "draft" ||
    !item.storagePath ||
    (context.role === "editor" && item.videoUploadCompletedAt !== null)
  ) {
    return {
      success: false,
      message:
        "This upload can no longer be cancelled from the upload page.",
    };
  }

  const { data: objectExists, error: existsError } =
    await context.supabase.storage
      .from(VIDEO_BUCKET)
      .exists(item.storagePath);

  if (existsError) {
    return {
      success: false,
      message:
        "The upload was stopped, but Storage cleanup could not be verified. The draft remains private for administrator review.",
    };
  }

  if (objectExists) {
    const { error: removeError } = await context.supabase.storage
      .from(VIDEO_BUCKET)
      .remove([item.storagePath]);

    if (removeError) {
      return {
        success: false,
        message:
          "The upload was stopped, but its private object could not be removed. The draft remains private for administrator review.",
      };
    }
  }

  const { data, error } = await context.supabase
    .from("media_items")
    .update({
      storage_path: null,
      video_upload_completed_at: null,
    })
    .eq("id", item.id)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message:
        "The private upload was removed, but the incomplete draft needs administrator review.",
    };
  }

  revalidatePath("/staff/media");

  return {
    success: true,
    message:
      "Upload cancelled. No video was published; an incomplete private draft remains for review.",
  };
}

export async function updateMediaItemAction(
  id: string,
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getActionContext();

  if (!isMediaUuid(id) || !canEditDrafts(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const intent = formData.get("intent");

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const initialItem = await getStaffMediaItem(context.supabase, id);
  const item =
    initialItem?.mediaType === "video"
      ? await getStaffVideoItem(context.supabase, id)
      : initialItem;

  if (!item) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (
    context.role === "editor" &&
    (item.status !== "draft" || intent !== "save")
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent === "publish") {
    if (
      context.role !== "admin" ||
      !item.storagePath
    ) {
      return { message: GENERIC_PERMISSION_ERROR };
    }

    if (
      item.mediaType === "video" &&
      (!item.videoUploadCompletedAt ||
        !(await verifyStoredVideoObject(
          context.supabase,
          item.storagePath,
        )))
    ) {
      return {
        message:
          "The completed MP4/WebM object must be verified before publication.",
      };
    }
  }

  const validation = validateMediaItemForm(formData, item.mediaType);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      itemFieldErrors: validation.errors,
    };
  }

  const values =
    intent === "publish"
      ? {
          ...validation.databaseValues,
          status: "published",
          published_at: null,
        }
      : validation.databaseValues;
  const { data, error } = await context.supabase
    .from("media_items")
    .update(values)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const album = item.albumId
    ? await getStaffAlbum(context.supabase, item.albumId)
    : null;
  revalidateMediaPaths(album?.slug);
  revalidatePath(`/staff/media/items/${id}/edit`);

  if (item.albumId) {
    revalidatePath(`/staff/media/albums/${item.albumId}/edit`);
  }

  const itemLabel = item.mediaType === "video" ? "video" : "photo";
  redirect(
    appendNotice(
      mediaItemDestination(item),
      `${itemLabel}-${intent === "publish" ? "published" : "updated"}`,
    ),
  );
}

export async function archiveMediaItemAction(
  id: string,
  _previousState: MediaActionState,
  _formData: FormData,
): Promise<MediaActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isMediaUuid(id) || context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const initialItem = await getStaffMediaItem(context.supabase, id);
  const item =
    initialItem?.mediaType === "video"
      ? await getStaffVideoItem(context.supabase, id)
      : initialItem;

  if (!item) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const { data, error } = await context.supabase
    .from("media_items")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const album = item.albumId
    ? await getStaffAlbum(context.supabase, item.albumId)
    : null;
  revalidateMediaPaths(album?.slug);
  redirect(
    appendNotice(
      mediaItemDestination(item),
      `${item.mediaType === "video" ? "video" : "photo"}-archived`,
    ),
  );
}

export async function deleteMediaItemAction(
  id: string,
  _previousState: MediaActionState,
  _formData: FormData,
): Promise<MediaActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isMediaUuid(id) || context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const initialItem = await getStaffMediaItem(context.supabase, id);
  const item =
    initialItem?.mediaType === "video"
      ? await getStaffVideoItem(context.supabase, id)
      : initialItem;

  if (!item) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const { data: archived, error: archiveError } =
    await context.supabase
      .from("media_items")
      .update({ status: "archived" })
      .eq("id", id)
      .select("id")
      .maybeSingle();

  if (archiveError || !archived) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (item.storagePath) {
    const { error: storageError } = await context.supabase.storage
      .from(item.mediaType === "video" ? VIDEO_BUCKET : MEDIA_BUCKET)
      .remove([item.storagePath]);

    if (storageError) {
      return {
        message:
          "The item was archived, but its file could not be removed. Nothing was permanently deleted; try again later.",
      };
    }

    const clearValues =
      item.mediaType === "video"
        ? {
            storage_path: null,
            video_upload_completed_at: null,
          }
        : { storage_path: null };
    const { data: cleared, error: clearError } = await context.supabase
      .from("media_items")
      .update(clearValues)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (clearError || !cleared) {
      return {
        message:
          "The file was removed and the record was archived, but final cleanup needs administrator review.",
      };
    }
  }

  const { data, error } = await context.supabase
    .from("media_items")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message:
        "The item is safely archived, but permanent record deletion could not be completed.",
    };
  }

  const album = item.albumId
    ? await getStaffAlbum(context.supabase, item.albumId)
    : null;
  revalidateMediaPaths(album?.slug);

  if (item.albumId) {
    revalidatePath(`/staff/media/albums/${item.albumId}/edit`);
  }

  redirect(
    appendNotice(
      mediaItemDestination(item),
      `${item.mediaType === "video" ? "video" : "photo"}-deleted`,
    ),
  );
}
