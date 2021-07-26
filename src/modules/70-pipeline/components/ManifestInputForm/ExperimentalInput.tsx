import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import { get } from 'lodash-es'
const generateNewKey = (): string => uuid()
const ExperimentalInput = (props: any): React.ReactElement => {
  const formikValue = get(props?.formik?.values, props.name, '')
  const ref = React.useRef()
  React.useEffect(() => {
    if (!ref?.current && ref.current !== formikValue) {
      ref.current = formikValue
    }
  }, [formikValue])
  const key = React.useMemo((): string => {
    return generateNewKey()
  }, [ref.current])
  return <FormInput.MultiTypeInput key={key} {...props} />
}

export default ExperimentalInput
