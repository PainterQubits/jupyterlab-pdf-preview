# JupyterLab PDF Preview

JupyterLab extension to preview PDF files in the file browser on hover.

## Installation

Coming soon.

## Development

To develop, the following dependencies must be installed:

- [Python](https://www.python.org/downloads/)
- [Hatch](https://hatch.pypa.io/latest/install/)
- [Node.js](https://nodejs.org/en/download)

To build the extension and start up a JupyterLab server for development, run:

```bash
hatch run jlpm dev
```

When the source code changes, the extension should be automatically rebuilt, and the
updated extension will be used when the page is reloaded.

> [!NOTE]  
> On Windows, symbolic links must be activated for `hatch run jlpm dev` to work. On
> Windows 10 or above, this can be done by
> [activating developer mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development).
>
> Alternatively, you can run
>
> ```bash
> hatch run jlpm clean
> hatch env remove default
> hatch run jupyter lab
> ```
>
> to completely reinstall the extension and start JupyterLab each time the source code
> changes.
