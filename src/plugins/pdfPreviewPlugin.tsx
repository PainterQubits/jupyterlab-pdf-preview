import { useState, useEffect } from "react";
import { pdfjs, Document, Thumbnail } from "react-pdf";
import { ISignal, Signal } from "@lumino/signaling";
import { JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import { IDefaultFileBrowser } from "@jupyterlab/filebrowser";
import { ReactWidget, UseSignal } from "@jupyterlab/ui-components";
import { PDF_MIMETYPE, PDF_PREVIEW_WIDTH, PDF_PREVIEW_BORDER_WIDTH } from "@/constants";
import { calcPdfPreviewPosition } from "@/utils";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?file-url";

// Set the URL for the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const pdfPreviewStyle = {
  display: "none",
  position: "fixed",
  zIndex: 100,
  overflow: "hidden",
  border: `${PDF_PREVIEW_BORDER_WIDTH}px solid var(--jp-border-color1)`,
  background: "white",
} as const;

type PdfComponentProps = {
  /** PDF content as a base64 string. */
  pdfContent: string;
  /** Mouse X position. */
  clientX: number;
  /** Mouse Y position. */
  clientY: number;
  /** Closest positioned ancestor element. */
  parentElement: Element;
};

/** PDF preview component. */
function PdfComponent({
  pdfContent,
  clientX,
  clientY,
  parentElement,
}: PdfComponentProps) {
  const [renderedHeight, setRenderedHeight] = useState<number | null>(null);

  // Reset rendered height when the PDF content changes
  useEffect(() => {
    setRenderedHeight(null);
  }, [pdfContent]);

  // If rendered, compute styles that determine position
  let positionStyle = {};
  if (renderedHeight !== null) {
    const { top, left, hide } = calcPdfPreviewPosition(
      clientX,
      clientY,
      parentElement,
      renderedHeight,
    );
    if (!hide) {
      positionStyle = { display: undefined, top, left };
    }
  }

  return (
    <div style={{ ...pdfPreviewStyle, ...positionStyle }}>
      <Document file={`data:${PDF_MIMETYPE};base64,${pdfContent}`}>
        <Thumbnail
          pageNumber={1}
          width={PDF_PREVIEW_WIDTH}
          onRenderSuccess={({ height }: { height: number }) => setRenderedHeight(height)}
        />
      </Document>
    </div>
  );
}

type SignalPdfComponentProps = {
  /** The PDF component will rerender when this signal emits. */
  update: ISignal<PdfPreviewWidget, void>;
  /** Props for the PDF component. */
  props: PdfComponentProps;
};

/** Wrapper around a PdfComponent that can update in response to a Lumino signal. */
function SignalPdfComponent({ update, props }: SignalPdfComponentProps) {
  return <UseSignal signal={update}>{() => <PdfComponent {...props} />}</UseSignal>;
}

/** Widget that renders a preview of a PDF. */
class PdfPreviewWidget extends ReactWidget {
  constructor(pdfComponentProps: PdfComponentProps) {
    super();
    this._props = pdfComponentProps;
  }

  protected render() {
    return <SignalPdfComponent update={this._update} props={this._props} />;
  }

  /** Update the PDF content. */
  updatePdfContent(pdfContent: string) {
    this._props.pdfContent = pdfContent;
    this._update.emit();
  }

  /**
   * Update the position of the PDF preview based on the mouse position and the closest
   * positioned ancestor element.
   */
  updatePosition(clientX: number, clientY: number, parentElement: Element) {
    this._props.clientX = clientX;
    this._props.clientY = clientY;
    this._props.parentElement = parentElement;
    this._update.emit();
  }

  private _props: PdfComponentProps;
  private _update = new Signal<this, void>(this);
}

/** Plugin that displays previews of PDF files in the file browser on hover. */
export const pdfPreviewPlugin: JupyterFrontEndPlugin<void> = {
  id: "jupyterlab-pdf-preview:plugin",
  description: "Preview PDF files in the file browser on hover.",
  autoStart: true,
  requires: [IDefaultFileBrowser],
  activate({ serviceManager }: JupyterFrontEnd, fileBrowser: IDefaultFileBrowser) {
    const { dirListing, node: fileBrowserNode } = fileBrowser;

    const pdfState: {
      /** The PDF preview widget, or null if none exists. */
      pdfPreviewWidget: PdfPreviewWidget | null;
      /**
       * The path of the current PDF being previewed, or null if no PDF is being
       * previewed.
       */
      currentPdfPath: string | null;
    } = { pdfPreviewWidget: null, currentPdfPath: null };

    fileBrowserNode.addEventListener("mouseover", ({ target, clientX, clientY }) => {
      const { itemNodes, itemModels } = dirListing;

      // Determine if the mouse is over a PDF file item, and if so, extract the file path
      // to the corresponding PDF
      let pdfPath: string | null = null;
      if (target instanceof Node) {
        for (let i = 0; i < itemNodes.length; ++i) {
          if (itemNodes[i].contains(target)) {
            const { path, mimetype } = itemModels[i];
            if (mimetype === PDF_MIMETYPE) {
              pdfPath = path;
              break;
            }
          }
        }
      }

      // Stop here if the PDF path has not changed; otherwise, update the current PDF path
      if (pdfPath === pdfState.currentPdfPath) {
        return;
      }
      pdfState.currentPdfPath = pdfPath;

      // If the mouse is over a PDF file item, display the PDF preview widget; otherwise,
      // dispose of any existing PDF previews
      if (pdfPath !== null) {
        (async () => {
          // Fetch the PDF content
          const { content: pdfContent }: { content: string } =
            await serviceManager.contents.get(pdfPath);

          // Since fetching the file content is asynchronous, check that the mouse is
          // still over the same PDF file before continuing
          if (pdfPath !== pdfState.currentPdfPath) {
            return;
          }

          // Create a new PDF preview widget if one does not exist or is disposed;
          // otherwise, update the content of the existing widget
          const { pdfPreviewWidget } = pdfState;
          if (pdfPreviewWidget === null || pdfPreviewWidget.isDisposed) {
            const newPdfPreview = new PdfPreviewWidget({
              pdfContent,
              clientX,
              clientY,
              parentElement: fileBrowserNode,
            });
            fileBrowser.addWidget(newPdfPreview);
            pdfState.pdfPreviewWidget = newPdfPreview;
          } else {
            pdfPreviewWidget.updatePdfContent(pdfContent);
          }
        })();
      } else if (
        pdfState.pdfPreviewWidget !== null &&
        !pdfState.pdfPreviewWidget.isDisposed
      ) {
        pdfState.pdfPreviewWidget.dispose();
      }
    });

    // Dispose of any existing PDF previews when the mouse leaves the file browser
    fileBrowserNode.addEventListener("mouseleave", () => {
      pdfState.currentPdfPath = null;
      const { pdfPreviewWidget } = pdfState;
      if (pdfPreviewWidget !== null && !pdfPreviewWidget.isDisposed) {
        pdfPreviewWidget.dispose();
      }
    });

    // Update the PDF preview position when the mouse moves over the file browser
    fileBrowserNode.addEventListener("mousemove", ({ clientX, clientY }) => {
      const { pdfPreviewWidget } = pdfState;
      if (pdfPreviewWidget !== null && !pdfPreviewWidget.isDisposed) {
        pdfPreviewWidget.updatePosition(clientX, clientY, fileBrowserNode);
      }
    });
  },
};
