/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import FixedScheduleDialog from './FixedScheduleDialog'
import FixedScheduleForm from './FixedScheduleForm'

interface UseFixedScheduleEditorProps {
  schedule?: FixedScheduleClient
  addSchedule: (schedule: FixedScheduleClient) => void
  isEdit?: boolean
}

const useFixedScheduleEditor = (props: UseFixedScheduleEditorProps) => {
  const onAddition = (schedule: FixedScheduleClient) => {
    props.addSchedule(schedule)
    closeModal()
  }

  const [openModal, closeModal] = useModalHook(
    () => (
      <FixedScheduleDialog onClose={closeModal}>
        <FixedScheduleForm
          schedule={props.schedule}
          closeDialog={closeModal}
          addSchedule={onAddition}
          isEdit={props.isEdit}
        />
      </FixedScheduleDialog>
    ),
    [props.schedule, props.addSchedule]
  )

  return {
    openEditor: openModal
  }
}

export default useFixedScheduleEditor
