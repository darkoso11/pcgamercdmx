import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export type CatalogImageData = {
  image: string;
  gallery: string[];
};

export function isSupportedCatalogImageFile(file: File): boolean {
  const fileName = file.name.toLowerCase();

  return SUPPORTED_IMAGE_TYPES.includes(file.type)
    || SUPPORTED_IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

export function prepareCatalogImagesForSave<T extends CatalogImageData>(
  data: T,
  selectedMainImageFile: File | null,
  selectedGalleryImageFiles: Map<string, File>,
  uploadImage: (file: File) => Observable<string>
): Observable<T> {
  const mainImage$ = selectedMainImageFile ? uploadImage(selectedMainImageFile) : of(data.image);

  const galleryUploads = data.gallery.map((image) => {
    const file = selectedGalleryImageFiles.get(image);
    return file ? uploadImage(file) : of(image);
  });

  const gallery$ = galleryUploads.length > 0 ? forkJoin(galleryUploads) : of([]);

  return forkJoin({ image: mainImage$, gallery: gallery$ }).pipe(
    map(({ image, gallery }) => ({ ...data, image, gallery }))
  );
}

export function getCatalogSaveErrorMessage(error: any, fallback: string): string {
  const status = error?.status;
  if (status === 401 || status === 403) {
    return `${fallback}. Tu sesion de Directus expiro o no tiene permisos; cierra sesion e ingresa de nuevo.`;
  }

  if (error?.name === 'TimeoutError') {
    return `${fallback}. Directus tardo demasiado en responder; intenta con una imagen mas ligera o vuelve a iniciar sesion.`;
  }

  return fallback;
}
