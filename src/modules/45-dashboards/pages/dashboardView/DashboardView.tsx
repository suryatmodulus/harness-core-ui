import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutate } from 'restful-react'
import { Layout } from '@wings-software/uicore'
import { useGet } from 'restful-react'
import { useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './DashboardView.module.scss'

const DASHBOARDS_ORIGIN = 'https://dashboards.harness.io'
const DashboardViewPage: React.FC = () => {
  const { getString } = useStrings()

  const { accountId, viewId, folderId } = useParams<AccountPathProps & { viewId: string; folderId: string }>()
  const [embedUrl, setEmbedUrl] = React.useState('')
  const [iframeState] = React.useState(0)
  const history = useHistory()
  const query = location.href.split('?')[1]

  const {
    mutate: createSignedUrl,
    loading,
    error
  } = useMutate({
    verb: 'POST',
    path: 'dashboard/v1/signedUrl',
    queryParams: {
      accountId: accountId,
      src: `/embed/dashboards-next/${viewId}?embed_domain=` + location?.host + '&' + query
    }
  })

  const generateSignedUrl = async () => {
    const { resource } = await createSignedUrl({})
    setEmbedUrl(resource)
  }

  React.useEffect(() => {
    generateSignedUrl()
  }, [viewId])

  React.useEffect(() => {
    window.addEventListener('message', function (event) {
      if (event.origin === DASHBOARDS_ORIGIN) {
        const onChangeData = JSON.parse(event?.data)
        if (onChangeData?.type === 'page:changed' && onChangeData?.page?.url?.includes('embed/explore')) {
          history.go(0)
        }
      }
    })
  }, [])

  const { data: folderDetail } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'dashboard/folderDetail',
    queryParams: { accountId: accountId, folderId: folderId === 'shared' ? '' : folderId }
  })

  const { data: dashboarDetail } = useGet({
    // Inferred from RestfulProvider in index.js
    path: `dashboard/${viewId}/detail`,
    queryParams: { accountId: accountId }
  })

  const links: { url: string; label: string }[] = [
    {
      url: routes.toCustomDashboardHome({ accountId }),
      label: 'Home'
    },
    {
      url: routes.toCustomFolderHome({ accountId }),
      label: getString('dashboards.homePage.folders')
    }
  ]

  const title = folderId === 'shared' ? 'Organization Shared Folder' : folderDetail?.resource || '' + ' Folder'
  if (folderId) {
    links.push({
      url: routes.toCustomDashboardHome({ accountId, folderId }),
      label: title
    })
  }
  if (dashboarDetail?.title) {
    links.push({
      url: '',
      label: dashboarDetail?.title
    })
  }

  return (
    <Page.Body
      className={css.pageContainer}
      loading={loading}
      retryOnError={() => {
        return
      }}
      error={(error?.data as Error)?.message}
      noData={{
        when: () => embedUrl === '',
        icon: 'dashboard',
        message: 'Dashboard not available'
      }}
    >
      <Breadcrumbs className={css.breadCrumb} links={links} />

      <Layout.Vertical className={css.frame}>
        <iframe src={embedUrl} key={iframeState} height="100%" width="100%" frameBorder="0" id="dashboard-render" />
      </Layout.Vertical>
    </Page.Body>
  )
}

export default DashboardViewPage
