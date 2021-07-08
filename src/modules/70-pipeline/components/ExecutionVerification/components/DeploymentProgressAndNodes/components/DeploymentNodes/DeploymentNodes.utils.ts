export type HexagonCoordinates = { x: number; y: number }

const A = (2 * Math.PI) / 6
const HexagonRadius = 12

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  totalNodes: number
): HexagonCoordinates[] {
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
      drawHexagon(ctx, x, y)
      cooordinates.push({ x, y })
    }
  }

  return cooordinates
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + HexagonRadius * Math.cos(A * i), y + HexagonRadius * Math.sin(A * i))
  }
  ctx.closePath()
  ctx.strokeStyle = '#DDDDDD'
  ctx.stroke()
  ctx.fillStyle = 'rgba(245, 245, 245, 0.65024)'
  ctx.fill()
}

export function mapNodeHealthStatusToColor(nodeHealth: string): string {
  switch (nodeHealth) {
    case 'HIGH':
      return 'var(--red-500)'
    case 'LOW':
      return 'var(--green-500)'
    case 'MEDIUM':
      return 'var(--yellow-500)'
    default:
      return 'var(--grey-200)'
  }
}
