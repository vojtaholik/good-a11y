import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const EFFECT_RUNTIME_METHODS = new Set([
  "runCallback",
  "runCallbackWith",
  "runFork",
  "runForkWith",
  "runPromise",
  "runPromiseExit",
  "runPromiseExitWith",
  "runPromiseWith",
  "runSync",
  "runSyncExit",
  "runSyncExitWith",
  "runSyncWith",
]);

const manualRunnerName = (callee: ESTree.Node): string | undefined => {
  if (
    callee.type !== "MemberExpression" ||
    callee.object.type !== "Identifier" ||
    callee.property.type !== "Identifier"
  ) {
    return undefined;
  }

  const object = callee.object.name;
  const method = callee.property.name;

  if (object === "Effect" && EFFECT_RUNTIME_METHODS.has(method)) {
    return `Effect.${method}`;
  }

  if (object === "ManagedRuntime" && method === "make") {
    return "ManagedRuntime.make";
  }

  return undefined;
};

const noManualEffectRuntimeInTests = defineRule({
  create(context) {
    if (!TEST_FILE_PATTERN.test(context.filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (manualRunnerName(node.callee) !== undefined) {
          context.report({ messageId: "manualRunner", node: node.callee });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow manually creating or running Effect runtimes in tests; use @effect/vitest.",
    },
    messages: {
      manualRunner:
        "Do not run Effects by hand in tests. Use @effect/vitest: it.effect(...) or it.layer(layer)(...).",
    },
    type: "problem",
  },
});

const DEFAULT_SIZE = 10;

const PROPERTY_ROOTS = new Set(["it", "test"]);

const WRAPPERS = new Set([
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
]);

const WHOLE_NUMBER = /^[\d_]+$/u;

/* oxlint-disable anti-slop/no-runtime-typeof -- The walkers below read every child of an ESTree node generically, so each child arrives as `unknown`. Lint tooling has no schema layer; this structural guard is the boundary check the anti-slop rule asks for. */
const isNode = (value: unknown): value is ESTree.Node =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  typeof value.type === "string";
/* oxlint-enable anti-slop/no-runtime-typeof */

const childrenOf = (node: ESTree.Node): ESTree.Node[] => {
  const children: ESTree.Node[] = [];

  for (const [key, value] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isNode(item)) {
          children.push(item);
        }
      }
    } else if (isNode(value)) {
      children.push(value);
    }
  }

  return children;
};

type Declared = ReadonlyMap<string, readonly ESTree.Node[]>;

const declaredAtTheTopOf = (program: ESTree.Program): Declared => {
  const declared = new Map<string, ESTree.Node[]>();

  const declare = (name: string, value: ESTree.Node) => {
    declared.set(name, [...(declared.get(name) ?? []), value]);
  };

  for (const statement of program.body) {
    const declaration =
      statement.type === "ExportNamedDeclaration" &&
      statement.declaration !== null
        ? statement.declaration
        : statement;

    if (declaration.type === "FunctionDeclaration" && declaration.id !== null) {
      declare(declaration.id.name, declaration.body ?? declaration);
    }

    if (declaration.type === "VariableDeclaration") {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type === "Identifier" && declarator.init !== null) {
          declare(declarator.id.name, declarator.init);
        }
      }
    }
  }

  return declared;
};

const unwrapped = (node: ESTree.Node): ESTree.Node =>
  WRAPPERS.has(node.type) && "expression" in node && isNode(node.expression)
    ? unwrapped(node.expression)
    : node;

const numberOf = (
  node: ESTree.Node,
  declared: Declared,
  followed: ReadonlySet<string> = new Set()
): number | undefined => {
  const value = unwrapped(node);

  if (value.type === "Literal") {
    const raw = value.raw ?? "";

    return WHOLE_NUMBER.test(raw) ? Number(raw.replaceAll("_", "")) : undefined;
  }

  if (value.type !== "Identifier" || followed.has(value.name)) {
    return undefined;
  }

  const [only, ...others] = declared.get(value.name) ?? [];

  return only === undefined || others.length > 0
    ? undefined
    : numberOf(only, declared, new Set([...followed, value.name]));
};

const calleeName = (callee: ESTree.Node): string | undefined => {
  if (callee.type === "Identifier") {
    return callee.name;
  }

  return callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
    ? callee.property.name
    : undefined;
};

interface DeclaredLengths {
  readonly longest: number;
  readonly unread: boolean;
}

