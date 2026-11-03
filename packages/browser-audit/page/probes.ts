/* oxlint-disable unicorn/consistent-function-scoping -- This script is evaluated in the scanned page; one block keeps every name out of the page's global scope. */
{
  const MAX_SNIPPET = 200;
  const MAX_TEXT = 120;
  const MAX_ELEMENTS = 4000;
  const SAMPLE_LIMIT = 5;

  const STYLE_PROPERTIES = [
    "outline-style",
    "outline-width",
    "outline-color",
    "outline-offset",
    "box-shadow",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "border-top-width",
    "border-bottom-width",
    "border-top-style",
    "border-bottom-style",
    "background-color",
    "background-image",
    "color",
    "text-decoration-line",
    "text-decoration-color",
    "text-decoration-thickness",
    "opacity",
    "transform",
    "filter",
    "fill",
    "stroke",
    "visibility",
    "content",
  ];

  const CONTROLS = [
    "a[href]",
    "area[href]",
    "button",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[tabindex='0']",
  ].join(",");

  const COMPOSITE_ROLES = new Set([
    "grid",
    "listbox",
    "menu",
    "menubar",
    "radiogroup",
    "tablist",
    "toolbar",
    "tree",
    "treegrid",
  ]);

  const CLIPPING = new Set(["clip", "hidden"]);

  const SPACING_CSS = [
    "*, *::before, *::after {",
    "line-height: 1.5 !important;",
    "letter-spacing: 0.12em !important;",
    "word-spacing: 0.16em !important;",
    "}",
    "p { margin-bottom: 2em !important; }",
  ].join("\n");

  const NO_TRANSITIONS_CSS =
    "*, *::before, *::after { transition: none !important; }";

  interface Stop {
    readonly changed?: number;
    readonly judged: boolean;
    readonly key: number;
    readonly modal?: boolean;
    readonly coverShare?: number | null;
    readonly obscuredBy?: string | null;
    readonly snippet: string;
  }

  interface Candidate {
    readonly clippedAway: boolean;
    readonly composite: boolean;
    readonly hidden: boolean;
    readonly key: number;
    readonly radioGroup: string | null;
    readonly snippet: string;
    readonly tabindex: string | null;
  }

  const snippetOf = (element: Element): string =>
    element.outerHTML.slice(0, MAX_SNIPPET);

  const textOf = (element: Element): string =>
    (element.textContent ?? "")
      .replaceAll(/\s+/gu, " ")
      .trim()
      .slice(0, MAX_TEXT);

  const addStyle = (css: string): HTMLStyleElement => {
    const style = document.createElement("style");

    style.textContent = css;
    document.documentElement.append(style);

    return style;
  };

  const allElements = (): readonly Element[] =>
    [...document.body.querySelectorAll("*")].slice(0, MAX_ELEMENTS);

  const isRendered = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return (
      rect.width > 1 &&
      rect.height > 1 &&
      style.visibility !== "hidden" &&
      Number(style.opacity) > 0
    );
  };

  const outside = (rect: DOMRect, box: DOMRect): boolean =>
    rect.right <= box.left ||
    rect.left >= box.right ||
    rect.bottom <= box.top ||
    rect.top >= box.bottom;

  const isClippedAway = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();

    for (
      let ancestor = element.parentElement;
      ancestor !== null && ancestor !== document.body;
      ancestor = ancestor.parentElement
    ) {
      const style = getComputedStyle(ancestor);

      if (
        (style.overflowX !== "visible" || style.overflowY !== "visible") &&
        outside(rect, ancestor.getBoundingClientRect())
      ) {
        return true;
      }
    }

    return (
      rect.right + scrollX <= 0 ||
      rect.bottom + scrollY <= 0 ||
      rect.left + scrollX >= document.documentElement.scrollWidth
    );
  };

  const insideComposite = (element: Element): boolean => {
    for (
      let node: Element | null = element;
      node !== null;
      node = node.parentElement
    ) {
      if (COMPOSITE_ROLES.has(node.getAttribute("role") ?? "")) {
        return true;
      }
    }

    return false;
  };

  const insideHidden = (element: Element): boolean =>
    element.closest("[inert], [aria-hidden='true']") !== null;

  const isModalLayer = (element: Element): boolean => {
    for (
      let node: Element | null = element;
      node !== null;
      node = node.parentElement
    ) {
      const role = node.getAttribute("role");

      if (
        role === "dialog" ||
        role === "alertdialog" ||
        node.getAttribute("aria-modal") === "true" ||
        (node instanceof HTMLDialogElement && node.open) ||
        getComputedStyle(node).position === "fixed"
      ) {
        return true;
      }
    }

    return false;
  };

  const related = (element: Element): readonly Element[] => {
    const nodes: Element[] = [element];

    for (
      let ancestor = element.parentElement, depth = 0;
      ancestor !== null && depth < 3;
      ancestor = ancestor.parentElement, depth += 1
    ) {
      nodes.push(ancestor);
    }

    for (const sibling of [
      element.previousElementSibling,
      element.nextElementSibling,
    ]) {
      if (sibling !== null) {
        nodes.push(sibling);
      }
    }

    nodes.push(...[...element.children].slice(0, 5));

    return nodes;
  };

  const styleSnapshot = (element: Element): readonly string[] => {
    const values: string[] = [];

    for (const node of related(element)) {
      for (const pseudo of [null, "::before", "::after"]) {
        const style = getComputedStyle(node, pseudo);

        for (const property of STYLE_PROPERTIES) {
          values.push(style.getPropertyValue(property));
        }
      }
    }

    const rect = element.getBoundingClientRect();

    values.push(
      [rect.left + scrollX, rect.top + scrollY, rect.width, rect.height]
        .map(Math.round)
        .join(",")
    );

    return values;
  };

  const inViewport = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();

    return (
      rect.width > 1 &&
      rect.height > 1 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < innerHeight &&
      rect.left < innerWidth
    );
  };

  const fixedLayerOf = (element: Element): Element | null => {
    for (
      let node: Element | null = element;
      node !== null;
      node = node.parentElement
    ) {
      const { position } = getComputedStyle(node);

      if (position === "fixed" || position === "sticky") {
        return node;
      }
    }

    return null;
  };

  const viewportShare = (element: Element): number => {
    const rect = element.getBoundingClientRect();

    const width = Math.max(
      0,
      Math.min(rect.right, innerWidth) - Math.max(rect.left, 0)
    );

    const height = Math.max(
      0,
      Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0)
    );

    return (width * height) / (innerWidth * innerHeight);
  };

  const coverOf = (element: Element): Element | null => {
    const rect = element.getBoundingClientRect();
    const insetX = Math.min(4, rect.width / 4);
    const insetY = Math.min(4, rect.height / 4);

    const points = [
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
      [rect.left + insetX, rect.top + insetY],
      [rect.right - insetX, rect.top + insetY],
      [rect.left + insetX, rect.bottom - insetY],
      [rect.right - insetX, rect.bottom - insetY],
    ] as const;

    let cover: Element | null = null;

    for (const [x, y] of points) {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) {
        return null;
      }

      const top = document.elementFromPoint(x, y);

      if (
        top === null ||
        top === element ||
        element.contains(top) ||
        top.contains(element)
      ) {
        return null;
      }

      const layer = fixedLayerOf(top);

      if (layer === null || layer.contains(element)) {
        return null;
      }

      cover = layer;
    }

    return cover;
  };

  const coverFields = (cover: Element | null) =>
    cover === null
      ? { coverShare: null, obscuredBy: null }
      : {
          coverShare: Math.round(viewportShare(cover) * 100) / 100,
          obscuredBy: snippetOf(cover),
        };

  const clipped = (element: Element): boolean => {
    const style = getComputedStyle(element);

    return (
      (CLIPPING.has(style.overflowX) &&
        element.scrollWidth > element.clientWidth + 1) ||
      (CLIPPING.has(style.overflowY) &&
        element.scrollHeight > element.clientHeight + 1)
    );
  };

  const before = new Map<Element, readonly string[]>();
  const candidates: Candidate[] = [];
  const keys = new Map<Element, number>();
  const stops: Stop[] = [];
  const walkStyle: HTMLStyleElement[] = [];

  const keyOf = (element: Element): number => {
    const known = keys.get(element);

    if (known !== undefined) {
      return known;
    }

    const key = keys.size;

    keys.set(element, key);

    return key;
  };

  const changedValues = (
    previous: readonly string[],
    next: readonly string[]
  ): number => next.filter((value, index) => value !== previous[index]).length;

  const onFocus = (event: FocusEvent): void => {
    const [element] = event.composedPath();

    if (!(element instanceof Element) || element instanceof HTMLIFrameElement) {
      stops.push({ judged: false, key: -1, snippet: "" });

      return;
    }

    const key = keyOf(element);
    const previous = before.get(element);

    if (previous === undefined || !inViewport(element)) {
      stops.push({ judged: false, key, snippet: snippetOf(element) });

      return;
    }

    stops.push({
      changed: changedValues(previous, styleSnapshot(element)),
      judged: true,
      key,
      modal: isModalLayer(element),
      ...coverFields(coverOf(element)),
      snippet: snippetOf(element),
    });
  };

  const containedWithin = (element: Element, limit: number): boolean => {
    for (
      let ancestor = element.parentElement;
      ancestor !== null && ancestor !== document.body;
      ancestor = ancestor.parentElement
    ) {
      if (
        getComputedStyle(ancestor).overflowX !== "visible" &&
        ancestor.getBoundingClientRect().right <= limit
      ) {
        return true;
      }
    }

    return false;
  };

  const reflow = () => {
    const root = document.scrollingElement ?? document.documentElement;
    const limit = root.clientWidth + 1;

    const offenders = allElements()
      .filter((element) => {
        const rect = element.getBoundingClientRect();

        return (
          rect.right > limit &&
          isRendered(element) &&
          !containedWithin(element, limit)
        );
      })
      .map((element) => {
        const frame = element.closest("iframe");

        return {
          exempt:
            element.closest("table, pre, canvas, video, svg") !== null ||
            (frame !== null && /maps?/iu.test(frame.src)),
          right: Math.round(element.getBoundingClientRect().right),
          snippet: snippetOf(element),
        };
      })
      .toSorted((left, right) => right.right - left.right);

    return {
      clientWidth: root.clientWidth,
      offenders: offenders.slice(0, SAMPLE_LIMIT),
      scrollWidth: root.scrollWidth,
    };
  };

  const textSpacing = () => {
    const containers = allElements().filter((element) => {
      const style = getComputedStyle(element);

      return (
        (CLIPPING.has(style.overflowX) || CLIPPING.has(style.overflowY)) &&
        textOf(element) !== "" &&
        isRendered(element)
      );
    });

    const clippedBefore = new Set(containers.filter(clipped));
    const style = addStyle(SPACING_CSS);

    const newlyClipped = containers.filter(
      (element) => !clippedBefore.has(element) && clipped(element)
    );

    style.remove();

    return {
      checked: containers.length,
      newlyClipped: newlyClipped.slice(0, SAMPLE_LIMIT).map((element) => ({
        snippet: snippetOf(element),
        text: textOf(element),
      })),
      newlyClippedCount: newlyClipped.length,
    };
  };

  const walkStart = (): number => {
    walkStyle.push(addStyle(NO_TRANSITIONS_CSS));

    const focusedAtLoad = document.activeElement;

    if (focusedAtLoad instanceof HTMLElement) {
      focusedAtLoad.blur();
    }

    for (const element of [...document.querySelectorAll(CONTROLS)].slice(
      0,
      MAX_ELEMENTS
    )) {
      if (!element.matches(":disabled") && isRendered(element)) {
        if (element !== focusedAtLoad) {
          before.set(element, styleSnapshot(element));
        }

        candidates.push({
          clippedAway: isClippedAway(element),
          composite: insideComposite(element),
          hidden: insideHidden(element),
          key: keyOf(element),
          radioGroup:
            element instanceof HTMLInputElement && element.type === "radio"
              ? element.name
              : null,
          snippet: snippetOf(element),
          tabindex: element.getAttribute("tabindex"),
        });
      }
    }

    document.addEventListener("focusin", onFocus, true);

    return candidates.length;
  };

  const walkStops = (from: number): readonly Stop[] => stops.slice(from);

  const walkEnd = () => {
    document.removeEventListener("focusin", onFocus, true);

    for (const style of walkStyle) {
      style.remove();
    }

    return { candidates };
  };

  Object.assign(globalThis, {
    __eaaProbes: { reflow, textSpacing, walkEnd, walkStart, walkStops },
  });
}
