import React from 'react'
import { Icon, SelectOption, Text, Button, Container } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import cx from 'classnames'
import {
  ListSecretsV2QueryParams,
  Failure,
  listSecretsV2Promise,
  SecretDTOV2,
  SecretTextSpecDTO,
  ResponsePageSecretResponseWrapper,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import css from './SecretReference.module.scss'

const CustomSelect = Select.ofType<SelectOption>()
export interface SecretRef extends SecretDTOV2 {
  scope: Scope
}

export interface SecretReferenceProps {
  onSelect: (secret: SecretRef) => void
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  defaultScope?: Scope
  type?: ListSecretsV2QueryParams['type']
  mock?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
}

const fetchRecords = (
  scope: Scope,
  search: string | undefined,
  done: (records: EntityReferenceResponse<SecretRef>[]) => void,
  type: ListSecretsV2QueryParams['type'],
  accountIdentifier: string,
  projectIdentifier?: string,
  orgIdentifier?: string,
  mock?: ResponsePageSecretResponseWrapper,
  connectorTypeContext?: ConnectorInfoDTO['type']
): void => {
  const secretManagerTypes: ConnectorInfoDTO['type'][] = ['AwsKms', 'AzureKeyVault', 'Vault']
  let sourceCategory: ListSecretsV2QueryParams['source_category'] | undefined
  if (connectorTypeContext && secretManagerTypes.includes(connectorTypeContext)) {
    sourceCategory = 'SECRET_MANAGER'
  }

  listSecretsV2Promise({
    queryParams: {
      accountIdentifier,
      type,
      searchTerm: search?.trim(),
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      source_category: sourceCategory
    },
    mock
  })
    .then(responseData => {
      if (responseData?.data?.content) {
        const secrets = responseData.data.content
        const response: EntityReferenceResponse<SecretRef>[] = []
        secrets.forEach(secret => {
          response.push({
            name: secret.secret.name || '',
            identifier: secret.secret.identifier || '',
            record: { ...secret.secret, scope }
          })
        })
        done(response)
      } else {
        done([])
      }
    })
    .catch((err: Failure) => {
      throw err.message
    })
}

const SecretReference: React.FC<SecretReferenceProps> = props => {
  const { defaultScope, accountIdentifier, projectIdentifier, orgIdentifier, type, mock, connectorTypeContext } = props
  const { getString } = useStrings()

  const secretTypeOptions: SelectOption[] = [
    {
      label: getString('secret.labelText'),
      value: 'SecretText'
    },
    {
      label: getString('secret.labelFile'),
      value: 'SecretFile'
    }
  ]
  const [secretType, setSecretType] = React.useState<SelectOption>(secretTypeOptions[0])

  const selectTypeDropdown = (
    <Container flex={{ alignItems: 'baseline' }}>
      <Text margin={{ left: 'medium', right: 'xsmall' }}>{getString('secret.labelSecretType')}</Text>
      <CustomSelect
        items={secretTypeOptions}
        filterable={false}
        itemRenderer={(item, { handleClick }) => (
          <MenuItem className={css.popoverWidth} key={item.value as string} text={item.label} onClick={handleClick} />
        )}
        onItemSelect={item => {
          setSecretType(item)
        }}
        popoverProps={{ minimal: true, popoverClassName: css.popoverWidth }}
      >
        <Button
          className={css.selectButton}
          width={60}
          inline
          minimal
          rightIcon="chevron-down"
          text={secretType.label}
        />
      </CustomSelect>
    </Container>
  )
  return (
    <EntityReference<SecretRef>
      onSelect={(secret, scope) => {
        secret.scope = scope
        props.onSelect(secret)
      }}
      defaultScope={defaultScope}
      recordClassName={css.listItem}
      fetchRecords={(scope, search, done) => {
        const selectedType = type || (secretType?.value as SecretDTOV2['type'])
        fetchRecords(
          scope,
          search,
          done,
          selectedType,
          accountIdentifier,
          projectIdentifier,
          orgIdentifier,
          mock,
          connectorTypeContext
        )
      }}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      noRecordsText={getString('secret.noSecretsFound')}
      searchInlineComponent={!type ? selectTypeDropdown : undefined}
      recordRender={({ item, selected }) => (
        <>
          <div className={css.item}>
            {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
              <Icon name={item.record.type === 'SecretText' ? 'text' : 'file'} size={24} className={css.secretIcon} />
            ) : null}
            <div>
              <div>{item.record.name}</div>
              {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
                <div className={css.meta}>
                  {item.identifier} . {(item.record.spec as SecretTextSpecDTO).secretManagerIdentifier}
                </div>
              ) : null}
              {item.record.type === 'SSHKey' ? <div className={css.meta}>{item.identifier}</div> : null}
            </div>
          </div>
          <Icon className={cx(css.iconCheck, { [css.iconChecked]: selected })} name="pipeline-approval" />
        </>
      )}
    />
  )
}

export default SecretReference
