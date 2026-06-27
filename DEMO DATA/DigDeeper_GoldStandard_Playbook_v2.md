DIG DEEPER
The Sparring Room
Gold Standard Playbook - Data Processing Agreement

CONFIDENTIAL - FOR SOLUTION EVALUATION USE ONLY

This playbook is the gold standard against which the Technician evaluates junior lawyer reasoning. It is not disclosed to the user during play. Law firms may tailor risk thresholds, jurisdiction references, and client type on licensing.

Version 1.0  |  Hack the Law Cambridge 2026

1. Governing Principle

"A gold standard DPA ensures that the controller's and processor's obligations are defined with sufficient precision that the protection of children's health data is not dependent on goodwill, assumption, or commercial pressure - but is structurally guaranteed by the agreement itself."

Every clause standard in this playbook is measured against this principle. The Technician's core question in every interrogation is: does the junior lawyer's chosen clause, and their defence of it, structurally guarantee protection - or does it rely on trust and assumption?

1.1 Consequence Framework
When a clause falls below gold standard, the Technician evaluates reasoning against four consequence categories:

Category
What it means in this scenario
Civil Liability
Marlin Health Trust may face negligence claims from patients or families if inadequate processing causes harm. The DPA is the contractual instrument that allocates and limits that exposure.
GDPR Breach
ICO enforcement action under UK GDPR. Fines up to GBP17.5 million or 4% of global annual turnover for the most serious infringements. Article 83(4) and (5) apply directly to inadequate processor agreements.
Financial Risk
Remediation costs, litigation, regulatory fines, and loss of NHS or private sector contracts. Nemo faces parallel exposure as processor under Article 82.
Reputational Risk
A data breach involving children's health records is a Category 1 reputational event. Marlin Health Trust's relationship with patient families, clinical staff, and NHS commissioners depends on demonstrable data governance.

2. Scenario

2.1 The Parties
Controller
Marlin Health Trust - operates the UK's largest specialist children's hospital. Processes children's health records as special category data under Article 9 UK GDPR.
Processor
Nemo - AI diagnostics company. Analyses patient records through a proprietary AI model to generate treatment recommendations delivered to Marlin's clinical staff.
Data Subjects
Children (patients under 18). Data subject rights exercised by parents or guardians except where the child has sufficient competence (Gillick competence).
Primary Legal Basis
Article 9(2)(h) UK GDPR - health care provision, subject to professional secrecy. Article 6(1)(c) - legal obligation. Article 9(2)(c) - vital interests (emergency backup only).
Additional Framework
ICO Children's Code (Age Appropriate Design Code). Data Protection Act 2018 Schedule 1 Part 1 para 2. NHS Digital Data Security Standards where applicable.

2.2 The Stakes
Nemo's AI system analyses children's health records and generates treatment recommendations that influence clinical decisions. This is active AI processing of the most sensitive data category, affecting the health outcomes of children. Every clause in this DPA carries direct clinical and legal consequence.

3. Gold Standard Clause Evaluation

The following standards define what a gold standard answer looks like for each essential clause. The Technician measures junior lawyer reasoning against these standards. A strong answer does not require verbatim reproduction - it requires the junior lawyer to demonstrate they understand why the clause exists, what it protects, and what fails without it.
Each clause entry includes a Pushback Defence section. This is the position the junior lawyer must hold when Nemo argues against a clause or attempts to weaken it during negotiation.

Clause 2 - Personal Data Types and Processing Purposes
Article 28(3) UK GDPR foundation. Everything downstream in the DPA flows from how precisely this clause is drafted.

Gold Standard
Clause 2 must establish:
The exact categories of special category data processed: children's health records including diagnosis, treatment history, medication, and clinical notes.
The explicit processing purpose: generating AI-driven treatment recommendations for clinical staff - not general health care administration.
The Article 9(2) lawful basis relied upon: 9(2)(h) as primary, with acknowledgment that 9(2)(c) applies only in emergency situations.
The fact that Nemo's AI model constitutes automated processing within the meaning of Article 22 - and that the DPA must address the controller's obligations in that regard.
The duration: tied to the clinical partnership agreement, with specific provisions for what happens to data after termination.

