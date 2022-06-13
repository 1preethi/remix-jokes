import type {
    ActionFunction
} from "@remix-run/node";

import { PythonShell } from '../utils/python-shell.server';


export const action: ActionFunction = async ({
    request,
}) => {
    const form = await request.formData();
    const code = form.get("code")

    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: ['1', '2', '3'],
        scriptPath: "/home/ib_admin/remix-jokes/app/utils"
      };
      

      let shell = new PythonShell('script.py', options);

      shell.send([1, 2, 4])

      shell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message, 'message');
      });
      

    return null
}

export default function Editor() {
    return (
        <form method="POST">
            <textarea name="code"></textarea>
            <button type="submit">Run</button>
        </form>
    );
}

//TODO: Need to change similar to the codeplayground in learning portal