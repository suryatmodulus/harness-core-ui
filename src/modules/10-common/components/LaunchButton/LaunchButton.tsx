import React from 'react'
import css from './LaunchButton.module.scss'

export interface LaunchButtonProps {
  launchButtonText: string
  redirectUrl: string
}
export const LaunchButton: React.FC<LaunchButtonProps> = props => {
  const launchUrlRedirect = () => {
    window.location.href = props.redirectUrl
  }
  return (
    <button type="button" className={css.launchButtonPosition} onClick={launchUrlRedirect}>
      {props.launchButtonText}
    </button>
  )
}
