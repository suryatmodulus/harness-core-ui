import styles from './HeatMapColors.module.scss'

export const colors = [
  styles.heatmapColor1,
  styles.heatmapColor2,
  styles.heatmapColor3,
  styles.heatmapColor4,
  styles.heatmapColor5,
  styles.heatmapColor6,
  styles.heatmapColor7,
  styles.heatmapColor8,
  styles.heatmapColor9,
  styles.heatmapColor10
]

export const HeatMapColors = {
  COLOR_1: '#348200',
  COLOR_2: '#43a700',
  COLOR_3: '#6fd400',
  COLOR_4: '#ffde4f',
  COLOR_5: '#ffcc1d',
  COLOR_6: '#fbbb00',
  COLOR_7: '#fa8200',
  COLOR_8: '#ef4b4b',
  COLOR_9: '#df281c',
  COLOR_10: '#ac1717'
}

function getColorIndex(value: number, minValue: number, maxValue: number): number {
  const limitedValue = Math.max(Math.min(value, maxValue), minValue)
  const colorIndex = ((limitedValue - minValue) * (colors.length - 1)) / (maxValue - minValue)
  return Math.round(colorIndex)
}

export function getColorStyle(value: number, minValue = 0, maxValue = 1): string {
  return colors[getColorIndex(value, minValue, maxValue)]
}

export function getColorValue(value: number, minValue = 0, maxValue = 1): string {
  return Object.values(HeatMapColors)[getColorIndex(value, minValue, maxValue)]
}
