# Vision

eaa-check tells a company where its public website stands against the European Accessibility Act, in every EU member state it sells in, and sells studio9's web and accessibility work off that report.

A visitor pastes a URL. The checker fetches the public page, runs deterministic checks over what it fetched, and shows each finding with the WCAG success criterion and EN 301 549 clause it relates to, and the member states where the EAA's rules reach it. The report ends with a contact call to action.

Audience: people who own or run e-commerce and service websites sold across the EU. The owner of this repo, and the agents who build it.

## What the product holds to

- Every legal and normative claim traces to a primary source through a verified fact in `research/facts/`. A claim without one is shown as "unknown" or left out.
- The report never says a site is "compliant". It says plainly that automated checks find only part of the issues WCAG covers and that a manual review is needed.
- Findings come from deterministic checks only. Nothing a model says changes a finding. A decision model may add judged observations, shown apart, labelled as a model's judgement and never counted as issues.
- Evidence is kept, so a stored scan can be re-checked under a newer catalogue.
- A site that refuses the scanner gets that said, with no findings.

## The house rule: a clean playground

As in webproai and rat-stack: every package is labeled, pushes in with one package and one `Layer.provide` or Stack line, pulls out the same way, declares its own resources, and is easy to trash.

## Needs sign-off

- Weakening lefthook, CI or the hook-bypass blocks
- Replacing pnpm, Turborepo, Effect, XState or Alchemy
- A production stage, a custom domain, or any paid service beyond what webproai already uses
- Resource destruction, replacement or deletion

## Amendment policy

This document changes when the product's purpose changes. Decisions inside that purpose go in the Brain.
