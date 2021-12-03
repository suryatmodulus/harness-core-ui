import React from 'react'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import css from './LaunchButton.module.scss'

export interface LaunchButtonProps {
  launchButtonText: string
  redirectUrl: string
}
export const LaunchButton: React.FC<LaunchButtonProps> = props => {
  const { licenseInformation } = useLicenseStore()

  const launchUrlRedirect = (): void => {
    window.location.href = props.redirectUrl
  }

  if (isCDCommunity(licenseInformation)) {
    return null
  }

  return (
    <button type="button" className={css.launchButtonPosition} onClick={launchUrlRedirect}>
      {props.launchButtonText}
    </button>
  )
}
