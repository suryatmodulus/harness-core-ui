import type {
  ResponseListServiceNowTicketTypeDTO,
  StepElementConfig, UseGetServiceNowIssueCreateMetadataProps,
  UseGetServiceNowTicketTypesProps
} from '../../../../../../services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'

import { getDefaultCriterias } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import type { ApprovalRejectionCriteria } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import type { Failure } from '../../../../../../services/cd-ng'
import type { GetDataError } from 'restful-react'
import {
  ResponseJiraIssueCreateMetadataNG,
  ResponseListServiceNowFieldNG,
  UseGetJiraIssueCreateMetadataProps
} from '../../../../../../services/cd-ng'

export interface ServiceNowApprovalData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    ticketType: string | ServiceNowTicketTypeSelectOption
    issueNumber: string
    approvalCriteria: ApprovalRejectionCriteria
    rejectionCriteria: ApprovalRejectionCriteria
  }
}
export interface ServiceNowTicketTypeSelectOption extends SelectOption {
  key: string
}

export interface ServiceNowApprovalStepModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowApprovalData
  allowableTypes: MultiTypeInputType[]
  onUpdate?: (data: ServiceNowApprovalData) => void
  onChange?: (data: ServiceNowApprovalData) => void
  isNewStep?: boolean
  readonly?: boolean
}
export interface ServiceNowFormContentInterface {
  formik: FormikProps<ServiceNowApprovalData>
  stepViewType: StepViewType
  allowableTypes: MultiTypeInputType[]
  isNewStep?: boolean
  readonly?: boolean
  refetchServiceNowTicketTypes: (props: UseGetServiceNowTicketTypesProps) => Promise<void>
  serviceNowTicketTypesFetchError?: GetDataError<Failure | Error> | null
  fetchingServiceNowTicketTypes: boolean
  serviceNowTicketTypesResponse: ResponseListServiceNowTicketTypeDTO | null
  refetchServiceNowMetadata: (props: UseGetServiceNowIssueCreateMetadataProps) => Promise<void>
  serviceNowMetadataFetchError?: GetDataError<Failure | Error> | null
  fetchingServiceNowMetadata: boolean
  serviceNowMetadataResponse: ResponseListServiceNowFieldNG | null
}
export const resetForm = (formik: FormikProps<ServiceNowApprovalData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.ticketType', '')
    formik.setFieldValue('spec.issueNumber', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
  if (parent === 'ticketType') {
    formik.setFieldValue('spec.issueNumber', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
}
