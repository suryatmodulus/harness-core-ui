import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useGetOrganizationList } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { usePostProject } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleName } from 'framework/types/ModuleName'
import { PageSpinner } from '@common/components'
import ProjectForm from './ProjectForm'

interface CreateModalData {
  modules?: Project['modules']
  module?: ModuleName
}

const CreateProject: React.FC<StepProps<Project> & CreateModalData> = props => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const { nextStep, modules, module } = props
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { mutate: createProject, loading: saving } = usePostProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { data: orgData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  let defaultOrg = ''
  const organizations: SelectOption[] =
    orgData?.data?.content?.map(org => {
      if (org.harnessManaged) defaultOrg = org.organization.identifier
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    }) || []

  const onComplete = async (values: Project): Promise<void> => {
    const dataToSubmit: Project = pick<Project, keyof Project>(values, [
      'name',
      'orgIdentifier',
      'color',
      'description',
      'identifier',
      'tags'
    ])
    ;(dataToSubmit as Project)['modules'] = values.modules || []
    if (module) {
      dataToSubmit.modules?.push(module as any)
    }
    try {
      await createProject(
        { project: dataToSubmit },
        {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: values?.orgIdentifier || /* istanbul ignore next */ ''
          }
        }
      )
      nextStep?.(dataToSubmit)
      showSuccess(getString('projectsOrgs.projectCreateSuccess'))
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }
  return (
    <>
      <ProjectForm
        disableSelect={false}
        enableEdit={true}
        disableSubmit={saving}
        initialOrgIdentifier={orgIdentifier || defaultOrg}
        initialModules={modules}
        organizationItems={organizations}
        title={getString('projectsOrgs.aboutProject')}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {saving ? <PageSpinner message={getString('projectsOrgs.createProjectLoader')} /> : null}
    </>
  )
}

export default CreateProject
