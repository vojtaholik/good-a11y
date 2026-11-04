/* oxlint-disable unicorn/consistent-function-scoping -- This script is evaluated in the scanned page; one block keeps every name out of the page's global scope. */
{
  const MAX_SNIPPET = 200;
  const MAX_TEXT = 300;
  const MAX_SHORT = 120;
  const MAX_WALKED = 5000;
  const MAX_HEADINGS = 20;
  const MAX_FIELDS = 40;
  const MAX_BLOCKS = 15;
  const MAX_FORMS = 3;
  const MAX_MESSAGES = 10;
  const MIN_BLOCK_TEXT = 40;
  const MIN_STOPWORD_HITS = 3;
  const MIN_STOPWORD_SHARE = 0.12;
  const HEADING_SCALE = 1.2;
  const BOLD = 600;

  const NOT_A_FIELD = new Set(["button", "hidden", "image", "reset", "submit"]);

  const INTERACTIVE = "a, button, label, summary, select, option, textarea";

  const HEADING = "h1, h2, h3, h4, h5, h6, [role='heading']";

  const BLOCKS =
    "p, li, td, th, dd, dt, blockquote, figcaption, h1, h2, h3, h4, h5, h6";

  const PAYMENT = /card|cvv|cvc|iban|ccnum|cc-|kreditkart|karta|carte/iu;

  const STOPWORDS = {
    cs: [
      "a",
      "je",
      "se",
      "na",
      "že",
      "pro",
      "jako",
      "není",
      "také",
      "jsou",
      "nebo",
      "který",
      "které",
      "však",
    ],
    da: [
      "og",
      "er",
      "det",
      "til",
      "på",
      "med",
      "ikke",
      "som",
      "der",
      "har",
      "af",
      "jeg",
      "eller",
      "også",
    ],
    de: [
      "und",
      "der",
      "die",
      "das",
      "ist",
      "nicht",
      "mit",
      "auf",
      "für",
      "sich",
      "auch",
      "eine",
      "werden",
      "oder",
    ],
    en: [
      "the",
      "and",
      "is",
      "of",
      "to",
      "in",
      "that",
      "for",
      "with",
      "you",
      "are",
      "this",
      "not",
      "or",
    ],
    es: [
      "el",
      "la",
      "que",
      "y",
      "los",
      "las",
      "por",
      "una",
      "para",
      "con",
      "es",
      "del",
      "como",
      "pero",
    ],
    fi: [
      "ja",
      "on",
      "ei",
      "että",
      "se",
      "oli",
      "kun",
      "mutta",
      "tai",
      "myös",
      "ovat",
      "joka",
      "voi",
      "sen",
    ],
    fr: [
      "le",
      "la",
      "et",
      "les",
      "des",
      "est",
      "une",
      "pour",
      "dans",
      "que",
      "pas",
      "sur",
      "avec",
      "vous",
    ],
    hu: [
      "a",
      "az",
      "és",
      "hogy",
      "nem",
      "egy",
      "is",
      "van",
      "meg",
      "már",
      "csak",
      "vagy",
      "mint",
      "ez",
    ],
    it: [
      "il",
      "di",
      "che",
      "e",
      "la",
      "per",
      "non",
      "una",
      "sono",
      "con",
      "della",
      "del",
      "anche",
      "gli",
    ],
    nl: [
      "de",
      "het",
      "een",
      "en",
      "van",
      "is",
      "niet",
      "dat",
      "met",
      "voor",
      "zijn",
      "ook",
      "maar",
      "worden",
    ],
    pl: [
      "i",
      "w",
      "nie",
      "się",
      "na",
      "że",
      "jest",
      "to",
      "do",
      "jak",
      "ale",
      "dla",
      "oraz",
      "być",
    ],
    pt: [
      "o",
      "a",
      "que",
      "e",
      "do",
      "da",
      "em",
      "um",
      "para",
      "não",
      "com",
      "uma",
      "os",
      "são",
    ],
    ro: [
      "și",
      "în",
      "este",
      "nu",
      "cu",
      "pe",
      "pentru",
      "care",
      "mai",
      "sau",
      "fost",
      "sunt",
      "acest",
      "la",
    ],
    sk: [
      "a",
      "je",
      "sa",
      "na",
      "že",
      "pre",
      "ako",
      "nie",
      "tiež",
      "sú",
      "alebo",
      "ktorý",
      "ktoré",
      "však",
    ],
    sv: [
      "och",
      "är",
      "att",
      "det",
      "som",
      "för",
      "med",
      "inte",
      "på",
      "av",
      "till",
      "har",
      "eller",
      "också",
    ],
  } satisfies Record<string, readonly string[]>;

  const collapse = (text: string): string =>
    text.replaceAll(/\s+/gu, " ").trim();

  const textOf = (element: Element, most = MAX_TEXT): string =>
    collapse(element.textContent ?? "").slice(0, most);

  const snippetOf = (element: Element): string =>
    element.outerHTML.slice(0, MAX_SNIPPET);

  const isRendered = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return (
      rect.width > 1 &&
      rect.height > 1 &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      (style.opacity === "" || Number(style.opacity) > 0)
    );
  };

  const ownText = (element: Element): string => {
    let text = "";

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
      }
    }

    return collapse(text);
  };

  const walked = (): readonly Element[] => {
    const found: Element[] = [];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT
    );

    for (
      let node = walker.nextNode();
      node !== null && found.length < MAX_WALKED;
      node = walker.nextNode()
    ) {
      if (node instanceof Element && ownText(node) !== "") {
        found.push(node);
      }
    }

    return found;
  };

  const bodySizeOf = (elements: readonly Element[]): number => {
    const weights = new Map<number, number>();

    for (const element of elements) {
      const size = Number(getComputedStyle(element).fontSize.replace("px", ""));

      weights.set(size, (weights.get(size) ?? 0) + ownText(element).length);
    }

    let best = 16;
    let most = -1;

    for (const [size, weight] of weights) {
      if (weight > most) {
        best = size;
        most = weight;
      }
    }

    return best;
  };

  const headingAncestors = (headings: readonly Element[]): Set<Element> => {
    const ancestors = new Set<Element>();

    for (const heading of headings) {
      let parent = heading.parentElement;

      while (parent !== null && !ancestors.has(parent)) {
        ancestors.add(parent);
        parent = parent.parentElement;
      }
    }

    return ancestors;
  };

  const looksLikeAHeading = (
    element: Element,
    bodySize: number,
    holdsHeading: ReadonlySet<Element>
  ): { readonly fontSize: number; readonly fontWeight: number } | null => {
    const text = textOf(element, MAX_SHORT + 1);

    if (
      text.length < 2 ||
      text.length > MAX_SHORT ||
      element.closest(HEADING) !== null ||
      holdsHeading.has(element) ||
      element.previousElementSibling?.matches(HEADING) === true ||
      element.closest(INTERACTIVE) !== null ||
      !isRendered(element)
    ) {
      return null;
    }

    const style = getComputedStyle(element);
    const fontSize = Number(style.fontSize.replace("px", ""));

    const weight = Number(
      style.fontWeight === "bold" ? "700" : style.fontWeight
    );

    const fontWeight = Number.isFinite(weight) && weight > 0 ? weight : 400;
    const block = style.display !== "inline";
    const parent = element.parentElement;

    const alone =
      block || (parent !== null && textOf(parent, MAX_SHORT + 1) === text);

    const larger = fontSize >= bodySize * HEADING_SCALE;
    const bolder = fontWeight >= BOLD && fontSize >= bodySize;

    return alone && (larger || bolder) ? { fontSize, fontWeight } : null;
  };

  const visualHeadings = (): string => {
    const elements = walked();
    const bodyFontSize = bodySizeOf(elements);
    const headings = [...document.querySelectorAll(HEADING)];
    const holdsHeading = headingAncestors(headings);
    const candidates: unknown[] = [];
    const seen = new Set<string>();

    for (const element of elements) {
      if (candidates.length >= MAX_HEADINGS) {
        break;
      }

      const look = looksLikeAHeading(element, bodyFontSize, holdsHeading);
      const text = textOf(element, MAX_SHORT);

      if (look !== null && !seen.has(text)) {
        seen.add(text);
        candidates.push({ ...look, snippet: snippetOf(element), text });
      }
    }

    return JSON.stringify({
      bodyFontSize,
      candidates,
      headings: headings.length,
    });
  };

  const isField = (element: Element): boolean =>
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement && !NOT_A_FIELD.has(element.type));

  const fieldsOf = (root: ParentNode): readonly Element[] =>
    [...root.querySelectorAll("input, select, textarea")].filter(isField);

  const idsText = (ids: string | null): string =>
    collapse(
      (ids ?? "")
        .split(/\s+/u)
        .filter((id) => id !== "")
        .map(
          (id) =>
            document.querySelector(`#${CSS.escape(id)}`)?.textContent ?? ""
        )
        .join(" ")
    ).slice(0, MAX_TEXT);

  const labelOf = (field: Element): string => {
    const labels =
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
        ? [...(field.labels ?? [])].map((label) => textOf(label))
        : [];

    return collapse(
      [
        field.getAttribute("aria-label") ?? "",
        idsText(field.getAttribute("aria-labelledby")),
        ...labels,
      ].join(" ")
    ).slice(0, MAX_TEXT);
  };

  const nearbyOf = (field: Element, label: string): string => {
    const container = field.parentElement?.parentElement ?? field.parentElement;

    if (container === null || container === document.body) {
      return "";
    }

    const text = textOf(container, MAX_TEXT * 2);

    return collapse(label === "" ? text : text.replace(label, "")).slice(
      0,
      MAX_TEXT
    );
  };

  const formInstructions = (): string => {
    const fields = fieldsOf(document.body)
      .flatMap((field) => (isRendered(field) ? [field] : []))
      .slice(0, MAX_FIELDS)
      .map((field) => {
        const label = labelOf(field);
        const forms = [...document.forms];

        return {
          describedBy: idsText(field.getAttribute("aria-describedby")),
          form:
            field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement ||
            field instanceof HTMLTextAreaElement
              ? forms.indexOf(field.form ?? document.createElement("form"))
              : -1,
          label,
          nearby: nearbyOf(field, label),
          placeholder: (field.getAttribute("placeholder") ?? "").slice(
            0,
            MAX_SHORT
          ),
          required:
            field.hasAttribute("required") ||
            field.getAttribute("aria-required") === "true",
          snippet: snippetOf(field),
          type:
            field instanceof HTMLInputElement
              ? field.type
              : field.tagName.toLowerCase(),
        };
      });

    return JSON.stringify({ fields });
  };

  const guessOf = (
    text: string
  ): { readonly guess: string; readonly hits: number } | null => {
    const words = text.toLowerCase().split(/[^\p{L}]+/u);
    let best: { guess: string; hits: number } | null = null;

    for (const [language, list] of Object.entries(STOPWORDS)) {
      const stop = new Set(list);
      const hits = words.filter((word) => stop.has(word)).length;

      if (hits > (best?.hits ?? 0)) {
        best = { guess: language, hits };
      }
    }

    return best !== null &&
      best.hits >= MIN_STOPWORD_HITS &&
      best.hits >= words.length * MIN_STOPWORD_SHARE
      ? best
      : null;
  };

  const primary = (lang: string): string =>
    lang.toLowerCase().split("-")[0] ?? "";

  const foreignBlocks = (): string => {
    const pageLang = document.documentElement.getAttribute("lang") ?? "";
    const blocks: unknown[] = [];

    const elements = [...document.body.querySelectorAll(BLOCKS)].slice(
      0,
      MAX_WALKED
    );

    for (const element of elements) {
      if (blocks.length >= MAX_BLOCKS) {
        break;
      }

      const text = textOf(element);
      const lang = element.closest("[lang]")?.getAttribute("lang") ?? "";
      const guess = text.length >= MIN_BLOCK_TEXT ? guessOf(text) : null;

      if (
        guess !== null &&
        guess.guess !== primary(lang) &&
        isRendered(element)
      ) {
        blocks.push({
          guess: guess.guess,
          hits: guess.hits,
          lang,
          snippet: snippetOf(element),
          text,
        });
      }
    }

    return JSON.stringify({ blocks, pageLang });
  };

  const skipReasonOf = (form: HTMLFormElement): string | null => {
    if (form.getAttribute("role") === "search" || form.closest("search")) {
      return "search";
    }

    if (form.querySelector("input[type=password]") !== null) {
      return "password";
    }

    const fields = fieldsOf(form);

    if (
      fields.some((field) =>
        PAYMENT.test(
          [
            field.getAttribute("autocomplete") ?? "",
            field.getAttribute("name") ?? "",
            field.id,
          ].join(" ")
        )
      )
    ) {
      return "payment";
    }

    if (fields.every((field) => field.getAttribute("type") === "search")) {
      return "no_fields";
    }

    return null;
  };

  const chosen: HTMLFormElement[] = [];
  const before: Set<string>[] = [];

  const visibleTexts = (root: ParentNode): Set<string> => {
    const texts = new Set<string>();

    for (const element of [...root.querySelectorAll("*")].slice(
      0,
      MAX_WALKED
    )) {
      const text = ownText(element);

      if (text !== "" && isRendered(element)) {
        texts.add(text);
      }
    }

    return texts;
  };

  const listForms = (): string => {
    const forms = [...document.forms].flatMap((form) =>
      isRendered(form) ? [{ form, skipped: skipReasonOf(form) }] : []
    );

    for (const { form, skipped } of forms) {
      if (skipped === null && chosen.length < MAX_FORMS) {
        chosen.push(form);
      }
    }

    return JSON.stringify(
      forms.slice(0, MAX_FORMS * 3).map(({ form, skipped }) => ({
        index: chosen.indexOf(form),
        skipped: skipped ?? (chosen.includes(form) ? null : "over_cap"),
        snippet: snippetOf(form),
      }))
    );
  };

  const submitEmpty = (index: number): string => {
    const form = chosen[index];

    if (form === undefined) {
      return JSON.stringify({ submitted: false });
    }

    before[index] = visibleTexts(document.body);
    form.removeAttribute("target");

    for (const control of form.querySelectorAll("[formtarget]")) {
      control.removeAttribute("formtarget");
    }

    for (const field of fieldsOf(form)) {
      if (
        (field instanceof HTMLInputElement &&
          !["checkbox", "radio", "file"].includes(field.type)) ||
        field instanceof HTMLTextAreaElement
      ) {
        field.value = "";
      }
    }

    try {
      form.requestSubmit();

      return JSON.stringify({ submitted: true });
    } catch {
      return JSON.stringify({ submitted: false });
    }
  };

  const readErrors = (index: number): string => {
    const form = chosen[index];

    if (form === undefined) {
      return JSON.stringify({ invalid: [], messages: [] });
    }

    const invalid = fieldsOf(form)
      .slice(0, MAX_FIELDS)
      .flatMap((field) => {
        const native =
          (field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement ||
            field instanceof HTMLTextAreaElement) &&
          !field.checkValidity()
            ? field.validationMessage.slice(0, MAX_SHORT)
            : null;

        const aria = field.getAttribute("aria-invalid") === "true";

        return native === null && !aria
          ? []
          : [
              {
                ariaInvalid: aria,
                describedBy: idsText(
                  `${field.getAttribute("aria-describedby") ?? ""} ${field.getAttribute("aria-errormessage") ?? ""}`
                ),
                label: labelOf(field),
                native,
                snippet: snippetOf(field),
              },
            ];
      });

    const seen = before[index] ?? new Set<string>();
    const messages: unknown[] = [];

    for (const element of [...document.body.querySelectorAll("*")].slice(
      0,
      MAX_WALKED
    )) {
      if (messages.length >= MAX_MESSAGES) {
        break;
      }

      const text = ownText(element);

      if (text !== "" && !seen.has(text) && isRendered(element)) {
        seen.add(text);
        messages.push({
          inForm: form.contains(element),
          live:
            element.closest("[role=alert], [aria-live], [role=status]") !==
            null,
          snippet: snippetOf(element),
          text: text.slice(0, MAX_TEXT),
        });
      }
    }

    return JSON.stringify({ invalid, messages });
  };

  Object.assign(globalThis, {
    __eaaEvidence: {
      foreignBlocks,
      formInstructions,
      listForms,
      readErrors,
      submitEmpty,
      visualHeadings,
    },
  });
}
