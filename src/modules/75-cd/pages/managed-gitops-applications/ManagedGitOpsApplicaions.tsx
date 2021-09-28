import React from 'react'
import { useGet, useMutate } from 'restful-react'
import { Button, ButtonSize, ButtonVariation, Card, Color, Icon, Layout, Text } from '@wings-software/uicore'

import { Page, useToaster } from '@common/exports'
import { getConfig } from 'services/config'
import css from './styles.module.scss'

function AppCard(props: any): React.ReactElement {
  const { app } = props
  const { mutate: syncApp } = useMutate('POST', getConfig(`gitops-proxy/applications/${app?.metadata?.name}/sync`))
  const { showError, showSuccess } = useToaster()
  const status = app?.status?.sync?.status
  const inSync = status === 'Synced'

  async function handleSync(): Promise<void> {
    try {
      await syncApp({})
      showSuccess('Application synced successfully.')
    } catch (e) {
      showError(e.message)
    }
  }

  return (
    <Card className={css.card}>
      <Text
        lineClamp={1}
        font={{ weight: 'bold' }}
        margin={{ top: 'small' }}
        color={Color.GREY_800}
        data-testid={app?.metadata?.name}
      >
        {app?.metadata?.name}
      </Text>
      <div className={css.statusContainer}>
        <Text lineClamp={1} font="small" color={Color.GREY_600}>
          Sync status: {status}
        </Text>
        <Icon
          name={inSync ? 'tick-circle' : 'circle-cross'}
          size={12}
          color={inSync ? Color.GREEN_500 : Color.RED_500}
        />
      </div>
      <Button
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.SMALL}
        margin={{ top: 'small' }}
        onClick={handleSync}
      >
        Sync
      </Button>
    </Card>
  )
}

export function ManagedGitOpsApplicaions(): React.ReactElement {
  const { data, loading } = useGet(
    getConfig(
      window.location.hostname === 'pr.harness.io' ? 'ng/gitops-proxy/applications' : 'gitops-proxy/applications'
    ),
    {
      resolve: (res: any) => (typeof res === 'string' ? JSON.parse(res) : res)
    }
  )

  return (
    <React.Fragment>
      <Page.Header title="Applications" />
      <Page.SubHeader></Page.SubHeader>
      <Page.Body loading={loading}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.items || []}
          keyOf={(item: any) => item.metadata.uid}
          renderItem={item => <AppCard app={item} />}
        />
      </Page.Body>
    </React.Fragment>
  )
}