What the Technician Hunts
Vague purpose statements such as 'processing for healthcare purposes' - insufficiently specific for Article 28(3).
Failure to identify Article 22 automated processing implications - the most common and most serious omission for this scenario.
Conflation of Article 9(2)(h) and Article 9(2)(a) explicit consent - particularly dangerous for children's data where consent capacity is age-dependent.

Technician Question
"You have included the nature and purpose clause. What exactly is the purpose of Nemo's processing in this agreement - and is that purpose the same as Marlin's purpose for collecting the data in the first place?"

Gold Standard Answer
Marlin's purpose is delivering clinical care. Nemo's processing purpose is generating AI-driven diagnostic recommendations as an input to that care - it is a distinct and downstream purpose that must be specified separately. The DPA cannot simply adopt the controller's stated purpose; it must define the processor's specific processing activity with precision.

Pushback Defence
When Nemo pushes back on this clause, the junior lawyer must hold their position using this structure:
If Nemo argues the purpose clause is too restrictive and limits their operational flexibility: the junior lawyer must hold firm. Article 28(3) requires that the subject matter, nature, purpose, and duration of processing are all specified. Vagueness is not flexibility - it is a compliance failure that exposes Marlin to ICO enforcement.
If Nemo argues that their processing purpose is the same as Marlin's: the junior lawyer must distinguish the two clearly. Marlin collects data to deliver care. Nemo processes it to generate AI recommendations. These are distinct processing activities requiring distinct specification.
If Nemo argues that Article 22 does not apply because a clinician reviews every recommendation: the junior lawyer must respond that the question of human review is precisely the safeguard Article 22 requires - it does not remove the obligation to address it in the DPA.

Clause 3 - Provider's Obligations
The processor's core Article 28(3) duties. This clause is the structural backbone of the entire DPA.

Gold Standard
Clause 3 must establish:
Processes personal data only on documented instructions from Marlin Health Trust - never for Nemo's own purposes including model training or product development.
Implements Article 25 data protection by design and by default in the AI diagnostic system architecture.
Assists Marlin in fulfilling its obligations under Articles 32 to 36 including security, breach notification, DPIA, and prior consultation with the ICO.
Makes available all information necessary to demonstrate compliance with Article 28 on Marlin's request.
Does not use Marlin's patient data to improve, retrain, or develop Nemo's AI model without explicit separate documented instruction from Marlin as controller.

What the Technician Hunts
The AI training data point - most junior lawyers miss that using patient data to improve the processor's commercial AI product is a purpose beyond the controller's instructions and requires separate lawful basis.
Failure to address data protection by design obligations specifically in the context of an AI system.
Generic processor obligation language copied from a template without adapting for AI processing specifics.

Technician Question
"Nemo's AI model will improve over time as it processes more patient data. Under your Clause 3 drafting, is Nemo permitted to use Marlin's patient data to retrain and improve its diagnostic model? Walk me through the legal analysis."

Gold Standard Answer
No. Using patient data to retrain the AI model is processing for Nemo's own commercial purpose - developing a better product - not processing on Marlin's instructions for Marlin's purposes. This would require a separate lawful basis under Article 6 and Article 9, separate to the DPA, and would likely require patient consent under Article 9(2)(a) given that Article 9(2)(h) applies only to direct healthcare provision. Clause 3 must explicitly prohibit this without separate documented instruction.

Pushback Defence
When Nemo pushes back on this clause, the junior lawyer must hold their position using this structure:
If Nemo argues that retraining the model improves diagnostic accuracy for Marlin's patients and is therefore in everyone's interest: the junior lawyer must hold firm. Commercial benefit to Nemo does not create a lawful basis for processing. The question is not whether retraining is beneficial - it is whether Marlin as controller has authorised that specific processing activity. Without documented instruction, it is unlawful.
If Nemo argues that the prohibition on model retraining makes the AI product unworkable: the junior lawyer should acknowledge this is a commercial negotiation point but maintain that any retraining requires a separate lawful basis and documented instruction. This is a matter for the commercial agreement, not a reason to weaken the DPA.
If Nemo argues that data protection by design is already built into their architecture and the clause is unnecessary: the junior lawyer must insist that contractual commitment is required regardless of Nemo's existing practices. An unverifiable assertion is not a structural guarantee.

