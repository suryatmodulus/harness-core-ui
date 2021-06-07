import React from 'react'
import { Container, Formik, FormikForm, Button, Color } from '@wings-software/uicore'
import * as Yup from 'yup'
import { omit, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { NgPipeline } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails } from 'services/pipeline-ng'

import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'

const logger = loggerFor(ModuleName.CD)

interface NgPipelineWithGitDetails extends NgPipeline {
  repo: string
  branch: string
}
export interface PipelineCreateProps {
  afterSave?: (values: NgPipeline, gitDetails?: EntityGitDetails) => void
  initialValues?: NgPipelineWithGitDetails
  closeModal?: () => void
}

export default function CreatePipelines({
  afterSave,
  initialValues = { identifier: '', name: '', description: '', tags: {}, repo: '', branch: '' },
  closeModal
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
    <Container className={css.container} background={isGitSyncEnabled ? Color.FORM_BG : ''}>
      <Button icon="cross" minimal className={css.closeModal} onClick={closeModal} />
      <div className={css.heading}>{isEdit ? getString('editPipeline') : getString('moduleRenderer.newPipeLine')}</div>
      <Container padding="xsmall" className={css.layout}>
        <div>
          <Formik
            initialValues={initialValues}
            formName="pipelineCreate"
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('createPipeline.pipelineNameRequired')),
              identifier: Yup.string().when('name', {
                is: val => val?.length,
                then: Yup.string()
                  .trim()
                  .required(getString('validation.identifierRequired'))
                  .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
                  .notOneOf(StringUtils.illegalIdentifiers)
              }),
              ...(isGitSyncEnabled
                ? {
                    repo: Yup.string().trim().required(getString('pipeline.repoRequired')),
                    branch: Yup.string().trim().required(getString('pipeline.branchRequired'))
                  }
                : {})
            })}
            onSubmit={values => {
              logger.info(JSON.stringify(values))
              const gitDetails =
                values.repo && values.repo.trim().length > 0
                  ? { repoIdentifier: values.repo, branch: values.branch }
                  : undefined
              afterSave && afterSave(omit(values, 'repo', 'branch'), gitDetails)
            }}
          >
            {formikProps => (
              <FormikForm>
                <div className={css.formInput}>
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{
                      isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
                    }}
                  />
                </div>
                {isGitSyncEnabled && (
                  <GitSyncStoreProvider>
                    <GitContextForm
                      formikProps={formikProps}
                      gitDetails={{ ...pick(initialValues, ['repo', 'branch']), getDefaultFromOtherRepo: false }}
                    />
                  </GitSyncStoreProvider>
                )}
                <Button
                  intent="primary"
                  className={css.startBtn}
                  type="submit"
                  text={isEdit ? getString('save') : getString('start')}
                />
              </FormikForm>
            )}
          </Formik>
        </div>
      </Container>
    </Container>
  )
}
