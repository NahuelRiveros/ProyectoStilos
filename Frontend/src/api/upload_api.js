import { http } from "./http";

export async function subirImagen(file) {
  const formData = new FormData();
  formData.append("imagen", file);

  const { data } = await http.post("/upload/imagen", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data;
}

export async function eliminarImagen(publicId) {
  if (!publicId) return;
  await http.delete("/upload/imagen", { data: { public_id: publicId } });
}
