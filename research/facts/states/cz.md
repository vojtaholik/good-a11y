# Czechia (CZ)

Source law text: e-Sbírka (official Collection of Laws), zákon č. 424/2023 Sb., as promulgated
(version /sb/2023/424/0000-00-00). The page at https://www.e-sbirka.cz/sb/2023/424 is a JavaScript
app. The same text is served as JSON by e-Sbírka's own API:
`https://www.e-sbirka.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F2023%2F424%2F0000-00-00/fragmenty?cisloStranky=0`
(pages 0..n), metadata at the same path without `/fragmenty`.

### CZ-LAW-1
- claim: Czechia transposed the EAA with Act No. 424/2023 Coll. on accessibility requirements for certain products and services, published in Collection of Laws part (částka) 194 on 29 December 2023.
- field: transposing-law
- value: Zákon č. 424/2023 Sb., o požadavcích na přístupnost některých výrobků a služeb
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "Zákon č. 424/2023 Sb., o požadavcích na přístupnost některých výrobků a služeb" / "Tento zákon zapracovává příslušný předpis Evropské unie1)" [Act No. 424/2023 Coll. on accessibility requirements for certain products and services / This act transposes the relevant EU legislation]
- retrieved: 2026-11-03
- used_by: states.cz.law
- status: verified
- verifier_note: e-Sbírka API: full citation, částka 194, vyhlášeno 2023-12-29; § 1 transposition sentence present (footnote marker 1) spacing only).

### CZ-APPLIES-1
- claim: Act No. 424/2023 Coll. takes effect on 28 June 2025 (§ 29).
- field: applies-from
- value: 2025-06-28
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "Tento zákon nabývá účinnosti dnem 28. června 2025." [This act takes effect on 28 June 2025.]
- retrieved: 2026-11-03
- used_by: states.cz.appliesFrom
- status: verified
- verifier_note: § 29 text matches; API metadata datumUcinnostiOd 2025-06-28.

### CZ-PRODUCTS-1
- claim: § 2 odst. 1 covers the EAA product list: consumer general-purpose computer hardware and operating systems, self-service payment terminals and other self-service terminals, consumer terminal equipment for electronic communications and audiovisual media, and e-readers.
- field: scope-products
- value: EAA Art. 2(1) products
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(1) Tento zákon se vztahuje na následující výrobky: a) hardwarové počítačové systémy pro všeobecné účely určené pro spotřebitele a jejich operační systém, b) samoobslužné platební terminály," [This act applies to the following products: a) consumer general-purpose computer hardware systems and their operating systems, b) self-service payment terminals,]
- retrieved: 2026-11-03
- used_by: states.cz.scope.products
- status: verified
- verifier_note: § 2 odst. 1 text matches; list a) to f) matches the claim.

### CZ-SERVICES-1
- claim: § 2 odst. 2 covers services provided to consumers: electronic communications, access to audiovisual media, financial services, e-commerce, e-books, and passenger transport elements.
- field: scope-services
- value: EAA Art. 2(2) services provided to consumers
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(2) Tento zákon se vztahuje na tyto služby poskytované spotřebitelům: a) služby elektronických komunikací, b) služby poskytující přístup k audiovizuálním mediálním službám, c) finanční služby, d) služby elektronického obchodování," [This act applies to these services provided to consumers: a) electronic communications services, b) services providing access to audiovisual media services, c) financial services, d) e-commerce services,]
- retrieved: 2026-11-03
- used_by: states.cz.scope.services
- status: verified
- verifier_note: § 2 odst. 2 text matches; e) e-books and f) passenger transport elements also present.

### CZ-ECOMMERCE-1
- claim: § 2 odst. 2 písm. d) lists e-commerce services provided to consumers, and § 3 písm. i) defines them as distance services via websites or mobile devices, by electronic means, at the consumer's individual request, to conclude a consumer contract.
- field: scope-ecommerce
- value: yes
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "i) službami elektronického obchodování služby poskytované na dálku prostřednictvím internetových stránek nebo mobilních zařízení, elektronickými prostředky a na individuální žádost spotřebitele s cílem uzavřít spotřebitelskou smlouvu," [e-commerce services: services provided at a distance through websites or mobile devices, by electronic means and at the individual request of a consumer, with a view to concluding a consumer contract]
- retrieved: 2026-11-03
- used_by: states.cz.scope.ecommerce
- status: verified
- verifier_note: § 2 odst. 2 písm. d) and § 3 odst. 1 písm. i) definition match.

### CZ-MICRO-1
- claim: § 2 odst. 3 písm. a) excludes from the act services provided by a service provider that is a microenterprise; § 3 písm. p) defines microenterprise by reference to Art. 2(3) of Annex I to Commission Regulation (EU) No 651/2014.
- field: microenterprise-exemption
- value: yes (services)
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(3) Tento zákon se nevztahuje na a) služby poskytované poskytovatelem služby, který je mikropodnikem," [This act does not apply to a) services provided by a service provider that is a microenterprise,]
- retrieved: 2026-11-03
- used_by: states.cz.exemptions.micro
- status: verified
- verifier_note: § 2 odst. 3 písm. a) and § 3 odst. 1 písm. p) (ref. Reg. 651/2014 Annex I Art. 2(3)) match.

