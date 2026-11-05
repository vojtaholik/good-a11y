import { Equal, Option, Stream } from "effect";
import { Subscription } from "foldkit";

export const OUTLINE_DATA = "outline";

const READ_LINE = 120;

export const currentSection = (): Option.Option<string> => {
  const ids = [
    ...document.querySelectorAll<HTMLAnchorElement>(
      `[data-${OUTLINE_DATA}] a[href^="#"]`
    ),
  ].map((link) => decodeURIComponent(link.hash.slice(1)));

  const passed = ids.filter((id) => {
    const target = document.querySelector(`#${id}`);

    return target !== null && target.getBoundingClientRect().top <= READ_LINE;
  });

  return Option.fromNullishOr(passed.at(-1));
};

export const sectionChanges: Stream.Stream<Option.Option<string>> =
  Stream.merge(
    Subscription.fromEvent({
      mapEvent: currentSection,
      options: { passive: true },
      target: () => window,
      type: "scroll",
    }),
    Subscription.fromEvent({
      mapEvent: currentSection,
      options: { passive: true },
      target: () => window,
      type: "resize",
    })
  ).pipe(Stream.changesWith(Option.makeEquivalence<string>(Equal.equals)));
