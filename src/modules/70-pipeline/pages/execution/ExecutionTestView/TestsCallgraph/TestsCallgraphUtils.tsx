import { pick, uniq, isEqual, uniqWith } from 'lodash-es'
import type Highcharts from 'highcharts'

export type NodeType = 'Source' | 'Test'

export const IS_FULL_CALLGRAPH_SHOWN = true
export interface CallgraphNode {
  from_id: number
  from_type: NodeType
  from_class: string
  from_package: string
  from_method: string
  from_params: string
  to_id: number
  to_type: NodeType
  to_class: string
  to_package: string
  to_method: string
  to_params: string
}

export interface CallgraphNodeSimple {
  id: number
  type: NodeType
  class: string
  package: string
  method: string
  params: string
}

export interface ClusterMap {
  [key: string]: CallgraphNode[]
}

export const SOURCE_NODE_RADIUS = 14 // 28px / 2
export const TEST_NODE_RADIUS = 18 // 36px / 2
export const TEST_NODE_SIDE_LENGTH = 22

type PathPiece = {
  x: number
  y: number
  label?: string
  x1?: number
  y1?: number
}

type PathData =
  | {
      [key: string]: PathPiece
    }
  | PathPiece[]

// NOTE: below is set of functions to enable round corners
// in test pentagons, WIP

// based on https://codepen.io/wvr/pen/WrNgJp?editors=1010

// const add = (a, b) => {
//   const {x, y} = a
//   return {
//     x: x + b.x,
//     y: y + b.y
//   }
// }

// const subtract = (a, b) => {
//   const {x, y} = a
//   return {
//     x: x - b.x,
//     y: y - b.y
//   }
// }

// const angle = ({x,y}) => Math.atan2(y,x)

// const fromAngle = (angle, magnitude = 1) => {
//   return {
//     x: magnitude * Math.cos(angle),
//     y: magnitude * Math.sin(angle)
//   }
// }

// function makePentagonPath(x, y, l, N = 5, corner = 6) {
//   const r = l / (2* Math.sin(Math.PI/N))
//   const pointNames = ['a', 'b', 'c', 'd', 'e']
//   const path = {}
//   for(let i = 0; i < N;i++) {
//     path[pointNames[i]]= {
//       x: x + r * Math.cos(Math.PI / N * (-0.5 + 2 * i)),
//       y: y + r * Math.sin(Math.PI / N * (-0.5 + 2 * i))
//     }
//   }
//   if(corner) {
//     const right = fromAngle(angle(subtract(path.b, path.a)), corner)
//     const left = fromAngle(angle(subtract(path.e, path.a)), corner)
//     const level = {x:0, y: corner}
//     const curvedPath = []
// // new Path.M(a.add(left)),
//     curvedPath.push({
//       label: 'M',
//       ...add(path.a, left)
//     })
// // new Path.Q(a, a.add(right)),
//     curvedPath.push({
//       label: 'Q',
//       ...path.a,
//       x1: add(path.a, right).x,
//       y1: add(path.a, right).y
//     })
// // new Path.L(b.subtract(right)),
//     curvedPath.push({
//       label: 'L',
//       ...subtract(path.b,right)
//     })
// // new Path.Q(b, b.add(level)),
//     curvedPath.push({
//       label: 'Q',
//       ...path.b,
//       x1: add(path.b, level).x,
//       y1: add(path.b, level).y
//     })
// // new Path.L(c.subtract(level)),
//     curvedPath.push({
//       label: 'L',
//       ...subtract(path.c,level)
//     })
// // new Path.Q(c, c.add(left)),
//     curvedPath.push({
//       label: 'Q',
//       ...path.c,
//       x1: add(path.c, left).x,
//       y1: add(path.c, left).y
//     })
// // new Path.L(d.subtract(left)),
//     curvedPath.push({
//       label: 'L',
//       ...subtract(path.d,left)
//     })
// // new Path.Q(d, d.subtract(right)),
//     curvedPath.push({
//       label: 'Q',
//       ...path.d,
//       x1: subtract(path.d, right).x,
//       y1: subtract(path.d, right).y
//     })
// // new Path.L(e.add(right)),
//     curvedPath.push({
//       label: 'L',
//       ...add(path.e,right)
//     })
// // new Path.Q(e, e.subtract(level)),
//     curvedPath.push({
//       label: 'Q',
//       ...path.e,
//       x1: subtract(path.e, level).x,
//       y1: subtract(path.e, level).y
//     })

