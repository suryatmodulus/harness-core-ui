import React from 'react'
import type { StepProps } from '@wings-software/uicore'
import type {
  Project,
  ResponseOrganizationResponse,
  ResponsePageOrganizationResponse,
  ResponseProjectResponse
} from 'services/cd-ng'
import type { UseGetMockData, UseMutateMockData } from '@common/utils/testUtils'
import type { ModuleName } from 'framework/types/ModuleName'
import CreateProject from './CreateProject'
import EditProject from './EditProject'

interface ProjectModalData {
  closeModal?: () => void
  onSuccess?: () => void
  onProjectSubmit?: (project: Project) => Promise<void>
  modules?: Project['modules']
  orgMockData?: UseGetMockData<ResponsePageOrganizationResponse>
  editOrgMockData?: UseGetMockData<ResponseOrganizationResponse>
  projectMockData?: UseGetMockData<ResponseProjectResponse>
  createMock?: UseMutateMockData<ResponseProjectResponse>
  module?: ModuleName
}

const StepAboutProject: React.FC<StepProps<Project> & ProjectModalData> = props => {
  const { prevStepData, orgMockData } = props
  const isStepBack = prevStepData?.identifier ? true : false
  return (
    <>
      {isStepBack ? (
        <EditProject isStep={isStepBack} {...props} />
      ) : (
        <CreateProject orgMockData={orgMockData} {...props} />
      )}
    </>
  )
}

export default StepAboutProject
