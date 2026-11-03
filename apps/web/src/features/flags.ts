import atFlag from "flag-icons/flags/4x3/at.svg";
import beFlag from "flag-icons/flags/4x3/be.svg";
import bgFlag from "flag-icons/flags/4x3/bg.svg";
import cyFlag from "flag-icons/flags/4x3/cy.svg";
import czFlag from "flag-icons/flags/4x3/cz.svg";
import deFlag from "flag-icons/flags/4x3/de.svg";
import dkFlag from "flag-icons/flags/4x3/dk.svg";
import eeFlag from "flag-icons/flags/4x3/ee.svg";
import esFlag from "flag-icons/flags/4x3/es.svg";
import fiFlag from "flag-icons/flags/4x3/fi.svg";
import frFlag from "flag-icons/flags/4x3/fr.svg";
import grFlag from "flag-icons/flags/4x3/gr.svg";
import hrFlag from "flag-icons/flags/4x3/hr.svg";
import huFlag from "flag-icons/flags/4x3/hu.svg";
import ieFlag from "flag-icons/flags/4x3/ie.svg";
import itFlag from "flag-icons/flags/4x3/it.svg";
import ltFlag from "flag-icons/flags/4x3/lt.svg";
import luFlag from "flag-icons/flags/4x3/lu.svg";
import lvFlag from "flag-icons/flags/4x3/lv.svg";
import mtFlag from "flag-icons/flags/4x3/mt.svg";
import nlFlag from "flag-icons/flags/4x3/nl.svg";
import plFlag from "flag-icons/flags/4x3/pl.svg";
import ptFlag from "flag-icons/flags/4x3/pt.svg";
import roFlag from "flag-icons/flags/4x3/ro.svg";
import seFlag from "flag-icons/flags/4x3/se.svg";
import siFlag from "flag-icons/flags/4x3/si.svg";
import skFlag from "flag-icons/flags/4x3/sk.svg";

const FLAGS = {
  at: atFlag,
  be: beFlag,
  bg: bgFlag,
  cy: cyFlag,
  cz: czFlag,
  de: deFlag,
  dk: dkFlag,
  ee: eeFlag,
  es: esFlag,
  fi: fiFlag,
  fr: frFlag,
  gr: grFlag,
  hr: hrFlag,
  hu: huFlag,
  ie: ieFlag,
  it: itFlag,
  lt: ltFlag,
  lu: luFlag,
  lv: lvFlag,
  mt: mtFlag,
  nl: nlFlag,
  pl: plFlag,
  pt: ptFlag,
  ro: roFlag,
  se: seFlag,
  si: siFlag,
  sk: skFlag,
} as const satisfies Record<string, string>;

const isFlagCode = (code: string): code is keyof typeof FLAGS =>
  Object.hasOwn(FLAGS, code);

export const flagOf = (code: string): string | undefined =>
  isFlagCode(code) ? FLAGS[code] : undefined;
