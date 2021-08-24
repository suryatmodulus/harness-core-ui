import type { HostData } from 'services/cv'

export type HostTestData = { risk: HostData['risk']; points: Highcharts.SeriesLineOptions['data']; name: string }
