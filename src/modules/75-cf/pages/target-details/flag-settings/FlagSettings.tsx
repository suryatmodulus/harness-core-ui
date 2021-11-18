import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Layout,
  Pagination,
  Select,
  SelectOption,
  Text,
  PageError
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Feature, GitDetails, GitSyncErrorResponse, Target, useGetAllFeatures, Variation } from 'services/cf'
import { ItemContainer } from '@cf/components/ItemContainer/ItemContainer'
import routes from '@common/RouteDefinitions'
import { CF_DEFAULT_PAGE_SIZE, FlagsSortByField, getErrorMessage, SortOrder } from '@cf/utils/CFUtils'
import { NoDataFoundRow } from '@cf/components/NoDataFoundRow/NoDataFoundRow'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { CFVariationColors } from '@cf/constants'
import { FlagPatchParams, useServeFeatureFlagVariationToTargets } from '@cf/utils/FlagUtils'
import { useToaster } from '@common/exports'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'

import SaveFlagToGitModal from '@cf/components/SaveFlagToGitModal/SaveFlagToGitModal'

import { GitSyncFormValues, GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { DetailHeading } from '../DetailHeading'
import css from './FlagSettings.module.scss'

const CellWidth = {
  USER: 0, // 80, set to 0 as backend is not ready
  LAST_EVALUATED: 0, // 170, set to 0 as backend is not ready
  VARIATION: 180
}

export const FlagSettings: React.FC<{ target?: Target | undefined | null; gitSync: UseGitSync }> = ({
  target,
  gitSync
}) => {
  const { getString } = useStrings()
  const [sortByField] = useState(FlagsSortByField.NAME)
  const [sortOrder, setSortOrder] = useState(SortOrder.ASCENDING)
  const { accountId, orgIdentifier, projectIdentifier, targetIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment } = useActiveEnvironment()
  const patchParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: activeEnvironment
  }

  const [pageNumber, setPageNumber] = useState(0)
  const [queryString, setQueryString] = useState('')
  const queryParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier as string,
      environment: activeEnvironment,
      targetIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber,
      sortByField,
      sortOrder,
      name: queryString
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      activeEnvironment,
      targetIdentifier,
      pageNumber,
      sortByField,
      sortOrder,
      queryString
    ]
  )
  const { data, loading: loadingFeatures, error, refetch } = useGetAllFeatures({ queryParams })
  const [loadingFeaturesInBackground, setLoadingFeaturesInBackground] = useState(false)

  const [isGitSyncModalOpen, setIsGitSyncModalOpen] = useState(false)

  const [selectedVariation, setSelectedVariation] = useState<Variation>()
  const [selectedFeature, setSelectedFeature] = useState<Feature>()

  const { showError } = useToaster()

  const { gitSyncInitialValues } = gitSync.getGitSyncFormMeta(AUTO_COMMIT_MESSAGES.UPDATED_FLAG_VARIATIONS)

  const _useServeFlagVariationToTargets = useServeFeatureFlagVariationToTargets(patchParams)

  const saveVariationChange = async (gitSyncFormValues?: GitSyncFormValues): Promise<boolean> => {
    try {
      if (!selectedVariation || !target || !selectedFeature) {
        return false
      }

      setLoadingFeaturesInBackground(true)

      let gitDetails: GitDetails | undefined

      if (gitSync?.isAutoCommitEnabled) {
        gitDetails = gitSyncInitialValues.gitDetails
      } else {
        gitDetails = gitSyncFormValues?.gitDetails
      }

      await _useServeFlagVariationToTargets(
        selectedFeature,
        selectedVariation.identifier,
        [target.identifier],
        gitDetails
      )

      if (!gitSync?.isAutoCommitEnabled && gitSyncFormValues?.autoCommit) {
        await gitSync.handleAutoCommit(gitSyncFormValues.autoCommit)
      }

      await refetch().then(() => {
        setIsGitSyncModalOpen(false)
        setLoadingFeaturesInBackground(false)
      })
      return true
    } catch (e: any) {
      if (e.status === GIT_SYNC_ERROR_CODE) {
        gitSync.handleError(e.data as GitSyncErrorResponse)
      } else {
        showError(getErrorMessage(e), 0, 'cf.serve.flag.variant.error')
      }

      return false
    }
  }

  const FlagSettingsHeader: React.FC = () => {
    const textStyle = {
      color: '#4F5162',
      fontSize: '10px',
      cursor: 'pointer',
      fontWeight: 'bold'
    } as React.CSSProperties

    return (
      <Container
        padding={{ left: 'xsmall', right: 'xsmall' }}
        style={{ position: 'sticky', top: '82px', background: '#fcfdfd', zIndex: 2 }}
      >
        <Layout.Horizontal padding={{ top: 'xsmall', right: 'xxxlarge', bottom: 'xsmall', left: 'xxxlarge' }}>
          <Text
            width={`calc(100% - ${CellWidth.USER + CellWidth.LAST_EVALUATED + CellWidth.VARIATION}px)`}
            tabIndex={0}
            role="button"
            rightIcon={
              sortByField === FlagsSortByField.NAME
                ? sortOrder === SortOrder.ASCENDING
                  ? 'caret-up'
                  : 'caret-down'
                : undefined
            }
            style={textStyle}
            onClick={() => {
              setSortOrder(previous => (previous === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING))
            }}
          >
            {getString('flag').toUpperCase()}
          </Text>
          <Text width={CellWidth.USER} style={{ display: 'none' }} />
          <Text width={CellWidth.LAST_EVALUATED} style={{ ...textStyle, display: 'none' }}>
            {getString('cf.shared.lastEvaluated').toUpperCase()}
          </Text>
          <Text width={CellWidth.VARIATION} style={textStyle}>
            {getString('cf.shared.variation').toUpperCase()}
          </Text>
        </Layout.Horizontal>
      </Container>
    )
  }
  const noData = data?.features?.length === 0
  const hasData = (data?.features?.length || 0) >= 1
  const loading = loadingFeatures && !loadingFeaturesInBackground

  return (
    <Container
      height="100%"
      flex
      style={{ overflow: 'auto', flexGrow: 1, background: '#fcfdfd', flexDirection: 'column' }}
    >
      <Layout.Horizontal
        style={{
          width: '100%',
          paddingRight: 'var(--spacing-xxlarge)',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: '#fcfdfd'
        }}
      >
        <DetailHeading style={{ alignSelf: 'baseline' }}>
          <StringWithTooltip stringId="cf.targetDetail.flagSetting" tooltipId="ff_targetFlagSettings_heading" />
        </DetailHeading>
        <FlexExpander />
        <Container height={35} style={{ alignSelf: 'baseline' }}>
          <ExpandingSearchInput
            placeholder={getString('cf.targetDetail.searchPlaceholder')}
            onChange={setQueryString}
          />
        </Container>
      </Layout.Horizontal>
      <Container style={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {!error && noData && (
          <NoDataFoundRow
            message={getString('cf.targetDetail.noFlagConfigured')}
            margin={{ left: 'xxlarge', right: 'xxlarge' }}
          />
        )}

        {!loading && !error && hasData && (
          <>
            <FlagSettingsHeader />
            <Layout.Vertical
              spacing="small"
              padding={{ top: 'xsmall', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}
              style={{ flexGrow: 1 }}
            >
              {data?.features?.map((feature, index) => (
                <FlagSettingsRow
                  index={index}
                  target={target as Target}
                  feature={feature}
                  patchParams={patchParams}
                  key={feature.identifier}
                  isGitSyncEnabled={gitSync.isGitSyncEnabled}
                  isAutoCommitEnabled={gitSync.isAutoCommitEnabled}
                  openGitSyncModal={() => setIsGitSyncModalOpen(true)}
                  setLoadingFeaturesInBackground={setLoadingFeaturesInBackground}
                  saveVariationChange={saveVariationChange}
                  setSelectedVariation={setSelectedVariation}
                  setSelectedFeature={setSelectedFeature}
                  refetch={async () => {
                    await refetch()
                  }}
                />
              ))}
            </Layout.Vertical>

            {(data?.itemCount || 0) > CF_DEFAULT_PAGE_SIZE && (
              <Container className={css.pagination}>
                <Pagination
                  itemCount={data?.itemCount || 0}
                  pageSize={data?.pageSize || 0}
                  pageCount={data?.pageCount || 0}
                  pageIndex={pageNumber}
                  gotoPage={setPageNumber}
                />
              </Container>
            )}
          </>
        )}
        {isGitSyncModalOpen && (
          <SaveFlagToGitModal
            flagName={selectedFeature?.name || ''}
            flagIdentifier={selectedFeature?.identifier || ''}
            onSubmit={saveVariationChange}
            onClose={() => {
              setIsGitSyncModalOpen(false)
            }}
          />
        )}

        {loading && <ContainerSpinner />}
        {!loading && error && <PageError message={getErrorMessage(error)} onClick={() => refetch()} />}
      </Container>
    </Container>
  )
}

const FlagSettingsRow: React.FC<{
  index: number
  target: Target
  feature: Feature
  patchParams: FlagPatchParams
  setLoadingFeaturesInBackground: React.Dispatch<React.SetStateAction<boolean>>
  refetch: () => Promise<void>
  isGitSyncEnabled: boolean
  isAutoCommitEnabled: boolean
  openGitSyncModal: () => void
  setSelectedVariation: (variation: Variation) => void
  setSelectedFeature: (feature: Feature) => void
  saveVariationChange: (gitSyncFormvalues?: GitSyncFormValues) => Promise<boolean>
}> = ({
  feature,
  index,
  patchParams,
  isGitSyncEnabled,
  isAutoCommitEnabled,
  openGitSyncModal,
  setSelectedVariation,
  setSelectedFeature,
  saveVariationChange
}) => {
  const { showError } = useToaster()
  const { withActiveEnvironment } = useActiveEnvironment()

  return (
    <ItemContainer>
      <Layout.Horizontal>
        <Container
          width={`calc(100% - ${CellWidth.USER + CellWidth.LAST_EVALUATED + CellWidth.VARIATION}px)`}
          style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}
        >
          <Text
            lineClamp={1}
            style={{ color: '#22222A', fontWeight: 600, fontSize: '13px', lineHeight: '24px' }}
            padding={{ right: 'xlarge' }}
          >
            <Link
              className={css.link}
              to={withActiveEnvironment(
                routes.toCFFeatureFlagsDetail({
                  accountId: patchParams.accountIdentifier,
                  orgIdentifier: patchParams.orgIdentifier,
                  projectIdentifier: patchParams.projectIdentifier,
                  featureFlagIdentifier: feature.identifier
                })
              )}
            >
              {feature.name}
            </Link>
          </Text>
          {!!feature.description && (
            <Text lineClamp={1} style={{ color: '#4F5162', fontSize: '12px' }} padding={{ right: 'xlarge' }}>
              {feature.description}
            </Text>
          )}
        </Container>

        <Container
          width={CellWidth.USER}
          flex={{ align: 'center-center' }}
          style={{ color: '#627386', fontSize: '12px', display: 'none' }}
        >
          <Text icon="user" tooltip={feature.owner?.join(', ')}>
            {(feature.owner?.length || 0) > 1 ? feature.owner?.length : ''}
          </Text>
        </Container>

        <Container
          width={CellWidth.LAST_EVALUATED}
          style={{ flexDirection: 'column', alignSelf: 'center', display: 'none' }}
        >
          <Text>{/* Dec 1, 2012 */}</Text>
          <Text>{/* Via conditional rules */}</Text>
        </Container>

        <Container width={CellWidth.VARIATION} style={{ alignSelf: 'center' }}>
          <VariationSelect
            rowIndex={index}
            variations={feature.variations}
            selectedIdentifier={feature.evaluationIdentifier as string}
            onChange={async variation => {
              try {
                setSelectedVariation(variation)
                setSelectedFeature(feature)

                if (isGitSyncEnabled && !isAutoCommitEnabled) {
                  openGitSyncModal()
                } else {
                  return saveVariationChange()
                }
              } catch (error) {
                showError(getErrorMessage(error), 0, 'cf.serve.flag.variant.error')
              }
              return false
            }}
          />
        </Container>
      </Layout.Horizontal>
    </ItemContainer>
  )
}

