export async function getKeplr(): Promise<any | undefined> {
  if ((window as any).keplr) {
    return (window as any).keplr;
  }

  if (document.readyState === "complete") {
    return (window as any).keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve((window as any).keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
}
