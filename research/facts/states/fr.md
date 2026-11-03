# France (FR)

Source texts, all on Légifrance (the official French legislation portal). Légifrance refuses plain scripted fetches, so these pages were read through the WebFetch tool:
- Loi n° 2023-171 du 9 mars 2023 (DDADUE), Article 16 (JORF n°0059 du 10 mars 2023).
- Code de la consommation, Article L. 412-13 (created by that Article 16) and Article L. 511-25-1.
- Décret n° 2023-931 du 9 octobre 2023 (JORF n°0235 du 10 octobre 2023), which inserts Articles D. 412-49 to D. 412-62 and R. 451-4 into the Code de la consommation.

### FR-LAW-1
- claim: France transposed the EAA mainly through Article 16 of Loi n° 2023-171 du 9 mars 2023 (JORF n°0059 du 10 mars 2023), whose Chapter IV deals with the accessibility of products and services and creates Article L. 412-13 of the Code de la consommation.
- field: transposing-law
- value: Loi n° 2023-171 du 9 mars 2023, art. 16 (JORF n°0059 du 10 mars 2023); Code de la consommation art. L. 412-13
- source: https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000047281777&categorieLien=cid
- excerpt: "Chapitre IV : Dispositions relatives à l'accessibilité des produits et des services (Article 16)"
- retrieved: 2026-11-03
- used_by: states.fr.law
- status: unverified
- verifier_note:

### FR-LAW-2
- claim: Décret n° 2023-931 du 9 octobre 2023 (JORF n°0235 du 10 octobre 2023) completes the transposition; its notice says its purpose is to transpose Directive (EU) 2019/882.
- field: transposing-law
- value: Décret n° 2023-931 du 9 octobre 2023 (JORF n°0235 du 10 octobre 2023)
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "Il a pour objet de transposer en droit français la directive (UE) 2019/882 relative à l'harmonisation des législations des Etats membres concernant les exigences en matière d'accessibilité aux produits et services." [Its purpose is to transpose Directive (EU) 2019/882 into French law.]
- retrieved: 2026-11-03
- used_by: states.fr.law
- status: unverified
- verifier_note:

### FR-APPLIES-1
- claim: Article 16 VIII A of Loi 2023-171 applies the article to products placed on the market and services provided after 28 June 2025 (with listed exceptions). Article 3 of Décret 2023-931 uses the same date.
- field: applies-from
- value: 2025-06-28
- source: https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000047281777&categorieLien=cid
- excerpt: "Sans préjudice des B à E du présent VIII, le présent article est applicable aux produits mis sur le marché et aux services fournis après le 28 juin 2025" [Without prejudice to B to E of this VIII, this article applies to products placed on the market and services provided after 28 June 2025]
- retrieved: 2026-11-03
- used_by: states.fr.appliesFrom
- status: unverified
- verifier_note:

### FR-APPLIES-2
- claim: Article 16 VIII B and C of Loi 2023-171: service providers may keep using products lawfully used before that date until 28 June 2030, and service contracts concluded before 28 June 2025 may run unchanged until their end, at the latest 28 June 2030.
- field: applies-from
- value: Pre-existing products and contracts: until 2030-06-28
- source: https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000047281777&categorieLien=cid
- excerpt: "Les contrats de services conclus avant le 28 juin 2025 peuvent s'appliquer sans modification jusqu'à leur terme, et au plus tard jusqu'au 28 juin 2030." [Service contracts concluded before 28 June 2025 may apply without modification until their end, and at the latest until 28 June 2030.]
- retrieved: 2026-11-03
- used_by: states.fr.appliesFrom
- status: unverified
- verifier_note:

### FR-PRODUCTS-1
- claim: Article D. 412-49 of the Code de la consommation (inserted by Décret 2023-931) covers consumer general-purpose computer hardware and operating systems, self-service terminals including payment terminals, consumer terminal equipment for electronic communications and for audiovisual media services, and e-readers.
- field: scope-products
- value: Computers and OS, self-service and payment terminals, telecom and AV media terminal equipment, e-readers
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "1° Systèmes informatiques matériels à usage général du grand public et systèmes d'exploitation relatifs à ces systèmes matériels ;" [1° consumer general-purpose computer hardware systems and operating systems for those hardware systems]
- retrieved: 2026-11-03
- used_by: states.fr.scope.products
- status: unverified
- verifier_note:

### FR-SERVICES-1
- claim: Article D. 412-50 I (inserted by Décret 2023-931) covers electronic communications services, access to audiovisual media services, elements of passenger transport services, listed consumer banking contracts and services, and e-commerce.
- field: scope-services
- value: Electronic communications, AV media access, passenger transport elements, consumer banking, e-commerce
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "Les dispositions de la présente section s'appliquent aux services suivants tels que définis à l'article 3 de la directive (UE) 2019/882" [This section applies to the following services as defined in Article 3 of Directive (EU) 2019/882]
- retrieved: 2026-11-03
- used_by: states.fr.scope.services
- status: unverified
- verifier_note:

