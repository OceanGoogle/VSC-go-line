import * as vscode from "vscode";

/**
 * Creates a position new position object which will be used as the active position (final cursor position) of the new selection
 */
function createNewPosition (editor: vscode.TextEditor, linesToJump: number, type_of_jp: string = 'E')
                 : vscode.Position 
{
  let newLine:number = (type_of_jp==='E')? (linesToJump>0)?linesToJump-1:0 :  (editor.selection.active.line + linesToJump);
    
  if (newLine < 0) {
    newLine = 0;
  }

  // Use active position of selection instead of "anchor/start/end" to move based on current cursor line
  let newCharacter = editor.selection.active.character;;
  if (newCharacter < 0) {
    newCharacter = 0;
  }

  // Create new position object by applying relative jump while maintaining same character position
  const newPosition: vscode.Position = new vscode.Position(
    newLine,
    newCharacter
  );

  return newPosition;
}

export default createNewPosition;
