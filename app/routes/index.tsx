import { Link } from "@remix-run/react";

export default function Index() {
    return (
        <div className="container">
            <div className="content">
                <h1>
                    MCQ Builder
                </h1>
                <nav>
                    <ul>
                        <li>
                            <Link to="pool-generator">Pool Generator</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}