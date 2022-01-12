export function chartsConfig(
  series: Highcharts.SeriesAreasplineOptions[],
  width: number,
  nodeIndex: number
): Highcharts.Options {
  // let xAxisTicks = series[0]?.data?.map((v: any) => v.x as number)
  // if (!xAxisTicks?.length) {
  //   xAxisTicks = series?.[1]?.data?.map((v: any) => v.x as number)
  // }

  return {
    chart: {
      height: 120,
      width,
      type: 'areaspline'
      // zoomType: 'xy',
      // spacing: [2, 1, 1, 2]
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      tickLength: 0,
      // lineWidth: 1,

      labels: {
        enabled: false
      },
      // tickPositions: xAxisTicks,
      // gridLineWidth: 0,
      // gridLineDashStyle: 'LongDash',
      title: {
        text: `Node ${nodeIndex + 1}`,
        align: 'low'
      }
    },
    yAxis: {
      // lineWidth: 0,
      gridLineWidth: 0,
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 3,
        turboThreshold: 50000
      },
      areaspline: {
        fillOpacity: 0.5
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(this: any): string {
        const title = this.series?.name ? `<p>${this.series?.name}</p><br/>` : ''
        return `<section class="serviceGuardTimeSeriesTooltip">${title}<p>Value: ${this.y.toFixed(2)}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}
