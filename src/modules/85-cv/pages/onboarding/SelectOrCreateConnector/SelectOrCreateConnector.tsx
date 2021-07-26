import React, { useEffect } from 'react'
import {
  Container,
  Link,
  Text,
  Layout,
  Color,
  IconName,
  TextInput,
  SelectOption,
  FormInput
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { ConnectorInfoDTO, GetConnectorQueryParams, useGetConnector } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import useCreateConnectorModal, {
  UseCreateConnectorModalProps
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import css from './SelectOrCreateConnector.module.scss'

export interface ConnectorSelectionProps {
  connectorType: ConnectorInfoDTO['type']
  value?: SelectOption
  disableConnector?: boolean
  createConnectorText: string
  connectToMonitoringSourceText?: string
  firstTimeSetupText?: string
  onSuccess?: UseCreateConnectorModalProps['onSuccess']
  isNewConnectorLabelVisible?: boolean
  width?: number
}

export interface SelectOrCreateConnectorProps extends ConnectorSelectionProps {
  iconName: IconName
  iconLabel: string
  iconSize?: number
  identifierDisabled?: boolean
}

export const SelectOrCreateConnectorFieldNames = {
  NAME: 'name',
  CONNECTOR_REF: 'connectorRef'
}

export function getQueryParamsBasedOnScope(value: string, params: ProjectPathProps): GetConnectorQueryParams {
  switch (getScopeFromValue(value)) {
    case Scope.ACCOUNT:
      return { accountIdentifier: params.accountId }
    case Scope.ORG:
      return { accountIdentifier: params.accountId, orgIdentifier: params.orgIdentifier }
    case Scope.PROJECT:
    default:
      return {
        accountIdentifier: params.accountId,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier
      }
  }
}

export function ConnectorSelection(props: ConnectorSelectionProps): JSX.Element {
  const {
    connectToMonitoringSourceText,
    firstTimeSetupText,
    connectorType,
    createConnectorText,
    onSuccess,
    value,
    disableConnector,
    isNewConnectorLabelVisible,
    width
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { openConnectorModal } = useCreateConnectorModal({ onSuccess })
  const { getString } = useStrings()
  const { showError } = useToaster()
  const {
    data,
    loading,
    error,
    refetch: fetchConnector
  } = useGetConnector({
    identifier: getIdentifierFromValue(value?.value as string) || '',
    queryParams: getQueryParamsBasedOnScope((value?.value as string) || '', {
      projectIdentifier,
      orgIdentifier,
      accountId
    }),
    lazy: true
  })

  if (error?.message) showError(error.message, 5000)
  useEffect(() => {
    if (data?.data?.connector?.name) {
      onSuccess?.({ connector: data.data.connector })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  useEffect(() => {
    if (value) fetchConnector()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderContent = () => {
    if (loading) {
      return <TextInput value={getString('loading')} className={css.loadingText} />
    }

    if (disableConnector) {
      return (
        <FormInput.Text
          name={`${SelectOrCreateConnectorFieldNames.CONNECTOR_REF}.label`}
          label=""
          disabled
          placeholder={getString('connectors.selectConnector')}
          className={css.disabledConnector}
        />
      )
    }

    return (
      <>
        <FormMultiTypeConnectorField
          name={SelectOrCreateConnectorFieldNames.CONNECTOR_REF}
          label={''}
          placeholder={getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={width || 300}
          isNewConnectorLabelVisible={!!isNewConnectorLabelVisible}
          type={connectorType}
          className={css.connectorReference}
          enableConfigureOptions={false}
          onSuccess={onSuccess}
        />
        {!isNewConnectorLabelVisible && (
          <Link
            withoutHref
            onClick={() => openConnectorModal(false, connectorType || ('' as ConnectorInfoDTO['type']), undefined)}
            height="30px"
          >
            {createConnectorText}
          </Link>
        )}
      </>
    )
  }

  return (
    <Layout.Vertical spacing="xsmall">
      {connectToMonitoringSourceText && <Text>{connectToMonitoringSourceText}</Text>}
      {firstTimeSetupText && (
        <Text color={Color.GREY_350} font={{ size: 'small' }}>
          {firstTimeSetupText}
        </Text>
      )}
      <Layout.Horizontal spacing="medium">{renderContent()}</Layout.Horizontal>
    </Layout.Vertical>
  )
}

export function SelectOrCreateConnector(props: SelectOrCreateConnectorProps): JSX.Element {
  const { iconName, iconLabel, iconSize, ...connectorSelectionProps } = props
  const { getString } = useStrings()

  return (
    <Container className={css.main}>
      <Text font={{ size: 'medium' }} margin={{ top: 'large', bottom: 'large' }}>
        {getString('monitoringSource')}
      </Text>
      <CVSelectionCard
        isSelected={true}
        className={css.monitoringCard}
        iconProps={{
          name: iconName,
          size: iconSize ?? 40
        }}
        cardLabel={iconLabel}
        renderLabelOutsideCard={true}
      />
      <AddDescriptionAndKVTagsWithIdentifier
        identifierProps={{
          inputLabel: getString('cv.monitoringSources.nameYourMonitoringSource'),
          inputName: SelectOrCreateConnectorFieldNames.NAME,
          isIdentifierEditable: !props.identifierDisabled
        }}
      />
      <ConnectorSelection {...connectorSelectionProps} />
    </Container>
  )
}