Clause 4 - Provider's Employees
Article 28(3)(b) - confidentiality obligations on authorised persons. Critical weight in children's health data context.

Gold Standard
Clause 4 must establish:
Only specifically authorised Nemo personnel may access Marlin patient data - with a defined authorisation process and a maintained register of authorised persons.
All authorised persons are subject to binding confidentiality obligations - either contractual or statutory.
Authorisation is role-specific and access is limited to the minimum necessary for the processing purpose.
Nemo must immediately revoke access and notify Marlin when an authorised person leaves the organisation or changes role.
Nemo's AI engineers and data scientists who have access to patient data during model maintenance must be included in the authorisation register - not just clinical-facing staff.

What the Technician Hunts
Generic confidentiality clauses that do not specify which Nemo staff have access.
Failure to include technical staff (engineers, data scientists) who access data for system maintenance - a common omission.
No mechanism for Marlin to verify the authorisation register or receive notification of personnel changes.

Technician Question
"A Nemo data scientist needs access to a subset of patient records to investigate a diagnostic anomaly in the AI model. Under your Clause 4, is that access permitted - and what obligations does it trigger?"

Gold Standard Answer
Access is permitted only if that data scientist is named on the authorisation register with a role description covering this purpose. The access must be logged. It must be limited to the minimum data necessary to investigate the anomaly. Marlin must be notified if this represents a change in the scope of authorised access. The data scientist's confidentiality obligation applies in full. Clause 4 should anticipate this scenario explicitly given the nature of AI system maintenance.

Pushback Defence
When Nemo pushes back on this clause, the junior lawyer must hold their position using this structure:
If Nemo argues that maintaining a register of authorised persons is operationally burdensome for a technology company with a dynamic team: the junior lawyer must hold firm. Article 28(3)(b) is not a suggestion. The burden of compliance is Nemo's as processor. If Nemo cannot commit to a register, Marlin should question whether Nemo is an appropriate processor for children's health data.
If Nemo argues that their engineers do not access patient data directly, only anonymised or aggregated data: the junior lawyer must probe whether the anonymisation is truly irreversible and whether re-identification is possible given the nature of health records. Pseudonymised data is still personal data under UK GDPR.
If Nemo argues that confidentiality obligations are already covered by employment contracts: the junior lawyer must insist these are contractual obligations between Nemo and its staff, not enforceable by Marlin. The DPA must give Marlin direct recourse.

Clause 5 - Security
Article 28(3)(c) and Article 32 - appropriate technical and organisational measures. Non-negotiable for health data.

Gold Standard
Clause 5 must establish:
Encryption: patient data encrypted at rest and in transit using current NHS-grade or equivalent standards.
Access controls: role-based access with multi-factor authentication for all systems processing patient data.
AI model security: specific measures addressing the security of the diagnostic model itself - adversarial attack protection, model integrity monitoring.
Pseudonymisation where technically feasible without compromising diagnostic accuracy.
Regular security testing: penetration testing schedule, vulnerability disclosure process, and results reporting to Marlin.
Incident response: documented response procedure with defined roles, timelines, and Marlin notification triggers.

What the Technician Hunts
Security clauses that simply state 'appropriate technical and organisational measures' without specifying what those measures are.
Failure to address AI-specific security risks - model poisoning, adversarial inputs, and diagnostic integrity.
No audit or testing obligation - security measures stated but never verified.

Technician Question
"Your Clause 5 commits Nemo to appropriate security measures. If an adversarial attack manipulates the AI model's diagnostic outputs - causing incorrect treatment recommendations - is that a security failure under your clause, and what does Marlin's recourse look like?"

Gold Standard Answer
Yes - adversarial manipulation of the AI model is a security failure and a personal data breach if patient data is involved in the attack or if the integrity of patient data outputs is compromised. Clause 5 should specifically address model integrity as a security obligation. Marlin's recourse runs through the breach notification provisions in Clause 6, the indemnification structure in Clause 15, and potentially direct ICO notification if the breach meets the Article 33 threshold. This is why specificity in Clause 5 matters - a generic security clause provides no contractual basis for claiming a model integrity failure is a breach of Nemo's obligations.

