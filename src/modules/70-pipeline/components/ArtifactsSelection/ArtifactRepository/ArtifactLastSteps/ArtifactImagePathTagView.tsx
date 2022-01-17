/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Menu } from '@blueprintjs/core'
import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { get, memoize } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'

import type { Failure, Error } from 'services/cd-ng'
import { tagOptions } from '../../ArtifactHelper'
import { helperTextData, resetTag } from '../../ArtifactUtils'
import type { ArtifactImagePathTagViewProps } from '../../ArtifactInterface'
import css from '../ArtifactConnector.module.scss'

const NoTagResults = ({ tagError }: { tagError: GetDataError<Failure | Error> | null }): JSX.Element => {
  const { getString } = useStrings()

  return (
    <span className={css.padSmall}>
      <Text lineClamp={1}>
        {get(tagError, 'data.message', null) || getString('pipelineSteps.deploy.errors.notags')}
      </Text>
    </span>
  )
}
const ArtifactImagePathTagView = ({
  selectedArtifact,
  formik,
  buildDetailsLoading,
  tagList,
  setTagList,
  expressions,
  allowableTypes,
  isReadonly,
  connectorIdValue,
  fetchTags,
  tagError
}: ArtifactImagePathTagViewProps): React.ReactElement => {
  const { getString } = useStrings()

  const getSelectItems = useCallback(() => {
    return tagList?.map(tag => ({ label: tag, value: tag })) as SelectOption[]
  }, [tagList])

  const tags = buildDetailsLoading ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }] : getSelectItems()

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={buildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <>
      <div className={css.imagePathContainer}>
        <FormInput.MultiTextInput
          label={getString('pipeline.imagePathLabel')}
          name="imagePath"
          placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
          multiTextInputProps={{ expressions, allowableTypes }}
          onChange={() => {
            tagList?.length && setTagList([])
            resetTag(formik)
          }}
        />
        {getMultiTypeFromValue(formik.values.imagePath) === MultiTypeInputType.RUNTIME && (
          <div className={css.configureOptions}>
            <ConfigureOptions
              value={formik.values.imagePath}
              type="String"
              variableName="imagePath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => {
                formik.setFieldValue('imagePath', value)
              }}
              isReadonly={isReadonly}
            />
          </div>
        )}
      </div>

      <div className={css.tagGroup}>
        <FormInput.RadioGroup
          name="tagType"
          radioGroup={{ inline: true }}
          items={tagOptions}
          className={css.radioGroup}
        />
      </div>
      {formik.values.tagType === 'value' ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={tags}
            disabled={!formik.values?.imagePath?.length}
            helperText={
              getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.FIXED &&
              getHelpeTextForTags(helperTextData(selectedArtifact, formik, connectorIdValue), getString)
            }
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                defaultSelectedItem: formik.values?.tag,
                noResults: <NoTagResults tagError={tagError} />,
                items: tags,
                addClearBtn: true,
                itemRenderer: itemRenderer,
                allowCreatingNewItems: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                fetchTags(formik.values.imagePath)
              }
            }}
            label={getString('tagLabel')}
            name="tag"
            className={css.tagInputButton}
          />

          {getMultiTypeFromValue(formik.values.tag) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values.tag}
                type="String"
                variableName="tag"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('tag', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      ) : null}

      {formik.values.tagType === 'regex' ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            label={getString('tagRegex')}
            name="tagRegex"
            placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(formik.values.tagRegex) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values.tagRegex}
                type="String"
                variableName="tagRegex"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('tagRegex', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}

export default ArtifactImagePathTagView
