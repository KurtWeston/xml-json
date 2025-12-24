import { Converter } from '../converter';
import { ConversionOptions } from '../types';

describe('Converter', () => {
  const defaultOptions: ConversionOptions = {
    pretty: false,
    indent: 2,
    strategy: 'compact',
    arrays: [],
    preserveAttributes: true,
    preserveComments: false,
    validate: false
  };

  describe('detectFormat', () => {
    it('should detect XML format', () => {
      const converter = new Converter(defaultOptions);
      expect(converter.detectFormat('<root></root>')).toBe('xml');
      expect(converter.detectFormat('  <root></root>  ')).toBe('xml');
    });

    it('should detect JSON format', () => {
      const converter = new Converter(defaultOptions);
      expect(converter.detectFormat('{"key": "value"}')).toBe('json');
      expect(converter.detectFormat('[1, 2, 3]')).toBe('json');
    });

    it('should return unknown for invalid format', () => {
      const converter = new Converter(defaultOptions);
      expect(converter.detectFormat('plain text')).toBe('unknown');
      expect(converter.detectFormat('')).toBe('unknown');
    });
  });

  describe('xmlToJson', () => {
    it('should convert simple XML to JSON', () => {
      const converter = new Converter(defaultOptions);
      const xml = '<root><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      const parsed = JSON.parse(result.output!);
      expect(parsed.root.name).toBe('test');
    });

    it('should preserve attributes with @ prefix', () => {
      const converter = new Converter(defaultOptions);
      const xml = '<root id="123"><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!);
      expect(parsed.root['@id']).toBe('123');
    });

    it('should handle arrays with repeated elements', () => {
      const options = { ...defaultOptions, arrays: ['item'] };
      const converter = new Converter(options);
      const xml = '<root><item>1</item><item>2</item></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!);
      expect(Array.isArray(parsed.root.item)).toBe(true);
    });

    it('should pretty print when option enabled', () => {
      const options = { ...defaultOptions, pretty: true, indent: 2 };
      const converter = new Converter(options);
      const xml = '<root><name>test</name></root>';
      const result = converter.xmlToJson(xml);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('\n');
    });

    it('should handle invalid XML', () => {
      const converter = new Converter(defaultOptions);
      const xml = '<root><unclosed>';
      const result = converter.xmlToJson(xml);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('jsonToXml', () => {
    it('should convert simple JSON to XML', () => {
      const converter = new Converter(defaultOptions);
      const json = '{"root": {"name": "test"}}';
      const result = converter.jsonToXml(json);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<root>');
      expect(result.output).toContain('<name>test</name>');
    });

    it('should convert attributes from @ prefix', () => {
      const converter = new Converter(defaultOptions);
      const json = '{"root": {"@id": "123", "name": "test"}}';
      const result = converter.jsonToXml(json);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('id="123"');
    });

    it('should handle arrays as repeated elements', () => {
      const converter = new Converter(defaultOptions);
      const json = '{"root": {"item": ["1", "2"]}}';
      const result = converter.jsonToXml(json);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<item>1</item>');
      expect(result.output).toContain('<item>2</item>');
    });

    it('should handle invalid JSON', () => {
      const converter = new Converter(defaultOptions);
      const json = '{invalid json}';
      const result = converter.jsonToXml(json);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('bidirectional conversion', () => {
    it('should preserve data through XML->JSON->XML', () => {
      const converter = new Converter(defaultOptions);
      const originalXml = '<root id="123"><name>test</name></root>';
      
      const jsonResult = converter.xmlToJson(originalXml);
      expect(jsonResult.success).toBe(true);
      
      const xmlResult = converter.jsonToXml(jsonResult.output!);
      expect(xmlResult.success).toBe(true);
      expect(xmlResult.output).toContain('id="123"');
      expect(xmlResult.output).toContain('<name>test</name>');
    });
  });
});
