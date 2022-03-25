type BrowserStorage = typeof localStorage | typeof sessionStorage;

const DEFAULT_PREFIX = "";

class Storage {
  private prefix: string;
  private storage: BrowserStorage;

  constructor(storage: BrowserStorage, prefix = DEFAULT_PREFIX) {
    this.prefix = prefix;
    this.storage = storage;
  }

  private prefixKey = (key: string): string => {
    return `${this.prefix}${key}`;
  };

  public getItem = <T>(key: string): T | undefined => {
    const fullKey = this.prefixKey(key);
    let saved: string | null = null;
    try {
      saved = this.storage.getItem(fullKey);
    } catch (err) {
      console.error(err);
      return undefined;
    }

    if (!saved || saved === "undefined") return undefined;

    try {
      return JSON.parse(saved) as T;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  };

  public setItem = <T>(key: string, item: T): void => {
    const fullKey = this.prefixKey(key);
    try {
      this.storage.setItem(fullKey, JSON.stringify(item));
    } catch (err) {
      console.error(err);
    }
  };

  public removeItem = (key: string): void => {
    const fullKey = this.prefixKey(key);
    try {
      this.storage.removeItem(fullKey);
    } catch (err) {
      console.error(err);
    }
  };
}

export default Storage;