//     return curvedPath
//   }
//   return path
// }

const pathify = (pathData: PathData): (number | string)[] => {
  let path: (number | string)[] = []
  const pathifiable = Array.isArray(pathData) ? pathData : Object.values(pathData)
  pathifiable.forEach((value, i) => {
    const { x, y, x1, y1, label } = value
    if (!i) {
      path = path.concat([`${label || 'M'}`, x, y])
    } else {
      path = path.concat([`${label || 'L'}`, x, y])
      if (x1 !== undefined && y1 !== undefined) {
        path = path.concat([x1, y1])
      }
    }
  })
  path = path.concat('Z')
  return path
}

export function highchartsPentas(H: any): void {
  H.SVGRenderer.prototype.symbols.pentagon = function (cx: number, cy: number) {
    const radius = TEST_NODE_SIDE_LENGTH / (2 * Math.sin(Math.PI / 5))
    const pointNames = ['a', 'b', 'c', 'd', 'e']
    const path: { [key: string]: PathPiece } = {}
    for (let i = 0; i < 5; i++) {
      path[pointNames[i]] = {
        x: cx + TEST_NODE_SIDE_LENGTH + radius * Math.cos((Math.PI / 5) * (-0.5 + 2 * i)),
        y: cy + TEST_NODE_SIDE_LENGTH + radius * Math.sin((Math.PI / 5) * (-0.5 + 2 * i))
      }
    }
    return pathify(path)
  }
  if (H.VMLRenderer) {
    H.VMLRenderer.prototype.symbols.pentagon = H.SVGRenderer.prototype.symbols.pentagon
  }
}

// custom wrapper that allows to have
// arrow-shaped links
export function highChartsArrows(H: any): void {
  H.wrap(H.seriesTypes.networkgraph.prototype.pointClass.prototype, 'getLinkPath', function (this: any) {
    const left = this.fromNode,
      right = this.toNode

    const angle = Math.atan((left.plotX - right.plotX) / (left.plotY - right.plotY))

    if (angle) {
      const path = ['M', left.plotX, left.plotY, right.plotX, right.plotY],
        nextLastPoint = right,
        pointRadius = right.custom.type === 'Test' ? TEST_NODE_RADIUS : SOURCE_NODE_RADIUS,
        // Note: arbitrary numbers that look decent
        arrowLength = 4,
        arrowWidth = 3

      if (left.plotY < right.plotY) {
        path.push(
          nextLastPoint.plotX - pointRadius * Math.sin(angle),
          nextLastPoint.plotY - pointRadius * Math.cos(angle)
        )
        path.push(
          nextLastPoint.plotX -
            pointRadius * Math.sin(angle) -
            arrowLength * Math.sin(angle) -
            arrowWidth * Math.cos(angle),
          nextLastPoint.plotY -
            pointRadius * Math.cos(angle) -
            arrowLength * Math.cos(angle) +
            arrowWidth * Math.sin(angle)
        )

        path.push(
          nextLastPoint.plotX - pointRadius * Math.sin(angle),
          nextLastPoint.plotY - pointRadius * Math.cos(angle)
        )
        path.push(
          nextLastPoint.plotX -
            pointRadius * Math.sin(angle) -
            arrowLength * Math.sin(angle) +
            arrowWidth * Math.cos(angle),
          nextLastPoint.plotY -
            pointRadius * Math.cos(angle) -
            arrowLength * Math.cos(angle) -
            arrowWidth * Math.sin(angle)
        )
      } else {
        path.push(
          nextLastPoint.plotX + pointRadius * Math.sin(angle),
          nextLastPoint.plotY + pointRadius * Math.cos(angle)
        )
        path.push(
          nextLastPoint.plotX +
            pointRadius * Math.sin(angle) +
            arrowLength * Math.sin(angle) -
            arrowWidth * Math.cos(angle),
          nextLastPoint.plotY +
            pointRadius * Math.cos(angle) +
            arrowLength * Math.cos(angle) +
            arrowWidth * Math.sin(angle)
        )
        path.push(
          nextLastPoint.plotX + pointRadius * Math.sin(angle),
          nextLastPoint.plotY + pointRadius * Math.cos(angle)
        )
        path.push(
          nextLastPoint.plotX +
            pointRadius * Math.sin(angle) +
            arrowLength * Math.sin(angle) +
            arrowWidth * Math.cos(angle),
          nextLastPoint.plotY +
            pointRadius * Math.cos(angle) +
            arrowLength * Math.cos(angle) -
            arrowWidth * Math.sin(angle)
        )
      }

      return path
    }
    return [
      ['M', left.plotX || 0, left.plotY || 0],
      ['L', right.plotX || 0, right.plotY || 0]
    ]
  })
}

