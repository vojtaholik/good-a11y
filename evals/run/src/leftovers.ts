const PS_LINE = /^\s*(?<pid>\d+)\s+(?<command>.*)$/u;

export const leftoverPids = (
  ps: string,
  roots: readonly string[],
  self: number
): readonly number[] =>
  ps.split("\n").flatMap((line) => {
    const groups = PS_LINE.exec(line)?.groups;
    const pid = Number(groups?.pid);

    return groups !== undefined &&
      pid !== self &&
      roots.some((root) => (groups.command ?? "").includes(`${root}/`))
      ? [pid]
      : [];
  });
