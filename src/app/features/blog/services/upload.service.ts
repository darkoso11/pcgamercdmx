import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private base = '/api/blog/uploads';
  constructor(private http: HttpClient) {}

  async uploadFile(file: File): Promise<string> {
    const meta = { filename: file.name, contentType: file.type };
    const resp: any = await this.http.post(`${this.base}/sign`, meta).toPromise();
    const { signedUrl, publicUrl } = resp || {};
    if (!signedUrl) throw new Error('No signed URL returned');
    await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return publicUrl;
  }
}
