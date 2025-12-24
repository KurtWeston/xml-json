import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { log } from '@onamfc/developer-log';
import { ConversionOptions, XMLParserOptions, ConversionResult, FileFormat } from './types';

export class Converter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions) {
    this.options = options;
  }

  detectFormat(input: string): FileFormat {
    const trimmed = input.trim();
    if (trimmed.startsWith('<') && trimmed.includes('>')) return 'xml';
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) return 'json';
    return 'unknown';
  }

  xmlToJson(xml: string): ConversionResult {
    try {
      const parserOptions: XMLParserOptions = {
        ignoreAttributes: !this.options.preserveAttributes,
        attributeNamePrefix: '@',
        textNodeName: '#text',
        ignoreDeclaration: false,
        ignorePiTags: true,
        parseTagValue: true,
        parseAttributeValue: true,
        trimValues: true,
        cdataPropName: '#cdata',
        commentPropName: this.options.preserveComments ? '#comment' : '',
        isArray: (tagName: string) => this.options.arrays.includes(tagName)
      };

      const parser = new XMLParser(parserOptions);
      const result = parser.parse(xml);

      if (this.options.strategy === 'explicit') {
        this.transformToExplicit(result);
      }

      const output = this.options.pretty
        ? JSON.stringify(result, null, this.options.indent)
        : JSON.stringify(result);

      return { success: true, output };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error(`XML to JSON conversion failed: ${message}`);
      return { success: false, error: message };
    }
  }

  jsonToXml(json: string): ConversionResult {
    try {
      const data = JSON.parse(json);

      if (this.options.strategy === 'explicit') {
        this.transformFromExplicit(data);
      }

      const builderOptions = {
        ignoreAttributes: !this.options.preserveAttributes,
        attributeNamePrefix: '@',
        textNodeName: '#text',
        cdataPropName: '#cdata',
        commentPropName: this.options.preserveComments ? '#comment' : '',
        format: this.options.pretty,
        indentBy: ' '.repeat(this.options.indent),
        suppressEmptyNode: false,
        suppressBooleanAttributes: false
      };

      const builder = new XMLBuilder(builderOptions);
      const output = builder.build(data);

      return { success: true, output };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error(`JSON to XML conversion failed: ${message}`);
      return { success: false, error: message };
    }
  }

  private transformToExplicit(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (key.startsWith('@')) {
        const attrName = key.substring(1);
        if (!obj['@attributes']) obj['@attributes'] = {};
        obj['@attributes'][attrName] = obj[key];
        delete obj[key];
      } else {
        this.transformToExplicit(obj[key]);
      }
    }
  }

  private transformFromExplicit(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;

    if (obj['@attributes']) {
      for (const attr in obj['@attributes']) {
        obj[`@${attr}`] = obj['@attributes'][attr];
      }
      delete obj['@attributes'];
    }

    for (const key in obj) {
      this.transformFromExplicit(obj[key]);
    }
  }
}