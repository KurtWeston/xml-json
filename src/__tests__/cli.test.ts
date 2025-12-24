import { Converter } from '../converter';
import { ConversionOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('@onamfc/developer-log');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('CLI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('File Processing', () => {
    it('should read and convert XML file', () => {
      const xmlContent = '<root><name>test</name></root>';
      mockFs.readFileSync.mockReturnValue(xmlContent);
      
      const options: ConversionOptions = {
        pretty: false,
        indent: 2,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const result = converter.xmlToJson(xmlContent);
      
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should write converted output to file', () => {
      const jsonContent = '{"root": {"name": "test"}}';
      const options: ConversionOptions = {
        pretty: true,
        indent: 4,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const result = converter.jsonToXml(jsonContent);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<root>');
    });
  });

  describe('Options Handling', () => {
    it('should apply pretty print option', () => {
      const options: ConversionOptions = {
        pretty: true,
        indent: 2,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const xml = '<root><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.output).toContain('\n');
    });

    it('should apply indent option', () => {
      const options: ConversionOptions = {
        pretty: true,
        indent: 4,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const xml = '<root><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.output).toContain('    ');
    });

    it('should handle arrays option', () => {
      const options: ConversionOptions = {
        pretty: false,
        indent: 2,
        strategy: 'compact',
        arrays: ['item', 'element'],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const xml = '<root><item>1</item><item>2</item></root>';
      const result = converter.xmlToJson(xml);
      
      const parsed = JSON.parse(result.output!);
      expect(Array.isArray(parsed.root.item)).toBe(true);
    });

    it('should strip attributes when preserveAttributes is false', () => {
      const options: ConversionOptions = {
        pretty: false,
        indent: 2,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: false,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const xml = '<root id="123"><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.output).not.toContain('@id');
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => {
        mockFs.readFileSync('nonexistent.xml', 'utf-8');
      }).toThrow('File not found');
    });

    it('should handle conversion errors', () => {
      const options: ConversionOptions = {
        pretty: false,
        indent: 2,
        strategy: 'compact',
        arrays: [],
        preserveAttributes: true,
        preserveComments: false,
        validate: false
      };
      
      const converter = new Converter(options);
      const result = converter.xmlToJson('<invalid><xml>');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
