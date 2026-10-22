import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Muneco, munecoSvg } from '../lib/muneco';

// Dibuja el muñeco en un círculo blanco del tamaño pedido.
export default function MunecoView({
  muneco,
  size,
  rounded = true,
}: {
  muneco: Muneco;
  size: number;
  rounded?: boolean;
}) {
  const xml = useMemo(() => munecoSvg(muneco), [muneco]);
  return (
    <View
      style={{ width: size, height: size, borderRadius: rounded ? size / 2 : size * 0.18, overflow: 'hidden', backgroundColor: '#FFFFFF' }}
      accessibilityRole="image"
      accessibilityLabel="Tu muñeco"
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
