import { http, type ApiResponse } from "./http";

export interface ImagenSubida {
  url:       string;
  public_id: string;
}

export async function subirImagen(file: File): Promise<ImagenSubida> {
  const formData = new FormData();
  formData.append("imagen", file);

  const r = await http.post<ApiResponse<ImagenSubida>>("/upload/imagen", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data.data;
}

export async function eliminarImagen(publicId: string): Promise<void> {
  await http.delete("/upload/imagen", { data: { public_id: publicId } });
}
