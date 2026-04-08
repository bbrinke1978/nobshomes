export interface GalleryImage {
  src: string;
  alt: string;
  project: string;
}

/**
 * Gallery image manifest.
 * To add a new image:
 * 1. Drop the image file into public/images/gallery/
 * 2. Add an entry below with src (relative to public/), alt text, and project name
 */
export const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/placeholder-1.jpg",
    alt: "Renovated suburban home - before and after",
    project: "Salt Lake City Renovation",
  },
  {
    src: "/images/gallery/placeholder-2.jpg",
    alt: "Rural property purchase in Carbon County",
    project: "Price Property Acquisition",
  },
  {
    src: "/images/gallery/placeholder-3.jpg",
    alt: "Modern home restoration project",
    project: "Provo Home Restoration",
  },
];
