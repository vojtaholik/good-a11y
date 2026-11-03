# Poland (PL)

Source law text: Sejm ELI API (official ISAP data), Ustawa z dnia 26 kwietnia 2024 r., Dz.U. 2024 poz. 731,
text as published (HTML). The ISAP record lists no amending acts as of retrieval. Fetched 2026-11-03.

### PL-LAW-1
- claim: Poland transposed the EAA with the Act of 26 April 2024 on ensuring compliance with accessibility requirements of certain products and services by economic operators, published in Dz.U. 2024 poz. 731; its footnote states it implements Directive (EU) 2019/882.
- field: transposing-law
- value: Ustawa z dnia 26 kwietnia 2024 r. o zapewnianiu spełniania wymagań dostępności niektórych produktów i usług przez podmioty gospodarcze (Dz.U. 2024 poz. 731)
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "Niniejsza ustawa wdraża dyrektywę Parlamentu Europejskiego i Rady (UE) 2019/882 z dnia 17 kwietnia 2019 r. w sprawie wymogów dostępności produktów i usług" [This act implements Directive (EU) 2019/882 of the European Parliament and of the Council of 17 April 2019 on the accessibility requirements for products and services]
- retrieved: 2026-11-03
- used_by: states.pl.law
- status: verified
- verifier_note: Sejm ELI text: footnote 1 implementation statement for Directive (EU) 2019/882 matches.

### PL-LAW-2
- claim: The official ISAP record identifies the act as Dz.U. 2024 poz. 731, status in force.
- field: transposing-law
- value: Dz.U. 2024 poz. 731
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731
- excerpt: "Dz.U. 2024 poz. 731" [displayAddress field of the ISAP record: Journal of Laws 2024 item 731]
- retrieved: 2026-11-03
- used_by: states.pl.law
- status: verified
- verifier_note: Sejm ELI record: displayAddress Dz.U. 2024 poz. 731, status obowiązujący, inForce IN_FORCE.

### PL-APPLIES-1
- claim: Under Art. 88, the act enters into force on 28 June 2025, except Art. 6 points 1, 2 and 5-9 and Art. 39 point 6, which entered into force 14 days after publication.
- field: applies-from
- value: 2025-06-28
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "Ustawa wchodzi w życie z dniem 28 czerwca 2025 r., z wyjątkiem art. 6 pkt 1, 2 i 5-9 oraz art. 39 pkt 6" [The act enters into force on 28 June 2025, except Art. 6 points 1, 2 and 5-9 and Art. 39 point 6]
- retrieved: 2026-11-03
- used_by: states.pl.appliesFrom
- status: verified
- verifier_note: Art. 88 matches verbatim; ELI entryIntoForce 2025-06-28.

### PL-PRODUCTS-1
- claim: Art. 3(1) of the act covers the EAA product list: consumer general-purpose computer hardware and operating systems, payment and self-service terminals (ATMs and cash deposit machines, ticketing machines, check-in machines, interactive information terminals), consumer terminal equipment for telecommunications and audiovisual media services, and e-readers.
- field: scope-products
- value: EAA Art. 2(1) products
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "4) czytników książek elektronicznych - zwanych dalej „produktami”." [4) e-book readers, hereinafter "products".]
- retrieved: 2026-11-03
- used_by: states.pl.scope.products
- status: verified
- verifier_note: Art. 3 ust. 1 pkt 1-4 match the claim incl. bankomaty i wpłatomaty.

### PL-SERVICES-1
- claim: Art. 3(2) of the act covers services offered or provided to consumers: telecommunications, access to audiovisual media services, passenger transport elements (bus, waterborne, air, rail), retail banking, e-books distribution and e-commerce.
- field: scope-services
- value: EAA Art. 2(2) services
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "Przepisy ustawy stosuje się do oferowanych lub świadczonych na rzecz konsumentów usług:" [The act applies to the following services offered or provided to consumers:]
- retrieved: 2026-11-03
- used_by: states.pl.scope.services
- status: verified
- verifier_note: Art. 3 ust. 2 pkt 1-6 match the claim.

### PL-ECOMMERCE-1
- claim: Art. 3(2)(6) lists e-commerce (handel elektroniczny) among the consumer services in scope.
- field: scope-ecommerce
- value: yes
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "5) rozpowszechniania książek elektronicznych, 6) handlu elektronicznego - zwanych dalej „usługami”." [5) distribution of e-books, 6) e-commerce, hereinafter "services".]
- retrieved: 2026-11-03
- used_by: states.pl.scope.ecommerce
- status: verified
- verifier_note: Art. 3 ust. 2 pkt 5-6 match verbatim.

### PL-ECOMMERCE-2
- claim: The act defines e-commerce services as services offered or provided at a distance through websites and mobile devices, by electronic means, at the individual request of the consumer, with a view to concluding a contract.
- field: scope-ecommerce
- value: definition matches EAA Art. 3(30)
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "usługi handlu elektronicznego - usługi oferowane lub świadczone na odległość przez strony internetowe i urządzenia mobilne, drogą elektroniczną i na indywidualne żądanie konsumenta w celu zawarcia umowy;" [e-commerce services: services offered or provided at a distance via websites and mobile devices, by electronic means and at the individual request of the consumer in order to conclude a contract;]
- retrieved: 2026-11-03
- used_by: states.pl.scope.ecommerce
- status: verified
- verifier_note: Art. 5 definition matches verbatim.

