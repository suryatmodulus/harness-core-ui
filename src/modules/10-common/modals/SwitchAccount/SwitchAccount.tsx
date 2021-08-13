import React, { useMemo, useState, useEffect } from 'react'
import { Container, Text, Button } from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { useGetUser, useSetDefaultAccountForCurrentUser, RestResponseUser, useNewSwitchAccount } from 'services/portal'
import type { User, Account } from 'services/portal'

import { Table, PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useConfirmationDialog, useToaster } from '@common/exports'
import type { UseGetMockData } from '@common/utils/testUtils'

import css from './SwitchAccount.module.scss'

interface SwitchAccountProps {
  hideModal: () => void
  searchString?: string
  mock?: UseGetMockData<RestResponseUser>
}

const RenderColumnCompanyName: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.companyName
  return <Text lineClamp={1}>{name}</Text>
}

const RenderColumnAccountEdition: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.licenseInfo?.accountType
  return <Text>{name}</Text>
}

const SwitchAccount: React.FC<SwitchAccountProps> = ({ searchString = '', mock }) => {
  const { accountId } = useParams<AccountPathProps>()
  const [user, setUser] = useState<User>()
  const { showError } = useToaster()
  const history = useHistory()

  const { getString } = useStrings()
  const { data, loading, error, refetch } = useGetUser({
    mock
  })
  const { mutate: setDefaultAccount, loading: settingDefault } = useSetDefaultAccountForCurrentUser({ accountId })
  const { mutate: switchAccount, loading: switchAccountLoading } = useNewSwitchAccount({
    // requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const RenderColumnAccountName: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    const handleSwitchAccount = async (): Promise<void> => {
      try {
        const response = await switchAccount({ accountId: account.uuid })
        if (response.resource) {
          history.push(routes.toHome({ accountId: account.uuid }))
        } else {
          showError(getString('common.switchAccountError'))
        }
      } catch (err) {
        showError(getString('common.switchAccountError'))
      }
    }

    return (
      <Button
        onClick={handleSwitchAccount}
        text={account.accountName}
        loading={switchAccountLoading}
        disabled={account.uuid === accountId}
        minimal={account.uuid === accountId}
      />
    )
  }

  const RenderColumnDefaultAccount: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    const handleSetDefault = async (): Promise<void> => {
      const { resource, responseMessages } = await setDefaultAccount(undefined, {
        pathParams: { accountId: account.uuid }
      })
      if (resource === true) {
        refetch()
      } else {
        showError(get(responseMessages, '[0].message', getString('somethingWentWrong')))
      }
    }

    const { openDialog } = useConfirmationDialog({
      cancelButtonText: getString('cancel'),
      confirmButtonText: getString('continue'),
      titleText: getString('common.changeDefaultAccountTitle'),
      contentText: getString('common.changeDefaultAccountMessage', { name: account.accountName }),
      onCloseDialog: isConfirmed => {
        if (isConfirmed) {
          handleSetDefault()
        }
      }
    })

    // default account should not be actionable
    return account.uuid === user?.defaultAccountId ? (
      <Text flex={{ align: 'center-center' }}>Default</Text>
    ) : (
      <Button
        small
        text={getString('common.setAsDefault')}
        onClick={openDialog}
        data-test-id={`set-default-account-${account.accountName}`}
      />
    )
  }

  useEffect(() => {
    setUser(data?.resource)
  }, [data])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const accounts = useMemo(
    () =>
      user?.accounts
        ?.concat(user.supportAccounts || [])
        ?.filter(account => account.accountName.toLowerCase().includes(searchString.toLowerCase())) || [],
    [user, searchString]
  )

  const columns: Column<Account>[] = useMemo(
    () => [
      {
        Header: getString('common.headerAccountName'),
        accessor: row => row.accountName,
        id: 'name',
        width: '30%',
        Cell: RenderColumnAccountName
      },
      {
        Header: getString('common.headerCompanyName'),
        accessor: row => row.companyName,
        id: 'companyName',
        width: '30%',
        Cell: RenderColumnCompanyName
      },
      {
        Header: getString('common.headerAccountEdition'),
        accessor: row => row.licenseInfo?.accountType,
        id: 'accountType',
        width: '20%',
        Cell: RenderColumnAccountEdition
      },
      {
        Header: getString('common.headerDefaultAccount'),
        accessor: row => row.defaults,
        id: 'defaultAccount',
        width: '20%',
        Cell: RenderColumnDefaultAccount
      }
    ],
    [accounts]
  )

  return (
    <Container padding={{ left: 'large', right: 'large' }} className={css.container}>
      {loading || settingDefault ? <PageSpinner /> : null}
      {error ? (
        <PageError message={error.message || getString('somethingWentWrong')} onClick={() => refetch()} />
      ) : null}
      {!loading && !settingDefault && !error && accounts ? (
        <Table columns={columns} data={accounts} sortable={false} />
      ) : null}
    </Container>
  )
}

export default SwitchAccount
