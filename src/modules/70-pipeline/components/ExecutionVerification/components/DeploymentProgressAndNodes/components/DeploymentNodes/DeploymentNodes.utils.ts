import type { DeploymentNodeAnalysisResult } from './DeploymentNodes.constants'

export type HexagonCoordinates = { x: number; y: number }

const A = (2 * Math.PI) / 6
const HexagonRadius = 12

export function drawGrid(width: number, height: number, totalNodes: number): HexagonCoordinates[] {
  const cooordinates: HexagonCoordinates[] = []
  const radiusWithMargin = HexagonRadius + 2.4
  for (
    let y = radiusWithMargin, nodesGenerated = 0;
    y + HexagonRadius * Math.sin(A) < height && nodesGenerated < totalNodes;
    y += radiusWithMargin * Math.sin(A)
  ) {
    for (
      let x = radiusWithMargin, j = 0;
      x + radiusWithMargin * (1 + Math.cos(A)) < width && nodesGenerated < totalNodes;
      x += radiusWithMargin * (1 + Math.cos(A)), y += (-1) ** j++ * radiusWithMargin * Math.sin(A), nodesGenerated++
    ) {
      cooordinates.push({ x, y })
    }
  }

  return cooordinates
}

export function mapNodeHealthStatusToColor(nodeHealth: DeploymentNodeAnalysisResult['risk']): string {
  switch (nodeHealth) {
    case 'HIGH':
      return 'var(--red-500)'
    case 'LOW':
      return 'var(--green-500)'
    case 'MEDIUM':
      return 'var(--yellow-500)'
    case 'NO_ANALYSIS':
    case 'NO_DATA':
      return 'var(--grey-300)'
    default:
      return ''
  }
}
