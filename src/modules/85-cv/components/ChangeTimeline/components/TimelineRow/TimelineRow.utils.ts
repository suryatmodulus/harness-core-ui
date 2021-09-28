import type { SeriesScatterOptions, XAxisOptions } from 'highcharts'
import { cloneDeep } from 'lodash-es'
import { EventTimelineHighChartsConfig } from './TimelineRow.constants'

export function getEventTimelineConfig(
  series: SeriesScatterOptions[],
  xAxis?: XAxisOptions,
  onClickDataPoint?: () => void,
  onClickPlot?: () => void
): Highcharts.Options {
  const scatterPlotConfigObject = cloneDeep(EventTimelineHighChartsConfig)
  scatterPlotConfigObject.series = series
  if (xAxis?.max && xAxis?.min) {
    scatterPlotConfigObject.xAxis = {
      ...scatterPlotConfigObject.xAxis,
      min: xAxis?.min,
      max: xAxis?.max
    }
  }

  if (scatterPlotConfigObject.plotOptions?.scatter?.events) {
    scatterPlotConfigObject.plotOptions.scatter.events.click = onClickDataPoint
  }

  if (scatterPlotConfigObject.chart?.events) {
    scatterPlotConfigObject.chart.events.click = onClickPlot
  }

  return scatterPlotConfigObject
}
