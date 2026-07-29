"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import {
  getStaffAlbum,
  getStaffMediaItem,
  getStaffMediaItems,
} from "@/lib/media/data";
import { MEDIA_BUCKET } from "@/lib/media/storage";
import { isMediaUuid } from "@/lib/media/types";
import {
  type AlbumFieldErrors,
  type MediaItemFieldErrors,
  validateAlbumForm,
  validateImageUpload,
  validateMediaItemForm,
} from "@/lib/media/validation";

export type MediaActionState = {
  message: string | null;
  albumFieldErrors?: AlbumFieldErrors;
  itemFieldErrors?: MediaItemFieldErrors;
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

  const item = await getStaffMediaItem(context.supabase, id);

  if (!item || !item.albumId) {
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
      item.mediaType !== "image" ||
      !item.storagePath
    ) {
      return { message: GENERIC_PERMISSION_ERROR };
    }
  }

  const validation = validateMediaItemForm(formData);

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

  const album = await getStaffAlbum(context.supabase, item.albumId);
  revalidateMediaPaths(album?.slug);
  revalidatePath(`/staff/media/items/${id}/edit`);
  revalidatePath(`/staff/media/albums/${item.albumId}/edit`);
  redirect(
    intent === "publish"
      ? `/staff/media/albums/${item.albumId}/edit?notice=photo-published`
      : `/staff/media/albums/${item.albumId}/edit?notice=photo-updated`,
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

  const item = await getStaffMediaItem(context.supabase, id);

  if (!item || !item.albumId) {
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

  const album = await getStaffAlbum(context.supabase, item.albumId);
  revalidateMediaPaths(album?.slug);
  redirect(
    `/staff/media/albums/${item.albumId}/edit?notice=photo-archived`,
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

  const item = await getStaffMediaItem(context.supabase, id);

  if (!item || !item.albumId) {
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
      .from(MEDIA_BUCKET)
      .remove([item.storagePath]);

    if (storageError) {
      return {
        message:
          "The item was archived, but its file could not be removed. Nothing was permanently deleted; try again later.",
      };
    }

    const { data: cleared, error: clearError } = await context.supabase
      .from("media_items")
      .update({ storage_path: null })
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

  const album = await getStaffAlbum(context.supabase, item.albumId);
  revalidateMediaPaths(album?.slug);
  revalidatePath(`/staff/media/albums/${item.albumId}/edit`);
  redirect(
    `/staff/media/albums/${item.albumId}/edit?notice=photo-deleted`,
  );
}
