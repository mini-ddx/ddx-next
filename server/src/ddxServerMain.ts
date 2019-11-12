// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createConnection, InitializeParams, InitializeResult } from 'vscode-languageserver';

import { VLS } from './services/vls';

const connection = process.argv.length <= 2 ? createConnection(process.stdin, process.stdout) : createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const vls = new VLS(connection);

connection.onInitialize(
  async (params: InitializeParams): Promise<InitializeResult> => {
    await vls.init(params);

    console.log('ddx language server initialized');

    return {
      capabilities: vls.capabilities
    };
  }
);

vls.listen();
