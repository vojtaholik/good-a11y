# Romania (RO)

Source law text: Senatul României, legislative file L284/2022, document 22L284LP.pdf: the law text as adopted by
Parliament (Chamber of Deputies as decisional chamber) and sent for promulgation. It is a scanned PDF; text was taken
from its embedded text layer with macOS PDFKit, so excerpts reproduce that layer (OCR artefacts possible; check against
the scan). Caveats: (1) the number and date are blank on this copy ("Bucureşti, ... Nr."), so the identifier
"232/2022" is NOT confirmed from a primary source; (2) this is the adopted text, not the Monitorul Oficial publication
or a consolidated version, so later amendments are unknown. legislatie.just.ro dropped every connection and the
cdep.ro legis pages returned 404 or timed out on 2026-11-03. Fetched 2026-11-03.

### RO-LAW-1
- claim: Romania transposed the EAA with the Lege privind cerinţele de accesibilitate aplicabile produselor şi serviciilor, adopted by Parliament (Senate file L284/2022); its closing note states it transposes Directive (EU) 2019/882. The law number and Monitorul Oficial reference are not on the fetched copy; secondary sources and a search-result title on cdep.ro give Legea nr. 232/2022, which is unconfirmed here.
- field: transposing-law
- value: Lege privind cerinţele de accesibilitate aplicabile produselor şi serviciilor (number unconfirmed)
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "Prezenta lege transpune prevederile Directivei (UE) 2019/882 a Parlamentului European şi a Consiliului din 17 aprilie 2019 privind cerinţele de accesibilitate aplicabile produselor şi serviciilor" [This law transposes Directive (EU) 2019/882 of the European Parliament and of the Council of 17 April 2019 on the accessibility requirements for products and services]
- retrieved: 2026-11-03
- used_by: states.ro.law
- status: verified
- verifier_note: Title and transposition note match the adopted senat.ro text; number honestly marked unconfirmed

### RO-LAW-2
- claim: The official identifier (law number, date, Monitorul Oficial issue) could not be read from a primary source: the adopted text leaves the number blank, legislatie.just.ro was unreachable and the cdep.ro law page returned 404.
- field: transposing-law
- value: unknown
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: (not retrieved: the adopted text ends "Bucureşti, Nr." with the number blank; legislatie.just.ro dropped connections; https://www.cdep.ro/pls/legis/legis_pck.htp_act?ida=187163 returned 404)
- retrieved: 2026-11-03
- used_by: states.ro.law
- status: verified
- verifier_note: Honest gap: adopted text leaves the number blank and legislatie.just.ro did not answer my fetch either

### RO-APPLIES-1
- claim: Under Art. 30, the law enters into force on 28 June 2025, except Art. 4(8) (112), which enters into force on 28 June 2027.
- field: applies-from
- value: 2025-06-28
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "Art. 30. - Prezenta lege intră în vigoare la data de 28 iunie 2025, cu excepţia prevederilor art. 4 alin. (8), care intră în vigoare la data de 28 iunie 2027." [Art. 30. This law enters into force on 28 June 2025, except Art. 4(8), which enters into force on 28 June 2027.]
- retrieved: 2026-11-03
- used_by: states.ro.appliesFrom
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 30

### RO-PRODUCTS-1
- claim: Art. 2(1)-(2) covers products placed on the market after 28 June 2025: consumer general-purpose hardware and operating systems, consumer terminal equipment for electronic communications and audiovisual media, e-readers, and self-service terminals (payment terminals, ATMs, ticketing and check-in machines, interactive information terminals).
- field: scope-products
- value: EAA Art. 2(1) products
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "a) sisteme hardware de uz general destinate consumatorilor şi sisteme de operare pentru aceste sisteme hardware;" [a) general-purpose hardware systems for consumers and operating systems for them;]
- retrieved: 2026-11-03
- used_by: states.ro.scope.products
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 2(1)-(2)

### RO-SERVICES-1
- claim: Art. 2(3) covers services provided to consumers after 28 June 2025: electronic communications, access to audiovisual media, consumer banking, e-books and dedicated software, and e-commerce; Art. 2(4) adds passenger transport elements.
- field: scope-services
- value: EAA Art. 2(2) services
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "(3) Prezenta lege se aplică următoarelor servicii furnizate consumatorilor după data de 28 iunie 2025:" [(3) This law applies to the following services provided to consumers after 28 June 2025:]
- retrieved: 2026-11-03
- used_by: states.ro.scope.services
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 2(3)-(4)

