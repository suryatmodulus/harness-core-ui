/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Chart as _Chart } from 'highcharts'
import type { NetworkgraphOptions } from '@cv/components/DependencyGraph/DependencyGraph.types'
import type { ServicePoint } from './ServiceDependencyGraph.types'

interface Chart extends _Chart {
  sticky?: any
}

const destroySticky = (chart: Chart): void => {
  chart.sticky?.destroy()
  delete chart.sticky
}

export const getDependencyGraphOptions = (
  setPoint: (point?: ServicePoint) => void,
  height: number | string
): NetworkgraphOptions => {
  return {
    chart: {
      height,
      spacing: [0, 0, 0, 0],
      events: {
        click: function () {
          destroySticky(this.series[0].chart)
        }
      }
    },
    series: [
      {
        type: 'networkgraph',
        point: {
          events: {
            click: function () {
              const text = '<span></span>'
              const cardWidth = 360
              const cardHeight = 435
              const chart: Chart = this.series.chart

              const anchorX = (this as any).plotX + (this.series.xAxis as any).pos
              const anchorY = (this as any).plotY + (this.series.yAxis as any).pos
              const align = anchorX < chart.chartWidth - cardWidth ? 'left' : 'right'
              const x = align === 'left' ? anchorX : anchorX - cardWidth

              let y = 50

              if (anchorY > cardHeight) {
                y = anchorY - cardHeight
              } else if (anchorY < chart.chartHeight - cardHeight) {
                y = anchorY
              }

              if (!chart.sticky) {
                chart.sticky = chart.renderer
                  .label(text, x, y, 'callout', anchorX, anchorY)
                  .attr({
                    align,
                    zIndex: 7
                  })
                  .add()
              } else {
                chart.sticky.attr({ align, text }).animate({ anchorX, anchorY, x, y }, { duration: 100 })
              }

              setPoint({
                sticky: chart.sticky,
                serviceRef: (this as any).serviceRef,
                environmentRef: (this as any).environmentRef,
                destroySticky: () => destroySticky(chart)
              })
            }
          }
        }
      }
    ]
  }
}
