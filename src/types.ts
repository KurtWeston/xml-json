export interface ConversionOptions {
  pretty: boolean;
  indent: number;
  strategy: 'compact' | 'explicit';
  arrays: string[];
  preserveAttributes: boolean;
  preserveComments: boolean;
  validate: boolean;
}

export interface XMLParserOptions {
  ignoreAttributes: boolean;
  attributeNamePrefix: string;
  textNodeName: string;
  ignoreDeclaration: boolean;
  ignorePiTags: boolean;
  parseTagValue: boolean;
  parseAttributeValue: boolean;
  trimValues: boolean;
  cdataPropName: string;
  commentPropName: string;
  isArray?: (tagName: string, jPath: string, isLeafNode: boolean, isAttribute: boolean) => boolean;
}

export interface ConversionResult {
  success: boolean;
  output?: string;
  error?: string;
}

export type FileFormat = 'xml' | 'json' | 'unknown';