declare module 'xlsx' {
  interface WorkSheet {
    [key: string]: any;
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  interface XLSX {
    utils: {
      json_to_sheet: (data: any[]) => WorkSheet;
      book_new: () => WorkBook;
      book_append_sheet: (wb: WorkBook, ws: WorkSheet, name?: string) => void;
    };
    write: (wb: WorkBook, opts: { bookType: string; type: string }) => any;
  }

  const XLSX: XLSX;
  export = XLSX;
} 