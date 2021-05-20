import React from 'react'
import { Button, Color, Container, Formik, FormikForm, FormInput, Layout, Text } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useDefaultVersionModal } from '@common/modals/DefaultVersion/DefaultVersion'
import { Versions } from '@common/constants/Utils'
import useSwitchAccountModal from '@common/modals/SwitchAccount/useSwitchAccountModal'
import css from './AccountDetails.module.scss'

interface FormValues {
  name: string
}

const AccountDetails: React.FC = () => {
  const { getString } = useStrings()
  const [accountName, setAccountName] = React.useState('Harness')
  const [updateAccountName, setUpdateAccountName] = React.useState(false)

  const { openDefaultVersionModal } = useDefaultVersionModal({ onSuccess: noop })
  const { openSwitchAccountModal } = useSwitchAccountModal({})

  const handleSubmit = (values: FormValues): void => {
    setAccountName(values.name)
    setUpdateAccountName(false)
  }

  return (
    <>
      <Page.Header title={getString('common.accountOverview')} />
      <Page.Body>
        <Container margin="xlarge" padding="xlarge" className={css.container}>
          <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
            {getString('common.accountDetails')}
          </Text>

          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
            <Text color={Color.GREY_600} className={css.minWidth}>
              {getString('common.accountName')}
            </Text>
            {updateAccountName ? (
              <Formik
                initialValues={{
                  name: accountName
                }}
                onSubmit={handleSubmit}
              >
                {() => (
                  <FormikForm>
                    <Layout.Horizontal spacing="medium">
                      <FormInput.Text name="name" />
                      <Button intent="primary" text={getString('save')} type="submit" />
                      <Button text={getString('cancel')} onClick={() => setUpdateAccountName(false)} />
                    </Layout.Horizontal>
                  </FormikForm>
                )}
              </Formik>
            ) : (
              <React.Fragment>
                <Text color={Color.GREY_800}>{accountName}</Text>
                <Button
                  minimal
                  intent="primary"
                  icon="edit"
                  text={getString('edit')}
                  onClick={() => setUpdateAccountName(true)}
                />
                <Button
                  minimal
                  intent="primary"
                  text={getString('common.switchAccount')}
                  onClick={openSwitchAccountModal}
                />
              </React.Fragment>
            )}
          </Layout.Horizontal>

          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
            <Text className={css.minWidth}>{getString('common.accountId')}</Text>
            <Text color={Color.GREY_800}>102684</Text>
          </Layout.Horizontal>

          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
            <Text className={css.minWidth}>{getString('common.harnessClusterHostingAccount')}</Text>
            <Text color={Color.GREY_800}>Prod 1</Text>
          </Layout.Horizontal>

          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <Text className={css.minWidth}>{getString('common.defaultVersion')}</Text>
            <Text color={Color.GREY_800}>Harness Next Generation </Text>
            <Button
              minimal
              intent="primary"
              padding="none"
              text={getString('change')}
              onClick={() => openDefaultVersionModal(Versions.NG)}
            />
          </Layout.Horizontal>
        </Container>
      </Page.Body>
    </>
  )
}

export default AccountDetails
