import type { SelectOption } from '@wings-software/uicore'
import type { ResponsePageServiceLevelObjectiveResponse, ResponsePageUserJourneyResponse } from 'services/cv'
import type { SLOForm } from './components/CreateSLOForm/CreateSLO.types'

export const getSLOsData = (SLOsData: ResponsePageServiceLevelObjectiveResponse | null): SLOForm[] => {
  return (SLOsData?.data?.content?.map(slo => {
    const { type, spec } = slo?.serviceLevelObjective?.serviceLevelIndicators?.[0] || {}
    return {
      ...slo?.serviceLevelObjective,
      serviceLevelIndicators: {
        type,
        spec
      }
    }
  }) || []) as SLOForm[]
}

export const getUserJourneys = (userJourneyData: ResponsePageUserJourneyResponse | null): SelectOption[] => {
  return (userJourneyData?.data?.content?.map(el => ({
    label: el?.userJourney?.name,
    value: el?.userJourney?.identifier
  })) || []) as SelectOption[]
}
