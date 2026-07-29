export const mediaPublicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type MediaPublicationStatus =
  (typeof mediaPublicationStatuses)[number];

export type AlbumRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: MediaPublicationStatus;
  publishedAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaItemRecord = {
  id: string;
  albumId: string | null;
  mediaType: "image" | "video";
  title: string;
  altText: string | null;
  caption: string | null;
  eventDate: string | null;
  storagePath: string | null;
  videoUploadCompletedAt: string | null;
  status: MediaPublicationStatus;
  publishedAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AlbumFormValues = {
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export type MediaItemFormValues = {
  title: string;
  altText: string;
  caption: string;
  eventDate: string;
  displayOrder: number;
};

export type PublicPhotoAlbum = {
  title: string;
  slug: string;
  description: string | null;
  publishedAt: string | null;
  photoCount: number;
  coverSrc: string;
};

export type PublicPhoto = {
  title: string;
  altText: string;
  caption: string | null;
  publishedAt: string | null;
  src: string;
};

export type PublicPhotoAlbumDetail = Omit<
  PublicPhotoAlbum,
  "photoCount" | "coverSrc"
> & {
  photos: PublicPhoto[];
};

export type PublicVideo = {
  title: string;
  accessibleDescription: string;
  caption: string | null;
  eventDate: string | null;
  publishedAt: string | null;
  playbackUrl: string;
};

export function isMediaUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
