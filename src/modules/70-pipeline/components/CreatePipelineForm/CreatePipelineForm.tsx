/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Formik, FormikForm as Form, Button, Color, Icon } from '@wings-software/uicore'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import type { EntityGitDetails } from 'services/pipeline-ng'
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './CreatePipelineForm.module.scss'

interface CreatePipelineFormProps {
  handleSubmit: (value: PipelineInfoConfig, gitDetail: EntityGitDetails) => void
  closeModal?: () => void
  learnMoreUrl?: string
}

export const CreatePipelineForm: React.FC<CreatePipelineFormProps> = props => {
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const { handleSubmit, closeModal, learnMoreUrl } = props
  return (
    <Formik
      initialValues={{
        color: DEFAULT_COLOR,
        identifier: '',
        name: '',
        description: '',
        tags: {},
        repo: '',
        branch: ''
      }}
      formName="createPipeline"
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
      enableReinitialize={true}
      onSubmit={values => {
        handleSubmit(omit(values, 'repo', 'branch'), {
          branch: values.branch,
          repoIdentifier: values.repo
        })
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Text style={{ color: Color.BLACK, paddingBottom: 8, fontWeight: 600, fontSize: 'large' }}>
              {getString('pipeline.createPipeline.setupHeader')}
            </Text>
            <Text style={{ fontSize: 'normal', color: Color.BLACK, paddingBottom: 36 }}>
              {getString('pipeline.createPipeline.setupSubtitle')}
            </Text>
            <NameIdDescriptionTags formikProps={formikProps} className={css.createPipelineNameIdDescriptionTags} />
            {isGitSyncEnabled && (
              <GitSyncStoreProvider>
                <GitContextForm
                  formikProps={formikProps}
                  gitDetails={{
                    repoIdentifier: formikProps.values.repo,
                    branch: formikProps.values.branch,
                    getDefaultFromOtherRepo: false
                  }}
                />
              </GitSyncStoreProvider>
            )}
            <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
              <Button intent="primary" text={getString('start')} type="submit" />
              <Button
                intent="none"
                text={getString('pipeline.createPipeline.setupLater')}
                type="reset"
                onClick={() => closeModal?.()}
              />
            </Layout.Horizontal>
            <Layout.Horizontal padding={{ top: 'large' }}>
              <a href={learnMoreUrl} rel="noreferrer" target="_blank">
                {getString('pipeline.createPipeline.learnMore')}
                <Icon name="chevron-right" />
              </a>
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}
