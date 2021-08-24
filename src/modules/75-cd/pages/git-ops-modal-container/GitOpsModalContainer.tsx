/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, HarnessDocTooltip, Layout, ExpandingSearchInput } from '@wings-software/uicore'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import ProvidersGridView from './ProvidersGridView'

import css from './GitOpsModalContainer.module.scss'

const GitOpsModalContainer: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()

  const { selectedProject } = useAppStore()
  const project = selectedProject

  const textIdentifier = 'gitOps'

  const gitOpsProviders = [
    {
      name: 'Darwin Argo Dev Env',
      id: 'DarwinArgoDevEnv',
      baseURL: 'https://34.136.244.5',
      status: 'Active',
      type: 'nativeArgo'
    },
    {
      name: 'EMT Argo QA Env',
      id: 'EMTArgoQAEnv',
      baseURL: 'https://34.136.244.6',
      status: 'Active',
      type: 'harnessManagedArgo'
    },
    {
      name: 'EMT Argo Stage Env',
      id: 'EMTArgoStageEnv',
      baseURL: 'https://34.136.244.7',
      status: 'Failure',
      type: 'nativeArgo'
    },
    {
      name: 'Darwin Argo Prod Env',
      id: 'DarwinArgoProdEnv',
      baseURL: 'https://34.136.244.8',
      status: 'Active',
      type: 'harnessManagedArgo'
    },
    {
      name: 'Merchant Processing Argo',
      id: 'MerchantProcessingArgo',
      baseURL: 'https://34.136.244.9',
      status: 'Active',
      type: 'nativeArgo'
    },
    {
      name: 'DNA Dev Argo',
      id: 'DNADevArgo',
      baseURL: 'https://34.136.244.10',
      status: 'Active',
      type: 'harnessManagedArgo'
    },
    {
      name: 'POS Prod Argo Env',
      id: 'POSProdArgoEnv',
      baseURL: 'https://34.136.244.11',
      status: 'Active',
      type: 'harnessManagedArgo'
    },
    {
      name: 'POS Dev Argo Env',
      id: 'POSDevArgoEnv',
      baseURL: 'https://34.136.244.12',
      status: 'Active',
      type: 'nativeArgo'
    }
  ]

  const addNewProvider = () => {}
  const searchProvider = () => {}

  return (
    <div className={css.main}>
      <div className={css.header}>
        <Breadcrumbs
          links={[
            {
              label: project?.name || '',
              url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module })
            },
            {
              label: 'GitOps',
              url: ''
            }
          ]}
        />
        <div className="ng-tooltip-native">
          <h2 data-tooltip-id={textIdentifier}>{getString('cd.gitOps')}</h2>
          <HarnessDocTooltip tooltipId={textIdentifier} useStandAlone={true} />
        </div>
      </div>

      <Layout.Horizontal flex className={css.addProviderHeader}>
        <Layout.Horizontal spacing="small">
          <RbacButton
            intent="primary"
            text={getString('cd.newProvider')}
            icon="plus"
            permission={{
              permission: PermissionIdentifier.ADD_NEW_PROVIDER,
              resource: {
                resourceType: ResourceType.PROJECT,
                resourceIdentifier: projectIdentifier
              }
            }}
            onClick={addNewProvider}
            id="newProviderBtn"
            data-test="newProviderButton"
            withoutBoxShadow
          />
        </Layout.Horizontal>

        <Layout.Horizontal margin={{ left: 'small' }}>
          <Container className={css.expandSearch} margin={{ right: 'small' }} data-name="providerSeachContainer">
            <ExpandingSearchInput
              placeholder={getString('search')}
              throttle={200}
              onChange={() => {
                // Need to pass the changed text to the function
                // Will update once the changes are ready
                searchProvider()
              }}
            />
          </Container>
        </Layout.Horizontal>
      </Layout.Horizontal>

      <ProvidersGridView providers={gitOpsProviders} />
    </div>
  )
}

export default GitOpsModalContainer
