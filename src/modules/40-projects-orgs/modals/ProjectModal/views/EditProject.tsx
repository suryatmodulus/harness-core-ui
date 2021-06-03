import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { useGetOrganization, useGetProject } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { usePutProject } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import { PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ProjectForm from './ProjectForm'

interface EditModalData {
  identifier?: string
  orgIdentifier?: string
  closeModal?: () => void
  isStep?: boolean
}

const EditProject: React.FC<StepProps<Project> & EditModalData> = props => {
  const { prevStepData, nextStep, identifier, orgIdentifier, closeModal, isStep } = props
  const [version, setVersion] = useState<string>()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const projectIdentifier = isStep ? prevStepData?.identifier : identifier
  const organizationIdentifier = isStep ? prevStepData?.orgIdentifier : orgIdentifier

  const { data: projectData, loading, response, error } = useGetProject({
    identifier: projectIdentifier || /* istanbul ignore next */ '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: organizationIdentifier || /* istanbul ignore next */ ''
    }
  })

  const { data: orgData } = useGetOrganization({
    identifier: organizationIdentifier || /* istanbul ignore next */ '',
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: updateProject, loading: saving } = usePutProject({
    identifier: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    },
    requestOptions: {
      headers: { 'If-Match': version as string }
    }
  })

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  useEffect(() => {
    /* istanbul ignore else */ if (!loading && !error) {
      setVersion(response?.headers.get('etag') as string)
    }
  }, [error, loading])

  const organizations: SelectOption[] = [
    {
      label: orgData?.data?.organization.name || /* istanbul ignore next */ '',
      value: orgData?.data?.organization.identifier || /* istanbul ignore next */ ''
    }
  ]

  const onComplete = async (values: Project): Promise<void> => {
    try {
      await updateProject(
        { project: values },
        {
          pathParams: { identifier: values.identifier },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: values.orgIdentifier
          }
        }
      )
      showSuccess(getString('projectsOrgs.projectEditSuccess'))
      isStep ? nextStep?.({ ...values }) : closeModal?.()
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }

  return (
    <>
      <ProjectForm
        data={projectData?.data?.project}
        disableSelect={true}
        enableEdit={false}
        disableSubmit={saving}
        initialOrgIdentifier={
          projectData?.data?.project.orgIdentifier || orgIdentifier || /* istanbul ignore next */ ''
        }
        organizationItems={organizations}
        title={getString('projectsOrgs.projectEdit')}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
        displayProjectCardPreview={isStep ? true : false}
      />
      {loading && !projectData ? <PageSpinner /> : null}
    </>
  )
}

export default EditProject
