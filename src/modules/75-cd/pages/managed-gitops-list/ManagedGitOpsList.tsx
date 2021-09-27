import React from 'react'
import { useHistory, useParams } from 'react-router'
import { Card, Color, Container, Intent, Layout, Text } from '@wings-software/uicore'

import { Page } from '@common/exports'
import type { ConnectedArgoGitOpsInfoDTO, GitopsProviderResponse } from 'services/cd-ng'
import { getGitOpsLogo } from '@cd/utils/GitOpsUtils'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import cardCss from '../gitops-providers-list/ProviderCard/ProviderCard.module.scss'

const cards: GitopsProviderResponse[] = [
  {
    identifier: 'identifier1',
    name: 'Managed GitOps',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam facere ratione iusto consequatur ducimus, vitae numquam. Delectus expedita, ratione possimus quaerat repudiandae exercitationem saepe, vel optio non in illum perspiciatis.',
    spec: {
      type: 'ManagedArgoProvider',
      adapterUrl: 'http://35.232.230.43'
    } as any
  }
]

interface ProviderCardProps extends ProjectPathProps {
  provider: GitopsProviderResponse
}

function ProviderCard(props: ProviderCardProps): React.ReactElement {
  const history = useHistory()
  const { projectIdentifier, accountId, orgIdentifier, provider } = props
  const { getString } = useStrings()

  return (
    <Card
      className={cardCss.card}
      interactive
      onClick={() =>
        history.push(routes.toManagedGitOpsAppliation({ orgIdentifier, accountId, projectIdentifier, module: 'cd' }))
      }
    >
      <Container className={cardCss.projectInfo}>
        <div className={cardCss.mainTitle}>
          <img className={cardCss.argoLogo} src={getGitOpsLogo(provider.spec)} alt="" aria-hidden />
        </div>
        <Text
          lineClamp={1}
          font={{ weight: 'bold' }}
          margin={{ top: 'small' }}
          color={Color.GREY_800}
          data-testid={provider.identifier}
        >
          {provider.name}
        </Text>
        <Text lineClamp={1} font="small" color={Color.GREY_600} margin={{ top: 'xsmall' }}>
          {getString('idLabel', { id: provider.identifier })}
        </Text>
        {!!provider.description?.length && (
          <Text
            font="small"
            lineClamp={2}
            color={Color.GREY_600}
            className={cardCss.description}
            margin={{ top: 'xsmall' }}
          >
            {provider.description}
          </Text>
        )}
        <div className={cardCss.urls}>
          <div className={cardCss.serverUrl}>
            <Text font={{ size: 'small' }}>{getString('cd.argoAdapterURL')}:</Text>
            <Text intent={Intent.PRIMARY} font={{ size: 'small' }}>
              {(provider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
            </Text>
          </div>
        </div>
      </Container>
    </Card>
  )
}

export function ManagedGitOpsList(): React.ReactElement {
  const params = useParams<ProjectPathProps>()

  return (
    <React.Fragment>
      <Page.Header title="Managed GitOps" />
      <Page.SubHeader></Page.SubHeader>
      <Page.Body>
        <Layout.Masonry
          center
          gutter={25}
          items={cards}
          keyOf={item => item.identifier}
          renderItem={item => <ProviderCard provider={item} {...params} />}
        />
      </Page.Body>
    </React.Fragment>
  )
}
