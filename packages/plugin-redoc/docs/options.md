# Options

`pluginRedoc()` accepts a single option, the path of the HTML file it writes. It takes none of the [shared plugin options](https://kubb.dev/docs/5.x/reference/plugin-options).

## Options overview

| Option              | Purpose                                 | Default                 |
| ------------------- | --------------------------------------- | ----------------------- |
| [`output`](#output) | Where the HTML file is written: `path`. | `{ path: 'docs.html' }` |

## Option details

### output

Where the generated Redoc HTML file is written.

|          |                         |
| -------- | ----------------------- |
| Type     | `{ path: string }`      |
| Required | `false`                 |
| Default  | `{ path: 'docs.html' }` |

#### output.path

File path of the generated HTML, resolved against the global `output.path`. Unlike most plugins, this points at a single file, not a directory. End the path with `.html`. Without `.html`, Kubb writes the file at that exact path, with no extension.

|          |               |
| -------- | ------------- |
| Type     | `string`      |
| Required | `false`       |
| Default  | `'docs.html'` |

With `output.path` set to `'docs.html'` and the global `output.path` set to `'./src/gen'`, the plugin writes one file:

```text
src/
└── gen/
    └── docs.html
```
