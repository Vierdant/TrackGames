const TYPE_NODES = new Set(["TSTypeAliasDeclaration", "TSInterfaceDeclaration", "TSEnumDeclaration"]);

function isImport(node) {
	return node.type === "ImportDeclaration";
}

function isType(node) {
	return TYPE_NODES.has(node.type);
}

function isConstant(node) {
	return node.type === "VariableDeclaration" && node.kind === "const";
}

function isFunction(node) {
	return node.type === "FunctionDeclaration" || node.type === "VariableDeclaration";
}

function getName(node) {
	if (node.type === "FunctionDeclaration") return node.id?.name ?? "";

	if (node.type === "VariableDeclaration") {
		const declaration = node.declarations[0];
		return declaration?.id?.name ?? "";
	}

	return "";
}

function isReactComponent(node) {
	return /^[A-Z]/.test(getName(node));
}

function isHook(node) {
	return /^use[A-Z0-9]/.test(getName(node));
}

function isHelperFunction(node) {
	return isFunction(node) && !isReactComponent(node) && !isHook(node);
}

function getSection(node) {
	if (isImport(node)) return "imports";
	if (isType(node)) return "types";
	if (isConstant(node) && !isReactComponent(node) && !isHook(node)) return "constants";
	if (isReactComponent(node)) return "components";
	if (isHook(node)) return "hooks";
	if (isHelperFunction(node)) return "helpers";

	return "other";
}

const rule = {
	meta: {
		type: "layout",
		fixable: "whitespace",
		docs: {
			description: "Require one blank line between Yamikhal file sections.",
		},
		schema: [],
		messages: {
			blankLine: "Expected one blank line between file structure sections.",
		},
	},

	create(context) {
		return {
			Program(program) {
				const body = program.body;

				for (let i = 1; i < body.length; i++) {
					const previous = body[i - 1];
					const current = body[i];

					const previousSection = getSection(previous);
					const currentSection = getSection(current);

					if (previousSection === "other" || currentSection === "other" || previousSection === currentSection) {
						continue;
					}

					const linesBetween = current.loc.start.line - previous.loc.end.line - 1;

					if (linesBetween !== 1) {
						context.report({
							node: current,
							messageId: "blankLine",
							fix(fixer) {
								return fixer.replaceTextRange([previous.range[1], current.range[0]], "\n\n");
							},
						});
					}
				}
			},
		};
	},
};

export default rule;
