declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditorBuild: any;
  export = ClassicEditorBuild;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Window {
  handleCredentialResponse: (response: any) => void;
}