### RO-ECOMMERCE-1
- claim: Art. 2(3)(e) lists e-commerce services among the consumer services in scope.
- field: scope-ecommerce
- value: yes
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "d) cărţi electronice şi software dedicat; e) servicii de comerţ electronic." [d) e-books and dedicated software; e) e-commerce services.]
- retrieved: 2026-11-03
- used_by: states.ro.scope.ecommerce
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 2(3)(e)

### RO-MICRO-1
- claim: Art. 4(5) exempts microenterprises offering services from the service accessibility requirements and related obligations.
- field: microenterprise-exemption
- value: yes, services microenterprises exempt
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "(5) Microîntreprinderile ce oferă servicii sunt scutite de obligaţia de a respecta cerinţele de accesibilitate prevăzute la alin. (3)" [(5) Microenterprises offering services are exempt from the obligation to meet the accessibility requirements in para. (3)]
- retrieved: 2026-11-03
- used_by: states.ro.exemptions.micro
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 4(5)

### RO-BURDEN-1
- claim: Art. 14 transposes the fundamental-alteration and disproportionate-burden exception.
- field: disproportionate-burden
- value: yes (Art. 14)
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "b) nu duce la impunerea unei sarcini disproporţionate asupra operatorilor economici în cauză." [b) does not result in a disproportionate burden on the economic operators concerned.]
- retrieved: 2026-11-03
- used_by: states.ro.exemptions.burden
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 14

### RO-AUTHORITY-1
- claim: Under Art. 19(1)(d), the Authority for the Digitalisation of Romania (Autoritatea pentru Digitalizarea României, ADR) is the market surveillance authority for the services in Art. 2(3)(d) and (e), that is e-books and e-commerce, and for some transport elements.
- field: authority
- value: Autoritatea pentru Digitalizarea României (ADR) for e-commerce
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "d) Autoritatea pentru Digitalizarea României pentru serviciile prevăzute la art. 2 alin. (3) lit. d) şi e)" [d) the Authority for the Digitalisation of Romania for the services in Art. 2(3)(d) and (e)]
- retrieved: 2026-11-03
- used_by: states.ro.authority
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 19(1)(d)

### RO-AUTHORITY-2
- claim: Art. 19(1) splits surveillance: ANPC (consumer protection) for most products and consumer banking, Ministry of Economy for self-service terminals, ANCOM for electronic communications, CNA for audiovisual access, Ministry of Transport for some transport elements, and the Competition Council for Art. 4(7).
- field: authority
- value: sector bodies: ANPC, Ministry of Economy, ANCOM, ADR, CNA, Ministry of Transport
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "c) Autoritatea Naţională pentru Administrare şi Reglementare în Comunicaţii pentru serviciile prevăzute la art. 2 alin. (3) lit. a);" [c) the National Authority for Management and Regulation in Communications for the services in Art. 2(3)(a);]
- retrieved: 2026-11-03
- used_by: states.ro.authority
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 19(1)(a)-(g)

### RO-PENALTIES-1
- claim: Under Art. 27(1)(f)-(j), service providers breaching Art. 13 face contravention fines between RON 5,000 and 15,000 depending on the provision: RON 6,000-12,000 for Art. 13(1) and 13(3), RON 7,000-15,000 for Art. 13(2)(a)-(e), RON 5,000-10,000 for Art. 13(2)(f)-(g). Amounts are as adopted; later amendments unknown.
- field: penalties
- value: services: RON 5,000-15,000 by provision
- source: https://www.senat.ro/legis/PDF/2022/22L284LP.pdf
- excerpt: "g) încălcarea de către furnizorii serviciilor prevăzute de prezenta lege a dispoziţiilor art. 13 alin. (2) lit. a) - d) şi se sancţionează cu amendă de la 7000 lei la 15000 lei;" [g) breach by service providers of Art. 13(2)(a)-(d) is fined RON 7,000 to 15,000;]
- retrieved: 2026-11-03
- used_by: states.ro.penalties
- status: verified
- verifier_note: Checked against senat.ro adopted text L284/2022 PDF, Art. 27(1)(f)-(j); (g) covers 13(2)(a)-(d) and (i) covers 13(2)(e), both RON 7,000-15,000
