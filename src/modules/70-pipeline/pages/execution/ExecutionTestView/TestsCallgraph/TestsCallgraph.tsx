import React, { useLayoutEffect, useEffect, useRef, useState, useMemo } from 'react'
import { clone, merge, isEmpty } from 'lodash-es'
import { TextInput } from '@wings-software/uicore'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import highChartsNetworkGraph from 'highcharts/modules/networkgraph'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import TIMock from './TIMock.json'
import {
  handleNodeClick,
  CallgraphNode,
  CallgraphNodeSimple,
  ClusterMap,
  highChartsArrows,
  getMatchingNodesIds,
  getTestClusters,
  buildLink,
  buildNode,
  getNodeTypeCount,
  getNodesFromCluster,
  highchartsPentas,
  IS_FULL_CALLGRAPH_SHOWN
} from './TestsCallgraphUtils'
import { CallgraphLegend } from './CallgraphLegend/CallgraphLegend'
import css from './TestsCallgraph.module.scss'

highChartsNetworkGraph(Highcharts)
highChartsArrows(Highcharts)
highchartsPentas(Highcharts)

const staticGraphOptions: Highcharts.Options = {
  title: {
    text: undefined
  },
  chart: {
    type: 'networkgraph',
    height: 750,
    backgroundColor: '#FFF',
    marginTop: 96,
    animation: false
  },
  tooltip: {
    stickOnContact: true,
    enabled: true,
    useHTML: true,
    shape: 'square',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    shadow: false,
    style: {
      pointerEvents: 'auto'
    },
    formatter: function (this: any) {
      const {
        id,
        type,
        package: from_package,
        class: from_class,
        method,
        params
      } = this.point.options.custom as CallgraphNodeSimple
      return `
<div class="wrapper">
  <div class="tint tint-${type.toLowerCase()}">
  </div>
  <div class="body">
    <h3 class="type">${type}</h3>
    <ul class="params">
      <li>
        <span>ID</span>
        <span>${id}</span>
      </li>
      <li>
        <span>Class</span>
        <span>${from_class}</span>
      </li>
      <li>
        <span>Method</span>
        <span>${method}</span>
      </li>
      <li>
        <span>Package</span>
        <span>${from_package}</span>
      </li>
      <li>
        <span>Params</span>
        <span>${params}</span>
      </li>
    </ul>
  </div>
</div>
`
    }
  },
  plotOptions: {
    series: {
      animation: false,
      allowPointSelect: true,
      marker: {
        states: {
          hover: {
            radiusPlus: 0
          }
        }
      }
    },
    networkgraph: {
      draggable: true,
      layoutAlgorithm: {
        // disabling simulation
        // removes drag animation for unknown reason
        enableSimulation: true,
        friction: -0.9,
        initialPositions: 'circle',
        maxIterations: 100,
        integration: 'verlet',
        maxSpeed: 1
      }
    }
  }
}
interface TestsCallgraphProps {
  data?: CallgraphNode[]
  highchartsProps?: Omit<HighchartsReact.Props, 'highcharts' | 'ref'>
  highchartsOptions?: Highcharts.Options
}

export const TestsCallgraph: (props: TestsCallgraphProps) => React.ReactElement = props => {
  const { getString } = useStrings()
  const chartRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [subsetId, setSubsetId] = useState('')
  const [clusters, setClusters] = useState<ClusterMap | undefined>()

  const data = props.data || TIMock

  const staticOptions = useMemo(() => {
    return merge(clone(staticGraphOptions), props.highchartsOptions)
  }, [props.highchartsOptions])

  useLayoutEffect(() => {
    ;(async () => {
      const result = await getTestClusters(data as CallgraphNode[])
      setClusters(result)
    })()
  }, [data])

  useEffect(() => {
    if (!subsetId && clusters) {
      setSubsetId(Object.keys(clusters)[0])
    }
  }, [subsetId, clusters])

  const nodes: CallgraphNodeSimple[] | undefined = useMemo(() => {
    return getNodesFromCluster(clusters, subsetId)
  }, [clusters, subsetId])
  const [sourcesCount, testsCount] = useMemo(() => getNodeTypeCount(nodes), [nodes])

  const links = useMemo(() => {
    if (clusters && !isEmpty(clusters) && subsetId) {
      if (IS_FULL_CALLGRAPH_SHOWN) {
        return Object.values(clusters).reduce((acc, cur) => {
          return acc.concat(cur)
        }, [])
      } else {
        return clusters[subsetId]
      }
    }
    return []
  }, [clusters, subsetId])

  const queryResults = useMemo(() => {
    if (searchQuery && nodes && clusters && subsetId) {
      return getMatchingNodesIds({
        searchQuery,
        clusters,
        subsetId
      })
    }
    return []
  }, [nodes, searchQuery, clusters, subsetId])

  const options: Highcharts.Options | Record<string, unknown> = useMemo(
    () =>
      nodes && links
        ? merge(clone(staticOptions), {
            series: [
              {
                type: 'networkgraph',
                animation: false,
                nodes: nodes?.map(buildNode(queryResults)),
                data: links.map(buildLink),
                events: {
                  click: handleNodeClick(setSubsetId)
                }
              }
            ]
          })
        : {},
    [nodes, links, queryResults, staticOptions]
  )

  useEffect(() => {
    const chart = (chartRef?.current as any)?.chart as Highcharts.Chart
    if (chart && nodes?.length) {
      chart.update({
        series: [
          {
            type: 'networkgraph',
            events: {
              click: handleNodeClick(setSubsetId)
            },
            nodes: nodes.map(buildNode(queryResults))
          }
        ]
      })
    }
  }, [queryResults, nodes])

  const onNodeSearch = (event: React.FormEvent<HTMLInputElement>): void => {
    setSearchQuery((event.target as any).value.trim())
  }

  return (
    <div className={css.wrapper}>
      <CallgraphLegend
        totalSourcesCount={sourcesCount /* stub */}
        totalTestsCount={testsCount /* stub */}
        updatedTestsCount={2 /* stub */}
        updatedSourcesCount={27 /* stub */}
        selectedTests={1 /* stub */}
      />
      <TextInput
        className={css.searchInput}
        value={searchQuery}
        placeholder={getString('search')}
        leftIcon="search"
        leftIconProps={{
          name: 'search',
          size: 16
        }}
        onChange={onNodeSearch}
      />
      {!isEmpty(clusters) && !isEmpty(options) ? (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartRef}
          immutable={true}
          updateArgs={[false, false, false]}
          {...(props.highchartsProps || {})}
        />
      ) : (
        <PageSpinner />
      )}
    </div>
  )
}
