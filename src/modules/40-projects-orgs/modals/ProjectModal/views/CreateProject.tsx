import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { useGetOrganizationList } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { usePostProject } from 'services/cd-ng'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useQueryParams } from '@common/hooks'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleName } from 'framework/types/ModuleName'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import ProjectForm from './ProjectForm'

interface CreateModalData {
  modules?: Project['modules']
  onSuccess?: () => void
  module?: ModuleName
}

const CreateProject: React.FC<StepProps<Project> & CreateModalData> = props => {
  const { nextStep, onSuccess, modules, module } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { orgId: orgIdentifier } = useQueryParams<{ orgId: string }>()
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
      showSuccess(i18n.newProjectWizard.aboutProject.createSuccess)
      onSuccess?.()
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
        title={i18n.newProjectWizard.aboutProject.name}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {saving ? <PageSpinner message={getString('projectsOrgs.createProjectLoader')} /> : null}
    </>
  )
}

export default CreateProject
