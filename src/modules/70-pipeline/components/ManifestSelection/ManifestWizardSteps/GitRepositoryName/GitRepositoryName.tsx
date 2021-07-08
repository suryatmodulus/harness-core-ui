import React from 'react'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface GitRepositoryNameProps {
  accountUrl: string
  expressions: Array<string>
  fieldValue: string | undefined
  changeFieldValue: (val: string) => void
  isReadonly?: boolean
}

const GitRepositoryName: React.FC<GitRepositoryNameProps> = ({
  accountUrl,
  expressions,
  fieldValue,
  changeFieldValue,
  isReadonly = false
}) => {
  const { getString } = useStrings()
  return (
    <div className={helmcss.repoNameSection}>
      <div className={helmcss.repoName}>
        <FormInput.MultiTextInput
          multiTextInputProps={{ expressions }}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          label={getString('pipelineSteps.build.create.repositoryNameLabel')}
          name="repoName"
          className={helmcss.reponameField}
        />
        {getMultiTypeFromValue(fieldValue) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={fieldValue as string}
            type="String"
            variableName="repoName"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={changeFieldValue}
            isReadonly={isReadonly}
          />
        )}
      </div>

      <div className={helmcss.halfWidth}>
        <String stringID="common.git.gitAccountUrl" className={css.accountUrl} />:
        <span className={css.repoNameUrl}>{`${accountUrl}`}</span>
      </div>
    </div>
  )
}

export default GitRepositoryName
