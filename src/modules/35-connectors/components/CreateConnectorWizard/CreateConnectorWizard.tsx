import React from 'react'
import { pick } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import type { ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import CreateGitConnector from '../CreateConnector/GitConnector/CreateGitConnector'
import CreateGithubConnector from '../CreateConnector/GithubConnector/CreateGithubConnector'
import CreateGitlabConnector from '../CreateConnector/GitlabConnector/CreateGitlabConnector'
import CreateBitbucketConnector from '../CreateConnector/BitbucketConnector/CreateBitbucketConnector'
import CreateK8sConnector from '../CreateConnector/K8sConnector/CreateK8sConnector'
import CreateHashiCorpVault from '../CreateConnector/HashiCorpVault/CreateHashiCorpVault'
import CreateAppDynamicsConnector from '../CreateConnector/AppDynamicsConnector/CreateAppDynamicsConnector'
import CreateSplunkConnector from '../CreateConnector/SplunkConnector/CreateSplunkConnector'
import CreateDockerConnector from '../CreateConnector/DockerConnector/CreateDockerConnector'
import CreateAWSConnector from '../CreateConnector/AWSConnector/CreateAWSConnector'
import CreateAWSCodeCommitConnector from '../CreateConnector/AWSCodeCommitConnector/CreateAWSCodeCommitConnector'
import CreateNexusConnector from '../CreateConnector/NexusConnector/CreateNexusConnector'
import CreateArtifactoryConnector from '../CreateConnector/ArtifactoryConnector/CreateArtifactoryConnector'
import CreateGcpConnector from '../CreateConnector/GcpConnector/CreateGcpConnector'
import HelmRepoConnector from '../CreateConnector/HelmRepoConnector/HemRepoConnector'
import JiraConnector from '../CreateConnector/JiraConnector/JiraConnector'
import CreateAwsKmsConnector from '../CreateConnector/AWSKmsConnector/CreateAwsKmsConnector'
import CreateNewRelicConnector from '../CreateConnector/NewRelicConnector/CreateNewRelicConnector'
import css from './CreateConnectorWizard.module.scss'

interface CreateConnectorWizardProps {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  type: ConnectorInfoDTO['type']
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
}

export const ConnectorWizard: React.FC<CreateConnectorWizardProps> = props => {
  const { type, accountId, orgIdentifier, projectIdentifier, onClose, ...rest } = props
  const commonProps = pick(props, [
    'onSuccess',
    'onClose',
    'isEditMode',
    'setIsEditMode',
    'connectorInfo',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return <CreateK8sConnector {...commonProps} />
    case Connectors.GIT:
      return <CreateGitConnector {...commonProps} />
    case Connectors.GITHUB:
      return <CreateGithubConnector {...commonProps} />
    case Connectors.GITLAB:
      return <CreateGitlabConnector {...commonProps} />
    case Connectors.BITBUCKET:
      return <CreateBitbucketConnector {...commonProps} />
    case Connectors.VAULT:
      return <CreateHashiCorpVault {...commonProps} />
    case Connectors.Jira:
      return <JiraConnector {...commonProps} />
    case Connectors.APP_DYNAMICS:
      return (
        <CreateAppDynamicsConnector
          {...rest}
          onClose={onClose}
          onConnectorCreated={props.onSuccess}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case Connectors.SPLUNK:
      return (
        <CreateSplunkConnector
          {...rest}
          onClose={onClose}
          onConnectorCreated={props.onSuccess}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      )
    case 'NewRelic':
      return <CreateNewRelicConnector {...commonProps} />
    case Connectors.DOCKER:
      return <CreateDockerConnector {...commonProps} />
    case Connectors.HttpHelmRepo:
      return <HelmRepoConnector {...commonProps} />
    case Connectors.AWS:
      return <CreateAWSConnector {...commonProps} />
    case Connectors.AWS_CODECOMMIT:
      return <CreateAWSCodeCommitConnector {...commonProps} />
    case Connectors.NEXUS:
      return <CreateNexusConnector {...commonProps} />
    case Connectors.ARTIFACTORY:
      return <CreateArtifactoryConnector {...commonProps} />
    case Connectors.GCP:
      return <CreateGcpConnector {...commonProps} />
    case Connectors.AWS_KMS:
      return <CreateAwsKmsConnector {...commonProps} />

    default:
      return null
  }
}

export const CreateConnectorWizard: React.FC<CreateConnectorWizardProps> = props => {
  return (
    <div className={css.createConnectorWizard}>
      <ConnectorWizard {...props} />
    </div>
  )
}
