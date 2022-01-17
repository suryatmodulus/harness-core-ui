/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import SecretReference from '@secrets/components/SecretReference/SecretReference'
import { getReference } from '@common/utils/utils'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper, ConnectorInfoDTO } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './CreateOrSelectSecret.module.scss'

export interface SecretReference {
  name: string
  identifier: string
  orgIdentifier?: string
  projectIdentifier?: string
  referenceString: string
}

export interface CreateOrSelectSecretProps {
  type?: SecretResponseWrapper['secret']['type']
  onSuccess: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  onCancel?: () => void
  handleInlineSSHSecretCreation: () => void
}

const CreateOrSelectSecret: React.FC<CreateOrSelectSecretProps> = ({
  type,
  onSuccess,
  secretsListMockData,
  connectorTypeContext,
  onCancel,
  handleInlineSSHSecretCreation
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return (
    <section className={css.main}>
      <SecretReference
        type={type}
        onCancel={onCancel}
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
        connectorTypeContext={connectorTypeContext}
        handleInlineSSHSecretCreation={handleInlineSSHSecretCreation}
      />
    </section>
  )
}

export default CreateOrSelectSecret
