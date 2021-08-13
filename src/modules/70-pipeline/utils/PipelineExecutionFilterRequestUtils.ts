import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import { omit, startCase } from 'lodash-es'
import type { PipelineExecutionFilterProperties, FilterDTO } from 'services/pipeline-ng'

import { EXECUTION_STATUS } from '@pipeline/utils/statusHelpers'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { StringUtils } from '@common/exports'
import type { CIWebhookInfoDTO } from 'services/ci'
import type { FilterProperties } from 'services/cd-ng'
import { isObjectEmpty, removeNullAndEmpty } from '@common/components/Filter/utils/FilterUtils'

export interface DeploymentTypeContext {
  deploymentType?: string
  infrastructureType?: string
  services?: MultiSelectOption[]
  environments?: MultiSelectOption[]
}

export interface BuildTypeContext {
  buildType?: BUILD_TYPE
  repositoryName?: string
  sourceBranch?: string
  targetBranch?: string
  branch?: string
  tag?: string
}

const exclusionList = ['buildType', 'repositoryName', 'sourceBranch', 'targetBranch', 'tag', 'branch']

export const getValidFilterArguments = (formData: Record<string, any>): PipelineExecutionFilterProperties => {
  const {
    status,
    buildType,
    repositoryName,
    sourceBranch,
    targetBranch,
    branch,
    tag,
    services,
    environments,
    deploymentType,
    infrastructureType
  } = formData
  return Object.assign(omit(formData, ...exclusionList), {
    status: status?.map((statusOption: MultiSelectOption) => statusOption?.value),
    moduleProperties: {
      ci: getCIModuleProperties(buildType as BUILD_TYPE, {
        repositoryName,
        sourceBranch,
        targetBranch,
        branch,
        tag
      }),
      cd: {
        serviceDefinitionTypes: deploymentType ? [deploymentType] : undefined,
        infrastructureType: infrastructureType,
        serviceIdentifiers: services?.map((service: MultiSelectOption) => service?.value),
        envIdentifiers: environments?.map((env: MultiSelectOption) => env?.value)
      }
    }
  })
}

export type PipelineExecutionFormType = Omit<PipelineExecutionFilterProperties, 'status'> & {
  status?: MultiSelectOption[]
} & BuildTypeContext &
  DeploymentTypeContext

export const createOption = (label: string, value: string, count?: number): MultiSelectOption => {
  const labelWithCount =
    count && count > 0
      ? label
          .concat(' ')
          .concat('(')
          .concat((count || '').toString())
          .concat(')')
      : label
  return {
    label: labelWithCount,
    value: value
  } as MultiSelectOption
}

export const getOptionsForMultiSelect = (): MultiSelectOption[] => {
  return Object.keys(EXECUTION_STATUS).map(key => {
    const text = EXECUTION_STATUS[parseInt(key)] || ''
    return createOption(startCase(text), text)
  })
}

export const createRequestBodyPayload = ({
  isUpdate,
  data,
  projectIdentifier,
  orgIdentifier
}: {
  isUpdate: boolean
  data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  projectIdentifier: string
  orgIdentifier: string
}): FilterDTO => {
  const {
    metadata: { name: _name, filterVisibility, identifier },
    formValues
  } = data
  const { pipelineName, status: _statuses, moduleProperties: _moduleProperties } = getValidFilterArguments(formValues)
  return {
    name: _name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
    filterVisibility: filterVisibility,
    projectIdentifier,
    orgIdentifier,
    filterProperties: {
      filterType: 'PipelineExecution',
      pipelineName: pipelineName || '',
      status: _statuses,
      moduleProperties: _moduleProperties as PipelineExecutionFilterProperties['moduleProperties']
    } as PipelineExecutionFilterProperties
  }
}

export const getCIModuleProperties = (buildType: BUILD_TYPE, contextInfo: BuildTypeContext): any => {
  const { repositoryName, sourceBranch, targetBranch, branch, tag } = contextInfo
  let moduleProperties = {}
  switch (buildType) {
    case BUILD_TYPE.PULL_OR_MERGE_REQUEST:
      moduleProperties = {
        ciExecutionInfoDTO: {
          event: 'pullRequest',
          pullRequest: { sourceRepo: repositoryName, sourceBranch: sourceBranch, targetBranch: targetBranch }
        } as CIWebhookInfoDTO
      }
      break
    case BUILD_TYPE.BRANCH:
      moduleProperties = {
        branch: branch
      }
      break
    case BUILD_TYPE.TAG:
      moduleProperties = {
        tag: tag
      }
      break
  }

  return Object.assign(moduleProperties, { repoName: repositoryName ? [repositoryName] : undefined })
}

export const enum BUILD_TYPE {
  PULL_OR_MERGE_REQUEST = 'PULL_OR_MERGE_REQUEST',
  BRANCH = 'BRANCH',
  TAG = 'TAG'
}

export const getFilterWithValidFields = (
  formData: PipelineExecutionFormType | undefined,
  filterProperties: FilterProperties | undefined
): Partial<PipelineExecutionFormType> | Partial<FilterProperties> | undefined => {
  if (!isObjectEmpty(filterProperties || {})) {
    return removeNullAndEmpty(omit(filterProperties, 'filterType'))
  } else if (!isObjectEmpty(formData || {})) {
    return removeNullAndEmpty(formData || {})
  }
  return {}
}

export const getBuildType = (moduleProperties: {
  [key: string]: {
    [key: string]: any
  }
}): BUILD_TYPE | undefined => {
  const { branch, tag, ciExecutionInfoDTO } = moduleProperties?.ci || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}

  return sourceBranch && targetBranch
    ? BUILD_TYPE.PULL_OR_MERGE_REQUEST
    : branch
    ? BUILD_TYPE.BRANCH
    : tag
    ? BUILD_TYPE.TAG
    : undefined
}

export const getMultiSelectFormOptions = (values?: any[]): SelectOption[] | undefined => {
  return values?.map(item => {
    return { label: item.name ?? item, value: item.identifier ?? item }
  })
}

export const getFilterByIdentifier = (identifier: string, filters?: FilterDTO[]): FilterDTO | undefined =>
  filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())
