import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";

import { MEDIA_BUCKET } from "./storage";
import {
  mediaPublicationStatuses,
  type AlbumRecord,
  type MediaItemRecord,
  type MediaPublicationStatus,
  type PublicPhoto,
  type PublicPhotoAlbum,
  type PublicPhotoAlbumDetail,
} from "./types";

type DatabaseAlbum = {
  id: unknown;
  title: unknown;
  slug: unknown;
  description: unknown;
  status: unknown;
  published_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

type DatabaseMediaItem = {
  id: unknown;
  album_id: unknown;
  media_type: unknown;
  title: unknown;
  alt_text: unknown;
  caption: unknown;
  storage_path: unknown;
  status: unknown;
  published_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

function isPublicationStatus(
  value: unknown,
): value is MediaPublicationStatus {
  return (
    typeof value === "string" &&
    mediaPublicationStatuses.includes(value as MediaPublicationStatus)
  );
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeAlbum(value: DatabaseAlbum): AlbumRecord | null {
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
    !isPublicationStatus(value.status) ||
    typeof value.display_order !== "number" ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    description: nullableString(value.description),
    status: value.status,
    publishedAt: nullableString(value.published_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

function normalizeMediaItem(
  value: DatabaseMediaItem,
): MediaItemRecord | null {
  if (
    typeof value.id !== "string" ||
    (value.album_id !== null && typeof value.album_id !== "string") ||
    (value.media_type !== "image" && value.media_type !== "video") ||
    typeof value.title !== "string" ||
    !isPublicationStatus(value.status) ||
    typeof value.display_order !== "number" ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    albumId: value.album_id,
    mediaType: value.media_type,
    title: value.title,
    altText: nullableString(value.alt_text),
    caption: nullableString(value.caption),
    storagePath: nullableString(value.storage_path),
    status: value.status,
    publishedAt: nullableString(value.published_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

const albumColumns =
  "id,title,slug,description,status,published_at,display_order,created_at,updated_at";
const itemColumns =
  "id,album_id,media_type,title,alt_text,caption,storage_path,status,published_at,display_order,created_at,updated_at";

export async function getStaffAlbums(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumColumns)
    .order("display_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return { albums: [], error: true };
  }

  const albums = (data ?? [])
    .map((value) => normalizeAlbum(value as DatabaseAlbum))
    .filter((value): value is AlbumRecord => value !== null);

  return { albums, error: false };
}

export async function getStaffAlbum(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumColumns)
    .eq("id", id)
    .maybeSingle();

  return error || !data
    ? null
    : normalizeAlbum(data as DatabaseAlbum);
}

export async function getStaffMediaItems(
  supabase: SupabaseClient,
  albumId: string,
) {
  const { data, error } = await supabase
    .from("media_items")
    .select(itemColumns)
    .eq("album_id", albumId)
    .order("display_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    return { items: [], error: true };
  }

  const items = (data ?? [])
    .map((value) => normalizeMediaItem(value as DatabaseMediaItem))
    .filter((value): value is MediaItemRecord => value !== null);

  return { items, error: false };
}

export async function getStaffMediaItem(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("media_items")
    .select(itemColumns)
    .eq("id", id)
    .maybeSingle();

  return error || !data
    ? null
    : normalizeMediaItem(data as DatabaseMediaItem);
}

export function getPhotoAssetSrc(albumSlug: string, position: number) {
  return `/media/photo/${encodeURIComponent(albumSlug)}/${position}`;
}

async function getPublishedImageRows(
  supabase: SupabaseClient,
  albumIds: string[],
) {
  if (albumIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("media_items")
    .select(itemColumns)
    .in("album_id", albumIds)
    .eq("media_type", "image")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((value) => normalizeMediaItem(value as DatabaseMediaItem))
    .filter(
      (value): value is MediaItemRecord =>
        value !== null &&
        value.mediaType === "image" &&
        value.storagePath !== null,
    );
}

export async function getPublishedPhotoAlbums(
  limit = 24,
): Promise<PublicPhotoAlbum[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("albums")
    .select(albumColumns)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) {
    return [];
  }

  const albums = (data ?? [])
    .map((value) => normalizeAlbum(value as DatabaseAlbum))
    .filter((value): value is AlbumRecord => value !== null);
  const items = await getPublishedImageRows(
    supabase,
    albums.map((album) => album.id),
  );

  return albums.flatMap((album) => {
    const albumItems = items.filter((item) => item.albumId === album.id);

    if (albumItems.length === 0) {
      return [];
    }

    return [
      {
        title: album.title,
        slug: album.slug,
        description: album.description,
        publishedAt: album.publishedAt,
        photoCount: albumItems.length,
        coverSrc: getPhotoAssetSrc(album.slug, 1),
      },
    ];
  });
}

export async function getPublishedPhotoAlbum(
  slug: string,
): Promise<PublicPhotoAlbumDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("albums")
    .select(albumColumns)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const album = normalizeAlbum(data as DatabaseAlbum);

  if (!album) {
    return null;
  }

  const items = await getPublishedImageRows(supabase, [album.id]);
  const photos: PublicPhoto[] = items.map((item, index) => ({
    title: item.title,
    altText: item.altText || item.title,
    caption: item.caption,
    publishedAt: item.publishedAt,
    src: getPhotoAssetSrc(album.slug, index + 1),
  }));

  return {
    title: album.title,
    slug: album.slug,
    description: album.description,
    publishedAt: album.publishedAt,
    photos,
  };
}

export async function downloadPublishedPhoto(
  slug: string,
  position: number,
) {
  const supabase = createPublicClient();
  const { data: albumData, error: albumError } = await supabase
    .from("albums")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (albumError || typeof albumData?.id !== "string") {
    return null;
  }

  const { data, error } = await supabase
    .from("media_items")
    .select("storage_path")
    .eq("album_id", albumData.id)
    .eq("media_type", "image")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false })
    .range(position - 1, position - 1)
    .maybeSingle();

  if (error || typeof data?.storage_path !== "string") {
    return null;
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .download(data.storage_path);

  if (downloadError || !file) {
    return null;
  }

  return file.arrayBuffer();
}
