export enum AuthenticationMechanisms {
  SAML = 'SAML',
  OAUTH = 'OAUTH',
  LDAP = 'LDAP',
  USER_PASSWORD = 'USER_PASSWORD'
}

export const getSamlEndpoint = (accountId: string): string => {
  let url = window.location.href.split('/#')[0]?.replace('/ng', '')

  if (window.apiUrl) {
    if (window.apiUrl.startsWith('/')) {
      url = `${url}${window.apiUrl}`
    } else {
      url = window.apiUrl
    }
  }

  return `${url}/api/users/saml-login?accountId=${accountId}`
}
