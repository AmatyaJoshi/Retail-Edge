declare module 'express-fileupload' {
  import { Request, Response, NextFunction } from 'express';

  export interface UploadedFile {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    mv(path: string, callback: (error: Error) => void): void;
    mv(path: string): Promise<void>;
  }

  interface FileUploadOptions {
    debug?: boolean;
    useTempFiles?: boolean;
    tempFileDir?: string;
    createParentPath?: boolean;
    abortOnLimit?: boolean;
    responseOnLimit?: string;
    limitHandler?: (req: Request, res: Response, next: NextFunction) => void;
    uploadTimeout?: number;
    safeFileNames?: boolean;
    preserveExtension?: boolean | string;
    uriDecodeFileNames?: boolean;
    parseNested?: boolean;
    useRelativePath?: boolean;
    defCharset?: string;
    defParamCharset?: string;
    limits?: {
      fileSize?: number;
    };
  }

  interface FileArray {
    [key: string]: UploadedFile | UploadedFile[];
  }

  interface RequestWithFiles extends Request {
    files?: FileArray;
  }

  function fileUpload(options?: FileUploadOptions): any;
  export = fileUpload;
} 