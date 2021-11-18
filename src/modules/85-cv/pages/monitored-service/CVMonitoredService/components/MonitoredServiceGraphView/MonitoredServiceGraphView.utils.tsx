import type { Chart as _Chart } from 'highcharts'
import type { NetworkgraphOptions } from '@cv/components/DependencyGraph/DependencyGraph.types'

interface Chart extends _Chart {
  sticky?: any
}

export const getDependencyGraphOptions = (
  setPoint: React.Dispatch<React.SetStateAction<{ sticky: any; point: any } | undefined>>
): NetworkgraphOptions => {
  return {
    chart: {
      height: '40%',
      spacing: [0, 0, 0, 0],
      events: {
        click: function () {
          ;(this.series[0].chart as Chart)?.sticky.destroy()
          ;(this.series[0].chart as Chart).sticky = undefined
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
                point: this
              })
            }
          }
        }
      }
    ]
  }
}
