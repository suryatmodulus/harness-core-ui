import React from 'react'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import {
  Layout,
  Heading,
  Color,
  Formik,
  FormikForm,
  Container,
  FormInput,
  CardSelect,
  CardBody,
  Text,
  Button,
  IconName,
  Card,
  Checkbox
} from '@wings-software/uicore'
import { InputGroup } from '@blueprintjs/core'
import copy from 'copy-to-clipboard'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import type { SamlSettings } from 'services/cd-ng'
import { useUploadSamlMetaData, useUpdateSamlMetaData } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import type { StringsMap } from 'stringTypes'
import css from '../useSAMLProvider.module.scss'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  samlProvider?: SamlSettings
}

interface FormValues {
  displayName: string
  authorizationEnabled: boolean
  groupMembershipAttr: string
}

enum Providers {
  AZURE = 'AZURE',
  OKTA = 'OKTA',
  ONE_LOGIN = 'ONE_LOGIN',
  OTHER = 'OTHER'
}
interface SAMLProviderType {
  type: Providers
  name: keyof StringsMap
  icon: IconName
  color?: Color
}

const SAMLProviderTypes: SAMLProviderType[] = [
  {
    type: Providers.AZURE,
    name: 'common.samlProvider.azure',
    icon: 'service-azure',
    color: Color.BLUE_700
  },
  {
    type: Providers.OKTA,
    name: 'common.samlProvider.okta',
    icon: 'ring',
    color: Color.BLUE_700
  },
  {
    type: Providers.ONE_LOGIN,
    name: 'common.samlProvider.oneLogin',
    icon: 'main-more'
  },
  {
    type: Providers.OTHER,
    name: 'common.other',
    icon: 'main-more'
  }
]

