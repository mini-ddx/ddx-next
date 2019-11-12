import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    /**
     * ddx Language Server Initialization
     */

    let serverModule = context.asAbsolutePath(
        path.join('server', 'dist', 'ddxServerMain.js')
    );

    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'ddx' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.ddx')
        }
    };
    // Create the language client and start the client.
    client = new LanguageClient(
        'ddx-language-server',
        'ddx language server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    context.subscriptions.push(client.start());

    client
        .onReady()
        .then(() => {
            // registerCustomClientNotificationHandlers(client);
            // registerCustomLSPCommands(context, client);
        })
        .catch(e => {
            console.log('Client initialization failed');
        });
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
