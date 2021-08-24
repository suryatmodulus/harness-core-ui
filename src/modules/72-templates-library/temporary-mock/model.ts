import type { Pageable, Sort } from 'services/pipeline-ng'
import type { TemplateType } from '../utils/templatesUtils'

export interface TemplateSummaryResponse {
  templateType: TemplateType
  createdAt?: number
  description?: string
  filters?: {
    [key: string]: {
      [key: string]: { [key: string]: any }
    }
  }
  identifier?: string
  lastUpdatedAt?: number
  modules?: string[]
  name?: string
  numOfStages?: number
  stageNames?: string[]
  tags?: {
    [key: string]: string
  }
  version?: number
  label?: string
  stableTemplate?: boolean
}

export interface TemplatesPageSummaryResponse {
  content?: TemplateSummaryResponse[]
  empty?: boolean
  first?: boolean
  last?: boolean
  number?: number
  numberOfElements?: number
  pageable?: Pageable
  size?: number
  sort?: Sort
  totalElements?: number
  totalPages?: number
}
