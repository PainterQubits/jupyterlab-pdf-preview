import { Contents } from "@jupyterlab/services";
import { FileBrowser, DirListing } from "@jupyterlab/filebrowser";

// Types for the modifications applied in applyModifications().
declare module "@jupyterlab/filebrowser" {
  interface FileBrowser {
    /** The DirListing for this FileBrowser. */
    get dirListing(): DirListing;
  }

  interface DirListing {
    /** Models for items in the DirListing. */
    get itemModels(): Contents.IModel[];

    /** Nodes for items in the DirListing. */
    get itemNodes(): HTMLElement[];
  }
}

/** Apply modifications to JupyterLab classes. */
export default function applyModifications() {
  // Add a getter method to access the DirListing for a FileBrowser
  Object.defineProperty(FileBrowser.prototype, "dirListing", {
    get() {
      return this.listing;
    },
  });

  // Add a getter method to access the models for items in the DirListing
  Object.defineProperty(DirListing.prototype, "itemModels", {
    get() {
      return this._sortedItems;
    },
  });

  // Add a getter method to access the Nodes for items in the DirListing
  Object.defineProperty(DirListing.prototype, "itemNodes", {
    get() {
      return this._items;
    },
  });
}
