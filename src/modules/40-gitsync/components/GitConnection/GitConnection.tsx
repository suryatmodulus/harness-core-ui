import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router'
import { Radio } from '@blueprintjs/core'
import { Button, Card, Color, Container, Icon, Layout, StepProps, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { GitSyncConfig, isSaasGitPromise, ResponseSaasGitDTO, usePostGitSyncSetting } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './GitConnection.module.scss'

interface GitConnectionStepProps {
  repo: string
}

interface GitConnectionProps {
  onSuccess: (data?: GitSyncConfig) => void
}

enum Agent {
  Manager = 'Manager',
  Delegate = 'Delegate'
}

const GitConnection: React.FC<StepProps<GitConnectionStepProps> & GitConnectionProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { prevStepData, onSuccess } = props
  const [isSaaS, setIsSaaS] = useState<boolean | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [agent, setAgent] = useState<Agent | undefined>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()

  const { mutate: registerAgent } = usePostGitSyncSetting({
    requestOptions: { headers: { accept: 'application/json' } }
  })

  React.useEffect(() => {
    setLoading(true)
    isSaasGitPromise({
      queryParams: {
        repoURL: encodeURIComponent(prevStepData?.repo || '')
      },
      body: undefined
    })
      .then((res: ResponseSaasGitDTO) => {
        const { saasGit } = res?.data || {}
        if (typeof saasGit !== 'undefined') {
          setAgent(saasGit ? Agent.Manager : Agent.Delegate)
          setIsSaaS(saasGit)
        }
      })
      .catch(e => {
        showError(e.data?.message || e.message)
      })
    setLoading(false)
  }, [prevStepData?.repo])

  return (
    <Layout.Vertical
      padding={{ top: 'huge', bottom: 'xxlarge', left: 'xxlarge', right: 'xxlarge' }}
      spacing="huge"
      flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      style={{ minHeight: '720px' }}
    >
      <Container>
        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
          {getString('gitsync.connectToGitProvider')}
        </Text>
        <Layout.Horizontal spacing="xlarge" padding={{ top: 'large' }}>
          <Card
            style={{ width: '50%' }}
            disabled={!isSaaS}
            className={cx({ [css.selected]: agent === Agent.Manager })}
            onClick={() => {
              if (isSaaS) {
                setAgent(Agent.Manager)
              }
            }}
          >
            <Layout.Horizontal flex>
              <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.PRIMARY_6}>
                {getString('gitsync.connectThroughManagerLabel')}
              </Text>
              <Radio
                onClick={() => setAgent(Agent.Manager)}
                checked={agent === Agent.Manager}
                disabled={loading || !isSaaS}
              />
            </Layout.Horizontal>
            <Text font="small" style={{ lineHeight: 'var(--spacing-large' }}>
              {getString('gitsync.connectThroughManager')}
            </Text>
            <Icon name="connectthroughmanager" size={250} flex={{ justifyContent: 'center' }} />
          </Card>
          <Card
            style={{ width: '50%' }}
            disabled={loading}
            className={cx({ [css.selected]: agent === Agent.Delegate })}
            onClick={() => setAgent(Agent.Delegate)}
          >
            <Layout.Horizontal flex>
              <Text font={{ size: 'normal', weight: 'bold' }} padding={{ bottom: 'medium' }} color={Color.PRIMARY_6}>
                {getString('gitsync.connectThroughDelegateLabel')}
              </Text>
              <Radio
                onClick={() => setAgent(Agent.Delegate)}
                checked={!isSaaS || agent === Agent.Delegate}
                disabled={loading}
              />
            </Layout.Horizontal>
            <Text font="small" padding={{ bottom: 'huge' }} style={{ lineHeight: 'var(--spacing-large' }}>
              {getString('gitsync.connectThroughDelegate')}
            </Text>
            <Icon name="connectthroughdelegate" size={400} height={150} flex={{ justifyContent: 'center' }} />
          </Card>
        </Layout.Horizontal>
        {/* <Layout.Horizontal padding={{ top: 'xxlarge' }} spacing="small">
          <Icon name="info" size={16} />
          <Link to={'/'}>{getString('gitsync.learnMore')}</Link>
        </Layout.Horizontal> */}
      </Container>
      <Layout.Horizontal className={css.btnWrapper}>
        <Button
          type="submit"
          intent="primary"
          text={getString('saveAndContinue')}
          rightIcon="chevron-right"
          disabled={loading || !agent}
          onClick={async () => {
            setLoading(true)
            try {
              const { status } = await registerAgent({
                accountIdentifier: accountId,
                projectIdentifier,
                organizationIdentifier: orgIdentifier,
                executeOnDelegate: agent === Agent.Delegate
              })
              if (status === 'SUCCESS') {
                showSuccess(getString('gitsync.successfullySavedConnectivityMode'))
                onSuccess()
              }
            } catch (e) {
              showError(e.data?.message || e.message)
            }
            setLoading(false)
          }}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default GitConnection
