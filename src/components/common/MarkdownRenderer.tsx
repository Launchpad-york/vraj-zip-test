/**
 * Markdown renderer powered by Streamdown
 */

import { Streamdown } from "streamdown";

export function MarkdownRenderer({
	content,
	isAnimating = false,
}: {
	content: string;
	isAnimating?: boolean;
}) {
	return (
		<div className="markdown-content text-sm">
			<Streamdown
				mode={isAnimating ? "streaming" : "static"}
				isAnimating={isAnimating}
			>
				{content}
			</Streamdown>
		</div>
	);
}
