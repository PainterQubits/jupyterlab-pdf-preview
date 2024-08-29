# JupyterLab PDF Preview

[![PyPI Latest Release](https://img.shields.io/pypi/v/jupyterlab-pdf-preview)](https://pypi.org/project/jupyterlab-pdf-preview/)
[![PyPI Python Versions](https://img.shields.io/pypi/pyversions/jupyterlab-pdf-preview)](https://pypi.org/project/jupyterlab-pdf-preview/)
[![License](https://img.shields.io/pypi/l/jupyterlab-pdf-preview)](https://github.com/PainterQubits/jupyterlab-pdf-preview/blob/main/LICENSE)
[![CI](https://github.com/PainterQubits/jupyterlab-pdf-preview/actions/workflows/ci.yml/badge.svg)](https://github.com/PainterQubits/jupyterlab-pdf-preview/actions/workflows/ci.yml)

JupyterLab extension to preview PDF files in the file browser on hover.

## Installation

Install the latest version of JupyterLab PDF Preview using pip:

```
pip install -U jupyterlab-pdf-preview
```

This extension should run alongside
[JupyterLab](https://jupyterlab.readthedocs.io/en/stable/getting_started/installation.html)
version 4.

## Development

To develop, the following dependencies must be installed:

- [Python](https://www.python.org/downloads/)
- [Hatch](https://hatch.pypa.io/latest/install/)
- [Node.js](https://nodejs.org/en/download)

To build the extension and start up a JupyterLab server for development, run:

```bash
hatch run dev
```

When the source code changes, the extension should be automatically rebuilt, and the
updated extension will be used when the page is reloaded.

> [!NOTE]  
> On Windows, symbolic links must be activated for `hatch run dev` to work. On Windows 10
> or above, this can be done by
> [activating developer mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development).
>
> Alternatively, you can run
>
> ```bash
> hatch run clean
> hatch env remove default
> hatch run jupyter lab
> ```
>
> to completely reinstall the extension and start JupyterLab each time the source code
> changes.