Pushback Defence
When Nemo pushes back on this clause, the junior lawyer must hold their position using this structure:
If Nemo argues that specifying security measures in the DPA is too prescriptive and may become outdated as technology evolves: the junior lawyer should acknowledge this concern but propose a solution - include a schedule of current measures that is reviewable annually, with a minimum baseline locked into the DPA itself. Flexibility cannot mean no standard.
If Nemo argues that adversarial AI attacks are an industry-wide problem beyond any single processor's control: the junior lawyer must respond that the existence of an industry-wide risk does not reduce Nemo's contractual obligation to implement reasonable measures against it. Foreseeability is the test, and adversarial attacks on diagnostic AI are well-documented.
If Nemo argues that penetration testing results are commercially sensitive and should not be disclosed to Marlin: the junior lawyer must insist on at minimum an executive summary confirming scope, findings classification, and remediation status. Marlin as controller has a right to verify processor compliance under Article 28(3)(h).

Clause 6 - Personal Data Breach
Article 28(3)(f) and Article 33 - processor breach notification. For children's health data, this clause is existential.

Gold Standard
Clause 6 must establish:
Nemo notifies Marlin of any suspected or confirmed personal data breach without undue delay - and in any event within 24 hours of Nemo becoming aware. This is stricter than Article 33's 72-hour controller-to-ICO deadline, giving Marlin time to assess and notify.
Notification must include: nature of the breach, categories and approximate number of data subjects affected, categories and approximate number of records concerned, likely consequences, and measures taken or proposed.
Nemo must preserve all evidence relating to the breach and cooperate fully with Marlin's investigation.
Nemo must not communicate externally about the breach - including to media, regulators, or affected individuals - without Marlin's prior written consent. The controller manages the regulatory and public response.
For AI-specific breaches: the clause must define what constitutes a breach in the context of diagnostic AI - including model output corruption affecting patient records.

What the Technician Hunts
Breach notification timelines that simply replicate Article 33's 72-hour window - this gives Marlin no time to assess before the ICO deadline runs.
No definition of what constitutes a breach in the AI diagnostic context.
Nemo retaining the right to notify the ICO or patients directly - this undermines the controller's regulatory management.

Technician Question
"Nemo discovers at 9am Monday that a software error caused diagnostic recommendations for 47 children to be generated using corrupted input data over the weekend. Under your Clause 6, what happens in the next 72 hours - and who does what?"

Gold Standard Answer
Nemo notifies Marlin immediately - within 24 hours under gold standard drafting, so by 9am Tuesday at latest. Nemo provides the required notification particulars. Marlin assesses whether the corruption constitutes a personal data breach under Article 4(12) - an event compromising confidentiality, integrity, or availability of personal data. If it does, Marlin has until 9am Wednesday to notify the ICO under Article 33. Marlin decides whether to notify the affected families under Article 34 based on whether the breach is likely to result in high risk to the children's rights and freedoms. Nemo cooperates fully and does not communicate externally. The 47 affected cases must be clinically reviewed as a priority - the DPA notification process runs in parallel with the clinical response.

Pushback Defence
When Nemo pushes back on this clause, the junior lawyer must hold their position using this structure:
If Nemo argues that a 24-hour notification window is unrealistic given the time needed to investigate a breach before reporting: the junior lawyer must hold firm. Article 28(3)(f) requires notification without undue delay. The purpose of early notification is to give the controller - Marlin - time to investigate and meet their own 72-hour ICO deadline. Nemo's internal investigation timeline is Nemo's operational problem, not Marlin's compliance risk.
If Nemo argues that they should be permitted to notify the ICO directly given their technical expertise in understanding the breach: the junior lawyer must reject this clearly. The ICO notification obligation belongs to the controller under Article 33. Nemo notifying the ICO without Marlin's consent would undermine Marlin's ability to manage the regulatory response and could prejudice Marlin's legal position.
If Nemo argues that corrupted AI outputs do not constitute a personal data breach because no data was accessed by an unauthorised third party: the junior lawyer must challenge this interpretation. A breach under Article 4(12) includes events affecting the integrity and availability of personal data - not only confidentiality breaches. Corrupted diagnostic outputs affecting patient records is an integrity breach.

