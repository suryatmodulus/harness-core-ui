/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { JiraFieldNG } from 'services/cd-ng'
import type { JiraFieldSelectorProps } from './types'
import css from './JiraFieldSelector.module.scss'

export const JiraFieldSelector = (props: JiraFieldSelectorProps) => {
  const { getString } = useStrings()
  const [selectedFields, setSelectedFields] = useState<JiraFieldNG[]>(props.selectedFields)
  const [selectedFieldsMap, setSelectedFieldsMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const map: Record<string, boolean> = {}
    if (!isEmpty(selectedFields)) {
      selectedFields.forEach(field => {
        map[field.name] = true
      })
    }
    setSelectedFieldsMap(map)
  }, [selectedFields])

  const onSelect = (field: JiraFieldNG, checked: boolean) => {
    const alreadySelectedFields: JiraFieldNG[] = [...selectedFields]
    if (checked) {
      alreadySelectedFields.push(field)
      setSelectedFields(alreadySelectedFields)
    } else {
      const index = alreadySelectedFields.indexOf(field)
      alreadySelectedFields.splice(index, 1)
      setSelectedFields(alreadySelectedFields)
    }
  }

  return (
    <div>
      <div className={css.fieldsSection}>
        {props.fields.map(field => (
          <Checkbox
            key={field.name}
            className={css.checkbox}
            checked={selectedFieldsMap[field.name]}
            onChange={ev => onSelect(field, (ev.target as HTMLInputElement).checked)}
          >
            {field.name}
          </Checkbox>
        ))}
      </div>
      <div className={css.buttons}>
        <Button
          text={getString('add')}
          disabled={isEmpty(selectedFields)}
          intent="primary"
          onClick={() => props.addSelectedFields(selectedFields)}
        />
        <Button className={css.secondButton} text={getString('cancel')} onClick={props.onCancel} />
      </div>
    </div>
  )
}
