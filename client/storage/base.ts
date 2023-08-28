export class Storage<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  set(data: T) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  get(defaultString = "{}"): T {
    return JSON.parse(localStorage.getItem(this.key) || defaultString);
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
