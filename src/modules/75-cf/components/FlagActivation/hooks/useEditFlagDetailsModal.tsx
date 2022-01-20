import React from 'react'
import {
  Layout,
  Text,
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook
} from '@wings-software/uicore'
import { Dialog, Divider } from '@blueprintjs/core'
import * as yup from 'yup'
import type { MutateMethod } from 'restful-react/dist/Mutate'
import type {
  Feature,
  GitSyncErrorResponse,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import { showToaster } from '@cf/utils/CFUtils'

import { GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import { useStrings } from 'framework/strings'
import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import patch from '../../../utils/instructions'
import SaveFlagToGitSubForm from '../../SaveFlagToGitSubForm/SaveFlagToGitSubForm'
import css from '../FlagActivationDetails.module.scss'

interface UseEditFlagDetailsModalProps {
  featureFlag: Feature
  gitSync: UseGitSync
  submitPatch: MutateMethod<Feature, GitSyncPatchOperation, PatchFeatureQueryParams, PatchFeaturePathParams>
  refetchFlag: () => void
}

interface UseEditFlagDetailsModalReturn {
  openEditDetailsModal: () => void
  hideEditDetailsModal: () => void
}

const useEditFlagDetailsModal = (props: UseEditFlagDetailsModalProps): UseEditFlagDetailsModalReturn => {
  const { featureFlag, gitSync, refetchFlag, submitPatch } = props
  const { getString } = useStrings()

  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => {
    const gitSyncFormMeta = gitSync?.getGitSyncFormMeta(AUTO_COMMIT_MESSAGES.UPDATED_FLAG_VARIATIONS)

    const initialValues = {
      name: featureFlag.name.trim(),
      description: featureFlag.description,
      permanent: featureFlag.permanent,
      gitDetails: gitSyncFormMeta?.gitSyncInitialValues.gitDetails,
      autoCommit: gitSyncFormMeta?.gitSyncInitialValues.autoCommit
    }

    const handleSubmit = (values: typeof initialValues): void => {
      const { name, description, permanent } = values
      if (name !== initialValues.name) {
        patch.feature.addInstruction(patch.creators.updateName(name as string))
      }

      if (description !== initialValues.description) {
        patch.feature.addInstruction(patch.creators.updateDescription(description as string))
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
                gitSync?.handleError(error.data as GitSyncErrorResponse)
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
            name: yup.string().required(getString('cf.creationModal.aboutFlag.nameRequired')),
            gitDetails: gitSyncFormMeta.gitSyncValidationSchema
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
                  <Button
                    minimal
                    text={getString('cancel')}
                    onClick={e => {
                      e.preventDefault()
                      hideEditDetailsModal()
                    }}
                  />
                </Container>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Dialog>
    )
  }, [featureFlag, gitSync?.isAutoCommitEnabled, gitSync?.isGitSyncEnabled])

  return { openEditDetailsModal, hideEditDetailsModal }
}

export default useEditFlagDetailsModal
