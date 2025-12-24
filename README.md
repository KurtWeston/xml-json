# xml-json

Bidirectional CLI converter between XML and JSON with attribute preservation and smart array detection

## Features

- Convert XML files to JSON with preserved attributes using @ prefix convention
- Convert JSON files back to XML with proper element and attribute reconstruction
- Smart array detection for repeated XML elements (convert to JSON arrays automatically)
- Preserve XML namespaces and handle namespace prefixes correctly
- Support for CDATA sections and mixed content nodes
- Pretty-print output with configurable indentation (2 or 4 spaces)
- Batch processing mode to convert multiple files in a directory
- Stdin/stdout support for piping data through the converter
- Multiple conversion strategies: compact (attributes as properties) vs explicit (separate attributes object)
- Validation mode to check if XML is well-formed before conversion
- Option to strip or preserve XML comments during conversion
- Handle self-closing tags and empty elements correctly in both directions

## How to Use

Use this project when you need to:

- Quickly solve problems related to xml-json
- Integrate typescript functionality into your workflow
- Learn how typescript handles common patterns

## Installation

```bash
# Clone the repository
git clone https://github.com/KurtWeston/xml-json.git
cd xml-json

# Install dependencies
npm install
```

## Usage

```bash
npm start
```

## Built With

- typescript

## Dependencies

- `fast-xml-parser`
- `commander`
- `chalk`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
