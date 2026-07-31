import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DirectusApiService } from '../../../core/services/directus-api.service';

export interface UploadedBlogFile {
  fileId: string;
  url: string;
  filename: string;
  mimeType: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private readonly directus: DirectusApiService) {}

  async uploadFile(file: File): Promise<UploadedBlogFile> {
    if (!file.size) {
      throw new Error('El archivo está vacío');
    }

    const response = await firstValueFrom(
      this.directus.uploadFile(file, file.name, { auth: true })
    );
    const fileId = response.data.id;
    return {
      fileId,
      url: this.directus.assetUrl(fileId),
      filename: response.data.filename_download || file.name,
      mimeType: file.type || 'application/octet-stream',
    };
  }
}