### CZ-BURDEN-1
- claim: § 15 odst. 1 transposes the fundamental-alteration and disproportionate-burden exceptions, assessed against the criteria in Annex 4; § 15 odst. 2 requires the provider to prepare an assessment (posouzení), and § 15 odst. 3 requires keeping it for 5 years.
- field: disproportionate-burden
- value: yes
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(1) Výrobce nebo poskytovatel služby není povinen splnit požadavky na přístupnost v rozsahu, v jakém by shoda s požadavky na přístupnost a) vyžadovala zásadní změnu výrobku nebo služby, nebo b) pro něj měla za následek nepřiměřenou zátěž na základě kritérií stanovených v příloze č. 4 k tomuto zákonu." [A manufacturer or service provider is not obliged to meet the accessibility requirements to the extent that compliance would a) require a fundamental alteration, or b) impose a disproportionate burden based on the criteria in Annex 4.]
- retrieved: 2026-11-03
- used_by: states.cz.exemptions.burden
- status: verified
- verifier_note: Revised claim matches § 15 odst. 1-3 (vypracuje posouzení; uchovává 5 let) on e-Sbírka.

### CZ-AUTHORITY-1
- claim: § 19 odst. 2 makes the Czech Trade Inspection Authority (Česká obchodní inspekce) the supervisory body for services, including e-commerce, except sector services assigned to other bodies (Czech Telecommunication Office for electronic communications, the Council for Radio and Television Broadcasting for audiovisual access, and transport authorities for transport services). § 19 odst. 1 makes it the body for products.
- field: authority
- value: Česká obchodní inspekce (services generally, incl. e-commerce, and products)
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(2) Orgánem dozoru nad dodržováním povinností stanovených tímto zákonem pro služby je Česká obchodní inspekce s výjimkou služeb a) podle § 2 odst. 2 písm. a), kde je orgánem dozoru Český telekomunikační úřad," [The supervisory body for service obligations under this act is the Czech Trade Inspection Authority, except services a) under § 2(2)(a), where the supervisory body is the Czech Telecommunication Office,]
- retrieved: 2026-11-03
- used_by: states.cz.authority
- status: verified
- verifier_note: § 19 odst. 1 (products: ČOI) and odst. 2 exceptions (ČTÚ, RRTV, transport bodies) match.

### CZ-PENALTIES-1
- claim: § 25 odst. 7 písm. a) makes it an offence for a service provider not to ensure the service meets the accessibility requirements; § 25 odst. 8 písm. a) sets the fine for that offence at up to CZK 10,000,000. Other offences carry fines up to CZK 5,000,000, CZK 2,000,000 or CZK 1,000,000.
- field: penalties
- value: up to CZK 10,000,000 (other offences up to CZK 5,000,000 / 2,000,000 / 1,000,000)
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "(7) Poskytovatel služby se dopustí přestupku tím, že a) nezajistí, aby poskytovaná služba splňovala požadavky na přístupnost v souladu s § 13 odst. 1," / "(8) Za přestupek lze uložit pokutu do a) 10 000 000 Kč, jde-li o přestupek podle [...] odstavce 7 písm. a), b) nebo l)," [(7) A service provider commits an offence if it a) fails to ensure the service meets the accessibility requirements under § 13(1) / (8) A fine of up to CZK 10,000,000 may be imposed for an offence under ... paragraph 7(a), (b) or (l)]
- retrieved: 2026-11-03
- used_by: states.cz.penalties
- status: verified
- verifier_note: § 25 odst. 7 písm. a) and odst. 8 tiers 10 000 000 / 5 000 000 / 2 000 000 / 1 000 000 Kč confirmed.

### CZ-STMT-1
- claim: § 14(1) of Act 424/2023 Coll.: the service provider publishes, in the general terms and conditions or a similar document, how the service meets the accessibility requirements, including a description of each requirement; on request it also gives this information in audio form; when published on a website, it must be in commonly accessible formats.
- field: other
- value: Information in the terms and conditions or a similar document; audio on request
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "Poskytovatel služby zveřejní ve všeobecných obchodních podmínkách nebo v obdobném dokumentu informace, jak služba splňuje požadavky na přístupnost" / "poskytne tyto informace na žádost i ve zvukové formě" [The service provider publishes in the general terms and conditions or a similar document information on how the service meets the accessibility requirements / provides this information on request also in audio form]
- retrieved: 2026-11-04
- used_by: states.cz.statement
- status: verified
- verifier_note: § 14 odst. 1 zákona 424/2023 Sb. verbatim (e-Sbírka fragments API, page 0, fetched 2026-11-04), incl. "běžně přístupných formátech" for websites.

### CZ-STMT-2
- claim: § 14(2) and (4) of Act 424/2023 Coll.: the service provider also publishes a general description of the service and explanations needed to understand how it works, for the whole time it provides the service, in a way accessible to persons with disabilities.
- field: other
- value: General description and explanations, published while the service runs, accessible
- source: https://www.e-sbirka.cz/sb/2023/424
- excerpt: "a) všeobecný popis služby, b) vysvětlivky nezbytné k pochopení fungování služby." / "po celou dobu jejího poskytování, a to tak, aby tyto informace byly přístupné i osobám se zdravotním postižením" [a) a general description of the service, b) explanations needed to understand how the service works / for the whole time it is provided, so that the information is accessible to persons with disabilities]
- retrieved: 2026-11-04
- used_by: states.cz.statement
- status: verified
- verifier_note: § 14 odst. 2 a) b) and odst. 4 verbatim.
