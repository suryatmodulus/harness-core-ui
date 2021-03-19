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
import { useStrings } from 'framework/exports'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateConnectorModal, {
  UseCreateConnectorModalProps
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import i18n from './SelectOrCreateConnector.i18n'
import css from './SelectOrCreateConnector.module.scss'

export interface ConnectorSelectionProps {
  connectorType: ConnectorInfoDTO['type']
  value?: SelectOption
  disableConnector?: boolean
  createConnectorText: string
  connectToMonitoringSourceText?: string
  firstTimeSetupText?: string
  onSuccess?: UseCreateConnectorModalProps['onSuccess']
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

export function ConnectorSelection(props: ConnectorSelectionProps): JSX.Element {
  const {
    connectToMonitoringSourceText,
    firstTimeSetupText,
    connectorType,
    createConnectorText,
    onSuccess,
    value,
    disableConnector
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { openConnectorModal } = useCreateConnectorModal({ onSuccess })
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { data, loading, error, refetch: fetchConnector } = useGetConnector({
    identifier: (value?.value as string) || '',
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    },
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
          className={css.disabledConnector}
        />
      )
    }

    return (
      <>
        <FormMultiTypeConnectorField
          name={SelectOrCreateConnectorFieldNames.CONNECTOR_REF}
          label=""
          placeholder={i18n.selectConnector}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={300}
          isNewConnectorLabelVisible={false}
          type={connectorType}
          className={css.connectorReference}
          enableConfigureOptions={false}
        />
        <Link
          withoutHref
          onClick={() => openConnectorModal(false, connectorType || ('' as ConnectorInfoDTO['type']), undefined)}
          height="30px"
        >
          {createConnectorText}
        </Link>
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

  return (
    <Container className={css.main}>
      <Text font={{ size: 'medium' }} margin={{ top: 'large', bottom: 'large' }}>
        {i18n.heading}
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
          inputLabel: i18n.name,
          inputName: SelectOrCreateConnectorFieldNames.NAME,
          isIdentifierEditable: !props.identifierDisabled
        }}
      />
      <ConnectorSelection {...connectorSelectionProps} />
    </Container>
  )
}
