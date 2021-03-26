import React from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, Tab } from '@blueprintjs/core'
import { pick } from 'lodash-es'
import { Text } from '@wings-software/uicore'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import SecretReference from '@secrets/components/SecretReference/SecretReference'
import { getReference } from '@secrets/utils/SSHAuthUtils'
import CreateUpdateSecret from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper } from 'services/cd-ng'

import i18n from './CreateOrSelectSecret.i18n'
import css from './CreateOrSelectSecret.module.scss'

export interface SecretReference {
  name: string
  identifier: string
  orgIdentifier?: string
  projectIdentifier?: string
  referenceString: string
}

export interface CreateOrSelectSecretProps {
  type: SecretResponseWrapper['secret']['type']
  onSuccess: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
}

const CreateOrSelectSecret: React.FC<CreateOrSelectSecretProps> = ({ type, onSuccess, secretsListMockData }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  return (
    <section className={css.main}>
      <Tabs id={'CreateOrSelect'}>
        {type === 'SecretFile' || type === 'SecretText' ? (
          <Tab
            id={'create'}
            title={<Text padding={'medium'}>{i18n.titleCreate}</Text>}
            panel={
              <CreateUpdateSecret
                type={type}
                onSuccess={data => {
                  onSuccess({
                    ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier']),
                    referenceString: getReference(getScopeFromDTO(data), data.identifier) as string
                  })
                }}
              />
            }
          />
        ) : null}
        <Tab
          id={'reference'}
          title={<Text padding={'medium'}>{i18n.titleSelect}</Text>}
          panel={
            <SecretReference
              type={type}
              onSelect={data => {
                onSuccess({
                  ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier']),
                  referenceString: getReference(data.scope, data.identifier) as string
                })
              }}
              accountIdentifier={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              mock={secretsListMockData}
            />
          }
        />
      </Tabs>
    </section>
  )
}

export default CreateOrSelectSecret
