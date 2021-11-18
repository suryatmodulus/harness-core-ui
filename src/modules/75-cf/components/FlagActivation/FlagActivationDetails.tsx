import React, { ReactElement, useState } from 'react'
import { useHistory, useParams, Link } from 'react-router-dom'
import { isEqual } from 'lodash-es'
import moment from 'moment'
import {
  Color,
  Layout,
  Text,
  FlexExpander,
  Button,
  Container,
  Heading,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook
} from '@wings-software/uicore'
import { Dialog, Divider, Intent } from '@blueprintjs/core'
import * as yup from 'yup'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import {
  DeleteFeatureFlagQueryParams,
  Feature,
  GitSyncErrorResponse,
  PatchFeatureQueryParams,
  useDeleteFeatureFlag,
  usePatchFeature,
  Variation
} from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { useConfirmAction, useQueryParams } from '@common/hooks'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getErrorMessage, showToaster, useFeatureFlagTypeToStringMapping } from '@cf/utils/CFUtils'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'

import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { GitSyncFormValues, GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import patch from '../../utils/instructions'
import { VariationTypeIcon } from '../VariationTypeIcon/VariationTypeIcon'
import { IdentifierText } from '../IdentifierText/IdentifierText'
import { EditVariationsModal } from '../EditVariationsModal/EditVariationsModal'
import { FlagPrerequisites } from './FlagPrerequisites'
import SaveFlagToGitSubForm from '../SaveFlagToGitSubForm/SaveFlagToGitSubForm'
import SaveFlagToGitModal from '../SaveFlagToGitModal/SaveFlagToGitModal'
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
  const { showError } = useToaster()
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
  const history = useHistory()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const gitSyncFormMeta = gitSync?.getGitSyncFormMeta(AUTO_COMMIT_MESSAGES.UPDATED_FLAG_VARIATIONS)

  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => {
    const initialValues = {
      name: featureFlag.name,
      description: featureFlag.description,
      tags: featureFlag.tags?.map(elem => elem.name),
      permanent: featureFlag.permanent,
      gitDetails: gitSyncFormMeta?.gitSyncInitialValues.gitDetails,
      autoCommit: gitSyncFormMeta?.gitSyncInitialValues.autoCommit
    }

    const getTag = (tagName: string) => featureFlag.tags?.find(tag => tag.name === tagName)

    const handleSubmit = (values: typeof initialValues): void => {
      const { name, description, tags, permanent } = values
      if (name !== initialValues.name) {
        patch.feature.addInstruction(patch.creators.updateName(name as string))
      }

      if (description !== initialValues.description) {
        patch.feature.addInstruction(patch.creators.updateDescription(description as string))
      }

      if (!isEqual(tags, initialValues.tags)) {
        initialValues.tags
          ?.filter(tag => tags?.includes(tag))
          .map(getTag)
          .forEach((tag: any) => {
            patch.feature.addInstruction(patch.creators.removeTag(tag.name, tag.value))
          })
        tags
          ?.filter((tag: any) => !initialValues.tags?.includes(tag))
          .forEach((tag: any) => {
            patch.feature.addInstruction(patch.creators.addTag(tag, tag))
          })
      }

      if (permanent !== initialValues.permanent) {
        patch.feature.addInstruction(patch.creators.updatePermanent(permanent))
      }

      patch.feature
        .onPatchAvailable(data => {
          submitPatch(
            gitSync?.isGitSyncEnabled
              ? {
                  ...data,
                  gitDetails: values.gitDetails
                }
              : data
          )
            .then(async () => {
              if (values.autoCommit) {
                await gitSync?.handleAutoCommit(values.autoCommit)
              }

              patch.feature.reset()
              hideEditDetailsModal()
              refetchFlag()
              showToaster(getString('cf.messages.flagUpdated'))
            })
            .catch(error => {
              if (error.status === GIT_SYNC_ERROR_CODE) {
                gitSync.handleError(error.data as GitSyncErrorResponse)
              } else {
                patch.feature.reset()
              }
            })
        })
        .onEmptyPatch(hideEditDetailsModal)
    }

    return (
      <Dialog enforceFocus={false} onClose={hideEditDetailsModal} isOpen={true} title="" className={css.editFlagModal}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={yup.object().shape({
            gitDetails: gitSyncFormMeta?.gitSyncValidationSchema
          })}
          formName="flagActivationDetails"
          onSubmit={handleSubmit}
        >
          {() => (
            <Form data-testid="edit-flag-form">
              <Layout.Vertical className={css.editDetailsModalContainer} spacing="large">
                <Text>{getString('cf.editDetails.editDetailsHeading')}</Text>

                <FormInput.Text name="name" label={getString('name')} />

                <FormInput.TextArea name="description" label={getString('description')} />

                <Container>
                  <FormInput.CheckBox
                    name="permanent"
                    label={getString('cf.editDetails.permaFlag')}
                    className={css.checkboxEditDetails}
                  />
                </Container>
                {gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled && (
                  <>
                    <Container>
                      <Divider />
                    </Container>
                    <SaveFlagToGitSubForm subtitle={getString('cf.gitSync.commitChanges')} hideNameField />
                  </>
                )}

                <Container>
                  <Button intent="primary" text={getString('save')} type="submit" />
                  <Button minimal text={getString('cancel')} onClick={hideEditDetailsModal} />
                </Container>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Dialog>
    )
  }, [featureFlag, gitSync.isAutoCommitEnabled, gitSync.isGitSyncEnabled])

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

  const { mutate: archiveFeatureFlag } = usePatchFeature({
    identifier: featureFlag.identifier,
    queryParams
  })
  const archiveFlag = useConfirmAction({
    title: getString('cf.featureFlags.archiveFlag'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.featureFlags.archiveFlagMessage', { name: featureFlag.name })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: () => {
      archiveFeatureFlag({
        instructions: [
          {
            kind: 'updateArchived',
            parameters: {
              archived: true
            }
          }
        ]
      })
        .then(() => {
          showToaster(getString('cf.messages.flagArchived'))
          refetchFlag()
        })
        .catch(error => showError(getErrorMessage(error), undefined, 'cf.archive.ff.error'))
    }
  })

  const handleDeleteFlag = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let commitMsg = ''
    if (gitSync?.isGitSyncEnabled) {
      if (gitSync?.isAutoCommitEnabled) {
        commitMsg = gitSyncFormMeta?.gitSyncInitialValues.gitDetails.commitMsg
      } else {
        commitMsg = gitSyncFormValues?.gitDetails.commitMsg || ''
      }
    }

    try {
      await deleteFeatureFlag(featureFlag.identifier, { queryParams: { ...queryParams, commitMsg } })

      history.replace(featureFlagListURL)
      showToaster(getString('cf.messages.flagDeleted'))
    } catch (error: any) {
      if (error.status === GIT_SYNC_ERROR_CODE) {
        gitSync.handleError(error.data as GitSyncErrorResponse)
      } else {
        showError(getErrorMessage(error), 0, 'cf.delete.ff.error')
      }
    }
  }

  const deleteFlag = useConfirmAction({
    title: getString('cf.featureFlags.deleteFlag'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.featureFlags.deleteFlagMessage', { name: featureFlag.name })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
        setIsDeleteModalOpen(true)
      } else {
        await handleDeleteFlag()
      }
    }
  })
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
        <RbacOptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: openEditDetailsModal,
              disabled: featureFlag.archived,
              permission: {
                resource: { resourceType: ResourceType.FEATUREFLAG },
                permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
              }
            },
            {
              icon: 'archive',
              text: getString('archive'),
              onClick: archiveFlag,
              // Disable for now per https://harness.atlassian.net/browse/FFM-772
              disabled: true,
              title: getString('cf.featureNotReady')
            },
            '-',
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: deleteFlag,
              disabled: featureFlag.archived,
              permission: {
                resource: { resourceType: ResourceType.FEATUREFLAG },
                permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
              }
            }
          ]}
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
        {isDeleteModalOpen && (
          <SaveFlagToGitModal
            flagName={featureFlag.name}
            flagIdentifier={featureFlag.identifier}
            onSubmit={handleDeleteFlag}
            onClose={() => {
              setIsDeleteModalOpen(false)
            }}
          />
        )}
      </Container>
    </>
  )
}

export default FlagActivationDetails
