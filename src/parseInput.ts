/**
 * Parse input string
 * @function parseInput
 */
//---------------------------------------------------------------------------------------
function parseInput(input: string): {linesToJump: number; type_of_j: string;} 
{
  let type_of_input:string ='E';
  
  if (input === "") {
    return { linesToJump: 0, type_of_j: "" };
  }
  
  const reslt = input.match(/[dujkg+\-:]/i);
  let end_out:string;
  if (reslt!==null) {
      switch(reslt[0]){
        default:
        case '+': case 'd': case 'D': case 'j': case 'J':
            type_of_input = 'D';
            break;
        case '-': case 'k': case 'K': case 'u': case 'U':
            type_of_input = 'U';
            break;   
        case 'g': case 'G':       
            type_of_input = 'E';
            break;   
      }
  }
  else {
      type_of_input = 'E';  // same to Enter
  }
  end_out = input.replace(/[djkug+\-:]/ig, "");  // remove direction chs

  let p_ed:number = parseInt(end_out);
  
  if (type_of_input==='U') p_ed = -1*p_ed; // go up

  return {linesToJump:p_ed, type_of_j:type_of_input};
}

export default parseInput;


