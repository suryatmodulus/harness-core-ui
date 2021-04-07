import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { isEqual } from 'lodash-es'
import moment from 'moment'
import { Link } from 'react-router-dom'
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
import { Dialog, Intent } from '@blueprintjs/core'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { MenuDivider, OptionsMenuButton } from '@common/components'
import { Feature, useDeleteFeatureFlag, usePatchFeature, Variation } from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { useConfirmAction } from '@common/hooks'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import patch from '../../utils/instructions'
import { VariationTypeIcon } from '../VariationTypeIcon/VariationTypeIcon'
import { IdentifierText } from '../IdentifierText/IdentifierText'
import { EditVariationsModal } from '../EditVariationsModal/EditVariationsModal'
import { FlagRerequisites } from './FlagRerequisites'
import css from './FlagActivationDetails.module.scss'

interface FlagActivationDetailsProps {
  featureFlag: Feature
  refetchFlag: () => void
}

const VariationItem: React.FC<{ variation: Variation; index: number }> = ({ variation, index }) => {
  return (
    <Layout.Horizontal className={css.variationItem} spacing="xsmall" style={{ alignItems: 'center' }}>
      <VariationWithIcon variation={variation} index={index} />
    </Layout.Horizontal>
  )
}

const VariationsList: React.FC<{ featureFlag: Feature; onEditSuccess: () => void }> = ({
  featureFlag,
  onEditSuccess
}) => {
  const { orgIdentifier, accountId, projectIdentifier } = useParams<Record<string, string>>()
  const isFlagTypeBoolean = featureFlag.kind === FlagTypeVariations.booleanFlag
  const { variations } = featureFlag
  const { getString } = useStrings()

  return (
    <Layout.Vertical padding="large" margin={{ top: 'large' }} className={css.module}>
      <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ bottom: 'medium' }}>
        <Text style={{ color: '#1C1C28', fontWeight: 600, fontSize: '14px', lineHeight: '22px' }}>
          {getString('cf.shared.variations')}
        </Text>
        <FlexExpander />
        <EditVariationsModal
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          feature={featureFlag}
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
          style={{ fontSize: '14px', lineHeight: '20px' }}
        >
          <VariationTypeIcon style={{ transform: 'translateY(1px)' }} multivariate={!isFlagTypeBoolean} />
          {isFlagTypeBoolean ? getString('cf.boolean') : getString('cf.multivariate')} ({variations.length}{' '}
          {getString('cf.shared.variations').toLocaleLowerCase()})
        </Text>

        {featureFlag.variations.map((variation, index) => (
          <VariationItem key={variation.identifier} variation={variation} index={index} />
        ))}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

