export const PROTOCOL_IDS = ['13:11', '14:10', '16:8', '18:6', '20:4', '23:1'] as const;

export type ProtocolId = (typeof PROTOCOL_IDS)[number];

/** Klucz komunikatu i18n dla etykiety protokołu (kropki i dwukropki nie nadają się na klucze). */
export type ProtocolMessageKey = 'p13_11' | 'p14_10' | 'p16_8' | 'p18_6' | 'p20_4' | 'p23_1';

export type Protocol = {
  id: ProtocolId;
  fastHours: number;
  eatHours: number;
  messageKey: ProtocolMessageKey;
};

export const DEFAULT_PROTOCOL_ID: ProtocolId = '16:8';

export const PROTOCOLS: readonly Protocol[] = PROTOCOL_IDS.map((id) => {
  const [fast, eat] = id.split(':').map(Number);
  return {
    id,
    fastHours: fast,
    eatHours: eat,
    messageKey: `p${fast}_${eat}` as ProtocolMessageKey,
  };
});

export function isProtocolId(value: unknown): value is ProtocolId {
  return typeof value === 'string' && (PROTOCOL_IDS as readonly string[]).includes(value);
}

export function getProtocol(id: string | undefined | null): Protocol {
  return PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS.find((p) => p.id === DEFAULT_PROTOCOL_ID)!;
}
