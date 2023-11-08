import {
  PDF_PREVIEW_WIDTH,
  PDF_PREVIEW_BORDER_WIDTH,
  PDF_PREVIEW_GAP,
} from "@/constants";

/**
 * Calculate the position of a PDF preview based on the mouse position, closest positioned
 * ancestor element, and PDF preview height. If the mouse would be over the preview in the
 * computed position, hide will be true, since the preview should be hidden.
 */
export function calcPdfPreviewPosition(
  clientX: number,
  clientY: number,
  parent: Element,
  pdfPreviewHeight: number,
) {
  // Retrieve position of the closest positioned ancestor element
  const {
    top: parentTop,
    left: parentLeft,
    width: maxX,
    height: maxY,
  } = parent.getBoundingClientRect();

  // Compute the mouse position relative to the closest positioned ancestor element
  const x = clientX - parentLeft;
  const y = clientY - parentTop;

  // Compute the preview width and height, including borders
  const previewWidth = PDF_PREVIEW_WIDTH + 2 * PDF_PREVIEW_BORDER_WIDTH;
  const previewHeight = pdfPreviewHeight + 2 * PDF_PREVIEW_BORDER_WIDTH;

  // Compute the preview width and height, including a gap
  const previewWidthWithGap = previewWidth + PDF_PREVIEW_GAP;
  const previewHeightWithGap = previewHeight + PDF_PREVIEW_GAP;

  // Compute the top coordinate of the preview
  const top =
    y + previewHeightWithGap > maxY // If there is not enough space below mouse
      ? Math.max(y - previewHeightWithGap, 0) // Place above mouse but within parent
      : y + PDF_PREVIEW_GAP; // Otherwise, place below mouse

  // Compute the left coordiante of the preview
  let left = Math.max(x - previewWidthWithGap, 0); // Left of mouse but within parent

  /** Whether the mouse is within the preview area. */
  const mouseOverPreview = () =>
    x >= left && x <= left + previewWidth && y >= top && y <= top + previewHeight;

  // If the mouse is over the preview area, place right of mouse but within parent
  if (mouseOverPreview()) {
    left = Math.min(x + PDF_PREVIEW_GAP, maxX - previewWidth);
  }

  return { top, left, hide: mouseOverPreview() };
}
