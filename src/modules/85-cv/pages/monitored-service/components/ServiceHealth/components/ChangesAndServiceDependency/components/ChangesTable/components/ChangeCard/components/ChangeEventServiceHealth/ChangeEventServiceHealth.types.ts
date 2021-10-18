import type { ChangeEventDTO } from 'services/cv'

export interface ChangeEventServiceHealthProps {
  serviceIdentifier: string
  envIdentifier: string
  startTime: number
  eventType: ChangeEventDTO['type']
}
