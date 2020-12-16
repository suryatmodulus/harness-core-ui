/**
 * Fetch logs access token
 */
export const fetchLogsAccessToken = (accountIdentifier: string) => {
  // TODO: remove once the implementtaiton on the infrastruture is done
  const headers = { 'X-Harness-Token': 'c76e567a-b341-404d-a8dd-d9738714eb82' }
  return fetch(`/gateway/log-service/token?accountID=${accountIdentifier}`, { headers }).then(response =>
    response.text()
  )
}
