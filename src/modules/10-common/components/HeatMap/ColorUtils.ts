import styles from './HeatMapColors.module.scss'

export const noAnalysisColor = 'var(--grey-200)'
export const noDataColor = 'var(--grey-100)'
export const lowRiskColor = 'var(--green-500)'
export const mediumRiskColor = 'var(--orange-500)'
export const highRiskColor = 'var(--red-500)'

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

export function getRiskColorStyle(value?: string) {
  switch (value) {
    case 'NO_ANALYSIS':
      return styles.noAnalysisColor
    case 'NO_DATA':
      return styles.noDataColor
    case 'LOW':
      return styles.lowRiskColor
    case 'MEDIUM':
      return styles.mediumRiskColor
    case 'HIGH':
      return styles.highRiskColor
    default:
      return styles.noAnalysisColor
  }
}

export function getRiskColorValue(value?: string) {
  switch (value) {
    case 'NO_ANALYSIS':
      return noAnalysisColor
    case 'NO_DATA':
      return noDataColor
    case 'LOW':
      return lowRiskColor
    case 'MEDIUM':
      return mediumRiskColor
    case 'HIGH':
      return highRiskColor
    default:
      return noAnalysisColor
  }
}