// initial processing of CallgraphNode Array
export const getTestClusters = async (data: CallgraphNode[]): Promise<ClusterMap> => {
  const clusters = await new Promise(res => {
    const testsMap: ClusterMap = {}
    // keep nodes with no clear relation
    let stock: Array<CallgraphNode[]> = []
    data.forEach(item => {
      const { from_id, from_type, to_id } = item
      // process tests
      if (from_type === 'Test') {
        const node = testsMap[from_id]
        if (node) {
          // add unique check before pushing
          node.push(item)
        } else {
          testsMap[from_id] = [item]
        }
        return
      }
      // process sources
      let mapKey: string | undefined
      const hasRelation = Object.entries(testsMap).some(([key, val]) => {
        if (val.find(source => source.to_id === from_id)) {
          mapKey = key
          return true
        }
        return false
      })
      if (hasRelation && mapKey) {
        testsMap[mapKey].push(item)
      } else {
        // put into stock
        let stockIdx: number | undefined
        const hasPlaceInStock = stock.some(part => {
          return part.some((stockNode, idx) => {
            if (stockNode.from_id === from_id || stockNode.to_id === to_id) {
              stockIdx = idx
              return true
            }
            return false
          })
        })
        if (hasPlaceInStock && stockIdx) {
          stock[stockIdx].push(item)
        } else {
          stock.push([item])
        }
      }
      // try to unload stock
      const stockKeyIdxMap: { idx: number; mapPushKey: string }[] = []
      stock.forEach((stockPart, idx) =>
        stockPart.forEach(part => {
          const mapKeys = Object.keys(testsMap)
          const mapPushKey = mapKeys.find(key => key === `${part.from_id}`)
          if (mapPushKey) {
            stockKeyIdxMap.push({
              idx,
              mapPushKey
            })
          }
        })
      )
      stockKeyIdxMap.forEach(mapItem => {
        const { idx, mapPushKey } = mapItem
        testsMap[mapPushKey].concat(stock[idx])
      })
      stock = stock.filter((_stockPart, idx) => !stockKeyIdxMap.find(stockMapPart => stockMapPart.idx === idx))
    })
    res(testsMap)
  }).then(res => res as ClusterMap)
  return clusters
}

