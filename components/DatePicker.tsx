import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { localDateOf } from '../lib/format';
import { colors, fonts } from '../lib/theme';
import Button from './Button';

type Request = {
  value: string | null; // 'AAAA-MM-DD'; null = sin fecha todavía
  fallback?: Date; // con qué fecha abre si no hay ninguna (p. ej. hace 30 años para el nacimiento)
  minimumDate?: Date;
  maximumDate?: Date;
  title: string;
  onPick: (iso: string) => void;
};

const toDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Calendario del teléfono para elegir una fecha. En Android es la ventana nativa; en iPhone, el calendario de
// Apple dentro de una hoja con "Listo" (iOS no trae ventana propia). `open()` lo abre y `element` va en la pantalla.
export function useDatePicker(): { open: (r: Request) => void; element: ReactNode } {
  const [request, setRequest] = useState<Request | null>(null);
  const [draft, setDraft] = useState(new Date());

  function open(r: Request) {
    const start = r.value ? toDate(r.value) : (r.fallback ?? new Date());
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: start,
        mode: 'date',
        minimumDate: r.minimumDate,
        maximumDate: r.maximumDate,
        onValueChange: (_e, date) => r.onPick(localDateOf(date.toISOString())),
      });
      return;
    }
    setDraft(start);
    setRequest(r);
  }

  const close = () => setRequest(null);

  const element = (
    <Modal visible={request !== null} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{request?.title}</Text>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            locale="es-CO"
            themeVariant="dark"
            accentColor={colors.accent}
            minimumDate={request?.minimumDate}
            maximumDate={request?.maximumDate}
            onValueChange={(_e, date) => setDraft(date)}
          />
          <Button
            label="Listo"
            onPress={() => {
              request?.onPick(localDateOf(draft.toISOString()));
              close();
            }}
            style={{ marginTop: 8 }}
          />
          <Pressable style={styles.cancel} onPress={close} hitSlop={8}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return { open, element };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { backgroundColor: colors.graphite, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 },
  title: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 17, textAlign: 'center', marginBottom: 4 },
  cancel: { alignSelf: 'center', marginTop: 12, padding: 6 },
  cancelText: { color: colors.dim, fontFamily: fonts.body, fontSize: 14 },
});
