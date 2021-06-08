import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type { Organization } from 'services/cd-ng'
import { usePostOrganization } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import OrganizationForm from './OrganizationForm'
import type { OrgModalData } from './StepAboutOrganization'

const CreateOrganization: React.FC<StepProps<Organization> & OrgModalData> = props => {
  const { nextStep, onSuccess } = props
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { mutate: createOrganization, loading: saving } = usePostOrganization({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const onComplete = async (values: Organization): Promise<void> => {
    const dataToSubmit: Organization = pick<Organization, keyof Organization>(values, [
      'name',
      'description',
      'identifier',
      'tags'
    ])
    try {
      await createOrganization(
        { organization: dataToSubmit },
        {
          queryParams: {
            accountIdentifier: accountId
          }
        }
      )
      nextStep?.(values)
      showSuccess(getString('projectsOrgs.orgCreateSuccess'))
      onSuccess?.(values)
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }
  return (
    <>
      <OrganizationForm
        title={getString('projectsOrgs.aboutTitle')}
        enableEdit={true}
        disableSubmit={false}
        submitTitle={getString('saveAndContinue')}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {saving ? <PageSpinner message={getString('projectsOrgs.createOrgLoader')} /> : null}
    </>
  )
}

export default CreateOrganization
