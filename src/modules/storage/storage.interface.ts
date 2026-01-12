export interface IStorageService {
  uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<void>;

  getPublicUrl(bucket: string, path: string): Promise<string>;

  deleteFile(bucket: string, path: string): Promise<void>;
}
