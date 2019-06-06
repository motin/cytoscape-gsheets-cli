/* tslint:disable:no-console */

import { ArgumentParser } from "argparse";
import stackman from "stackman";
import { runGsheetCreate } from "./runGsheetCreate";
import { runGsheetExport } from "./runGsheetExport";
import { runGsheetFix } from "./runGsheetFix";
import { runGsheetImport } from "./runGsheetImport";

process.once("unhandledRejection", (err: Error, _p) => {
  console.log("Event: Unhandled Rejection");

  stackman().callsites(err, (stackmanErr, callsites) => {
    if (stackmanErr) {
      throw stackmanErr;
    }
    callsites.forEach(callsite => {
      console.log(
        "Error occured in at %s line %d",
        callsite.getFileName(),
        callsite.getLineNumber(),
      );
    });
  });

  console.error(err.stack, err);
  // debugger;
  process.exit(1);
});

process.once("uncaughtException", err => {
  console.log("Event: Uncaught Exception");

  stackman().callsites(err, (stackmanErr, callsites) => {
    if (stackmanErr) {
      throw stackmanErr;
    }
    callsites.forEach(callsite => {
      console.log(
        "Error occured in at %s line %d",
        callsite.getFileName(),
        callsite.getLineNumber(),
      );
    });
  });

  console.error(err.stack, err);
  // debugger;
  process.exit(1);
});

Error.stackTraceLimit = Infinity;

try {
  // const packageInfo = require("./package.json");
  const parser = new ArgumentParser({
    // version: packageInfo.version,
    // description: packageInfo.description,
    addHelp: true,
  });
  parser.addArgument(["--googleOauth2ClientId"], {
    help: "googleOauth2ClientId",
    required: false,
  });
  parser.addArgument(["--gsheetsApiCredentialsFile"], {
    help: "gsheetsApiCredentialsFile",
    required: false,
  });
  parser.addArgument(["--gsheetCreate"], {
    help: "gsheetCreate",
    required: false,
  });
  parser.addArgument(["--gsheetImport"], {
    help: "gsheetImport",
    required: false,
  });
  parser.addArgument(["--gsheetExport"], {
    help: "gsheetExport",
    required: false,
  });
  parser.addArgument(["--gsheetFix"], {
    help: "gsheetFix",
    required: false,
  });
  parser.addArgument(["--spreadsheetId"], {
    help: "spreadsheetId",
    required: false,
  });
  parser.addArgument(["--networksJsPath"], {
    help: "networksJsPath",
    required: false,
  });
  parser.addArgument(["--networkName"], {
    help: "networkName",
    required: false,
  });

  const args = parser.parseArgs();
  console.log("CLI arguments: ", args, "\n");

  const {
    googleOauth2ClientId,
    gsheetsApiCredentialsFile,
    gsheetCreate,
    gsheetImport,
    gsheetExport,
    gsheetFix,
    spreadsheetId,
    networksJsPath,
    networkName,
  } = args;

  (async () => {
    if (gsheetCreate) {
      await runGsheetCreate(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
      ).catch(error => {
        throw new Error(error);
      });
    }

    if (gsheetImport) {
      if (!networkName) {
        throw new Error("Network name is not specified");
      }
      await runGsheetImport(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
        spreadsheetId,
        networksJsPath,
        networkName,
      ).catch(error => {
        throw new Error(error);
      });
    }

    if (gsheetExport) {
      if (!networkName) {
        throw new Error("Network name is not specified");
      }
      await runGsheetExport(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
        spreadsheetId,
        networksJsPath,
        networkName,
      ).catch(error => {
        console.error(error.stack);
        throw new Error(error);
      });
    }

    if (gsheetFix) {
      await runGsheetFix(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
        spreadsheetId,
      ).catch(error => {
        throw new Error(error);
      });
    }
  })();
} catch (e) {
  console.log("CLI: Caught error:");
  console.error(e);
}
