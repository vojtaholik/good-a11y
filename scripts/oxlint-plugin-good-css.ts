import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

type PropertyNode = Extract<ESTree.Node, { type: "Property" }>;

const LOGICAL = new Map([
  ["borderBottomColor", "borderBlockEndColor"],
  ["borderBottomStyle", "borderBlockEndStyle"],
  ["borderBottomWidth", "borderBlockEndWidth"],
  ["borderLeftColor", "borderInlineStartColor"],
  ["borderLeftStyle", "borderInlineStartStyle"],
  ["borderLeftWidth", "borderInlineStartWidth"],
  ["borderRightColor", "borderInlineEndColor"],
  ["borderRightStyle", "borderInlineEndStyle"],
  ["borderRightWidth", "borderInlineEndWidth"],
  ["borderTopColor", "borderBlockStartColor"],
  ["borderTopStyle", "borderBlockStartStyle"],
  ["borderTopWidth", "borderBlockStartWidth"],
  ["bottom", "insetBlockEnd"],
  ["height", "blockSize"],
  ["left", "insetInlineStart"],
  ["marginBottom", "marginBlockEnd"],
  ["marginLeft", "marginInlineStart"],
  ["marginRight", "marginInlineEnd"],
  ["marginTop", "marginBlockStart"],
  ["maxHeight", "maxBlockSize"],
  ["maxWidth", "maxInlineSize"],
  ["minHeight", "minBlockSize"],
  ["minWidth", "minInlineSize"],
  ["paddingBottom", "paddingBlockEnd"],
  ["paddingLeft", "paddingInlineStart"],
  ["paddingRight", "paddingInlineEnd"],
  ["paddingTop", "paddingBlockStart"],
  ["right", "insetInlineEnd"],
  ["top", "insetBlockStart"],
  ["width", "inlineSize"],
]);

const REPLACED_VALUES = new Map([
  ["animationTimingFunction:ease-in", "easeIn"],
  ["outline:none", "outlineNone"],
  ["overflow:hidden", "hidden"],
  ["textAlign:left", "textAlign"],
  ["textAlign:right", "textAlign"],
  ["transitionProperty:all", "transitionAll"],
  ["transitionTimingFunction:ease-in", "easeIn"],
]);

const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu;

const WIDTH_QUERY = /^@media[^)]{0,40}\((?:max|min)-(?:width|inline-size)/u;

const isStyleFile = (filename: string): boolean =>
  filename.endsWith(".stylex.ts");

const keyOf = (node: PropertyNode): string | null => {
  if (node.computed) {
    return null;
  }

  if (node.key.type === "Identifier") {
    return node.key.name;
  }

  return node.key.type === "Literal" ? String(node.key.value) : null;
};

const textOf = (node: ESTree.Node): string | null =>
  node.type === "Literal" ? String(node.value) : null;

const namesAStyle = (node: PropertyNode): boolean =>
  node.parent.type === "ObjectExpression" &&
  node.parent.parent.type === "CallExpression";

const inAllCss = defineRule({
  create(context) {
    if (!isStyleFile(context.filename)) {
      return {};
    }

    return {
      Literal(node) {
        const text = String(node.value);

        if (HEX_COLOR.test(text)) {
          context.report({ messageId: "hex", node });
        }

        if (WIDTH_QUERY.test(text)) {
          context.report({ messageId: "breakpoint", node });
        }
      },
      Property(node) {
        const key = keyOf(node);

        if (key === null) {
          return;
        }

        const logical = LOGICAL.get(key);

        if (logical !== undefined && !namesAStyle(node)) {
          context.report({
            data: { logical, physical: key },
            messageId: "physical",
            node: node.key,
          });
        }

        if (key === ":hover" && node.value.type !== "ObjectExpression") {
          context.report({ messageId: "hover", node: node.key });
        }

        const value = textOf(node.value);

        const messageId =
          value === null ? undefined : REPLACED_VALUES.get(`${key}:${value}`);

        if (messageId !== undefined) {
          context.report({ messageId, node: node.value });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Hold the site's styles to the rules good-css gives for all CSS.",
    },
    messages: {
      breakpoint:
        "A width query is a breakpoint. Let the layout adapt on its own: flex-wrap with a flex-basis, a clamp() token, or the content grid. good-css.com has the entries.",
      easeIn:
        "ease-in starts slow and reads as lag. Use motion.easeOut from tokens.stylex.ts.",
      hex: "Write the colour in oklch() as a token in tokens.stylex.ts, with none as the hue of a gray, and derive a tint with color-mix(in oklch, …).",
      hidden:
        'Cut overflow off with "clip". Keep "hidden" only for an element a script scrolls, with a disable comment that says so.',
      hover:
        'Put a :hover value inside the hover query, as in ":hover": { [HOVER]: value, default: base }, with HOVER = "@media (hover: hover) and (pointer: fine)", so a tap does not leave it stuck.',
      outlineNone:
        "Never remove the outline. The focus ring is the :focus-visible rule in base.css; set outlineColor where currentColor would not show.",
      physical:
        "Write {{logical}} in place of {{physical}}: styles use inline and block properties, never left, right, top and bottom.",
      textAlign: 'Write textAlign "start" or "end", never left or right.',
      transitionAll: 'Name the properties a transition changes, never "all".',
    },
    type: "problem",
  },
});

export default definePlugin({
  meta: { name: "good-css" },
  rules: { "in-all-css": inAllCss },
});
