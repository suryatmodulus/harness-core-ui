/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'
import { Color, Layout, Text, FlexExpander, Container, Heading } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import {
  DeleteFeatureFlagQueryParams,
  Feature,
  PatchFeatureQueryParams,
  useDeleteFeatureFlag,
  usePatchFeature,
  Variation
} from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { useQueryParams } from '@common/hooks'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlagTypeToStringMapping } from '@cf/utils/CFUtils'

import type { UseGitSync } from '@cf/hooks/useGitSync'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import { VariationTypeIcon } from '../VariationTypeIcon/VariationTypeIcon'
import { IdentifierText } from '../IdentifierText/IdentifierText'
import { EditVariationsModal } from '../EditVariationsModal/EditVariationsModal'
import { FlagPrerequisites } from './FlagPrerequisites'
import FlagDetailsOptionsMenuButton from '../FlagDetailsOptionsMenuButton/FlagDetailsOptionsMenuButton'
import css from './FlagActivationDetails.module.scss'

interface FlagActivationDetailsProps {
  featureFlag: Feature
  gitSync: UseGitSync
  gitSyncActionsComponent?: ReactElement
  refetchFlag: () => void
}

const VariationItem: React.FC<{ variation: Variation; index: number }> = ({ variation, index }) => {
  return (
    <Layout.Horizontal className={css.variationItem} spacing="xsmall" style={{ alignItems: 'center' }}>
      <VariationWithIcon variation={variation} index={index} />
    </Layout.Horizontal>
  )
}

const VariationsList: React.FC<{ featureFlag: Feature; onEditSuccess: () => void; gitSync: UseGitSync }> = ({
  featureFlag,
  onEditSuccess,
  gitSync
}) => {
  const { orgIdentifier, accountId, projectIdentifier } = useParams<Record<string, string>>()
  const isFlagTypeBoolean = featureFlag.kind === FlagTypeVariations.booleanFlag
  const { variations } = featureFlag
  const { getString } = useStrings()
  const typeToStringMapping = useFeatureFlagTypeToStringMapping()

  return (
    <Layout.Vertical padding="large" margin={{ top: 'large' }} className={css.module}>
      <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ bottom: 'medium' }}>
        <Text style={{ color: '#1C1C28', fontWeight: 600, fontSize: '14px', lineHeight: '22px' }}>
          <StringWithTooltip stringId="cf.shared.variations" tooltipId="ff_ffVariations_heading" />
        </Text>
        <FlexExpander />
        <EditVariationsModal
          gitSync={gitSync}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          feature={featureFlag}
          permission={{
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          }}
          onSuccess={onEditSuccess}
          minimal
          intent="primary"
          icon="edit"
          disabled={featureFlag.archived}
        />
      </Layout.Horizontal>

      <Layout.Vertical className={css.variationsList}>
        <Text
          border={{ bottom: true, color: Color.GREY_300 }}
          padding={{ bottom: 'small' }}
          flex
          style={{ fontSize: '14px', lineHeight: '20px' }}
        >
          <VariationTypeIcon style={{ transform: 'translateY(1px)' }} multivariate={!isFlagTypeBoolean} />
          {isFlagTypeBoolean ? getString('cf.boolean') : getString('cf.multivariate')}
          {!isFlagTypeBoolean && (
            <Text color={Color.GREY_400} padding={{ left: 'xsmall' }}>
              ({typeToStringMapping[featureFlag.kind] || ''})
            </Text>
          )}
          <FlexExpander />
          <Text color={Color.GREY_400}>
            {getString('cf.featureFlagDetail.variationCount', { count: variations.length })}
          </Text>
        </Text>

        {featureFlag.variations.map((variation, index) => (
          <VariationItem key={variation.identifier} variation={variation} index={index} />
        ))}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

