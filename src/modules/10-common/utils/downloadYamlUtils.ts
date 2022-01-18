/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * @description Downloads YAML response as a file
 *
 * @param yamlResponse YAML file/response received
 * @param fileName Name of the file to be downlaoded
 * @returns Promise resolving to an object with status as boolean
 */
const downloadYamlAsFile = async (yamlResponse: any, fileName: string): Promise<{ status: boolean }> => {
  try {
    const response = new Response(yamlResponse)
    const blob = await (response as any).blob()
    const file = new Blob([blob], { type: 'application/yaml' })
    const data = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.style.display = 'none'
    anchor.href = data
    anchor.download = fileName
    anchor.click()
    // For Firefox
    setTimeout(() => {
      anchor.remove()
      // Release resource on disk after triggering the download
      window.URL.revokeObjectURL(data)
    }, 100)
    return { status: true }
  } catch (e) {
    return { status: false }
  }
}

export { downloadYamlAsFile }