const FlagActivationDetails: React.FC<FlagActivationDetailsProps> = props => {
  const { featureFlag, refetchFlag } = props
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const { orgIdentifier, accountId, projectIdentifier } = useParams<Record<string, string>>()
  const featureFlagListURL = routes.toCFFeatureFlags({
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier,
    accountId
  })
  const { mutate: submitPatch } = usePatchFeature({
    identifier: featureFlag.identifier as string,
    queryParams: {
      project: featureFlag.project as string,
      environment: featureFlag.envProperties?.environment as string,
      account: accountId,
      org: orgIdentifier
    }
  })
  const history = useHistory()
  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => {
    const initialValues = {
      name: featureFlag.name,
      description: featureFlag.description,
      tags: featureFlag.tags?.map(elem => elem.name),
      permanent: featureFlag.permanent
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
          submitPatch(data)
            .then(() => {
              patch.feature.reset()
              hideEditDetailsModal()
              refetchFlag()
            })
            .catch(() => {
              patch.feature.reset()
            })
        })
        .onEmptyPatch(hideEditDetailsModal)
    }

    return (
      <Dialog onClose={hideEditDetailsModal} isOpen={true} title={''}>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {() => (
            <Form>
              <Layout.Vertical className={css.editDetailsModalContainer}>
                <Text>{getString('cf.editDetails.editDetailsHeading')}</Text>

                <FormInput.Text name="name" label={getString('name')} />

                <FormInput.TextArea name="description" label={getString('description')} />

                <FormInput.TagInput
                  name="tags"
                  label={getString('tagsLabel')}
                  items={[]}
                  labelFor={nameTag => nameTag as string}
                  itemFromNewTag={newTag => newTag}
                  tagInputProps={{ showAddTagButton: true, allowNewTag: true }}
                />

                <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
                  <FormInput.CheckBox
                    name="permanent"
                    label={getString('cf.editDetails.permaFlag')}
                    className={css.checkboxEditDetails}
                  />
                  {/* <Text
                    icon="info-sign"
                    iconProps={{ color: Color.BLUE_500, size: 12 }}
                    tooltip="To be added..."
                    tooltipProps={{ isDark: true }}
                  /> */}
                </Layout.Horizontal>

                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" />
                  <Button minimal text={getString('cancel')} onClick={hideEditDetailsModal} />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Dialog>
    )
  }, [featureFlag])
  const { mutate: deleteFeatureFlag } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string,
      account: accountId,
      org: orgIdentifier
    }
  })
  const { mutate: archiveFeatureFlag } = usePatchFeature({
    identifier: featureFlag.identifier,
    queryParams: {
      account: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: '' // TODO: is environment really needed?
    }
  })
  const archiveFlag = useConfirmAction({
    title: getString('cf.featureFlags.archiveFlag'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.featureFlags.archiveFlagMessage', { name: featureFlag.name })
          }}
        ></span>
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
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
          showSuccess('good to go')
          refetchFlag()
        })
        .catch(error => showError(getErrorMessage(error)))
    }
  })
  const deleteFlag = useConfirmAction({
    title: getString('cf.featureFlags.deleteFlag'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.featureFlags.deleteFlagMessage', { name: featureFlag.name })
          }}
        ></span>
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      try {
        deleteFeatureFlag(featureFlag.identifier)
          .then(() => {
            history.replace(featureFlagListURL)
            showSuccess(
              <Text color={Color.WHITE}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getString('cf.featureFlags.deleteFlagSuccess', { name: featureFlag.name })
                  }}
                />
              </Text>
            )
          })
          .catch(error => {
            showError(getErrorMessage(error), 0)
          })
      } catch (error) {
        showError(getErrorMessage(error), 0)
      }
    }
  })
  const renderTime = (time: number, style?: React.CSSProperties): React.ReactNode => (
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
      {getString('cf.featureFlags.createdDate', {
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
        <OptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: openEditDetailsModal,
              disabled: featureFlag.archived
            },
            {
              icon: 'archive',
              text: getString('archive'),
              onClick: archiveFlag,
              disabled: featureFlag.archived
            },
            MenuDivider,
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: deleteFlag
            }
          ]}
        />
      </Layout.Horizontal>

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

        {!!featureFlag.tags?.length && (
          <Container className={css.tagsFlagActivationDetails}>
            <TagsViewer
              tags={featureFlag.tags?.map(({ value }) => value as string)}
              style={{ backgroundColor: '#D9DAE6', fontSize: '12px', lineHeight: '16px', color: '#22222A' }}
            />
          </Container>
        )}

        <Layout.Vertical margin={{ top: 'medium', bottom: 'xlarge' }}>
          {renderTime(featureFlag.createdAt)}
          {renderTime(featureFlag.modifiedAt, { paddingTop: 'var(--spacing-xsmall)' })}
        </Layout.Vertical>

        <VariationsList
          featureFlag={featureFlag}
          onEditSuccess={() => {
            refetchFlag()
          }}
        />

        <FlagRerequisites featureFlag={featureFlag} refetchFlag={refetchFlag} />
      </Container>
    </>
  )
}

export default FlagActivationDetails
