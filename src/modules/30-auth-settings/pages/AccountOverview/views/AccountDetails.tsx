import React from 'react'
import { Button, Color, Container, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { truncate } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultExperienceModal } from '@common/modals/DefaultVersion/DefaultExperience'
import { useGetAccountNG } from 'services/cd-ng'
import type { Experiences } from '@common/constants/Utils'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useSwitchAccountModal from '@common/modals/SwitchAccount/useSwitchAccountModal'
import AccountNameForm from './AccountNameForm'
import css from '../AccountOverview.module.scss'

const VERSIONS = {
  CG: 'common.harnessFirstGeneration',
  NG: 'common.harnessNextGeneration'
}

const AccountDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { data, loading, refetch: refetchAcct, error } = useGetAccountNG({ accountIdentifier: accountId })
  const [updateAccountName, setUpdateAccountName] = React.useState(false)

  const { openDefaultExperienceModal } = useDefaultExperienceModal({ refetchAcct })
  const { openSwitchAccountModal } = useSwitchAccountModal({})

  const accountData = data?.data

  const accountNameComponent = updateAccountName ? (
    <AccountNameForm
      name={accountData?.name || ''}
      setUpdateAccountName={setUpdateAccountName}
      refetchAcct={refetchAcct}
    />
  ) : (
    <React.Fragment>
      <Text color={Color.GREY_800}>{truncate(accountData?.name)}</Text>
      <RbacButton
        minimal
        intent="primary"
        icon="edit"
        text={getString('edit')}
        onClick={() => setUpdateAccountName(true)}
        permission={{
          permission: PermissionIdentifier.EDIT_ACCOUNT,
          resource: {
            resourceType: ResourceType.ACCOUNT
          }
        }}
      />
      <Button minimal intent="primary" text={getString('common.switchAccount')} onClick={openSwitchAccountModal} />
    </React.Fragment>
  )

  const defaultExperienceStr =
    accountData?.defaultExperience && VERSIONS[accountData?.defaultExperience]
      ? getString(VERSIONS[accountData?.defaultExperience] as keyof StringsMap)
      : ''

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <Container height={300}>
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetchAcct()} />
      </Container>
    )
  }

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container} background="white">
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.accountDetails')}
      </Text>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
        <Text color={Color.GREY_600} className={css.minWidth}>
          {getString('common.accountName')}
        </Text>
        {accountNameComponent}
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.accountId')}</Text>
        <Text color={Color.GREY_800}>{accountData?.identifier}</Text>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.harnessClusterHostingAccount')}</Text>
        <Text padding={{ right: 'small' }} color={Color.GREY_800}>
          {accountData?.cluster}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Text className={css.minWidth}>{getString('common.defaultExperience')}</Text>
        <Text color={Color.GREY_800}>{defaultExperienceStr}</Text>
        <RbacButton
          minimal
          intent="primary"
          padding="none"
          text={getString('change')}
          onClick={() => openDefaultExperienceModal(accountData?.defaultExperience as Experiences)}
          permission={{
            permission: PermissionIdentifier.EDIT_ACCOUNT,
            resource: {
              resourceType: ResourceType.ACCOUNT
            }
          }}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default AccountDetails
