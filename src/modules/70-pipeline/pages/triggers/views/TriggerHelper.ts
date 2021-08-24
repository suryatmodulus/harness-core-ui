export const isProduction = () => {
  return location.hostname === 'app.harness.io'
}

export const isQA = () => {
  return location.hostname === 'qa.harness.io'
}

export const isLocalHost = () => {
  return location.hostname === 'localhost'
}

export const isGeneralStoreAccount = (accountId: string) => {
  return isProduction() && accountId === 'lnFZRF6jQO6tQnB9znMALw'
}

export const isValidQAAccount = (accountId: string) => {
  return ['zEaak-FLS425IEO7OLzMUg', 'lnFZRF6jQO6tQnB9znMALw'].includes(accountId)
}
