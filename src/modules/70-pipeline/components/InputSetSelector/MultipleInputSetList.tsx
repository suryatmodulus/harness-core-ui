import React from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'

import { Checkbox, Color, Container, Icon, Layout, Text } from '@harness/uicore'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { useStrings } from 'framework/strings'
import type { EntityGitDetails, InputSetErrorWrapper, InputSetSummaryResponse } from 'services/pipeline-ng'
import { getIconByType } from './utils'
import { InputSetGitDetails } from './InputSetGitDetails'
import css from './InputSetSelector.module.scss'

interface MultipleInputSetListProps {
  inputSet: InputSetSummaryResponse
  onCheckBoxHandler: (
    checked: boolean,
    label: string,
    val: string,
    type: InputSetSummaryResponse['inputSetType'],
    inputSetGitDetails: EntityGitDetails | null,
    inputSetErrorDetails?: InputSetErrorWrapper,
    overlaySetErrorDetails?: { [key: string]: string }
  ) => void
}

export function MultipleInputSetList(props: MultipleInputSetListProps): JSX.Element {
  const { inputSet, onCheckBoxHandler } = props
  const { getString } = useStrings()

  return (
    <li
      className={cx(css.item)}
      onClick={() => {
        if (isInputSetInvalid(inputSet)) {
          return
        }
        onCheckBoxHandler(
          true,
          defaultTo(inputSet.name, ''),
          defaultTo(inputSet.identifier, ''),
          defaultTo(inputSet.inputSetType, 'INPUT_SET'),
          defaultTo(inputSet.gitDetails, null),
          inputSet.inputSetErrorDetails,
          inputSet.overlaySetErrorDetails
        )
      }}
    >
      <Layout.Horizontal flex={{ distribution: 'space-between' }}>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Checkbox
            className={css.checkbox}
            disabled={isInputSetInvalid(inputSet)}
            labelElement={
              <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }}>
                <Icon name={getIconByType(inputSet.inputSetType)}></Icon>
                <Container margin={{ left: true }} className={css.nameIdContainer}>
                  <Text
                    data-testid={`popover-${inputSet.name}`}
                    lineClamp={1}
                    font={{ weight: 'bold' }}
                    color={Color.GREY_800}
                  >
                    {inputSet.name}
                  </Text>
                  <Text font="small" lineClamp={1} margin={{ top: 'xsmall' }} color={Color.GREY_450}>
                    {getString('idLabel', { id: inputSet.identifier })}
                  </Text>
                </Container>
              </Layout.Horizontal>
            }
          />
          {isInputSetInvalid(inputSet) && (
            <Container padding={{ left: 'large' }}>
              <Badge
                text={'common.invalid'}
                iconName="error-outline"
                showTooltip={true}
                entityName={inputSet.name}
                entityType={inputSet.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
                uuidToErrorResponseMap={inputSet.inputSetErrorDetails?.uuidToErrorResponseMap}
                overlaySetErrorDetails={inputSet.overlaySetErrorDetails}
              />
            </Container>
          )}
        </Layout.Horizontal>
        {inputSet.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={inputSet.gitDetails} /> : null}
      </Layout.Horizontal>
    </li>
  )
}
