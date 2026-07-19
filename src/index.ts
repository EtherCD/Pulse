import { mkdirSync, readFile, writeFile } from "node:fs";
import { TypeScriptGenerator } from "./gen/typescript";
import PulseLexer from "./lexer";
import { ParserPackage, PulseParser } from "./parser";
import { Validator } from "./validator";
import { cli, define } from "gunshi";
import path from "node:path";
import { RustGenerator } from "./gen/rust";

(async () => {
  const processFile = (content: string): ParserPackage[] => {
    const lexer = new PulseLexer(content);
    const tokens = lexer.tokenize();
    const parser = new PulseParser(tokens);
    const parsed = parser.parse();
    new Validator(parsed).validate();
    return parsed;
  };

  const compile = define({
    name: "compile",
    description:
      "Compiles *.pulse files into source code for selected languages.",
    examples: "compile -f main.pulse --typescript -o build",
    args: {
      typescript: {
        type: "boolean",
        description: "Compile files into TypeScript",
      },
      rust: {
        type: "boolean",
        description: "Compile files into Rust",
      },
      file: {
        type: "string",
        short: "f",
        description: "File to compile",
      },
      dir: {
        type: "string",
        short: "d",
        description: "A directory for compilation",
      },
      out: {
        type: "string",
        short: "o",
        description: "A directory for compiled files",
      },
    },
    run: (ctx) => {
      const { file, dir, out } = ctx.values;

      if (!file && !dir) {
        console.error("Specify the file/directory to compile.");
      }

      if (file) {
        readFile(file, (err, data) => {
          if (err) {
            console.error("Could not open the file");
            return;
          }
          let filePath: string = file
            .split(".")
            .filter((val) => val != "pulse")
            .join("");
          const parsedFile = processFile(data + "");
          if (out) {
            filePath = path.join(
              out,
              filePath
                .split("/")
                .filter((_, i, arr) => i == arr.length - 1)
                .join("/"),
            );
            try {
              mkdirSync(out);
            } catch (e) {}
          }
          if (ctx.values.typescript) {
            const generator = new TypeScriptGenerator(parsedFile);
            generator.generate();
            const fileName = filePath + ".ts";
            writeFile(fileName, generator.finish(), {}, (error) => {
              if (err) console.error("Failed to write the file");
              else
                console.info(
                  `File ${file} successfully compiled into file ${fileName}`,
                );
            });
          }
          if (ctx.values.rust) {
            const generator = new RustGenerator(parsedFile);
            generator.generate();
            const fileName = filePath + ".rs";
            writeFile(fileName, generator.finish(), {}, (error) => {
              if (err) console.error("Failed to write the file");
              else
                console.info(
                  `File ${file} successfully compiled into file ${fileName}`,
                );
            });
          }
        });
      }
    },
  });

  await cli(process.argv.slice(2), compile);
})();
