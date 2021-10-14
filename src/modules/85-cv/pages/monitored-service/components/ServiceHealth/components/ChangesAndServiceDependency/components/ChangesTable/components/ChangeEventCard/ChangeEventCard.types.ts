import type { ChangeEventDTO } from 'services/cv'

export interface ChangeInfoData {
  triggerAt: string
  summary: {
    [key: string]: string | { name: string; url?: string }
  }
}

export interface ChangeDetailsDataInterface {
  type?: ChangeEventDTO['type']
  category?: ChangeEventDTO['category']
  status?: ChangeEventDTO['metadata']['status']
  details: {
    [key: string]: string | { name: string | ChangeEventDTO['type']; url?: string }
  }
}

export interface ChangeTitleData {
  name: string | undefined
  type: ChangeEventDTO['type']
  executionId: string
  url?: string
}

export interface CustomChangeEventDTO extends ChangeEventDTO {
  id?: string
  pipelinePath?: string
}