4. Trap Clause Analysis

The following clauses appear in the pool but are traps. A junior lawyer who selects them without being able to articulate their specific relevance - or who selects them in place of essential clauses - loses health bar points. The Technician's first question on any trap clause is: why did you pick this?

Warranties
Belongs in the commercial agreement between Marlin and Nemo, not the DPA. Selecting this reveals the junior lawyer is conflating two separate documents. The Technician asks: what exactly is Nemo warranting here, and under which legal framework?

Indemnification
Commercial risk allocation belongs in the main contract. Including it in the DPA creates drafting conflicts and jurisdiction confusion. Note: a strong junior lawyer may argue that indemnification for GDPR breaches should be cross-referenced in the DPA. This is defensible only if argued with precision.

Definitions and Interpretation
Not a substantive clause - it is a drafting aid that supports whichever clauses are selected. Picking this as one of five essential clauses indicates a misunderstanding of what the clause pool requires.

5. The Silent Trap - Article 22

This is the hardest question in the game. A junior lawyer who identifies this gap unprompted wins the round outright.

The clause pool does not contain an explicit Article 22 automated decision-making clause. This is a deliberate omission.

Article 22 UK GDPR applies where automated processing produces decisions that have a legal or similarly significant effect on data subjects. Nemo's AI generates treatment recommendations that directly influence clinical decisions affecting children's health outcomes. The question of whether this constitutes Article 22 decision-making - and who bears the obligation to implement safeguards - is the most legally complex issue in this scenario.

Technician's Hardest Question
"You have built your DPA. Is there anything that should be in this agreement that is not in the clause pool at all?"

Gold Standard Answer
Yes. Article 22 UK GDPR. Nemo's AI generates treatment recommendations from children's health records. If those recommendations constitute automated decision-making with significant effects on the children's health - and a strong argument exists that they do - then the controller must implement safeguards including the right to human review of any AI-generated recommendation before it is acted upon clinically. The DPA must address how Marlin and Nemo allocate responsibility for implementing that human review mechanism. This obligation cannot be satisfied by the existing clause pool. It requires a specific Article 22 provision.

Pushback Defence
If Nemo argues that Article 22 does not apply because a clinician always reviews the recommendation before acting:
The junior lawyer must respond that the existence of human review is precisely the Article 22 safeguard - it does not remove the obligation to guarantee it contractually. If the clinical review step is not embedded in the DPA, there is no enforceable mechanism ensuring it occurs.
The junior lawyer should further argue that the DPA must specify who is responsible for ensuring the human review step is implemented - Marlin as controller bears this obligation under Article 22(3), but the DPA must require Nemo to design their system in a way that makes human review technically possible and practically mandatory.

6. Scoring Framework

The Technician evaluates junior lawyer reasoning across two dimensions:

Performance
Speed to Defensible Position
Argument Structure Quality
Gold Standard
Reaches defensible position within 2 Technician questions per clause
Identifies legal basis, consequence, and structural guarantee without prompting
Developing
Reaches defensible position within 3 to 4 questions, with Technician prompting
Identifies legal basis but not consequence or structural guarantee
Below Standard
5 or more Dig Deeper triggers. Fails to reach defensible position.
Reasoning relies on assumption, trust, or generic template language

7. Tailoring and Disclaimer

This playbook is designed for law firm licensing and tailoring. The following elements may be adapted:
Client type - substitute Marlin Health Trust with the relevant client and adjust the Article 9 ground accordingly.
Risk threshold - adjust the consequence framework to reflect the firm's risk appetite and client sector.
Jurisdiction - UK GDPR references may be updated for EU GDPR, or dual UK/EU application where the client operates cross-border.

DISCLAIMER: This playbook is an evaluation tool for the Dig Deeper training game. It does not constitute legal advice. All clause standards reflect the authors' interpretation of UK GDPR and Article 28 obligations as at June 2026. Law firms should obtain independent legal review before relying on this playbook in client-facing work.
