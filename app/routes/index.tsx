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
                            <Link to="mcq-builder">MCQ Builder</Link>
                        </li>
                        <li>
                            <Link to="mcq-review/sheets">MCQ Review</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}