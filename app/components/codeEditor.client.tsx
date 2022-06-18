import AceEditor from "react-ace";

// import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
// import "ace-builds/src-noconflict/ext-language_tools";
// import "ace-builds/src-noconflict/ext-searchbox";
// import "ace-builds/src-noconflict/keybinding-vscode";

import "ace-builds/src-noconflict/mode-python";
// import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";


const CodeEditor = (props) => {
    const { changeEditor } = props

    return (
        <div>
            <AceEditor
                width="100%"
                fontSize={18}
                height="400px"
                mode="python"
                theme="monokai"
                onChange={changeEditor}
                name="codeEditor"
                editorProps={{ $blockScrolling: true }}
                setOptions={{ useWorker: true }} />
        </div>)
}

export default CodeEditor;

//FIX: Not able to override styles


