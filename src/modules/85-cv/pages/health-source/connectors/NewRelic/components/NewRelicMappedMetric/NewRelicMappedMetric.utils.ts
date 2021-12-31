import type { TimeSeriesSampleDTO } from 'services/cv'

export const getOptionsForChart = (newRelicTimeSeriesData: TimeSeriesSampleDTO[] | null): (number | undefined)[][] => {
  return newRelicTimeSeriesData?.map(el => [el?.timestamp, el?.metricValue]) || []
}
