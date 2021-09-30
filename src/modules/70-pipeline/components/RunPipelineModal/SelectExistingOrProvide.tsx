import React, { FormEvent } from 'react'
import { PopoverPosition, Radio, RadioGroup } from '@blueprintjs/core'
import { Icon, Layout, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RunPipelineForm.module.scss'

interface SelectExistingInputsOrProvideNewProps {
  existingProvide: string
  onExistingProvideRadioChange: (e: FormEvent<HTMLInputElement>) => void
}

const SelectExistingInputsOrProvideNew = ({
  existingProvide,
  onExistingProvideRadioChange
}: SelectExistingInputsOrProvideNewProps): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <div>
      <Layout.Horizontal className={css.runModalSubHeading} id="use-input-set">
        <RadioGroup
          name="existingProvideRadio"
          label={getString('pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide')}
          inline
          selectedValue={existingProvide}
          onChange={onExistingProvideRadioChange}
        >
          <Radio
            label={getString('pipeline.triggers.pipelineInputPanel.provide')}
            value="provide"
            className={cx(css.valueProviderRadio, existingProvide === 'provide' ? css.selectedValueProvider : '')}
          />
          <Radio
            label={getString('pipeline.triggers.pipelineInputPanel.existing')}
            value="existing"
            className={cx(css.valueProviderRadio, existingProvide === 'existing' ? css.selectedValueProvider : '')}
          />
        </RadioGroup>
        <span className={css.helpSection}>
          <Icon name="question" className={css.helpIcon} />
          <Text
            tooltipProps={{
              position: PopoverPosition.BOTTOM
            }}
            tooltip={
              <Text padding="medium" width={400}>
                {getString('pipeline.inputSets.aboutInputSets')}
                <a
                  href="https://ngdocs.harness.io/article/3fqwa8et3d-input-sets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getString('learnMore')}
                </a>
              </Text>
            }
          >
            {getString('pipeline.triggers.pipelineInputPanel.whatAreInputsets')}
          </Text>
        </span>
      </Layout.Horizontal>
    </div>
  )
}

export default SelectExistingInputsOrProvideNew