### PL-MICRO-1
- claim: Art. 4(1) of the act excludes services offered or provided by microenterprises.
- field: microenterprise-exemption
- value: yes, services microenterprises exempt
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "Przepisów ustawy nie stosuje się do: 1) usług oferowanych lub świadczonych przez mikroprzedsiębiorców;" [The act does not apply to: 1) services offered or provided by microenterprises;]
- retrieved: 2026-11-03
- used_by: states.pl.exemptions.micro
- status: verified
- verifier_note: Art. 4 pkt 1 matches (Art. 4 has points, not paragraphs; content correct).

### PL-BURDEN-1
- claim: Art. 21 of the act transposes the fundamental-alteration and disproportionate-burden exception; the economic operator carries out the assessment.
- field: disproportionate-burden
- value: yes (Art. 21)
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "Wymagania dostępności mają zastosowanie wyłącznie w zakresie, w jakim zapewnienie zgodności z nimi: ... 2) nie stanowi dla podmiotu gospodarczego nieproporcjonalnego obciążenia." [Accessibility requirements apply only to the extent that compliance: ... 2) does not impose a disproportionate burden on the economic operator.]
- retrieved: 2026-11-03
- used_by: states.pl.exemptions.burden
- status: verified
- verifier_note: Art. 21 ust. 1 pkt 2 matches; ust. 2 operator does the assessment.

### PL-AUTHORITY-1
- claim: Under Art. 38(2) the market surveillance system consists of the President of the Board of PFRON (State Fund for Rehabilitation of Disabled Persons), the market surveillance authorities in Art. 38(3), and customs authorities.
- field: authority
- value: President of the Board of PFRON plus sector market surveillance authorities
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "System nadzoru rynku tworzą: 1) Prezes Zarządu PFRON; 2) organy nadzoru rynku, o których mowa w ust. 3; 3) organy celne." [The market surveillance system consists of: 1) the President of the Board of PFRON; 2) the market surveillance authorities referred to in para. 3; 3) customs authorities.]
- retrieved: 2026-11-03
- used_by: states.pl.authority
- status: verified
- verifier_note: Art. 38 ust. 2 matches verbatim.

### PL-AUTHORITY-2
- claim: Under Art. 38(3)(2), the market surveillance authority for e-commerce services is the minister responsible for computerisation (informatyzacja).
- field: authority
- value: minister responsible for computerisation (for e-commerce services)
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "2) usług handlu elektronicznego jest minister właściwy do spraw informatyzacji," [2) for e-commerce services, the minister responsible for computerisation,]
- retrieved: 2026-11-03
- used_by: states.pl.authority
- status: verified
- verifier_note: Art. 38 ust. 3 pkt 2 matches verbatim.

### PL-AUTHORITY-3
- claim: Under Art. 38(3)(3), the market surveillance authority for retail banking services is the Financial Ombudsman (Rzecznik Finansowy); under Art. 38(3)(1), the President of the Office of Electronic Communications (UKE) covers terminals, telecom and audiovisual access services, computers, e-readers and e-books.
- field: authority
- value: Rzecznik Finansowy (retail banking); Prezes UKE (telecom, devices, e-books)
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "3) usług bankowości detalicznej jest Rzecznik Finansowy," [3) for retail banking services, the Financial Ombudsman,]
- retrieved: 2026-11-03
- used_by: states.pl.authority
- status: verified
- verifier_note: Art. 38 ust. 3 pkt 1 (Prezes UKE scope) and pkt 3 (Rzecznik Finansowy) match.

### PL-PENALTIES-1
- claim: Under the penalties chapter, a service provider that fails to ensure accessibility (among other breaches) faces a fine of up to ten times the average monthly wage in the national economy for the previous year, as announced by the President of Statistics Poland, but not more than 10% of the previous year's turnover. The law states the cap as a multiple, not a fixed amount.
- field: penalties
- value: up to 10x average monthly wage (prior year), max 10% of turnover
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "w wysokości do dziesięciokrotności przeciętnego wynagrodzenia miesięcznego w gospodarce narodowej za rok poprzedzający" [up to ten times the average monthly wage in the national economy for the previous year]
- retrieved: 2026-11-03
- used_by: states.pl.penalties
- status: verified
- verifier_note: Art. 73 ust. 1 pkt 2 lit. a (usługodawca) and the 10x average wage, max 10% turnover cap match.

### PL-PENALTIES-2
- claim: The fine is capped at 10% of turnover achieved in the financial year preceding the year the fine is imposed.
- field: penalties
- value: max 10% of prior-year turnover
- source: https://api.sejm.gov.pl/eli/acts/DU/2024/731/text.html
- excerpt: "jednak nie większej niż 10 % obrotu osiągniętego w roku obrotowym poprzedzającym rok nałożenia kary" [but not more than 10% of turnover achieved in the financial year preceding the year in which the fine is imposed]
- retrieved: 2026-11-03
- used_by: states.pl.penalties
- status: verified
- verifier_note: Art. 73 ust. 1 cap text matches verbatim.