// essentialy reduces CluterMap to its minified version
// with only clusters whose nodes match user input
export const getSearchResultClusters: (clusterSource: ClusterMap, searchQuery: string) => ClusterMap = (
  clusterSource,
  searchQuery
) => {
  return Object.entries(clusterSource).reduce((acc, current) => {
    const [key, cluster] = current
    const matchingNodes = cluster.filter(node => {
      return Object.entries(node).some(
        value =>
          !['from_type', 'to_type'].includes(value[0]) &&
          value[1] &&
          `${value[1]}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    if (matchingNodes.length) {
      return { ...acc, [key]: matchingNodes }
    }
    return acc
  }, {})
}

// @TODO: turn this stub into a proper fn
export const cutNodeLabel: (label: string) => string = label => {
  return label.length <= 7 ? label : label.slice(0, 5) + '..'
}

export const getMatchingNodesIds: ({
  searchQuery,
  clusters,
  subsetId
}: {
  searchQuery: string
  clusters: ClusterMap
  subsetId: string
}) => number[] = ({ searchQuery, clusters, subsetId }) => {
  // 1. search for matches in the clusters, return smaller cluster
  const searchResultClusters = getSearchResultClusters(clusters, searchQuery)
  // 2. highlight every test node whose id matches with smaller cluster keys
  const testNodeIdsToHighlight = Object.keys(searchResultClusters).map(Number)
  // 3. compare selected cluster nodes with respective smaller cluster nodes
  const sourceNodeIdsToHighlight = uniq(
    (IS_FULL_CALLGRAPH_SHOWN
      ? ([] as CallgraphNode[]).concat(...Object.values(searchResultClusters))
      : searchResultClusters[subsetId]
    )?.reduce((acc, cur) => {
      const temp = []
      // below is required as searchResultCluster
      // consist of double nodes
      if (
        Object.values(pick(cur, ['from_id', 'from_class', 'from_package', 'from_method', 'from_params'])).some(value =>
          `${value}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) {
        temp.push(cur.from_id)
      }
      if (
        Object.values(pick(cur, ['to_id', 'to_class', 'to_package', 'to_method', 'to_params'])).some(value =>
          `${value}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) {
        temp.push(cur.to_id)
      }
      return acc.concat(temp)
    }, [] as number[])
  )
  return IS_FULL_CALLGRAPH_SHOWN
    ? sourceNodeIdsToHighlight
    : testNodeIdsToHighlight.concat(sourceNodeIdsToHighlight).filter(id => `${id}` !== subsetId)
}

export const getNodeTypeCount: (nodes: CallgraphNodeSimple[]) => [number, number] = nodes => {
  let tests = 0
  let sources = 0
  if (nodes) {
    nodes.forEach(node => {
      if (node.type === 'Test') {
        tests += 1
      } else {
        sources += 1
      }
    })
  }
  return [sources, tests]
}

export const getNodesFromCluster: (clusters: ClusterMap | undefined, subsetId: string) => CallgraphNodeSimple[] = (
  clusters,
  subsetId
) => {
  // get test nodes
  const testNodes: CallgraphNodeSimple[] = []
  if (clusters) {
    Object.keys(clusters).forEach(key => {
      const testNode = clusters[key].find(node => `${node.from_id}` === key)
      if (testNode) {
        testNodes.push({
          id: testNode.from_id,
          type: testNode.from_type as NodeType,
          package: testNode.from_package,
          class: testNode.from_class,
          method: testNode.from_method,
          params: testNode.from_params
        })
      }
    })
    let children: CallgraphNodeSimple[] = []
    if (subsetId) {
      let temp: any[] = []
      if (IS_FULL_CALLGRAPH_SHOWN) {
        temp = Object.values(clusters).reduce((acc, cur) => {
          return acc.concat(cur)
        }, [])
      }
      children = (IS_FULL_CALLGRAPH_SHOWN ? temp : clusters[subsetId]).reduce(
        (acc, cur) =>
          acc.concat([
            {
              id: cur.from_id,
              type: cur.from_type,
              package: cur.from_package,
              class: cur.from_class,
              method: cur.from_method,
              params: cur.from_params
            },
            {
              id: cur.to_id,
              type: cur.to_type,
              package: cur.to_package,
              class: cur.to_class,
              method: cur.to_method === '<init>' ? 'init' : cur.to_method,
              params: cur.to_params
            }
          ]),
        [] as any[]
      )
    }
    return uniqWith(testNodes.concat(children), isEqual)
  }
  return []
}

export function handleNodeClick(callback: (id: string) => void): ({ point }: { point: any }) => boolean | void {
  return function ({ point }) {
    const { type, id } = point.custom
    if (type === 'Test' && !IS_FULL_CALLGRAPH_SHOWN) {
      callback(`${id}`)
    }
    // prevent default node selection
    return false
  }
}

export const buildNode: (
  queryResults: number[]
) => (nodeData: CallgraphNodeSimple) => any = queryResults => nodeData => {
  const hasMatch = queryResults.length && queryResults.includes(nodeData.id)
  return {
    id: `${nodeData.id}`,
    color: hasMatch ? '#F8B500' : nodeData.type === 'Test' ? '#8A36FF' : '#0095F7',
    name: nodeData.package,
    marker: {
      radius: nodeData.type === 'Test' ? TEST_NODE_RADIUS : SOURCE_NODE_RADIUS,
      symbol: nodeData.type === 'Test' ? 'pentagon' : 'circle',
      states: {
        hover: {
          lineColor: nodeData.type === 'Test' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(239, 251, 255, 0.7)',
          lineWidth: 1
        }
      }
    },
    dataLabels: {
      enabled: true,
      format: cutNodeLabel(nodeData.type === 'Test' ? nodeData.class : nodeData.method),
      position: 'center',
      align: 'center' as Highcharts.AlignValue,
      verticalAlign: 'middle' as Highcharts.VerticalAlignValue,
      color: hasMatch ? '#000000' : '#ffffff',
      style: {
        fontSize: nodeData.type === 'Test' ? '8px' : '6px',
        fontWeight: '500',
        textOverflow: 'ellipsis',
        textOutline: 'none'
      },
      x: nodeData.type === 'Test' ? 4 : undefined // align inside penta
    },
    custom: {
      ...nodeData
    }
  }
}

export const buildLink: (node: CallgraphNode) => any = node => {
  return {
    from: `${node.from_id}`,
    to: `${node.to_id}`,
    color: '#0095F7',
    custom: {
      ...node
    }
  }
}
