import { ResponseError } from "./types";

export class ResponseException implements ResponseError {
  constructor(error: ResponseError) {
    this.errors = error.errors;
    this.status = error.status;
    this.title = error.title;
    this.traceId = error.traceId;
    this.type = error.type;

    Object.setPrototypeOf(this, ResponseException.prototype);
  }
  errors: { [key: string]: string[] };
  type: string;
  title: string;
  status: number;
  traceId: string;
}
