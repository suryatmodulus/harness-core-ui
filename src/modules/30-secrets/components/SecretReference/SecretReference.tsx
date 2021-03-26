import React from 'react'
import { Icon, Select, SelectOption, Label } from '@wings-software/uicore'
import cx from 'classnames'
import {
  ListSecretsQueryParams,
  Failure,
  listSecretsV2Promise,
  SecretDTOV2,
  SecretTextSpecDTO,
  ResponsePageSecretResponseWrapper
} from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/exports'
import css from './SecretReference.module.scss'

export interface SecretRef extends SecretDTOV2 {
  scope: Scope
}

export interface SecretReferenceProps {
  onSelect: (secret: SecretRef) => void
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  defaultScope?: Scope
  type?: ListSecretsQueryParams['type']
  mock?: ResponsePageSecretResponseWrapper
}

const fetchRecords = (
  scope: Scope,
  search: string | undefined,
  done: (records: EntityReferenceResponse<SecretRef>[]) => void,
  type: ListSecretsQueryParams['type'],
  accountIdentifier: string,
  projectIdentifier?: string,
  orgIdentifier?: string,
  mock?: ResponsePageSecretResponseWrapper
): void => {
  listSecretsV2Promise({
    queryParams: {
      accountIdentifier,
      type,
      searchTerm: search?.trim(),
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
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
  const { defaultScope, accountIdentifier, projectIdentifier, orgIdentifier, type, mock } = props
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
    <div className={css.selectBox}>
      <Label className={css.text}>{getString('secret.labelSecretType')}</Label>
      <Select
        className={css.secretTypeSelect}
        items={secretTypeOptions}
        disabled={false}
        value={secretType}
        onChange={secretOption => setSecretType(secretOption)}
      />
    </div>
  )
  return (
    <EntityReference<SecretRef>
      onSelect={(secret, scope) => {
        secret.scope = scope
        props.onSelect(secret)
      }}
      defaultScope={defaultScope}
      recordClassName={css.listItem}
      fetchRecords={(scope, search = '', done) => {
        const selectedType = (secretType?.value as SecretDTOV2['type']) || type || 'SecretText'
        fetchRecords(scope, search, done, selectedType, accountIdentifier, projectIdentifier, orgIdentifier, mock)
      }}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      noRecordsText={getString('secret.noSecretsFound')}
      searchInlineComponent={!type ? selectTypeDropdown : undefined}
      recordRender={(item, selected) => (
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
