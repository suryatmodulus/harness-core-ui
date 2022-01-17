/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const EDITOR_BASE_DARK_THEME = 'vs-dark'
export const EDITOR_BASE_LIGHT_THEME = 'vs'
/* Dark theme colors */
export const EDITOR_DARK_BG = '4F5162'
export const EDITOR_DARK_FG = 'b8bfca'
export const EDITOR_DARK_SELECTION = '91999466'
export const EDITOR_WHITESPACE = '666C6880'
export const EDITOR_DARK_TYPE = '25a6f7'

/* Light theme colors */
export const EDITOR_LIGHT_BG = 'FFFFFF'

/* Common colors */
const EDITOR_COMMENT = '9aa5b5'
const EDITOR_LIGHT_TYPE = '1D76FF'
const EDITOR_LIGHT_STRING = '22272D'

export const EditorTheme = {
  LIGHT: [
    { token: 'type', foreground: `#${EDITOR_LIGHT_TYPE}` },
    { token: 'string', foreground: `#${EDITOR_LIGHT_STRING}` },
    { token: 'comment', foreground: `#${EDITOR_COMMENT}` }
  ],
  DARK: [
    { token: 'type', foreground: `#${EDITOR_DARK_TYPE}` },
    { token: 'string', foreground: `#${EDITOR_DARK_FG}` },
    { token: 'comment', foreground: `#${EDITOR_COMMENT}` }
  ]
}

export const DEFAULT_EDITOR_HEIGHT = 600
export const MIN_SNIPPET_SECTION_WIDTH = 400

export const TRIGGER_CHARS_FOR_NEW_EXPR = ['+']
export const TRIGGER_CHAR_FOR_PARTIAL_EXPR = '.'
export const KEY_CODE_FOR_PLUS_SIGN = 'Equal'
export const ANGULAR_BRACKET_CHAR = '<'
export const KEY_CODE_FOR_SEMI_COLON = 'Semicolon'
export const KEY_CODE_FOR_PERIOD = 'Period'
export const KEY_CODE_FOR_SPACE = 'Space'
export const KEY_CODE_FOR_CHAR_Z = 'KeyZ'

export const MAX_ERR_MSSG_LENGTH = 80