const lengthsDeclaredFrom = (
  start: ESTree.Node,
  declared: Declared
): DeclaredLengths => {
  const followed = new Set<string>();
  const pending = [start];
  let longest = 0;
  let unread = false;

  for (;;) {
    const node = pending.pop();

    if (node === undefined) {
      return { longest, unread };
    }

    if (node.type === "Identifier" && !followed.has(node.name)) {
      followed.add(node.name);
      pending.push(...(declared.get(node.name) ?? []));
    }

    if (
      node.type === "CallExpression" &&
      calleeName(node.callee) === "isMaxLength"
    ) {
      const [bound] = node.arguments;
      const length = bound === undefined ? 0 : numberOf(bound, declared);

      unread ||= length === undefined;
      longest = Math.max(longest, length ?? 0);
    }

    pending.push(...childrenOf(node));
  }
};

const rootName = (node: ESTree.Node): string | undefined => {
  if (node.type === "Identifier") {
    return node.name;
  }

  return node.type === "MemberExpression" ? rootName(node.object) : undefined;
};

const isAProperty = (node: ESTree.CallExpression): boolean =>
  node.callee.type === "MemberExpression" &&
  calleeName(node.callee) === "prop" &&
  PROPERTY_ROOTS.has(rootName(node.callee.object) ?? "");

const valueNamed = (
  holder: ESTree.Node | undefined,
  name: string,
  declared: Declared
): ESTree.Node | undefined => {
  if (holder === undefined) {
    return undefined;
  }

  const given = unwrapped(holder);

  const [only] =
    given.type === "Identifier" ? (declared.get(given.name) ?? []) : [given];

  const written = only === undefined ? given : unwrapped(only);

  if (written.type !== "ObjectExpression") {
    return undefined;
  }

  for (const property of written.properties) {
    if (
      property.type === "Property" &&
      !property.computed &&
      property.key.type === "Identifier" &&
      property.key.name === name
    ) {
      return property.value;
    }
  }

  return undefined;
};

const sizeReachesDeclaredLengths = defineRule({
  create(context) {
    if (!TEST_FILE_PATTERN.test(context.filename)) {
      return {};
    }

    let declared: Declared = new Map();

    return {
      CallExpression(node) {
        const [, generated, , options] = node.arguments;

        if (!isAProperty(node) || generated === undefined) {
          return;
        }

        const { longest, unread } = lengthsDeclaredFrom(generated, declared);

        const sizeWritten = valueNamed(
          valueNamed(options, "arbitrary", declared),
          "size",
          declared
        );

        if (sizeWritten === undefined && longest > DEFAULT_SIZE) {
          context.report({
            data: { longest: `${longest}` },
            messageId: "noSize",
            node: node.callee,
          });
        } else if (sizeWritten === undefined && unread) {
          context.report({ messageId: "unreadLength", node: node.callee });
        } else if (sizeWritten !== undefined) {
          const size = numberOf(sizeWritten, declared);

          if (size !== undefined && size < longest) {
            context.report({
              data: { longest: `${longest}`, size: `${size}` },
              messageId: "sizeTooSmall",
              node: node.callee,
            });
          }
        }
      },
      Program(node) {
        declared = declaredAtTheTopOf(node);
      },
    };
  },
  meta: {
    docs: {
      description:
        "Require a property to run at a size that reaches the longest list or string it declares.",
    },
    messages: {
      noSize:
        "This property declares a list or a string up to {{longest}} long and sets no size. Effect's Arbitrary draws nothing longer than the check's size, which is 10 unless set, so the declared length is never run. Add `arbitrary: { size: {{longest}} }` to the property's options, or lower the declared maximum to what the property is meant to run.",
      sizeTooSmall:
        "This property declares a list or a string up to {{longest}} long and runs at size {{size}}. Effect's Arbitrary draws nothing longer than the check's size, so the declared length is never run. Raise `arbitrary.size` to {{longest}}, or lower the declared maximum.",
      unreadLength:
        "This property declares a maximum length that is not a number or a constant of this file, and sets no size. Effect's Arbitrary draws nothing longer than the check's size, which is 10 unless set. Say the size the property runs at: `arbitrary: { size: <that maximum> }`.",
    },
    type: "problem",
  },
});

export default definePlugin({
  meta: { name: "effect-tests" },
  rules: {
    "no-manual-effect-runtime-in-tests": noManualEffectRuntimeInTests,
    "size-reaches-declared-lengths": sizeReachesDeclaredLengths,
  },
});