### FR-ECOM-1
- claim: Article D. 412-50 I point 5° (inserted by Décret 2023-931) lists e-commerce ("Commerce électronique") among the covered services.
- field: scope-ecommerce
- value: yes
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "« 5° Commerce électronique. »" [5° E-commerce.]
- retrieved: 2026-11-03
- used_by: states.fr.scope.ecommerce
- status: unverified
- verifier_note:

### FR-MICRO-1
- claim: Article L. 412-13 I of the Code de la consommation exempts enterprises with fewer than ten employees providing services, with annual turnover or balance sheet total not above EUR 2 million, from the accessibility requirements and related obligations. The text does not use the word "microentreprise".
- field: microenterprise-exemption
- value: yes (service providers with fewer than 10 employees and turnover or balance sheet at most EUR 2 million)
- source: https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006069565&idArticle=LEGIARTI000047284897&dateTexte=29990101&categorieLien=cid
- excerpt: "Les entreprises employant moins de dix personnes qui fournissent des services et dont le chiffre d'affaires annuel n'excède pas deux millions d'euros ou dont le total du bilan n'excède pas deux millions d'euros sont dispensées des exigences d'accessibilité mentionnées au présent article et de toutes les obligations qui y sont liées." [Enterprises employing fewer than ten persons that provide services, with annual turnover or balance sheet not exceeding EUR 2 million, are exempt from the accessibility requirements of this article and all related obligations.]
- retrieved: 2026-11-03
- used_by: states.fr.exemptions.micro
- status: unverified
- verifier_note:

### FR-BURDEN-1
- claim: Article L. 412-13 II of the Code de la consommation transposes the disproportionate burden exception; a decree sets the criteria (annex to D. 412-60).
- field: disproportionate-burden
- value: yes (Code de la consommation L. 412-13 II)
- source: https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006069565&idArticle=LEGIARTI000047284897&dateTexte=29990101&categorieLien=cid
- excerpt: "2° N'impose pas une charge disproportionnée aux opérateurs économiques concernés. Un décret détermine les critères d'évaluation du caractère disproportionné de la charge." [2° does not impose a disproportionate burden on the economic operators concerned. A decree sets the criteria for assessing whether the burden is disproportionate.]
- retrieved: 2026-11-03
- used_by: states.fr.exemptions.burden
- status: unverified
- verifier_note:

### FR-AUTH-1
- claim: Article L. 511-25-1 of the Code de la consommation empowers the competition, consumer affairs and fraud control agents (agents de la CCRF) to investigate breaches of L. 412-13, alongside sector regulators' agents: ARCEP (electronic communications), ARCOM (audiovisual media services), and ACPR, AMF and Banque de France (banking). The text does not name a single body for e-commerce beyond the CCRF agents.
- field: authority
- value: Agents de la concurrence, de la consommation et de la répression des fraudes (CCRF); ARCEP, ARCOM, ACPR/AMF/Banque de France by sector
- source: https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006069565&idArticle=LEGIARTI000047284925&dateTexte=&categorieLien=id
- excerpt: "Outre les agents de la concurrence, de la consommation et de la répression des fraudes, sont habilités à rechercher et à constater les infractions à l'article L. 412-13 :" [In addition to the competition, consumer affairs and fraud control agents, the following are empowered to investigate and record breaches of Article L. 412-13:]
- retrieved: 2026-11-03
- used_by: states.fr.authority
- status: unverified
- verifier_note:

### FR-PEN-1
- claim: Article R. 451-4 I point 10° a) of the Code de la consommation (inserted by Décret 2023-931) punishes a service provider that designs or provides services not meeting the obligations of D. 412-57 1° with the fine for 5th-class contraventions. The decree does not state a euro amount; the amount is set in the Code pénal, which was not fetched in this pass.
- field: penalties
- value: Fine for a 5th-class contravention (amount set in the Code pénal, not stated in the decree)
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "Est puni de l'amende prévue pour les contraventions de la 5e classe le fait : ... « 10° Pour le prestataire de service : a) De concevoir ou fournir des services, à titre gratuit ou onéreux, pour lesquels les obligations mentionnées au 1° de l'article D. 412-57 ne sont pas satisfaites ;" [Punishable by the fine for 5th-class contraventions: ... 10° for a service provider: a) designing or providing services, free or paid, for which the obligations in D. 412-57 1° are not met]
- retrieved: 2026-11-03
- used_by: states.fr.penalties
- status: unverified
- verifier_note:

### FR-PEN-2
- claim: The euro amount of the 5th-class contravention fine that applies under R. 451-4 was not read from a primary source in this pass. Unknown until Code pénal art. 131-13 is fetched from Légifrance.
- field: penalties
- value: unknown
- source: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048178349
- excerpt: "Est puni de l'amende prévue pour les contraventions de la 5e classe le fait :" [Punishable by the fine provided for 5th-class contraventions:]
- retrieved: 2026-11-03
- used_by: states.fr.penalties
- status: unverified
- verifier_note:
