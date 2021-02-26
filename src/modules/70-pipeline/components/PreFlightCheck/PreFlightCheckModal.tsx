import React, { useEffect, useState } from 'react'
import type { PreFlightCheckModalProps } from './PreFlightCheckUtil'

export const PreFlightCheckModal: React.FC<PreFlightCheckModalProps> = () => {
  const [preFlightCheckId, setPreFlightCheckId] = useState('')

  const getPreFlightCheckId = async () => {
    // some api call here
    // const {response} = getPreFlightCheckId()
    setPreFlightCheckId('preFlightCheckId')
  }

  useEffect(() => {
    getPreFlightCheckId()
  })
  return (
    <
  )
}
