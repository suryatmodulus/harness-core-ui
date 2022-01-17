import type { useGetMetricPacks, useGetLabelNames } from 'services/cv'

export type SelectHealthSourceServicesProps = {
  values: {
    sli: boolean
    healthScore: boolean
    continuousVerification: boolean
  }
  metricPackResponse: ReturnType<typeof useGetMetricPacks>
  labelNamesResponse?: ReturnType<typeof useGetLabelNames>
  hideServiceIdentifier?: boolean
  hideCV?: boolean
  hideSLIAndHealthScore?: boolean
}
