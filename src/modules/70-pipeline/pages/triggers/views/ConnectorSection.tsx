import React from 'react'
import { FormInput, Text, Color, TextInput } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { Connectors, connectorUrlType } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorReferenceDTO
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { AWS_CODECOMMIT } from '../utils/TriggersWizardPageUtils'
import { GitSourceProviders } from '../utils/TriggersListUtils'
import css from './ConnectorSection.module.scss'
interface ConnectorSectionInterface {
  formikProps?: any
}

export const ConnectorSection: React.FC<ConnectorSectionInterface> = ({ formikProps }) => {
  const { getString } = useStrings()
  const {
    values: { sourceRepo, repoName, connectorRef },
    values
  } = formikProps
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  // undefined scope means added from + Add
  const [liveRepoName, setLiveRepoName] = React.useState(repoName || '')
  const setSelectedConnector = (value: ConnectorReferenceDTO, scope: Scope = Scope.PROJECT): void => {
    formikProps.setValues({
      ...values,
      connectorRef: {
        label: value.name || '',
        value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
        connector: value,
        live: value?.status?.status === 'SUCCESS'
      },
      repoName: ''
    })
    setLiveRepoName('')
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data?.connector) {
        setSelectedConnector(data.connector)
      }
    }
  })
  const connectorUrl = connectorRef?.connector?.spec?.url
  const constructRepoUrl = `${connectorUrl}${connectorUrl?.endsWith('/') ? '' : '/'}`
  const updatedSourceRepo = sourceRepo === GitSourceProviders.AWS_CODECOMMIT.value ? AWS_CODECOMMIT : sourceRepo
  const renderRepoUrl = (): JSX.Element | null => {
    const connectorURLType = connectorRef?.connector?.spec?.type
    if (connectorURLType === connectorUrlType.REPO) {
      return (
        <>
          <Text margin={{ bottom: 'xsmall' }}>{getString('repositoryUrlLabel')}</Text>
          <TextInput
            style={{ marginBottom: 'var(--spacing-medium)', borderColor: 'var(--bp3-intent-color, #dddddd)' }}
            value={connectorUrl}
            placeholder={getString('pipeline.repositoryUrlPlaceholder')}
            disabled
          />
        </>
      )
    } else if (connectorURLType === connectorUrlType.ACCOUNT || connectorURLType === connectorUrlType.REGION) {
      return (
        <>
          <FormInput.Text
            style={{ marginBottom: 'var(--spacing-xsmall)' }}
            label={getString('pipelineSteps.build.create.repositoryNameLabel')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            name="repoName"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLiveRepoName(e.target.value)}
          />
          <Text data-name="" style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_400}>
            {`${constructRepoUrl}${liveRepoName}`}
          </Text>
        </>
      )
    }
    return null
  }

  return (
    <section className={css.main}>
      <ConnectorReferenceField
        error={formikProps.errors.connectorRef}
        name="connectorRef"
        style={{ marginBottom: 'var(--spacing-xsmall)' }}
        width={324}
        type={Connectors[updatedSourceRepo?.toUpperCase()]}
        selected={formikProps.values.connectorRef}
        label={getString('connector')}
        placeholder={getString('connectors.selectConnector')}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onChange={(value, scope) => {
          setSelectedConnector(value, scope)
          formikProps.validateForm()
        }}
        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
      />
      <Text
        intent="primary"
        style={{ cursor: 'pointer', width: '70px', marginBottom: 'var(--spacing-medium)' }}
        onClick={() => {
          openConnectorModal(false, Connectors[sourceRepo?.toUpperCase()], {
            gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
          }) // isEditMode, type, and connectorInfo
        }}
      >
        {getString('plusAdd')}
      </Text>
      {renderRepoUrl()}
    </section>
  )
}

export default ConnectorSection
