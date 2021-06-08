import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, Color, Icon, TabNavigation } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { Module, ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { ResponseSecretResponseWrapper, SecretDTOV2, useGetSecretV2 } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { UseGetMockData } from '@common/utils/testUtils'
import css from './SecretDetailsHomePage.module.scss'

interface OptionalIdentifiers {
  module?: Module
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
}
interface SecretDetailsProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
}

const getProjectUrl = ({ accountId, projectIdentifier, orgIdentifier, module }: OptionalIdentifiers): string => {
  if (module && orgIdentifier && projectIdentifier) {
    return routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module })
  }
  return routes.toProjectDetails({ accountId, orgIdentifier, projectIdentifier })
}

const getSecretsUrl = ({ accountId, orgIdentifier, projectIdentifier, module }: OptionalIdentifiers): string => {
  return routes.toSecrets({ accountId, orgIdentifier, projectIdentifier, module })
}

const SecretDetaislHomePage: React.FC<SecretDetailsProps> = ({ children }, props) => {
  const { accountId, projectIdentifier, orgIdentifier, secretId, module } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  const { selectedProject } = useAppStore()
  const { loading, data, error, refetch } = useGetSecretV2({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier },
    mock: props.mockSecretDetails
  })
  const { getString } = useStrings()
  const secretType = data?.data?.secret.type
  const childrenWithProps = React.isValidElement(children)
    ? React.cloneElement(children, { secretData: data, refetch: refetch })
    : children

  const renderBreadCrumb: React.FC = () => {
    const breadCrumbArray = [
      {
        url: getSecretsUrl({ accountId, projectIdentifier, orgIdentifier, module }),
        label: getString('common.secrets')
      },
      {
        url: '#',
        label: ''
      }
    ]
    /* istanbul ignore else */ if (projectIdentifier) {
      breadCrumbArray.unshift({
        url: getProjectUrl({ accountId, projectIdentifier, orgIdentifier, module }),
        label: selectedProject ? selectedProject.name : ''
      })
    }
    return <Breadcrumbs links={breadCrumbArray} />
  }

  const renderIcon = (type: SecretDTOV2['type']) => {
    switch (type) {
      case 'SecretText':
        return <Icon name="text" size={24} />
      case 'SecretFile':
        return <Icon name="file" size={24} />
      case 'SSHKey':
        return <Icon name="secret-ssh" size={24} />
    }
  }

  return (
    <>
      <Page.Header
        size="large"
        className={css.header}
        title={
          <Layout.Vertical>
            {renderBreadCrumb(props)}

            <Layout.Horizontal spacing="small">
              {secretType ? renderIcon(secretType) : null}

              <Container>
                <Text color={Color.GREY_800} font="medium">
                  {data?.data?.secret.name || ''}
                </Text>
                <Text color={Color.GREY_400} font="small">
                  {data?.data?.secret.identifier || ''}
                </Text>
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <TabNavigation
            links={[
              {
                label: getString('overview'),
                to: routes.toSecretDetailsOverview({
                  accountId,
                  projectIdentifier,
                  orgIdentifier,
                  secretId,
                  module
                })
              },
              {
                label: getString('common.references'),
                to: routes.toSecretDetailsReferences({
                  accountId,
                  projectIdentifier,
                  orgIdentifier,
                  secretId,
                  module
                })
              }
            ]}
          />
        }
      />
      <Page.Body
        loading={loading}
        retryOnError={() => refetch()}
        error={(error?.data as Error)?.message || error?.message}
        noData={{
          when: () => !data?.data,
          icon: 'nav-project',
          message: getString('entityReference.noRecordFound')
        }}
      >
        {childrenWithProps}
      </Page.Body>
    </>
  )
}

export default SecretDetaislHomePage
