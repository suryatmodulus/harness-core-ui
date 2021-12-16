import { Button, ButtonVariation, FormInput, Layout, Text } from '@wings-software/uicore'
import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import css from './KeyValueProps.module.scss'

export const KeyValuePairs = (props: any) => {
  const { name, formik, prevStepData } = props
  // console.log('pppppppp', prevStepData)
  const [headers, setHeaders] = useState([1])
  useEffect(() => {
    if (formik.values?.[name]) {
      setHeaders(formik.values[name])
    }
  }, [formik.values?.[name]])

  const handleDel = useCallback(
    (item: number) => {
      setHeaders((_headers: number[]) => {
        _headers.splice(item, 1)
        return [..._headers]
      })
      delete prevStepData?.[`${name}_key_${item + 1}`]
      delete prevStepData?.[`${name}_value_${item + 1}_`]
      delete prevStepData?.[`${name}_value_${item + 1}_fieldType`]
      delete prevStepData?.[`${name}_value_${item + 1}_textField`]
      delete formik.values[`${name}_key_${item + 1}`]
      delete formik.values[`${name}_value_${item + 1}_`]
      delete formik.values[`${name}_value_${item + 1}_fieldType`]
      delete formik.values[`${name}_value_${item + 1}_textField`]
    },
    [formik.values, name, prevStepData]
  )
  return (
    <>
      <Layout.Horizontal className={css.keyValHeader} spacing="large" border={{ bottom: true }}>
        <Text className={css.textCss}>Key</Text>
        <Text className={css.textCss}>Value</Text>
      </Layout.Horizontal>

      {headers?.map((item, _index) => (
        <Layout.Horizontal key={item} spacing="large">
          <FormInput.Text className={cx(css.textCss, css.secretText)} name={`${name}_key_${item}`} placeholder="key" />
          <TextReference
            name={`${name}_value_${item}_`}
            stringId={'cv.emptySpaces'}
            textWidth={'300px'}
            placeHolder={'value'}
            type={ValueType.TEXT}
          />
          <Button icon="trash" minimal className={css.secretText} onClick={() => handleDel(_index)} />
        </Layout.Horizontal>
      ))}
      <Button
        icon="plus"
        text={'Add Header'}
        variation={ButtonVariation.LINK}
        onClick={() => setHeaders((hea: number[]) => [...hea, hea[hea.length - 1] + 1])}
        margin={{ top: 'small' }}
      />
    </>
  )
}
