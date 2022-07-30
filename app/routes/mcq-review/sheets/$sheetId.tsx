import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
import { json } from "@remix-run/node"; // or "@remix-run/cloudflare"

export const loader = async ({ params }) => {

    const { sheetId } = params

    const doc = new GoogleSpreadsheet(sheetId);

    await doc.useServiceAccountAuth({
        //TODO:Need to change
        client_email: "mcqbot@mcq-comments-db.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQRXXbVaYsPHDP\nQuSpqpIVvjalNR6n/aQkupBf+IPbSDRz6ZST21ulu9kSonH6y9vWUlXc1zw+01uw\njcyeboe7yDrVE9K57rTcgw52GDNheHucj5NPaVHNaCCtD/mtvKFtZtA2N8Kd/vSZ\noC8ZKC3wLMTKffANOtuWQoEir47lxOmEtoekhhe+9ElI6e77AqtbH6bUi0YWY4La\nXYuzTSkOXolpKUb7dzZDUqGojPG3WasmhrsMP4isDm0VY3ltnNkJydwY9WGkl/yo\n5fn5v2k4wMqvgzZ2ngesy0yB4YrNQ2I2hYUfjceoSk4KjOCOR3vr4xYFPI8ZHnkD\nuXCLNrUNAgMBAAECggEAUiCB2ArPKzRuO5yiNLF5R6+pNr5ap13ig0U6N031GNxB\nKtAZ8bAXVKRddfauwXnv53SyPRJ2xENuLZHM9VCan5bWdD2L5BvYH/hiFHl4kWAE\nRnlrWm4qfrgn4nahOzxd35kiU67rRIhMBeRfjikE7GeK9lpw9ZaXDoqNB5N44uts\nFz4EuHypScqr0c3XnoIi9aS7FtzoFIQjykH5/9cB2l3gJ+yYrWDGqOYT5SAb8iXG\n0gQ82kXrNSMVm4Rtch6VJ3iGMSPJHBqQlxc2YxKW42KB7aGmtEK+tDjgh7mF1icp\noe+1zLdyVdpdKJ7I+GeYZKJ+pHFPnJTkCbmjvlNctQKBgQDprnvBXEBMiZTuVSQB\nyG9/xH/baqU55O7NL/dCmM4XdVCmaSVZLk9DbJv2LFWozZA7n13JsNbTyzbG8wFL\n+4XvYzM/cdBxmxWdGLtc27ZcjxjrzD5pOtKdwRH/KBlhsoCgNaAIELsr8jtAbwPf\n86uAm/1P0fsHUj+Lh6m5uZUnOwKBgQDkKbI7I1biQVRS6e4SPg7uSttDRSCxCMUX\n8t+671DwjsjRLmM8+uW3hmYHA64YqKDNOwgvX4/XHN6inJpf3JQSacxvNSgQwfYv\n4RSUAEIbtcvqVnMb2SV/vnUr3NFJzq7UQlySH6kP5TRMq0vOrQxyOJmOEE7km1Q/\nc07FWe0gVwKBgEYjyCOOpAIVHa23wnoChm0MNvBN/0/0RjUyW34SzXE/FjkMwFgX\nTVVIiTuHrSJgqRUsTYNXX/PsQAHROKds1JO46830RIOE8CTaIorJq9/2V52XDXia\nXlNZeyRiDdRENtVfoywokXWsXFqHt9sFkYmlyI+n0DgvWMFxs+D6Mim3AoGAfuNN\ncqQZqqSIX8AnHVAT/6PzwrqMDsiAy+vPTufOzKmrtuGkYQJrhKAi153NUXteSiSd\nTbNIjGpKyoZrOAq08nSSM/qM+JzV7BSx3Ak0urJk4EMJqyAdQajLAwTAA9sE0ZjC\nYKVo4SUn68eL1jnY5SDjDOW26l4UAWGAGjMDs+sCgYEA6U/CfBhaKmb8msq8egsn\n61xmjpo0DvNbNDGNXBnyMARvnnPcSZB3RRvjELrXCnIRF5jnjaKtKUnWoA9hW4Qg\nAA3djGf+ArG3DoWWZqOyo9aHuM3OpFJWkXEwjBT4vshbsnEebWCZXnGRlA269v+M\niP/M74zvpY2riB2uch/pqLE=\n-----END PRIVATE KEY-----\n".replace(/\\n/gm, '\n')
    });

    await doc.loadInfo();

    const rawSubsheets = doc['_rawSheets']

    const subsheets = Object.keys(rawSubsheets).map(eachSheetKey => {
        const { _rawProperties } = rawSubsheets[eachSheetKey]
        return _rawProperties
    })

    return { sheetId, subsheets: subsheets }
}


export default function SheetId() {

    const { sheetId, subsheets } = useLoaderData()

    return (
        <Outlet />
    )
}