const FlagActivationDetails: React.FC<FlagActivationDetailsProps> = props => {
  const urlQuery: Record<string, string> = useQueryParams()
  const { featureFlag, refetchFlag, gitSyncActionsComponent, gitSync } = props
  const { getString } = useStrings()
  const { orgIdentifier, accountId, projectIdentifier } = useParams<Record<string, string>>()
  const featureFlagListURL =
    routes.toCFFeatureFlags({
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountId
    }) + `${urlQuery?.activeEnvironment ? `?activeEnvironment=${urlQuery.activeEnvironment}` : ''}`
  const { mutate: submitPatch } = usePatchFeature({
    identifier: featureFlag.identifier as string,
    queryParams: {
      project: featureFlag.project as string,
      environment: featureFlag.envProperties?.environment as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as PatchFeatureQueryParams
  })

  const { mutate: deleteFeatureFlag } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as DeleteFeatureFlagQueryParams
  })

  const queryParams = {
    account: accountId,
    accountIdentifier: accountId,
    org: orgIdentifier,
    project: projectIdentifier,
    environment: featureFlag.envProperties?.environment as string
  } as PatchFeatureQueryParams

  const renderTime = (time: number, langString: StringKeys, style?: React.CSSProperties): React.ReactNode => (
    <Text
      style={{
        fontWeight: 500,
        lineHeight: '14px',
        fontSize: '10px',
        color: '#555770',
        letterSpacing: '0.2px',
        ...style
      }}
    >
      {getString(langString, {
        date: moment(time).format('MMMM D, YYYY hh:mm A')
      })}
    </Text>
  )

  return (
    <>
      <Layout.Horizontal className={css.breadcrumb}>
        <Link style={{ color: '#0092E4', fontSize: '12px' }} to={featureFlagListURL}>
          {getString('flag')}
        </Link>

        <span style={{ display: 'inline-block', paddingLeft: 'var(--spacing-xsmall)' }}>/</span>
        <FlexExpander />
        <FlagDetailsOptionsMenuButton
          featureFlag={featureFlag}
          gitSync={gitSync}
          queryParams={queryParams}
          submitPatch={submitPatch}
          deleteFeatureFlag={deleteFeatureFlag}
          refetchFlag={refetchFlag}
        />
      </Layout.Horizontal>

      {gitSyncActionsComponent && (
        <Container flex={{ justifyContent: 'space-between', alignItems: 'center' }} width={230}>
          {gitSyncActionsComponent}
        </Container>
      )}

      <Container>
        <Heading
          style={{
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '22px',
            color: '#1C1C28',
            marginBottom: 'var(--spacing-small)'
          }}
        >
          {featureFlag.name}
          {featureFlag.archived && (
            <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }} font={{ size: 'small' }}>
              ({getString('cf.shared.archived')})
            </Text>
          )}
        </Heading>
        {featureFlag.description && (
          <Text margin={{ bottom: 'small' }} style={{ fontSize: '13px', lineHeight: '20px', color: '#22222A' }}>
            {featureFlag.description}
          </Text>
        )}

        <IdentifierText identifier={featureFlag.identifier} allowCopy />

        {/* Disable tags for now (backend does not support them) */}
        {false && !!featureFlag.tags?.length && (
          <Container className={css.tagsFlagActivationDetails}>
            <TagsViewer
              tags={featureFlag.tags?.map(({ value }) => value as string)}
              style={{ backgroundColor: '#D9DAE6', fontSize: '12px', lineHeight: '16px', color: '#22222A' }}
            />
          </Container>
        )}

        <Layout.Vertical margin={{ top: 'medium', bottom: 'xlarge' }}>
          {renderTime(featureFlag.createdAt, 'cf.featureFlags.createdDate')}
          {renderTime(featureFlag.modifiedAt, 'cf.featureFlags.modifiedDate', { paddingTop: 'var(--spacing-xsmall)' })}
        </Layout.Vertical>

        <VariationsList
          featureFlag={featureFlag}
          gitSync={gitSync}
          onEditSuccess={() => {
            refetchFlag()
          }}
        />

        <FlagPrerequisites featureFlag={featureFlag} refetchFlag={refetchFlag} gitSync={gitSync} />
      </Container>
    </>
  )
}

export default FlagActivationDetails
