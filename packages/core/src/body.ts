import { Effect, Result, Stream } from "effect";

export interface CappedBody {
  readonly bytes: Uint8Array;
  readonly truncated: boolean;
}

export interface DecodedBody {
  readonly charset: string;
  readonly text: string;
}

export const readCapped = <E, R>(
  stream: Stream.Stream<Uint8Array, E, R>,
  maxBytes: number
): Effect.Effect<CappedBody, E, R> =>
  Effect.suspend(() => {
    const kept: Uint8Array[] = [];
    let total = 0;
    let truncated = false;

    const keep = (chunk: Uint8Array) => {
      const room = maxBytes - total;

      if (chunk.byteLength > room) {
        kept.push(chunk.subarray(0, room));
        total += room;
        truncated = true;
      } else {
        kept.push(chunk);
        total += chunk.byteLength;
      }

      return !truncated;
    };

    return stream.pipe(
      Stream.runForEachWhile((chunk) => Effect.sync(() => keep(chunk))),
      Effect.map(() => {
        const bytes = new Uint8Array(total);
        let offset = 0;

        for (const chunk of kept) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }

        return { bytes, truncated };
      })
    );
  });

const BYTE_ORDER_MARKS = [
  { charset: "utf-8", mark: [0xef, 0xbb, 0xbf] },
  { charset: "utf-16le", mark: [0xff, 0xfe] },
  { charset: "utf-16be", mark: [0xfe, 0xff] },
] as const;

const HEADER_CHARSET = /charset=["']?(?<charset>[\w-]+)/iu;

const META_CHARSET = /<meta[^>]+charset=["']?(?<charset>[\w-]+)/iu;

const META_SNIFF_BYTES = 2048;

const declaredCharset = (contentType: string, bytes: Uint8Array): string => {
  const marked = BYTE_ORDER_MARKS.find(({ mark }) =>
    mark.every((byte, index) => bytes[index] === byte)
  );

  if (marked !== undefined) {
    return marked.charset;
  }

  const fromHeader = HEADER_CHARSET.exec(contentType)?.groups?.charset;

  if (fromHeader !== undefined) {
    return fromHeader.toLowerCase();
  }

  const head = new TextDecoder("latin1").decode(
    bytes.subarray(0, META_SNIFF_BYTES)
  );

  return META_CHARSET.exec(head)?.groups?.charset?.toLowerCase() ?? "utf-8";
};

export const decodeBody = (
  contentType: string,
  bytes: Uint8Array
): DecodedBody => {
  const charset = declaredCharset(contentType, bytes);

  const decoded = Result.try(() => new TextDecoder(charset).decode(bytes));

  return Result.isSuccess(decoded)
    ? { charset, text: decoded.success }
    : { charset: "utf-8", text: new TextDecoder("utf-8").decode(bytes) };
};
