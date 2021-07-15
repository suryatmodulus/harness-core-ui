# String Externalization and Internaltionalization

We do not hardcode strings inside the code (Except for debugging messages).
We write all our strings in a `YAML` file.
The files follows `strings.<language id>.yaml` convention. For example, a
strings file for English language shall be named `strings.en.yaml`.
Each module has `strings` folder where all the string files reside. Correct
language be automtically loaded based on the user's preference.

> Note: All the examples in this document will use `.en` by default for all the
> examples.

## API

These strings can be accessed either by using the `<String/>` component or using
the `useStrings` hook.

```tsx
import { String, useStrings } from 'framework/strings'

// via component
<String stringID="myKey" />

// via hooks
const { getString } = useStrings()

<div>{getString("myKey")}</div>
```

### Namespacing and Nested Objects

The strings are namespaced according to the module. What this means is if you
want to access a string defined in `10-common/strings/string.en.yaml`, it will
be available under `common.` key.

You can also use nested objects using dot notation. We use [lodash's get](https://lodash.com/docs/#get) method
to resolve the path.

Example:

```tsx
/* 10-common/strings/strings.en.yaml
foo:
  bar: "Foo Bar"
*/

/* 70-pipeline/strings/strings.en.yaml
foo:
  bar: "Foo Baz"
*/

<String stringID="common.foo.bar" /> // Foo Bar
<String stringID="pipeline.foo.bar" /> // Foo Baz
```

### Templating

We use [mustache.js](https://github.com/janl/mustache.js/) to provide templating
support in the strings.

```tsx
/**
 * myKey: "Hello {{ name }}"
 */

// component
<String stringId="myKey" vars={{ name: "World!"}}/> // Hello World!

// hook
const { getString } = useStrings()

<div>{getString("myKey", { name: "World!" })}</div> // Hello World!
```

### Self Referencing

We also support self referencing in the strings via a special variable `$`.
This self referencing is limited to one level for performance reasons and avoid
circular referencing.

```tsx
/**
 * hello: "Hello"
 * myKey: "{{ $.hello }} World"
 * myKey2: "{{ $.myKey }} Again"
 */

// component
<String stringId="myKey"> // Hello World
<String stringId="myKey2"/> // Hello World

// hook
const { getString } = useStrings()

<div>{getString("myKey")}</div> // Hello World!
<div>{getString("myKey2")}</div> // {{ $.hello }} World Again
```

### Things to remember

- Duplicate strings values are not allowed.
- You can run `yarn strings` locally to check any issues with strings.
- Always commit any changes to `src/stringTypes.ts`.
