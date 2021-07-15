export function chartsConfig(series: Highcharts.SeriesLineOptions[], width: number): Highcharts.Options {
  let xAxisTicks = series[0]?.data?.map((v: any) => v.x as number)
  if (!xAxisTicks?.length) {
    xAxisTicks = series?.[1]?.data?.map((v: any) => v.x as number)
  }
  return {
    chart: {
      height: 120,
      width,
      type: 'line',
      zoomType: 'xy',
      spacing: [2, 1, 1, 2]
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
      lineWidth: 1,
      labels: {
        enabled: false
      },
      tickPositions: xAxisTicks,
      gridLineWidth: 1,
      gridLineDashStyle: 'LongDash',
      title: {
        text: ''
      }
    },
    yAxis: {
      lineWidth: 0,
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
        lineWidth: 1,
        turboThreshold: 50000
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
