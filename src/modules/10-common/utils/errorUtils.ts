export function shouldShowError(e: any): boolean {
  const hideMessagesForStatusCodes = [502, 503]
  if (
    e?.message === 'Failed to fetch: The user aborted a request.' ||
    e?.message === 'Failed to fetch: Failed to fetch' ||
    e?.message === 'Failed to fetch: 504 Gateway Timeout' ||
    hideMessagesForStatusCodes.includes(e?.status)
  ) {
    return false
  }
  return true
}
