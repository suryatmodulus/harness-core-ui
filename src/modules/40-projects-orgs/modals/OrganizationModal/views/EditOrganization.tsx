import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { StepProps, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Organization, useGetOrganization } from 'services/cd-ng'
import { usePutOrganization } from 'services/cd-ng'
import { useToaster } from '@common/components/Toaster/useToaster'
import { PageSpinner } from '@common/components'
import OrganizationForm from './OrganizationForm'

import i18n from './StepAboutOrganization.i18n'

interface EditModalData {
  identifier?: string
  closeModal?: () => void
  onSuccess?: (Organization: Organization | undefined) => void
  isStep?: boolean
}

const EditOrganization: React.FC<StepProps<Organization> & EditModalData> = props => {
  const { prevStepData, nextStep, onSuccess, identifier, isStep } = props
  const { accountId } = useParams()
  const { showSuccess } = useToaster()
  const [version, setVersion] = useState<string>()
  const orgIdentifier = isStep ? prevStepData?.identifier : identifier

  const { mutate: editOrganization, loading: saving } = usePutOrganization({
    identifier: orgIdentifier || '',
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: { 'If-Match': version as string }
    }
  })
  const { data, loading, error, response } = useGetOrganization({
    identifier: orgIdentifier || '',
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    /* istanbul ignore else */ if (!loading && !error) {
      setVersion(response?.headers.get('etag') as string)
    }
  }, [error, loading])

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const onComplete = async (values: Organization): Promise<void> => {
    const dataToSubmit: Organization = pick<Organization, keyof Organization>(values, [
      'name',
      'description',
      'identifier',
      'tags'
    ])
    try {
      await editOrganization(
        { organization: dataToSubmit },
        {
          queryParams: {
            accountIdentifier: accountId
          }
        }
      )
      nextStep?.(values)
      showSuccess(i18n.form.editSuccess)
      onSuccess?.(values)
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }
  return (
    <>
      <OrganizationForm
        data={data?.data?.organization}
        title={i18n.editTitle}
        enableEdit={false}
        submitTitle={isStep ? i18n.form.saveAndContinue : i18n.form.saveAndClose}
        disableSubmit={saving}
        disablePreview={!isStep}
        setModalErrorHandler={setModalErrorHandler}
        onComplete={onComplete}
      />
      {loading ? <PageSpinner /> : null}
    </>
  )
}

export default EditOrganization
