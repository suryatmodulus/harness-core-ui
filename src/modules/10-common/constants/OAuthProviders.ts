import type { IconName } from '@wings-software/uicore'
import { Color } from '@wings-software/uicore'

export interface OAuthProviderType {
  type: string
  name: string
  url: string
  iconName: IconName
  color?: Color
}

export const OAuthProviders: OAuthProviderType[] = [
  { type: 'GITHUB', name: 'Github', url: 'oauth2Redirect?provider=github', iconName: 'github', color: Color.BLACK },
  { type: 'BITBUCKET', name: 'Bitbucket', url: 'oauth2Redirect?provider=bitbucket', iconName: 'bitbucket-blue' },
  { type: 'GITLAB', name: 'GitLab', url: 'oauth2Redirect?provider=gitlab', iconName: 'service-gotlab' },
  { type: 'LINKEDIN', name: 'LinkedIn', url: 'oauth2Redirect?provider=linkedin', iconName: 'linkedin' },
  { type: 'GOOGLE', name: 'Google', url: 'oauth2Redirect?provider=google', iconName: 'google' },
  { type: 'AZURE', name: 'Azure', url: 'oauth2Redirect?provider=azure', iconName: 'service-azure' }
]

export const URLS = {
  OAUTH: 'https://app.harness.io/gateway/',
  FREE_TRIAL: 'https://harness.io/thanks-freetrial-p/',
  PRIVACY_AGREEMENT: 'https://harness.io/privacy/',
  SUBSCRIPTION_TERMS: 'https://harness.io/subscriptionterms/'
}
