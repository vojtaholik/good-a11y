/* oxlint-disable unicorn/consistent-function-scoping -- This script is evaluated in the scanned page; one block keeps every name out of the page's global scope. */
/* oxlint-disable unicorn/prefer-dom-node-text-content -- The probes measure the text a user sees; textContent also counts hidden text. */
{
  const MAX_SNIPPET = 160;
  const MAX_ELEMENTS = 4000;
  const MAX_FIELDS = 60;
  const MAX_ICONS = 60;
  const MAX_RULES = 50;
  const MAX_MATCHES = 50;
  const MAX_TRIGGERS = 10;
  const GRID_STEP = 32;
  const MIN_CONTENT_POINTS = 2;
  const CONTENT_SHARE = 0.8;
  const MIN_ICON_SIDE = 10;
  const OUTSIDE_GAP = 3;

  const TEXT_FIELDS = new Set([
    "",
    "text",
    "email",
    "search",
    "tel",
    "url",
    "password",
    "number",
  ]);

  const OPAQUE_MEDIA = new Set([
    "IMG",
    "VIDEO",
    "CANVAS",
    "PICTURE",
    "IFRAME",
    "OBJECT",
    "EMBED",
  ]);

  const GRAPHICS = "path,circle,rect,polygon,ellipse,line,polyline";

  const ROTATED =
    /rotate\(\s*-?(?:90|270)deg\s*\)|rotate\(\s*-?0?\.25turn\s*\)/iu;

  const RGB =
    /^rgba?\(\s*(?<red>[\d.]+)[,\s]+(?<green>[\d.]+)[,\s]+(?<blue>[\d.]+)(?:\s*[,/]\s*(?<alpha>[\d.]+%?))?\s*\)$/u;

  const LOGO = /logo|brand/iu;
  const SHADOW_COLOR = /rgba?\([^)]*\)/gu;

  interface Color {
    readonly alpha: number;
    readonly blue: number;
    readonly green: number;
    readonly red: number;
  }

  interface Backdrop {
    readonly color: Color;
    readonly element: Element;
  }

  const snippetOf = (element: Element): string =>
    element.outerHTML.slice(0, MAX_SNIPPET);

  const signatureOf = (element: Element): string =>
    `${element.tagName.toLowerCase()}#${element.id}.${element.getAttribute("class") ?? ""}`.slice(
      0,
      MAX_SNIPPET
    );

  const pixels = (value: string): number =>
    value.endsWith("px") ? Number(value.slice(0, -2)) : Number.NaN;

  const blurActive = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
      Number(style.opacity) > 0 &&
      element.checkVisibility()
    );
  };

  const colorOf = (value: string): Color | null => {
    const groups = RGB.exec(value.trim())?.groups;

    if (groups === undefined) {
      return null;
    }

    const alphaText = groups.alpha ?? "1";

    return {
      alpha: alphaText.endsWith("%")
        ? Number(alphaText.slice(0, -1)) / 100
        : Number(alphaText),
      blue: Number(groups.blue),
      green: Number(groups.green),
      red: Number(groups.red),
    };
  };

  const channel = (value: number): number => {
    const scaled = value / 255;

    return scaled <= 0.04045
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  };

  const luminance = (color: Color): number =>
    0.2126 * channel(color.red) +
    0.7152 * channel(color.green) +
    0.0722 * channel(color.blue);

  const contrast = (left: Color, right: Color): number => {
    const [light, dark] = [luminance(left), luminance(right)].toSorted(
      (one, other) => other - one
    );

    return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
  };

  const rounded = (ratio: number): number => Math.round(ratio * 100) / 100;

  const WHITE: Color = { alpha: 1, blue: 255, green: 255, red: 255 };

  const flatLayer = (style: CSSStyleDeclaration): boolean =>
    style.backgroundImage === "none" &&
    Number(style.opacity) === 1 &&
    style.filter === "none" &&
    style.backdropFilter === "none" &&
    style.mixBlendMode === "normal";

  const backdropOf = (start: Element): Backdrop | null => {
    for (
      let node: Element | null = start;
      node !== null;
      node = node.parentElement
    ) {
      const style = getComputedStyle(node);

      if (!flatLayer(style) || OPAQUE_MEDIA.has(node.tagName)) {
        return null;
      }

      const color = colorOf(style.backgroundColor);

      if (color === null) {
        return null;
      }

      if (color.alpha === 1) {
        return { color, element: node };
      }

      if (color.alpha > 0) {
        return null;
      }
    }

    return getComputedStyle(document.documentElement).colorScheme.includes(
      "dark"
    )
      ? null
      : { color: WHITE, element: document.documentElement };
  };

  const sameBackdrop = (left: Backdrop, right: Backdrop): boolean =>
    left.element === right.element || contrast(left.color, right.color) === 1;

  const outsideBackdrop = (element: Element): Backdrop | null => {
    const rect = element.getBoundingClientRect();
    const x = rect.left - OUTSIDE_GAP;
    const y = rect.top + rect.height / 2;

    if (x < 0 || y < 0 || y > innerHeight) {
      return null;
    }

    const [top] = document.elementsFromPoint(x, y);

    if (top === undefined || element.contains(top)) {
      return null;
    }

    const there = backdropOf(top);
    const parent = element.parentElement;
    const behind = parent === null ? null : backdropOf(parent);

    return there !== null && behind !== null && sameBackdrop(there, behind)
      ? behind
      : null;
  };

  const usable = (element: Element): boolean =>
    isRendered(element) &&
    !element.matches(":disabled, [aria-disabled='true']") &&
    element.closest("[inert], [aria-hidden='true']") === null;

  interface Low {
    readonly ratio: number;
    readonly snippet: string;
  }

  const borderOf = (style: CSSStyleDeclaration): Color | null => {
    const sides = ["top", "right", "bottom", "left"].map((side) => ({
      color: style.getPropertyValue(`border-${side}-color`),
      style: style.getPropertyValue(`border-${side}-style`),
      width: pixels(style.getPropertyValue(`border-${side}-width`)),
    }));

    const drawn = sides.filter(
      (side) => side.style !== "none" && side.width >= 1
    );

    const bottom = sides.at(2);

    const full =
      drawn.length === 4 &&
      drawn.every(
        (side) => side.style === "solid" && side.color === sides[0]?.color
      );

    const underline =
      drawn.length === 1 &&
      bottom !== undefined &&
      drawn[0] === bottom &&
      bottom.style === "solid";

    if (!full && !underline) {
      return null;
    }

    const color = colorOf(drawn[0]?.color ?? "");

    return color !== null && color.alpha === 1 ? color : null;
  };

  const invisibleShadow = (shadow: string): boolean =>
    shadow === "none" ||
    (shadow.match(SHADOW_COLOR) ?? ["opaque"]).every(
      (paint) => colorOf(paint)?.alpha === 0
    );

  const fieldContrast = () => {
    const fields = [...document.querySelectorAll("input, textarea, select")]
      .filter(
        (field) =>
          (!(field instanceof HTMLInputElement) ||
            TEXT_FIELDS.has(field.getAttribute("type")?.toLowerCase() ?? "")) &&
          usable(field)
      )
      .slice(0, MAX_FIELDS);

    const low: Low[] = [];
    let judged = 0;

    for (const field of fields) {
      const style = getComputedStyle(field);
      const rect = field.getBoundingClientRect();
      const border = borderOf(style);
      const outside = outsideBackdrop(field);
      const own = colorOf(style.backgroundColor);

      if (
        border !== null &&
        outside !== null &&
        own !== null &&
        (own.alpha === 0 || own.alpha === 1) &&
        invisibleShadow(style.boxShadow) &&
        flatLayer(style) &&
        rect.width >= 20 &&
        rect.height >= 10
      ) {
        judged += 1;

        const inside = own.alpha === 0 ? outside.color : own;

        const ratio = Math.max(
          contrast(border, outside.color),
          contrast(inside, outside.color)
        );

        if (ratio < 3) {
          low.push({ ratio: rounded(ratio), snippet: snippetOf(field) });
        }
      }
    }

    return { judged, low };
  };

  const isLogo = (control: Element, svg: Element): boolean =>
    [control, svg].some((node) =>
      LOGO.test(
        `${node.id} ${node.getAttribute("class") ?? ""} ${node.getAttribute("aria-label") ?? ""}`
      )
    ) ||
    (control instanceof HTMLAnchorElement &&
      new URL(control.href, location.href).pathname === "/");

  const paintOf = (svg: SVGSVGElement): Color | null => {
    const paints: string[] = [];

    for (const graphic of svg.querySelectorAll(GRAPHICS)) {
      const style = getComputedStyle(graphic);

      if (
        Number(style.opacity) !== 1 ||
        Number(style.fillOpacity) !== 1 ||
        Number(style.strokeOpacity) !== 1 ||
        style.filter !== "none"
      ) {
        return null;
      }

      if (style.fill !== "none") {
        paints.push(style.fill);
      }

      if (style.stroke !== "none" && pixels(style.strokeWidth) > 0) {
        paints.push(style.stroke);
      }
    }

    const [first] = paints;

    if (first === undefined || paints.some((paint) => paint !== first)) {
      return null;
    }

    const color = colorOf(first);

    return color !== null && color.alpha === 1 ? color : null;
  };

  const stackClear = (svg: Element, backdrop: Backdrop): boolean => {
    const rect = svg.getBoundingClientRect();

    const stack = document.elementsFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

    for (const element of stack) {
      if (element === backdrop.element) {
        return true;
      }

      if (!svg.contains(element) && !element.contains(svg)) {
        return false;
      }
    }

    return false;
  };

  const iconContrast = () => {
    const controls = [
      ...document.querySelectorAll("a[href], button, [role='button']"),
    ]
      .filter(
        (control) =>
          (control instanceof HTMLElement ? control.innerText.trim() : "") ===
            "" &&
          control.querySelectorAll("svg").length === 1 &&
          control.querySelector("img, image, foreignObject, use, text") ===
            null &&
          usable(control)
      )
      .slice(0, MAX_ICONS);

    const low: Low[] = [];
    let judged = 0;

    for (const control of controls) {
      const svg = control.querySelector("svg");
      const rect = svg?.getBoundingClientRect();

      if (
        svg !== null &&
        rect !== undefined &&
        rect.width >= MIN_ICON_SIDE &&
        rect.height >= MIN_ICON_SIDE &&
        isRendered(svg) &&
        !isLogo(control, svg) &&
        getComputedStyle(svg).filter === "none" &&
        Number(getComputedStyle(svg).opacity) === 1
      ) {
        const paint = paintOf(svg);
        const backdrop = backdropOf(svg);

        if (paint !== null && backdrop !== null && stackClear(svg, backdrop)) {
          judged += 1;

          const ratio = contrast(paint, backdrop.color);

          if (ratio < 3) {
            low.push({ ratio: rounded(ratio), snippet: snippetOf(control) });
          }
        }
      }
    }

    return { judged, low };
  };

  const nonTextContrast = () => {
    blurActive();

    return { fields: fieldContrast(), icons: iconContrast() };
  };

  const textOf = (element: Element): number =>
    element instanceof HTMLElement ? element.innerText.trim().length : 0;

  const orientationRules = (): readonly CSSStyleRule[] => {
    const found: CSSStyleRule[] = [];

    const visit = (rules: CSSRuleList, inOrientation: boolean) => {
      for (const rule of rules) {
        if (found.length >= MAX_RULES) {
          return;
        }

        if (rule instanceof CSSMediaRule) {
          visit(
            rule.cssRules,
            inOrientation || /orientation/iu.test(rule.media.mediaText)
          );
        } else if (rule instanceof CSSGroupingRule) {
          visit(rule.cssRules, inOrientation);
        } else if (rule instanceof CSSStyleRule && inOrientation) {
          found.push(rule);
        }
      }
    };

    for (const sheet of document.styleSheets) {
      try {
        visit(sheet.cssRules, false);
      } catch {
        continue;
      }
    }

    return found;
  };

  const mediaOf = (rule: CSSRule): string => {
    const media: string[] = [];

    for (
      let parent = rule.parentRule;
      parent !== null;
      parent = parent.parentRule
    ) {
      if (parent instanceof CSSMediaRule) {
        media.push(parent.media.mediaText);
      }
    }

    return media.join(" and ");
  };

  const orientation = () => {
    const total = textOf(document.body);

    const rules = orientationRules().flatMap((rule) => {
      const hide =
        rule.style.display === "none" || rule.style.visibility === "hidden";

      const rotate =
        ROTATED.test(rule.style.transform) ||
        ROTATED.test(
          rule.style.rotate === "" ? "" : `rotate(${rule.style.rotate})`
        );

      if (!hide && !rotate) {
        return [];
      }

      let matched: readonly Element[];

      try {
        matched = [...document.querySelectorAll(rule.selectorText)].slice(
          0,
          MAX_MATCHES
        );
      } catch {
        return [];
      }

      const covered = matched.some(
        (element) =>
          element === document.documentElement || element === document.body
      )
        ? total
        : matched.reduce((sum, element) => sum + textOf(element), 0);

      const media = mediaOf(rule);

      return [
        {
          active: matchMedia(media).matches,
          hide,
          media: media.slice(0, MAX_SNIPPET),
          rotate,
          selector: rule.selectorText.slice(0, MAX_SNIPPET),
          share: total === 0 ? 0 : Math.min(1, covered / total),
        },
      ];
    });

    return { rules, text: total };
  };

  let visibleBefore = new WeakMap<Element, boolean>();
  let added: Element[] = [];
  let observer: MutationObserver | null = null;

  const snapshot = () => {
    visibleBefore = new WeakMap();
    added = [];
    observer?.disconnect();

    for (const element of allElements()) {
      visibleBefore.set(element, isRendered(element));
    }

    observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element && added.length < MAX_ELEMENTS) {
            added.push(node);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const appeared = (): readonly Element[] => {
    const changed = new Set<Element>();

    for (const element of [...allElements(), ...added]) {
      const before = visibleBefore.get(element);
      const now = element.isConnected && isRendered(element);

      if (before === undefined ? now : before !== now) {
        changed.add(element);
      }
    }

    return [...changed].filter(
      (element) =>
        element.parentElement === null || !changed.has(element.parentElement)
    );
  };

  const keyReset = () => {
    blurActive();
    snapshot();

    return true;
  };

  const keyRead = () => {
    const focused = document.activeElement;

    return {
      changed: appeared()
        .filter((element) => textOf(element) > 0)
        .slice(0, 5)
        .map(signatureOf),
      focus:
        focused === null ||
        focused === document.body ||
        focused === document.documentElement
          ? null
          : signatureOf(focused),
      snippet:
        focused === null || focused === document.body
          ? null
          : snippetOf(focused),
    };
  };

  const TRIGGERS = [
    "[aria-haspopup]:not([aria-haspopup='false'])",
    "[aria-expanded]",
    "[aria-describedby]",
    "[data-tooltip]",
    "[data-tippy-content]",
    "[data-bs-toggle='tooltip']",
    "nav a[href]",
    "header a[href]",
    "nav button",
    "header button",
  ].join(",");

  let triggers: Element[] = [];
  let noisy = new Set<number>();
  let content: Element | null = null;
  let grid: (Element | null)[] = [];
  let region: { readonly x: number; readonly y: number }[] = [];

  const inView = (rect: DOMRect): boolean =>
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= innerHeight &&
    rect.right <= innerWidth;

  const hoverTriggers = () => {
    scrollTo(0, 0);
    blurActive();

    noisy = new Set();
    triggers = [...new Set(document.querySelectorAll(TRIGGERS))]
      .filter(
        (element) =>
          usable(element) &&
          inView(element.getBoundingClientRect()) &&
          !isLogo(element, element)
      )
      .slice(0, MAX_TRIGGERS);

    return triggers.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    });
  };

  const gridPoints = () => {
    const points: { x: number; y: number }[] = [];

    for (let y = GRID_STEP / 2; y < innerHeight; y += GRID_STEP) {
      for (let x = GRID_STEP / 2; x < innerWidth; x += GRID_STEP) {
        points.push({ x, y });
      }
    }

    return points;
  };

  const topAt = (x: number, y: number): Element | null => {
    let top = document.elementFromPoint(x, y);

    while (top?.shadowRoot) {
      const inner = top.shadowRoot.elementFromPoint(x, y);

      if (inner === null || inner === top) {
        break;
      }

      top = inner;
    }

    return top;
  };

  const composedParent = (element: Element): Element | null => {
    if (element.parentElement !== null) {
      return element.parentElement;
    }

    const root = element.getRootNode();

    return root instanceof ShadowRoot ? root.host : null;
  };

  const holdsComposed = (outer: Element, inner: Element): boolean => {
    for (let at: Element | null = inner; at !== null; at = composedParent(at)) {
      if (at === outer) {
        return true;
      }
    }

    return false;
  };

  const sample = () => gridPoints().map(({ x, y }) => topAt(x, y));

  const hoverStart = () => {
    content = null;
    region = [];
    grid = sample();

    return true;
  };

  const hoverQuiet = () => {
    const now = sample();

    for (const [at, element] of now.entries()) {
      if (element !== grid[at]) {
        noisy.add(at);
      }
    }

    grid = now;

    return true;
  };

  const ownText = (element: Element | null): boolean =>
    element !== null &&
    (element.matches("img, svg, input, textarea, select, video") ||
      [...element.childNodes].some(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? "").trim() !== ""
      ));

  const related = (left: Element, right: Element): boolean =>
    holdsComposed(left, right) || holdsComposed(right, left);

  const hoverShown = (index: number) => {
    const trigger = triggers[index];

    if (trigger === undefined) {
      return null;
    }

    const box = trigger.getBoundingClientRect();
    const points = gridPoints();

    const changed = points.flatMap((point, at) => {
      const now = topAt(point.x, point.y);

      const inBox =
        point.x >= box.left &&
        point.x <= box.right &&
        point.y >= box.top &&
        point.y <= box.bottom;

      return now === null ||
        noisy.has(at) ||
        now === grid[at] ||
        inBox ||
        related(now, trigger)
        ? []
        : [{ before: grid[at] ?? null, now, point }];
    });

    if (changed.length < MIN_CONTENT_POINTS) {
      return null;
    }

    const branchOf = (element: Element): Element => {
      let branch = element;

      for (
        let parent = composedParent(branch);
        parent !== null && !holdsComposed(parent, trigger);
        parent = composedParent(branch)
      ) {
        branch = parent;
      }

      return branch;
    };

    const groups = new Map<Element, Element[]>();

    for (const { now } of changed) {
      const branch = branchOf(now);
      groups.set(branch, [...(groups.get(branch) ?? []), now]);
    }

    const [tops = []] = [...groups.values()].toSorted(
      (left, right) => right.length - left.length
    );

    if (tops.length < MIN_CONTENT_POINTS) {
      return null;
    }

    const holds = (element: Element) =>
      tops.filter((top) => holdsComposed(element, top)).length;

    let found: Element | null = tops[0] ?? null;

    while (found !== null && holds(found) < tops.length * CONTENT_SHARE) {
      found = composedParent(found);
    }

    if (
      found === null ||
      found === document.body ||
      found === document.documentElement ||
      holdsComposed(found, trigger) ||
      (textOf(found) === 0 && found.querySelector("img, svg") === null)
    ) {
      return null;
    }

    const container = found;
    const inside = changed.filter(({ now }) => holdsComposed(container, now));

    content = container;
    region = inside.map(({ point }) => point);

    const fromX = box.left + box.width / 2;
    const fromY = box.top + box.height / 2;

    const [onto] = region.toSorted(
      (left, right) =>
        Math.hypot(left.x - fromX, left.y - fromY) -
        Math.hypot(right.x - fromX, right.y - fromY)
    );

    return {
      obscures: inside.some(
        ({ before }) =>
          before !== null &&
          !related(before, trigger) &&
          !holdsComposed(container, before) &&
          ownText(before)
      ),
      onto: onto ?? { x: fromX, y: fromY },
      snippet: snippetOf(container),
      trigger: snippetOf(trigger),
    };
  };

  const contentShown = (): boolean => {
    const shown = content;

    return (
      shown !== null &&
      shown.isConnected &&
      region.filter(({ x, y }) => {
        const now = topAt(x, y);

        return now !== null && holdsComposed(shown, now);
      }).length >=
        region.length * CONTENT_SHARE
    );
  };

  const focusTrigger = (index: number) => {
    const trigger = triggers[index];

    if (trigger instanceof HTMLElement || trigger instanceof SVGElement) {
      trigger.focus();
    }

    return document.activeElement === trigger;
  };

  const blurAll = () => {
    blurActive();

    return true;
  };

  Object.assign(globalThis, {
    __eaaInteract: {
      blurAll,
      contentShown,
      focusTrigger,
      hoverQuiet,
      hoverShown,
      hoverStart,
      hoverTriggers,
      keyRead,
      keyReset,
      nonTextContrast,
      orientation,
    },
  });
}
