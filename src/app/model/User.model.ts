export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private expirationDate: Date
  ) {}

  get token() {
    if (!this.expirationDate || this.expirationDate > new Date()) {
      return null;
    } else {
      return this._token;
    }
  }
}
