import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type { Organization } from 'services/cd-ng'
import { usePostOrganization } from 'services/cd-ng'
import { useToaster } from '@common/components/Toaster/useToaster'
import i18n from './StepAboutOrganization.i18n'
import OrganizationForm from './OrganizationForm'
import type { OrgModalData } from './StepAboutOrganization'

const CreateOrganization: React.FC<StepProps<Organization> & OrgModalData> = props => {
  const { nextStep, onSuccess } = props
  const { accountId } = useParams()
  const { showSuccess } = useToaster()
  const { mutate: createOrganization } = usePostOrganization({
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
      showSuccess(i18n.form.createSuccess)
      onSuccess?.(values)
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }
  return (
    <OrganizationForm
      title={i18n.aboutTitle}
      enableEdit={true}
      disableSubmit={false}
      submitTitle={i18n.form.saveAndContinue}
      setModalErrorHandler={setModalErrorHandler}
      onComplete={onComplete}
    />
  )
}

export default CreateOrganization
