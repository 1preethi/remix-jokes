import { ActionFunction, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, Outlet, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import Comments from "~/components/comments";
import McqPreviewer from "~/components/mcqPreviewer";
import ResponsiveContainer from "~/components/responsiveContainer";
import { authenticator } from "~/utils/auth.server";
import { SocialsProvider } from "remix-auth-socials";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
//import "dotenv/config";

const sheetId = "15qGC0V9rb3o5MuPlfdgkfZ3UU49HxR2WBVmpdIOZM6w"
const subsheetName = "Index"

class McqReviewContent {
    constructor(templateJson, contentJson, sheetId, subsheetName, reportedTo) {
        this.templateJson = templateJson;
        this.contentJson = contentJson;
        this.sheetId = sheetId;
        this.subsheetName = subsheetName
        this.reportedTo = reportedTo
    }
}


export const loader = async ({ request }) => {

    const doc = new GoogleSpreadsheet(sheetId);

    await doc.useServiceAccountAuth({
        //TODO:Need to change
        client_email: "mcqbot@mcq-comments-db.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQRXXbVaYsPHDP\nQuSpqpIVvjalNR6n/aQkupBf+IPbSDRz6ZST21ulu9kSonH6y9vWUlXc1zw+01uw\njcyeboe7yDrVE9K57rTcgw52GDNheHucj5NPaVHNaCCtD/mtvKFtZtA2N8Kd/vSZ\noC8ZKC3wLMTKffANOtuWQoEir47lxOmEtoekhhe+9ElI6e77AqtbH6bUi0YWY4La\nXYuzTSkOXolpKUb7dzZDUqGojPG3WasmhrsMP4isDm0VY3ltnNkJydwY9WGkl/yo\n5fn5v2k4wMqvgzZ2ngesy0yB4YrNQ2I2hYUfjceoSk4KjOCOR3vr4xYFPI8ZHnkD\nuXCLNrUNAgMBAAECggEAUiCB2ArPKzRuO5yiNLF5R6+pNr5ap13ig0U6N031GNxB\nKtAZ8bAXVKRddfauwXnv53SyPRJ2xENuLZHM9VCan5bWdD2L5BvYH/hiFHl4kWAE\nRnlrWm4qfrgn4nahOzxd35kiU67rRIhMBeRfjikE7GeK9lpw9ZaXDoqNB5N44uts\nFz4EuHypScqr0c3XnoIi9aS7FtzoFIQjykH5/9cB2l3gJ+yYrWDGqOYT5SAb8iXG\n0gQ82kXrNSMVm4Rtch6VJ3iGMSPJHBqQlxc2YxKW42KB7aGmtEK+tDjgh7mF1icp\noe+1zLdyVdpdKJ7I+GeYZKJ+pHFPnJTkCbmjvlNctQKBgQDprnvBXEBMiZTuVSQB\nyG9/xH/baqU55O7NL/dCmM4XdVCmaSVZLk9DbJv2LFWozZA7n13JsNbTyzbG8wFL\n+4XvYzM/cdBxmxWdGLtc27ZcjxjrzD5pOtKdwRH/KBlhsoCgNaAIELsr8jtAbwPf\n86uAm/1P0fsHUj+Lh6m5uZUnOwKBgQDkKbI7I1biQVRS6e4SPg7uSttDRSCxCMUX\n8t+671DwjsjRLmM8+uW3hmYHA64YqKDNOwgvX4/XHN6inJpf3JQSacxvNSgQwfYv\n4RSUAEIbtcvqVnMb2SV/vnUr3NFJzq7UQlySH6kP5TRMq0vOrQxyOJmOEE7km1Q/\nc07FWe0gVwKBgEYjyCOOpAIVHa23wnoChm0MNvBN/0/0RjUyW34SzXE/FjkMwFgX\nTVVIiTuHrSJgqRUsTYNXX/PsQAHROKds1JO46830RIOE8CTaIorJq9/2V52XDXia\nXlNZeyRiDdRENtVfoywokXWsXFqHt9sFkYmlyI+n0DgvWMFxs+D6Mim3AoGAfuNN\ncqQZqqSIX8AnHVAT/6PzwrqMDsiAy+vPTufOzKmrtuGkYQJrhKAi153NUXteSiSd\nTbNIjGpKyoZrOAq08nSSM/qM+JzV7BSx3Ak0urJk4EMJqyAdQajLAwTAA9sE0ZjC\nYKVo4SUn68eL1jnY5SDjDOW26l4UAWGAGjMDs+sCgYEA6U/CfBhaKmb8msq8egsn\n61xmjpo0DvNbNDGNXBnyMARvnnPcSZB3RRvjELrXCnIRF5jnjaKtKUnWoA9hW4Qg\nAA3djGf+ArG3DoWWZqOyo9aHuM3OpFJWkXEwjBT4vshbsnEebWCZXnGRlA269v+M\niP/M74zvpY2riB2uch/pqLE=\n-----END PRIVATE KEY-----\n".replace(/\\n/gm, '\n')
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[subsheetName]

    if (sheet) {
        const rows = await sheet.getRows();

        const sheets = rows.map(eachObj => {
            return { sheetId: eachObj.sheetId, sheetName: eachObj.sheetName }
        })

        return { sheets }

    }

    return null

};

// export const action: ActionFunction = async ({
//     request,
// }) => {

//     const uploadHandler = unstable_createMemoryUploadHandler({
//         maxPartSize: 500_000,
//     });
//     const formData = await unstable_parseMultipartFormData(
//         request,
//         uploadHandler // <-- we'll look at this deeper next
//     );

// }


export default function McqReviewPlayground() {

    const [activeQuestionKey, setActiveQuestionKey] = useState("")

    const [fileReader, setFileReader] = useState()

    const [contentJson, setContentJson] = useState([])
    const [templateJson, setTemplateJson] = useState([])
    const [sheetId, setSheetId] = useState("1WpZhSD9_bXm1whI6ooc23wAqYumEaGiS7WwwDzlScZ8");
    const [subsheetName, setSubsheetName] = useState("Patterns")
    const [reportedTo, setReportedTo] = useState("preethi")
    const [mcqReviewContent, setMcqReviewContent] = useState({})

    const createMcqReviewContentTemplate = (templateJson, contentJson, sheetId, subsheetName, reportedTo) => {
        const mcqReviewContent = new McqReviewContent(templateJson, contentJson, sheetId, subsheetName, reportedTo)
        return mcqReviewContent
    }

    useEffect(() => {
        const reader = new FileReader()
        setFileReader(reader)
    }, [])

    const updateQuestionKey = (key) => {
        setActiveQuestionKey(key)
    }

    const onSubmitReviewContent = (event) => {
        event.preventDefault()
        const mcqReviewContent = createMcqReviewContentTemplate(templateJson, contentJson, sheetId, subsheetName, reportedTo)
        setMcqReviewContent(mcqReviewContent)
    }

    const onChangeSheetId = (event) => {
        setSheetId(event.target.value)
    }
    const onChangeSubsheetName = (event) => {
        setSubsheetName(event.target.value)
    }
    const onChangeReportedTo = (event) => {
        setReportedTo(event.target.value)
    }

    const getJSONFileContent = async (file) => {
        return new Promise(resolve => {
            const blob = new Blob([file], { type: "application/json" });

            fileReader.addEventListener('load', ((jsonFile) => {
                return function (event) {
                    resolve(JSON.parse(event.target.result))
                };

            })(blob));

            fileReader.readAsText(blob);
        });
    }

    const onChangeContentJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]
        let jsonContent = await getJSONFileContent(file)
        setContentJson(jsonContent)
    }

    const onChangeTemplateJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]

        let jsonContent = await getJSONFileContent(file)
        setTemplateJson(jsonContent)
    }

    return (
        <>
            <Outlet />
            {/* <ResponsiveContainer>
                <form encType="multipart/form-data" onSubmit={onSubmitReviewContent}>
                    <div>
                        <label>Upload Content JSON</label>
                        <input id="contentUpload" type="file" name="contentJsonFile" size="30" onChange={onChangeContentJsonFile} />
                    </div>
                    <div>
                        <label>Upload Templates JSON</label>
                        <input id="templateUpload" type="file" name="templateJsonFile" size="30" onChange={onChangeTemplateJsonFile} />
                    </div>
                    <input name="reportedTo" value={reportedTo} onChange={onChangeReportedTo} />
                    <button>Submit</button>
                </form>
                <div>
                    <McqPreviewer templateJson={mcqReviewContent?.templateJson} contentJson={mcqReviewContent?.contentJson} activeQuestionKey={activeQuestionKey} updateQuestionKey={updateQuestionKey} />
                </div>
            </ResponsiveContainer> */}
            {/* <Form
                    method="post"
                    action={`/auth/${SocialsProvider.GOOGLE}`}
                >
                    <button>Login with Google</button>
                </Form> */}
        </>

    )

}