import React from 'react'
import { isPlainObject, toPairs, startCase, isEmpty, isNil } from 'lodash-es'
import { Collapse as BPCollapse, Icon } from '@blueprintjs/core'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { CopyText } from '@common/components/CopyText/CopyText'
import { toVariableStr } from '@common/utils/StringUtils'

import css from './ExecutionStepInputOutputTab.module.scss'

const blackListKeys = ['step', 'parallel']

function Collapse(props: React.PropsWithChildren<{ title: string }>): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(true)

  function toggle(): void {
    setIsOpen(status => !status)
  }

  return (
    <div className={css.panel} data-status={isOpen ? 'open' : 'close'}>
      <div className={css.panelTitle} onClick={toggle}>
        <Icon icon="chevron-up" />
        <span>{props.title}</span>
      </div>
      <BPCollapse isOpen={isOpen}>{props.children}</BPCollapse>
    </div>
  )
}

export interface ExecutionStepInputOutputTabRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  level: number
  prefix: string
}

export function ExecutionStepInputOutputTabRow(props: ExecutionStepInputOutputTabRowProps): React.ReactElement {
  return (
    <React.Fragment>
      {toPairs(props.data).map(([key, value]) => {
        if (key.startsWith('_') || isNil(value)) return null

        let newKey = `${props.prefix}.${key}`

        if (blackListKeys.includes(key.toLowerCase()) || key.toLowerCase().endsWith('definition')) {
          newKey = props.prefix
        }

        if (isPlainObject(value)) {
          if (isEmpty(value)) return null

          return (
            <Collapse key={key} title={startCase(key)}>
              <ExecutionStepInputOutputTabRow prefix={newKey} data={value} level={props.level + 1} />
            </Collapse>
          )
        }

        if (Array.isArray(value)) {
          if (value.every(e => typeof e === 'string')) {
            return (
              <div className={css.ioRow} key={key}>
                <div className={css.key}>
                  <CopyText textToCopy={toVariableStr(newKey)}>{key}</CopyText>
                </div>
                <div className={css.value}>
                  <CopyText textToCopy={value.join(', ')}>{value.join(', ')}</CopyText>
                </div>
              </div>
            )
          }

          return (
            <Collapse key={key} title={startCase(key)}>
              {value.map((item, index) => {
                return (
                  <ExecutionStepInputOutputTabRow
                    key={`${newKey}[${index}]`}
                    prefix={`${newKey}[${index}]`}
                    data={item}
                    level={props.level + 1}
                  />
                )
              })}
            </Collapse>
          )
        }

        return (
          <div className={css.ioRow} key={key}>
            <div data-fqn={newKey} className={css.key}>
              <CopyText textToCopy={toVariableStr(newKey)}>{key}</CopyText>
            </div>
            <div className={css.value}>
              <CopyText textToCopy={value.toString()}>{value.toString()}</CopyText>
            </div>
          </div>
        )
      })}
    </React.Fragment>
  )
}

export interface ExecutionStepInputOutputTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>
  mode: 'input' | 'output'
  baseFqn?: string
}

export default function ExecutionStepInputOutputTab(props: ExecutionStepInputOutputTabProps): React.ReactElement {
  const { mode, baseFqn = '', data } = props
  const { getString } = useStrings()

  if (!data || isEmpty(data)) {
    return (
      <div className={css.ioTab} data-empty="true">
        {getString(mode === 'output' ? 'execution.iotab.noOutputText' : 'execution.iotab.noInputText')}
      </div>
    )
  }

  return (
    <div className={css.ioTab}>
      <div className={cx(css.ioRow, css.header)}>
        <div>{getString(mode === 'input' ? 'inputName' : 'outputName')}</div>
        <div>{getString(mode === 'input' ? 'inputValue' : 'outputValue')}</div>
      </div>
      <ExecutionStepInputOutputTabRow prefix={baseFqn} data={data} level={0} />
    </div>
  )
}
