/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, Intent, Icon, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import { useToaster } from '@common/exports'
import AddKeyDialog from '@cf/components/AddKeyDialog/AddKeyDialog'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import type { ApiKey } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { PlatformEntry, PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'

export interface SelectEnvironmentViewProps {
  language: PlatformEntry
  apiKey: ApiKey | undefined
  setApiKey: (key: ApiKey | undefined) => void
  setEnvironmentIdentifier: (environmentIdentifier: string | undefined) => void
}

export const SelectEnvironmentView: React.FC<SelectEnvironmentViewProps> = props => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [environmentCreated, setEnvironmentCreated] = useState(false)
  const [environment, setEnvironment] = useState<EnvironmentResponseDTO>()
  const [apiKey, setApiKey] = useState<SelectEnvironmentViewProps['apiKey']>()
  const { EnvironmentSelect, loading, error, refetch, environments } = useEnvironmentSelectV2({
    onChange: (_value, _environment, userEvent) => {
      setEnvironment(_environment)
      props.setEnvironmentIdentifier(_environment.identifier)
      if (userEvent) {
        props.setApiKey(undefined)
      }
    }
  })

  useEffect(() => {
    setApiKey(props.apiKey)
  }, [props.apiKey])

  if (error) {
    showError(getErrorMessage(error), 0, 'cf.get.env.list.error')
  }

  const serverSide = props.language.type === PlatformEntryType.SERVER

  return (
    <Container>
      <Layout.Horizontal spacing="small">
        {loading && <Icon name="spinner" size={16} color="blue500" />}
        {!loading && (
          <>
            {!!environments?.length && (
              <Container width={250}>
                <EnvironmentSelect />
              </Container>
            )}
            <EnvironmentDialog
              onCreate={() => {
                setEnvironmentCreated(true)
                refetch()
                props.setApiKey(undefined)
              }}
              buttonProps={{
                intent: Intent.NONE,
                text: getString('cf.onboarding.createEnv'),
                style: { color: 'var(--blue-500)', ...(environments?.length ? { border: 'none' } : {}) }
              }}
            />
          </>
        )}
      </Layout.Horizontal>
      {environmentCreated && (
        <Text
          margin={{ top: 'medium' }}
          icon="tick-circle"
          color={Color.GREEN_700}
          iconProps={{ color: Color.GREEN_700, size: 16 }}
        >
          {getString('cf.onboarding.envCreated')}
        </Text>
      )}

      {!!environments?.length && environment && (
        <Container>
          <Text margin={{ top: 'large', bottom: 'medium' }} style={{ color: '#6B6D85', lineHeight: '20px' }}>
            {getString(
              apiKey
                ? serverSide
                  ? 'cf.onboarding.keyDescriptionServer'
                  : 'cf.onboarding.keyDescriptionClient'
                : 'cf.onboarding.sdkKeyLabel'
            )}
          </Text>

          <Layout.Horizontal spacing="small" style={{ alignItems: 'baseline' }}>
            {apiKey && (
              <>
                <Text style={{ fontWeight: 600 }}>
                  {getString(serverSide ? 'cf.onboarding.secret' : 'cf.onboarding.clientKey')}
                </Text>
                <IdentifierText
                  allowCopy
                  identifier={apiKey.apiKey}
                  style={{
                    padding: 'var(--spacing-small) var(--spacing-medium)',
                    background: '#F3F3FA',
                    border: 'none'
                  }}
                />
              </>
            )}
            <AddKeyDialog
              keyType={
                props.language.type === PlatformEntryType.CLIENT
                  ? EnvironmentSDKKeyType.CLIENT
                  : EnvironmentSDKKeyType.SERVER
              }
              environment={environment as EnvironmentResponseDTO}
              onCreate={(newKey: ApiKey, hideCreate) => {
                setApiKey(newKey)
                props.setApiKey(newKey)
                hideCreate()
              }}
              buttonProps={{
                intent: Intent.NONE,
                minimal: false,
                style: { color: 'var(--blue-500)' },
                text: getString('cf.onboarding.sdkButtonLabel')
              }}
            />
          </Layout.Horizontal>
        </Container>
      )}
    </Container>
  )
}
