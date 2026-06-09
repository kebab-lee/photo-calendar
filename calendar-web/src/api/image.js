import client from './client.js';

/** 업로드(있으면 교체). multipart file + fit. → { imageUrl, thumbUrl, fit } */
export async function uploadImage(date, file, fit) {
  const form = new FormData();
  form.append('file', file);
  form.append('fit', fit);
  const { data } = await client.post(`/entries/${date}/image`, form);
  return data;
}

/** fit 변경(cover/contain). → ImageResponse */
export async function updateFit(date, fit) {
  const { data } = await client.patch(`/entries/${date}/image`, { fit });
  return data;
}

/** 삭제. */
export async function deleteImage(date) {
  await client.delete(`/entries/${date}/image`);
}
