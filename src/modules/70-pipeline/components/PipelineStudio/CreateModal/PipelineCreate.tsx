import React from 'react'
import { Container, Formik, FormikForm, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails } from 'services/pipeline-ng'

import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'

const logger = loggerFor(ModuleName.CD)

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo: string
  branch: string
}
export interface PipelineCreateProps {
  afterSave?: (values: PipelineInfoConfig, gitDetails?: EntityGitDetails) => void
  initialValues?: PipelineInfoConfigWithGitDetails
  closeModal?: () => void
  gitDetails?: IGitContextFormProps
}

export default function CreatePipelines({
  afterSave,
  initialValues = { identifier: '', name: '', description: '', tags: {}, repo: '', branch: '' },
  closeModal,
  gitDetails
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { isGitSyncEnabled } = useAppStore()

  const identifier = initialValues?.identifier
  if (identifier === DefaultNewPipelineId) {
    initialValues.identifier = ''
  }
  const isEdit = (initialValues?.identifier?.length || '') > 0
  return (
    <Formik
      initialValues={initialValues}
      formName="pipelineCreate"
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
        identifier: IdentifierSchema(),
        ...(isGitSyncEnabled
          ? {
              repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
              branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
            }
          : {})
      })}
      onSubmit={values => {
        logger.info(JSON.stringify(values))
        const formGitDetails =
          values.repo && values.repo.trim().length > 0
            ? { repoIdentifier: values.repo, branch: values.branch }
            : undefined
        afterSave && afterSave(omit(values, 'repo', 'branch'), formGitDetails)
      }}
    >
      {formikProps => (
        <FormikForm>
          <NameIdDescriptionTags
            formikProps={formikProps}
            identifierProps={{
              isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
            }}
          />
          {isGitSyncEnabled && (
            <GitSyncStoreProvider>
              <GitContextForm formikProps={formikProps} gitDetails={gitDetails} />
            </GitSyncStoreProvider>
          )}
          <Container padding={{ top: 'xlarge' }}>
            <Button intent="primary" type="submit" text={isEdit ? getString('save') : getString('start')} />
            &nbsp; &nbsp;
            <Button text={getString('cancel')} onClick={closeModal} />
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}
