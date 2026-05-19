import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export default function SedanGraphic({ width = 300, height = 150 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 1200 600" fill="none">
      <Defs>
        <LinearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="50%" stopColor="#111827" />
          <Stop offset="100%" stopColor="#000000" />
        </LinearGradient>
        <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#DFF6FF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.2" />
        </LinearGradient>
        <RadialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Ellipse cx="600" cy="500" rx="280" ry="40" fill="url(#wheelGlow)" opacity="0.6" />

      <G>
        <Path
          d="M250 360C280 300 360 250 520 240H760C860 240 930 280 980 340L1040 360C1070 370 1090 390 1090 420V450C1090 470 1070 490 1040 490H980C970 520 940 550 890 550C840 550 800 520 790 490H420C410 520 370 550 320 550C270 550 230 520 220 490H180C150 490 130 470 130 440V410C130 390 150 370 180 360L250 360Z"
          fill="url(#carBody)"
        />
        <Path
          d="M300 350C360 290 470 260 690 260H760C850 260 900 290 940 340"
          stroke="#374151"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.5"
        />
        <Path
          d="M430 260H730C810 260 860 290 900 340H620L540 280H460L430 260Z"
          fill="url(#glass)"
        />
        <Rect x="930" y="355" width="70" height="18" rx="9" fill="#E0F2FE" />
        <Rect x="930" y="355" width="70" height="18" rx="9" fill="#06B6D4" opacity="0.35" />
        <Rect x="210" y="365" width="50" height="16" rx="8" fill="#FCA5A5" opacity="0.8" />
        <Circle cx="320" cy="490" r="62" fill="#111827" />
        <Circle cx="320" cy="490" r="34" fill="#6B7280" />
        <Circle cx="890" cy="490" r="62" fill="#111827" />
        <Circle cx="890" cy="490" r="34" fill="#6B7280" />
        <G stroke="#D1D5DB" strokeWidth="3" opacity="0.6">
          <Line x1="320" y1="456" x2="320" y2="524" />
          <Line x1="286" y1="490" x2="354" y2="490" />
          <Line x1="890" y1="456" x2="890" y2="524" />
          <Line x1="856" y1="490" x2="924" y2="490" />
        </G>
        <G fill="#FFFFFF" opacity="0.45">
          <Circle cx="420" cy="340" r="4" />
          <Circle cx="470" cy="320" r="3" />
          <Circle cx="620" cy="310" r="5" />
          <Circle cx="740" cy="350" r="4" />
          <Circle cx="860" cy="330" r="3" />
        </G>
      </G>
    </Svg>
  );
}