export interface VariationSelectProps {
  variations: Variation[]
  rowIndex: number
  selectedIdentifier: string
  onChange: (variation: Variation) => boolean | Promise<boolean>
}

export const VariationSelect: React.FC<VariationSelectProps> = ({
  variations,
  rowIndex,
  selectedIdentifier,
  onChange
}) => {
  const [index, setIndex] = useState<number>(variations.findIndex(v => v.identifier === selectedIdentifier))
  const value =
    index !== -1
      ? {
          label: variations[index].name as string,
          value: variations[index].identifier as string,
          icon: {
            name: 'full-circle',
            style: {
              color: CFVariationColors[index]
            }
          }
        }
      : undefined
  const { activeEnvironment } = useActiveEnvironment()
  const [canEdit] = usePermission({
    resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
    permissions: [PermissionIdentifier.EDIT_FF_FEATUREFLAG]
  })

  return (
    <Text
      data-testid={`variation_select_${rowIndex}`}
      tooltip={
        !canEdit ? (
          <RBACTooltip resourceType={ResourceType.ENVIRONMENT} permission={PermissionIdentifier.EDIT_FF_FEATUREFLAG} />
        ) : undefined
      }
    >
      <Select
        disabled={!canEdit}
        items={variations.map<SelectOption>((variation, _index) => ({
          label: variation.name as string,
          value: variation.identifier as string,
          icon: {
            name: 'full-circle',
            style: {
              color: CFVariationColors[_index]
            }
          }
        }))}
        value={value as SelectOption}
        onChange={async ({ value: _value }) => {
          const oldIndex = index
          const newIndex = variations.findIndex(v => v.identifier === _value)

          if (newIndex !== -1 && newIndex !== index) {
            setIndex(newIndex)

            const result = await onChange(variations[newIndex])

            // If onChange does not return true, meaning it fails => go back to previous value
            if (result !== true) {
              setIndex(oldIndex)
            }
          }
        }}
      />
    </Text>
  )
}
