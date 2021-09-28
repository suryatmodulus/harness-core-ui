import { ChangeSourceTypes } from '../ChangeTimeline.constants'

export const generateMockInfoCardData = (count: number) => [
  {
    count,
    key: ChangeSourceTypes.Deployments
  },
  {
    count,
    key: ChangeSourceTypes.Infrastructure
  },
  {
    count,
    key: ChangeSourceTypes.Incidents
  }
]
