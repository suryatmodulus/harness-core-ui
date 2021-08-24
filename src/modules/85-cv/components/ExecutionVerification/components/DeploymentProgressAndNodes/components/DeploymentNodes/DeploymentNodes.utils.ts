import {
  DeploymentNodeAnalysisResult,
  DeploymentNodeSubPartSize,
  DefaultNodeSubPartSize,
  HexagonSizes
} from './DeploymentNodes.constants'

export type HexagonCoordinates = { x: number; y: number }

const A = (2 * Math.PI) / 6

export function drawGrid(width: number, totalNodes: number, hexagonRadius: number): HexagonCoordinates[] {
  const cooordinates: HexagonCoordinates[] = []
  const radiusWithMargin = hexagonRadius + 2.4
  for (let y = radiusWithMargin, nodesGenerated = 0; nodesGenerated < totalNodes; y += radiusWithMargin * Math.sin(A)) {
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

export function getHexagonSubPartSize(containerWidth: number): DeploymentNodeSubPartSize {
  for (const sizeObject of HexagonSizes) {
    if (containerWidth <= sizeObject.containerWidth) {
      return sizeObject
    }
  }

  return DefaultNodeSubPartSize
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
