import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { localDateOf } from './format';

// Fotos de progreso: se guardan SOLO en el teléfono, en la carpeta privada de la app (nunca se suben).
// Nombre del archivo: AAAA-MM-DD_<milisegundos>.jpg, así la fecha se lee del nombre.
export type Foto = { uri: string; day: string; time: number; file: File };

function carpeta(userId: string) {
  return new Directory(Paths.document, 'fotos-progreso', userId);
}

export function listarFotos(userId: string): Foto[] {
  const dir = carpeta(userId);
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((item): item is File => item instanceof File && /^\d{4}-\d{2}-\d{2}_\d+\.jpg$/.test(item.name))
    .map((file) => {
      const [day, rest] = file.name.split('_');
      return { uri: file.uri, day, time: Number(rest.replace('.jpg', '')), file };
    })
    .sort((a, b) => b.time - a.time);
}

export type ResultadoFoto = 'ok' | 'cancelada' | 'sin-permiso';

export async function tomarFoto(userId: string): Promise<ResultadoFoto> {
  const permiso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permiso.granted) return 'sin-permiso';

  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled || !result.assets[0]) return 'cancelada';

  const dir = carpeta(userId);
  if (!dir.exists) dir.create({ intermediates: true });
  const now = Date.now();
  const destino = new File(dir, `${localDateOf(new Date(now).toISOString())}_${now}.jpg`);
  await new File(result.assets[0].uri).copy(destino);
  return 'ok';
}

export function borrarFoto(foto: Foto) {
  if (foto.file.exists) foto.file.delete();
}
