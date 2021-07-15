import React, { useState } from 'react'
import { Button } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'
import useCVNotificationsModal from '@cv/components/CVNotifications/useCVNotificationsModal'
import { useRetrieveAlert } from 'services/cv'

import { PageSpinner } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CVNotificationTable from './NotificationTable/CVNotificationTable'

import css from './CVNotificationPage.module.scss'

const CVNotificationPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const {
    data,
    loading,
    error,
    refetch: reloadAlertList
  } = useRetrieveAlert({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      offset: page,
      pageSize: 10
    }
  })
  const { openNotificationModal } = useCVNotificationsModal({
    onSuccess: () => {
      reloadAlertList()
    }
  })

  return (
    <>
      <Page.Header title={'Notifications'}></Page.Header>
      <Page.Body className={css.mainPage}>
        <Button
          text={getString('cv.admin.notifications.newNotification')}
          icon="plus"
          intent="primary"
          onClick={() => openNotificationModal()}
          margin={{ bottom: 'small' }}
        />

        {loading ? (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        ) : error ? (
          <div style={{ paddingTop: '200px' }}>
            <PageError message={error.message} onClick={() => reloadAlertList()} />
          </div>
        ) : data?.resource?.content?.length ? (
          <CVNotificationTable
            data={data?.resource}
            reload={reloadAlertList}
            gotoPage={pageNumber => setPage(pageNumber)}
          />
        ) : (
          <Page.NoDataCard icon="nav-dashboard" message={'No Notification Rule'} />
        )}
      </Page.Body>
    </>
  )
}

export default CVNotificationPage
