type TextField = {
  type: "text";
  defaultValue?: string;
}

type TextFAreaField = {
  type: "textarea";
  defaultValue?: string;
}

type BooleanField = {
  type: "boolean";
  defaultValue?: boolean;
}

type NumberField = {
  type: "number";
  defaultValue?: number;
}

type BaseField = {
  name: string;
}

type File = {
  isFolder: false;
}

type Folder = {
  isFolder: true;
  filenameField: string;
}

type BaseConfig = {
  // this must be the same as the markdown/folder name (except index page, the markdown name of which should be index)
  url: string;
  name: string;
  fields: {
    // propName = front matter variable name = page component property name
    [propName: string]: (TextField | TextFAreaField | BooleanField | NumberField) & BaseField
  };
}

export type CmsConfig = (BaseConfig & File) | (BaseConfig & Folder)

export const TEMPLATE_FILE_NAME = '_'