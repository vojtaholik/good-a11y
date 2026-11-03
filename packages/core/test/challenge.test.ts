import { describe, expect, it } from "@effect/vitest";

import { challengeIn, unmaskedAtTheTestedAddress } from "../src/index.js";
import type { FetchResult } from "../src/index.js";

const AWS_WAF_CHALLENGE = `<!DOCTYPE html><html lang="en"><head><title></title><script type="text/javascript" src="https://www.example.com/__challenge_h78I/d8c1/a18a/challenge.js"></script></head><body><script>window.awsWafCookieDomainList = []; AwsWafIntegration.getToken().then(() => location.reload());</script></body></html>`;

const AKAMAI_CHALLENGE = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="5; URL='/?bm-verify=AAQ'" /><title>&nbsp;</title></head><body><iframe src="/interstitial/ic.html"></iframe><script>xhr.open("POST", "/_sec/verify?provider=interstitial", false);</script></body></html>`;

const BALEEN_CHALLENGE = `<!doctype html><html><head><title>Shop</title><script>var __blnChallengeStore={"checkChallengeParams":{"request_fate":"challengejs"},"cookie":{"name":"visit_baleen_x"}};</script></head><body></body></html>`;

const answered = (status: number, body: string): FetchResult => ({
  body,
  contentType: "text/html",
  durationMs: 1,
  finalUrl: "https://www.example.com/",
  headers: {},
  observedAt: "2026-11-03T20:00:00.000Z",
  ok: true,
  redirects: [],
  requestedUrl: "https://www.example.com/",
  status,
  truncated: false,
});

describe("challengeIn", () => {
  it("names an AWS WAF JavaScript challenge served with 202 and no header", () => {
    expect(challengeIn({}, AWS_WAF_CHALLENGE)).toBe("aws_waf");
  });

  it("names an Akamai Bot Manager interstitial served with 200", () => {
    expect(challengeIn({}, AKAMAI_CHALLENGE)).toBe("akamai");
  });

  it("names a Baleen challenge served with 200", () => {
    expect(challengeIn({}, BALEEN_CHALLENGE)).toBe("baleen");
  });

  it("turns such a page into a refusal at the tested address", () => {
    for (const [status, body] of [
      [202, AWS_WAF_CHALLENGE],
      [200, BALEEN_CHALLENGE],
      [200, AKAMAI_CHALLENGE],
    ] as const) {
      const result = unmaskedAtTheTestedAddress(answered(status, body));

      expect(result.ok).toBe(false);
    }
  });

  it("leaves an ordinary page that mentions a challenge alone", () => {
    expect(
      challengeIn(
        {},
        "<html><body><h1>The cooking challenge</h1></body></html>"
      )
    ).toBeUndefined();
  });
});
