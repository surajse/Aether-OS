export interface KnowledgeTriple {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  validFrom: number;
  validTo?: number; // undefined means currently active
  confidence: number;
}

export class TemporalKnowledgeGraph {
  private triples: KnowledgeTriple[] = [];

  /**
   * Asserts a new factual triple. Automatically invalidates older conflicting triples on the same subject & predicate.
   */
  assertFact(subject: string, predicate: string, object: string, confidence = 1.0): KnowledgeTriple {
    const now = Date.now();

    // Invalidate existing active fact on the same subject and predicate
    for (const triple of this.triples) {
      if (triple.subject === subject && triple.predicate === predicate && triple.validTo === undefined) {
        if (triple.object !== object) {
          triple.validTo = now; // superseded
        } else {
          // Fact already matches, return existing
          return triple;
        }
      }
    }

    const newTriple: KnowledgeTriple = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      subject,
      predicate,
      object,
      validFrom: now,
      confidence
    };

    this.triples.push(newTriple);
    return newTriple;
  }

  /**
   * Retrieves all currently valid active facts.
   */
  getActiveFacts(subject?: string): KnowledgeTriple[] {
    return this.triples.filter((t) => t.validTo === undefined && (!subject || t.subject === subject));
  }

  /**
   * Retrieves full chronological evolution of a subject and predicate.
   */
  getFactHistory(subject: string, predicate: string): KnowledgeTriple[] {
    return this.triples.filter((t) => t.subject === subject && t.predicate === predicate);
  }
}
