import * as path from 'path';

import {
    DidChangeConfigurationParams,
    DocumentColorParams,
    DocumentFormattingParams,
    DocumentLinkParams,
    FileChangeType,
    IConnection,
    TextDocumentPositionParams,
    ColorPresentationParams,
    InitializeParams,
    ServerCapabilities,
    TextDocumentSyncKind,
    CompletionItemKind,
    DocumentFormattingRequest,
    Disposable,
    CodeActionParams
} from 'vscode-languageserver';
import {
    ColorInformation,
    CompletionItem,
    CompletionList,
    Definition,
    Diagnostic,
    DocumentHighlight,
    DocumentLink,
    DocumentSymbolParams,
    Hover,
    Location,
    SignatureHelp,
    SymbolInformation,
    TextDocument,
    TextDocumentChangeEvent,
    TextEdit,
    ColorPresentation,
    Range
} from 'vscode-languageserver-types';

import { DocumentService } from './documentService';

export class VLS {
    private documentService: DocumentService;

    private pendingValidationRequests: { [uri: string]: NodeJS.Timer } = {};

    constructor(private lspConnection: IConnection) {
        this.documentService = new DocumentService(this.lspConnection);
    }

    async init(params: InitializeParams) {
        // logger.setLevel(_.get(params.initializationOptions.config, ['ddx', 'dev', 'logLevel'], 'INFO'));

        const workspacePath = params.rootPath;
        if (!workspacePath) {
            console.error('No workspace path found. ddx initialization failed.');
            return {
                capabilities: {}
            };
        }

        this.lspConnection.onCompletion(
            (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
                // The pass parameter contains the position of the text document in
                // which code complete got requested. For the example we ignore this
                // info and always provide the same completion items.
                return [
                    {
                        label: 'TypeScript',
                        kind: CompletionItemKind.Text,
                        data: 1
                    },
                    {
                        label: 'JavaScript',
                        kind: CompletionItemKind.Text,
                        data: 2
                    }
                ];
            }
        );

        // This handler resolves additional information for the item selected in
        // the completion list.
        this.lspConnection.onCompletionResolve(
            (item: CompletionItem): CompletionItem => {
                if (item.data === 1) {
                    item.detail = 'TypeScript details';
                    item.documentation = 'TypeScript documentation';
                } else if (item.data === 2) {
                    item.detail = 'JavaScript details';
                    item.documentation = 'JavaScript documentation';
                }
                return item;
            }
        );

        this.lspConnection.onShutdown(() => {
            this.dispose();
        });
    }

    listen() {
        this.lspConnection.listen();
    }

    get capabilities(): ServerCapabilities {
        return {
            textDocumentSync: TextDocumentSyncKind.Full,
            completionProvider: { resolveProvider: true, triggerCharacters: ['.', ':', '<', '"', "'", '/', '@', '*'] },
            signatureHelpProvider: { triggerCharacters: ['('] },
            documentFormattingProvider: false,
            hoverProvider: true,
            documentHighlightProvider: true,
            documentLinkProvider: {
                resolveProvider: false
            },
            documentSymbolProvider: true,
            definitionProvider: true,
            referencesProvider: true,
            codeActionProvider: true,
            colorProvider: true
        };
    }

    dispose(): void {
        // this.languageModes.dispose();
    }
}
