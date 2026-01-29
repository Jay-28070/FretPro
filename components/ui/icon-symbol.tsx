// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Tab bar icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'music.note': 'music-note',
  'tuningfork': 'tune',
  'person.fill': 'person',
  
  // Profile icons
  'gearshape.fill': 'settings',
  'person.2.fill': 'people',
  'chart.bar.fill': 'bar-chart',
  'trophy.fill': 'emoji-events',
  'chevron.right': 'chevron-right',
  
  // Friends icons
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
  'person.2': 'people-outline',
  'bolt.fill': 'flash-on',
  'checkmark': 'check',
  'xmark': 'close',
  
  // Other
  'chevron.left.forwardslash.chevron.right': 'code',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
