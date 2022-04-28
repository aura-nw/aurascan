import { Window as KeplrWindow } from "@keplr-wallet/types";

declare module '@ckeditor/ckeditor5-build-classic' {
	const ClassicEditorBuild: any;
	export = ClassicEditorBuild;
}


declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow { }
}