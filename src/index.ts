#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import chalk from 'chalk';
import { log } from '@onamfc/developer-log';
import { Converter } from './converter';
import { ConversionOptions } from './types';

const program = new Command();

program
  .name('xml-json')
  .description('Bidirectional CLI converter between XML and JSON')
  .version('1.0.0')
  .argument('[input]', 'Input file or directory (omit for stdin)')
  .option('-o, --output <file>', 'Output file (omit for stdout)')
  .option('-p, --pretty', 'Pretty print output', false)
  .option('-i, --indent <spaces>', 'Indentation spaces', '2')
  .option('-s, --strategy <type>', 'Conversion strategy (compact|explicit)', 'compact')
  .option('-a, --arrays <elements>', 'Comma-separated list of elements to treat as arrays', '')
  .option('--no-attributes', 'Strip attributes during conversion')
  .option('--preserve-comments', 'Keep XML comments', false)
  .option('-v, --validate', 'Validate input before conversion', false)
  .option('-b, --batch', 'Process all files in directory', false)
  .action(async (input, options) => {
    try {
      const convOptions: ConversionOptions = {
        pretty: options.pretty,
        indent: parseInt(options.indent, 10),
        strategy: options.strategy as 'compact' | 'explicit',
        arrays: options.arrays ? options.arrays.split(',').map((s: string) => s.trim()) : [],
        preserveAttributes: options.attributes,
        preserveComments: options.preserveComments,
        validate: options.validate
      };

      const converter = new Converter(convOptions);

      if (options.batch && input) {
        processBatch(input, options.output, converter, convOptions);
      } else if (input) {
        processSingleFile(input, options.output, converter);
      } else {
        processStdin(options.output, converter);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error(chalk.red(`Error: ${message}`));
      process.exit(1);
    }
  });

function processSingleFile(inputPath: string, outputPath: string | undefined, converter: Converter): void {
  const inputData = readFileSync(inputPath, 'utf-8');
  const format = converter.detectFormat(inputData);

  if (format === 'unknown') {
    throw new Error('Unable to detect input format');
  }

  const result = format === 'xml' ? converter.xmlToJson(inputData) : converter.jsonToXml(inputData);

  if (!result.success) {
    throw new Error(result.error);
  }

  if (outputPath) {
    writeFileSync(outputPath, result.output!);
    log.info(chalk.green(`✓ Converted ${inputPath} → ${outputPath}`));
  } else {
    console.log(result.output);
  }
}

function processBatch(dirPath: string, outputDir: string | undefined, converter: Converter, options: ConversionOptions): void {
  const files = readdirSync(dirPath);
  let processed = 0;

  for (const file of files) {
    const fullPath = join(dirPath, file);
    if (!statSync(fullPath).isFile()) continue;

    const ext = extname(file).toLowerCase();
    if (ext !== '.xml' && ext !== '.json') continue;

    try {
      const inputData = readFileSync(fullPath, 'utf-8');
      const format = converter.detectFormat(inputData);
      const result = format === 'xml' ? converter.xmlToJson(inputData) : converter.jsonToXml(inputData);

      if (result.success) {
        const newExt = format === 'xml' ? '.json' : '.xml';
        const outputFile = file.replace(ext, newExt);
        const outputPath = outputDir ? join(outputDir, outputFile) : join(dirPath, outputFile);
        writeFileSync(outputPath, result.output!);
        log.info(chalk.green(`✓ ${file} → ${outputFile}`));
        processed++;
      }
    } catch (error) {
      log.warn(chalk.yellow(`⚠ Skipped ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  log.info(chalk.blue(`\nProcessed ${processed} file(s)`));
}

function processStdin(outputPath: string | undefined, converter: Converter): void {
  let inputData = '';
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', (chunk) => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    const format = converter.detectFormat(inputData);
    if (format === 'unknown') {
      log.error(chalk.red('Unable to detect input format from stdin'));
      process.exit(1);
    }

    const result = format === 'xml' ? converter.xmlToJson(inputData) : converter.jsonToXml(inputData);

    if (!result.success) {
      log.error(chalk.red(`Conversion failed: ${result.error}`));
      process.exit(1);
    }

    if (outputPath) {
      writeFileSync(outputPath, result.output!);
      log.info(chalk.green(`✓ Output written to ${outputPath}`));
    } else {
      console.log(result.output);
    }
  });
}

program.parse();