// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

import parseInput from "./parseInput";
import createNewPosition from "./createNewPosition";
import shiftVisibleRange from "./shiftVisibleRange";
import deleteHighlight from "./deleteHighlight";
//--------------------------------------------------------------------------------------------------    
function show_str(): Promise<string | undefined> {
  return new Promise((resolve) => {
    const input = vscode.window.createInputBox();
    input.title = "only 0-9 /j/k/d/u/g/+/-/:";
    input.placeholder = "last ch=>jkdug+-: go";
    input.ignoreFocusOut = true;

    const ALLOWED = /[^0-9jkJKduDUgG+\-:]/g;          // 要移除的「不允許」集合
    const ANY_TRI = /.+[jkJKduDUgG+\-:]$/;              // 觸發送出的「結尾」集合

    let suppress = false;                      // 避免 onDidChangeValue 內部回寫造成循環

    input.onDidChangeValue((raw) => {
        if (suppress) return;

        // 1) 過濾：移除不允許字元（含貼上情境）
        let filtered:string;
        if (raw.match(ALLOWED)) {
          filtered = raw.replace(ALLOWED, "");
          suppress = true;
          input.value = filtered;
          suppress = false;
          return;
        }
        else 
          filtered = raw;
          
        // 2) 若最後一個字元是觸發鍵，等同 Enter：去掉最後字元後送出
        //    前面至少要有一個字元，才算有效輸入
        if (filtered.match(ANY_TRI)) {
          suppress = true;
          input.value = filtered; 
          input.hide();
          resolve(filtered);
          suppress = false;
        }
    });

    // 使用者真的按 Enter 的情況：直接回傳（不再去掉字元）
    input.onDidAccept(() => {
        resolve(input.value);
        input.hide();
    });

    input.onDidHide(() => resolve(undefined));
    input.show();
  });
}
//--------------------------------------------------------------------------------------------------    
// every time user push ctrl+g....
async function callb () {
// Get the current editor
  const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  
  // If the current editor is undefined (meaning user focus not on a editor), just ignore the command
  if (!editor) return;

  // // original Line number settings
  const config = vscode.workspace.getConfiguration('editor');
  const old_line_style = config.get<string>('lineNumbers');

  // // set to 'relative'
  config.update('lineNumbers', 'relative', vscode.ConfigurationTarget.Global);
  
  let input = await show_str ();  // wait till Input finish
  
  // Delete highlight generated in preview function
  deleteHighlight(editor);
  config.update('lineNumbers', old_line_style, vscode.ConfigurationTarget.Global);

  // End if input box closed after losing focus or if user pressed esc or if user pressed enter with no input
  if (input === undefined || input === "") {
        // Replace visible range/viewPort with how it was before the preview
        editor.revealRange(new vscode.Range(editor.selection.active, 
                           editor.selection.active), 
                           vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        return;
  }
  
  // Get lines to jump and characters to jump from input
  // const {linesToJump, type_of_j} = parseInput(input);
  const parse_ret = parseInput(input);
  
  // Create the new end position using linesToJump
  const newPosition: vscode.Position = createNewPosition (editor, parse_ret.linesToJump, parse_ret.type_of_j);

  // Create new selection object where the start and end positions are the same, to make it a singular cursor movement
  const newSelection: vscode.Selection = new vscode.Selection(newPosition, newPosition);
  
  editor.selection = newSelection;
  
  // Shifts visible range if needed
  shiftVisibleRange(editor, newPosition);
} 
//--------------------------------------------------------------------------------------------------    
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) 
{
      // setup();
      const registeredCommandGoto = vscode.commands.registerCommand ("ctrl_g_go", callb,);
      context.subscriptions.push(registeredCommandGoto);
}
  
// this method is called when your extension is deactivated
export function deactivate() {
    // No clean up code required for this extension
}
//--------------------------------------------------------------------------------------------------    
