declare module 'pino-http' {
  import { IncomingMessage, ServerResponse } from 'http';
  import { Logger } from 'pino';

  interface Options {
    logger?: Logger;
    autoLogging?: boolean | { ignore?: (req: IncomingMessage) => boolean };
    quietReqLogger?: boolean;
    quietResLogger?: boolean;
    wrapSerializers?: boolean;
    redact?: string[];
    level?: string;
    customAttributeKeys?: Record<string, string>;
  }

  function pinoHttp(opts?: Options): (req: IncomingMessage, res: ServerResponse, next?: () => void) => void;

  export = pinoHttp;
}
