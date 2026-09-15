import {getNestAxiosInstance, getNestOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {FilesApi} from "@/client/nest";
import {StorageKeys} from "@/lib/common/Constants";

export default class FileClient {
  async uploadFiles(files: File[]): Promise<string[]> {
    const token = localStorage.getItem(StorageKeys.Token);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await getNestAxiosInstance().post("/files", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.urls;
  }

  async getStorageUrl(): Promise<string> {
    const api = new FilesApi(getNestOpenAPIConfiguration());
    const response = await api.filesControllerGetWebUrl();
    return response.data.webUrl;
  }

  async cloneFiles(filenames: string[]): Promise<string[]> {
    const api = new FilesApi(getNestOpenAPIConfiguration());
    const response = await api.filesControllerCloneFiles({
      filenames: filenames
    });
    return response.data.urls;
  }

  async fetchFiles(): Promise<string[]> {
    const api = new FilesApi(getNestOpenAPIConfiguration());
    const response = await api.filesControllerGetFiles();
    return response.data.urls;
  }

  async deleteFiles(filenames: string[]): Promise<void> {
    const api = new FilesApi(getNestOpenAPIConfiguration());
    await api.filesControllerDeleteFiles({
      filenames: filenames
    });
  }
}