const SAMLProviderForm: React.FC<Props> = ({ onSubmit, onCancel, samlProvider }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [selected, setSelected] = React.useState<SAMLProviderType>()
  const samlEndpoint = `https://${window.location.hostname}/gateway/api/users/saml-login?acc=${accountId}`
  const selectedSAMLProvider = getString(
    selected
      ? selected?.type === Providers.OTHER
        ? 'common.authSettings.SAMLProvider'
        : selected.name
      : 'common.authSettings.SAMLProvider'
  )

  const { mutate: uploadSamlSettings, loading: uploadingSamlSettings } = useUploadSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const { mutate: updateSamlSettings, loading: updatingSamlSettings } = useUpdateSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const createFormData = (data: FormValues): FormData => {
    const formData = new FormData()
    formData.set('displayName', data.displayName)
    formData.set('authorizationEnabled', JSON.stringify(data.authorizationEnabled))
    formData.set('groupMembershipAttr', data.groupMembershipAttr)
    formData.set('ssoSetupType', AuthenticationMechanisms.SAML)

    const file = (data as any)?.files?.[0]
    file && formData.set('file', file)

    return formData
  }

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      let response

      if (samlProvider) {
        response = await updateSamlSettings(createFormData(values) as any)
      } else {
        response = await uploadSamlSettings(createFormData(values) as any)
      }

      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(
            samlProvider
              ? 'common.samlProvider.samlProviderUpdatedSuccessfully'
              : 'common.samlProvider.samlProviderAddedSuccessfully'
          ),
          5000
        )
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const filesValidation = samlProvider
    ? yup.array()
    : yup.array().required(getString('common.validation.fileIsRequired'))

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Heading level={1} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'xxlarge' }}>
        {samlProvider
          ? getString('common.samlProvider.editSAMLProvider')
          : getString('common.samlProvider.addSAMLProvider')}
      </Heading>
      <Layout.Horizontal>
        <Layout.Vertical width={580} padding={{ right: 'xxxlarge' }}>
          <Formik
            initialValues={{
              displayName: samlProvider?.displayName || /* istanbul ignore next */ '',
              authorizationEnabled: samlProvider ? !!samlProvider?.authorizationEnabled : true,
              groupMembershipAttr: samlProvider?.groupMembershipAttr || /* istanbul ignore next */ ''
            }}
            validationSchema={yup.object().shape({
              displayName: yup.string().trim().required(getString('common.validation.nameIsRequired')),
              files: filesValidation,
              groupMembershipAttr: yup.string().when('authorizationEnabled', {
                is: val => val,
                then: yup.string().trim().required(getString('common.validation.groupAttributeIsRequired'))
              })
            })}
            onSubmit={values => {
              handleSubmit(values)
            }}
          >
            {({ values, setFieldValue }) => (
              <FormikForm>
                <Container width={474} margin={{ bottom: 'xxxlarge' }}>
                  <FormInput.Text name="displayName" label={getString('name')} />
                </Container>
                {!samlProvider && (
                  <React.Fragment>
                    <Text margin={{ bottom: 'medium' }}>{getString('common.samlProvider.selectSAMLProvider')}</Text>
                    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                      <CardSelect
                        data={selected ? [selected] : SAMLProviderTypes}
                        cornerSelected
                        cardClassName={css.card}
                        renderItem={item => (
                          <CardBody.Icon icon={item.icon} iconSize={25} iconProps={{ color: item.color }}>
                            <Text
                              font={{
                                size: 'small',
                                align: 'center',
                                weight: 'semi-bold'
                              }}
                              flex={{ justifyContent: 'center' }}
                              color={Color.GREY_900}
                              className={css.text}
                            >
                              {getString(item.name)}
                            </Text>
                          </CardBody.Icon>
                        )}
                        onChange={value => setSelected(value)}
                        selected={selected}
                      />
                      {selected ? (
                        <Button
                          text={getString('change')}
                          minimal
                          intent="primary"
                          onClick={() => {
                            setFieldValue('files', [])
                            setSelected(undefined)
                          }}
                        />
                      ) : null}
                    </Layout.Horizontal>
                  </React.Fragment>
                )}
                {(selected || samlProvider) && (
                  <React.Fragment>
                    <Text color={Color.GREY_500} margin={{ top: 'huge', bottom: 'xsmall' }}>
                      {getString('common.samlProvider.enterSAMLEndPoint', {
                        selectedSAMLProvider
                      })}
                    </Text>
                    <InputGroup
                      name="endPoint"
                      value={samlEndpoint}
                      rightElement={
                        <Button
                          icon="duplicate"
                          inline
                          minimal
                          className={css.copyToClipboardButton}
                          onClick={() => {
                            copy(samlEndpoint)
                              ? showSuccess(getString('clipboardCopySuccess'))
                              : showError(getString('clipboardCopyFail'))
                          }}
                        />
                      }
                      disabled
                    />
                    <Text color={Color.GREY_500} margin={{ bottom: 'xsmall' }} padding={{ top: 'huge' }}>
                      {getString(
                        samlProvider
                          ? 'common.samlProvider.identityProvider'
                          : 'common.samlProvider.uploadIdentityProvider',
                        {
                          selectedSAMLProvider
                        }
                      )}
                      {samlProvider && ` ${getString('titleOptional')}`}
                    </Text>
                    <Container margin={{ bottom: 'xxxlarge' }}>
                      <FormInput.FileInput
                        name="files"
                        buttonText={getString('upload')}
                        placeholder={getString('common.samlProvider.chooseFile')}
                        multiple
                      />
                    </Container>
                    <Card className={css.authorizationCard}>
                      <Container margin={{ left: 'xlarge' }}>
                        <Checkbox
                          name="authorization"
                          label={getString('common.samlProvider.enableAuthorization')}
                          font={{ weight: 'semi-bold' }}
                          color={Color.GREY_600}
                          checked={values.authorizationEnabled}
                          onChange={e => setFieldValue('authorizationEnabled', e.currentTarget.checked)}
                        />
                      </Container>
                      {values.authorizationEnabled && (
                        <Container width={300} margin={{ top: 'large' }}>
                          <FormInput.Text
                            name="groupMembershipAttr"
                            label={getString('common.samlProvider.groupAttributeName')}
                          />
                        </Container>
                      )}
                    </Card>
                  </React.Fragment>
                )}
                <Layout.Horizontal spacing="small" padding={{ top: 'huge', bottom: 'xlarge' }}>
                  <Button
                    intent="primary"
                    text={getString(samlProvider ? 'save' : 'add')}
                    type="submit"
                    loading={uploadingSamlSettings || updatingSamlSettings}
                  />
                  <Button text={getString('cancel')} onClick={onCancel} />
                </Layout.Horizontal>
              </FormikForm>
            )}
          </Formik>
        </Layout.Vertical>
        <Layout.Vertical
          width={290}
          padding={{ left: 'xxxlarge' }}
          margin={{ bottom: 'large' }}
          border={{ left: true }}
        >
          <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
            {getString('common.samlProvider.friendlyReminder')}
          </Heading>
          <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
            {getString('common.samlProvider.friendlyReminderDescription')}
          </Text>
          {(selected || samlProvider) && (
            <React.Fragment>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.samlProvider.enablingAuthorization')}
              </Heading>
              <Text
                color={Color.GREY_800}
                font={{ size: 'small' }}
                margin={{ bottom: 'xxlarge' }}
                className={css.notes}
              >
                {getString('common.samlProvider.enablingAuthorizationDescription', {
                  selectedSAMLProvider
                })}
              </Text>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.samlProvider.testingSSO')}
              </Heading>
              <Text
                color={Color.GREY_800}
                font={{ size: 'small' }}
                margin={{ bottom: 'xxlarge' }}
                className={css.notes}
              >
                {getString('common.samlProvider.testingSSODescription')}
              </Text>
            </React.Fragment>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SAMLProviderForm
