import React from 'react'
import { FormInput, Text } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { FormikContext } from 'formik'
import { useStrings } from 'framework/exports'
// import { useGetMetadata } from 'services/cd-ng'
// import { useToaster } from '@common/exports'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useListAwsRegions } from 'services/portal'
import type { AwsKmsConfigFormData } from './AwsKmsConfigForm'
import css from '../CreateAwsKmsConnector.module.scss'

const keyOrDelegateOptions: IOptionProps[] = [
  {
    label: 'AWS Access Key',
    value: 'awsAccessKey'
  },
  {
    label: 'Assume IAM role on delegate',
    value: 'assumeIamRole'
  }
]

interface AwsKmsConnectorConnectorFormFieldsProps {
  formik: FormikContext<AwsKmsConfigFormData>
  isEditing?: boolean
  //   identifier: string
}

const AwsKmsConnectorFormFields: React.FC<AwsKmsConnectorConnectorFormFieldsProps> = ({
  formik
  //   identifier,
  // isEditing
}) => {
  const { getString } = useStrings()
  // const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { accountId } = useParams()
  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))
  //   const { showError } = useToaster()
  //   const [secretEngineOptions, setSecretEngineOptions] = useState<SelectOption[]>([])
  //   const { mutate: getMetadata } = useGetMetadata({ queryParams: { accountIdentifier: accountId } })

  //   const handleFetchEngines = async (formData: AwsKmsConfigFormData): Promise<void> => {
  //     try {
  //       const res = await getMetadata({
  //         identifier,
  //         encryptionType: 'AwsKms',
  //         orgIdentifier,
  //         projectIdentifier
  //         spec: {
  //           url: formData.vaultUrl,
  //           accessType: formData.accessType.toUpperCase(),
  //           spec:
  //             formData.accessType === 'APP_ROLE'
  //               ? {
  //                   appRoleId: formData.appRoleId,
  //                   secretId: formData.secretId
  //                 }
  //               : {
  //                   authToken: formData.authToken
  //                 }
  //         }
  //       })
  //       setSecretEngineOptions(
  //         res.data?.spec?.secretEngines?.map(secretEngine => {
  //           return {
  //             label: secretEngine.name || '',
  //             value: `${secretEngine.name || ''}@@@${secretEngine.version || 2}`
  //           }
  //         }) || []
  //       )
  //     } catch (err) {
  //       showError(err?.data?.message)
  //     }
  //   }
  //   const isFetchDisabled = (formData: AwsKmsConfigFormData): boolean => {
  //     if (!formData.vaultUrl?.trim()) return true
  //     switch (formData.accessType) {
  //       case 'APP_ROLE':
  //         if (!formData.appRoleId?.trim() || !formData.secretId?.trim()) return true
  //         break
  //       case 'TOKEN':
  //         if (!formData.authToken?.trim()) return true
  //         break
  //     }
  //     return false
  //   }

  //   React.useEffect(() => {
  // if (isEditing && formik.values.engineType === 'fetch') handleFetchEngines(formik.values)
  //   }, [isEditing])

  return (
    <>
      <FormInput.RadioGroup
        name="keyOrDelegate"
        // label={''}
        radioGroup={{ inline: true }}
        items={keyOrDelegateOptions}
        className={css.radioGroup}
        onChange={() => {
          // console.log(ev)
        }}
      />
      <Text font={{ size: 'medium' }} className={css.authTitle}>
        {getString('authentication')}
      </Text>
      <FormInput.Text name="accessKey" label={getString('connectors.awsKms.accessKeyLabel')} />
      <SecretInput name="secretAccessKey" label={getString('connectors.awsKms.secretKeyLabel')} />
      <SecretInput name="аrnKey" label={getString('connectors.awsKms.arnLabel')} />
      <FormInput.Select
        selectProps={{
          usePortal: true,
          addClearBtn: true
        }}
        value={formik.values?.region}
        items={regions}
        label={getString('pipelineSteps.regionLabel')}
        name={'region'}
      />
    </>
  )
}

export default AwsKmsConnectorFormFields
