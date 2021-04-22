import React from 'react'
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
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useStrings } from 'framework/exports'
import type { StringsMap } from 'stringTypes'
import type { SAMLProvider } from '../useSAMLProvider'
import css from '../useSAMLProvider.module.scss'

interface Props {
  hideModal: () => void
  samlProvider?: SAMLProvider
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
}

const SAMLProviderTypes: SAMLProviderType[] = [
  {
    type: Providers.AZURE,
    name: 'common.samlProvider.azure',
    icon: 'service-azure'
  },
  {
    type: Providers.OKTA,
    name: 'common.samlProvider.okta',
    icon: 'ring'
  },
  {
    type: Providers.ONE_LOGIN,
    name: 'common.samlProvider.oneLogin',
    icon: 'service-azure'
  },
  {
    type: Providers.OTHER,
    name: 'common.other',
    icon: 'service-azure'
  }
]

const SAMLProviderForm: React.FC<Props> = ({ hideModal, samlProvider }) => {
  const { getString } = useStrings()
  const [selected, setSelected] = React.useState<SAMLProviderType>()

  const handleSubmit = (): void => {
    // Submit logic
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Heading level={1} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'xxlarge' }}>
        {samlProvider
          ? getString('common.samlProvider.editSAMLProvider')
          : getString('common.samlProvider.addSAMLProvider')}
      </Heading>
      <Layout.Horizontal>
        <Layout.Vertical width={520} padding={{ right: 'xxxlarge' }}>
          <Formik
            initialValues={{
              name: samlProvider?.name || '',
              authorization: !!samlProvider?.authorization,
              groupAttributeName: samlProvider?.groupAttributeName || ''
            }}
            validationSchema={yup.object().shape({
              name: yup.string().trim().required(getString('common.validation.nameIsRequired')),
              files: yup.array().required(getString('common.validation.fileIsRequired')),
              groupAttributeName: yup.string().when('authorization', {
                is: val => val,
                then: yup.string().trim().required(getString('common.validation.groupAttributeIsRequired'))
              })
            })}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <FormikForm>
                <Container width={474}>
                  <FormInput.Text name="name" label={getString('name')} />
                </Container>
                {!samlProvider && (
                  <React.Fragment>
                    <Text>{getString('common.samlProvider.selectSAMLProvider')}</Text>
                    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                      <CardSelect
                        data={selected ? [selected] : SAMLProviderTypes}
                        cornerSelected={true}
                        className={css.cardRow}
                        cardClassName={css.card}
                        renderItem={(item, selectedItem) => (
                          <CardBody.Icon icon={item.icon} iconSize={25}>
                            <Text
                              font={{
                                size: 'small',
                                align: 'center'
                              }}
                              flex={{ justifyContent: 'center' }}
                              color={selectedItem ? Color.GREY_900 : Color.GREY_350}
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
                    <Text color={Color.GREY_700} margin={{ top: 'xxxlarge', bottom: 'small' }}>
                      {getString('common.samlProvider.enterSAMLEndPoint')}
                    </Text>
                    <InputGroup
                      name="endPoint"
                      value={`https://${window.location.hostname}/gateway/api/users/saml-login?acc`}
                      rightElement={
                        <Container padding="xsmall">
                          <CopyToClipboard
                            content={`https://${window.location.hostname}/gateway/api/users/saml-login?acc`}
                          />
                        </Container>
                      }
                      disabled
                    />
                    <Text color={Color.GREY_700} margin={{ bottom: 'medium' }} padding={{ top: 'xxxlarge' }}>
                      {getString('common.samlProvider.uploadIdentityProvider')}
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
                          checked={values.authorization}
                          onChange={e => setFieldValue('authorization', e.currentTarget.checked)}
                        />
                      </Container>
                      {values.authorization && (
                        <Container width={300} margin={{ top: 'large' }}>
                          <FormInput.Text
                            name="groupAttributeName"
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
                    disabled={!(selected || samlProvider)}
                  />
                  <Button text={getString('common.cancel')} onClick={hideModal} />
                </Layout.Horizontal>
              </FormikForm>
            )}
          </Formik>
        </Layout.Vertical>
        <Layout.Vertical
          width={310}
          padding={{ left: 'xxxlarge' }}
          margin={{ bottom: 'large' }}
          border={{ left: true }}
        >
          <Heading level={3} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
            {getString('common.samlProvider.friendlyReminder')}
          </Heading>
          <Text color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
            {getString('common.samlProvider.friendlyReminderDescription')}
          </Text>
          {(selected || samlProvider) && (
            <React.Fragment>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.samlProvider.enablingAuthorization')}
              </Heading>
              <Text color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
                {getString('common.samlProvider.enablingAuthorizationDescription')}
              </Text>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString('common.samlProvider.testingSSO')}
              </Heading>
              <Text color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
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
