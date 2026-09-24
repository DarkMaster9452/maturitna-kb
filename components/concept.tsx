'use client';
import { CSSProperties } from 'react';
import { Icon } from '@/components/ui';
import { useT } from '@/components/i18n';

/* ══════════════════════════════════════════════════════════════
   Concept — MaturitaKB je koncept (prototyp), nie hotový produkt
   ══════════════════════════════════════════════════════════════ */

/** Malý mono štítok „Koncept" — ku logu, nadpisom a pod. */
export function ConceptBadge({ mono = false, style }: { mono?: boolean; style?: CSSProperties }) {
  const { t } = useT();
  return (
    <span className="mkb-eyebrow" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, letterSpacing: '.14em', lineHeight: 1,
      padding: '4px 7px', borderRadius: 6,
      border: `1px solid ${mono ? 'var(--panel-ink-line)' : 'var(--outline-variant)'}`,
      color: mono ? 'var(--panel-ink-variant)' : 'var(--on-surface-variant)',
      whiteSpace: 'nowrap', ...style,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
      {t('Koncept')}
    </span>
  );
}

/** Tenký hairline pás s upozornením, že ide o koncept. */
export function ConceptBanner({ style }: { style?: CSSProperties }) {
  const { t } = useT();
  return (
    <div role="note" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
      padding: '8px 16px', fontSize: 12.5, lineHeight: 1.4, textAlign: 'center',
      background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)',
      color: 'var(--on-surface-variant)', ...style,
    }}>
      <span className="mkb-eyebrow" style={{ fontSize: 10.5, color: 'var(--on-surface)' }}>{t('Koncept')}</span>
      <span>{t('Toto je koncept aplikácie — nie hotový produkt. Obsah, účty aj štatistiky sú ukážkové.')}</span>
    </div>
  );
}

/** Kompaktná poznámka do obsahu portálu (hairline box). */
export function ConceptNote({ style }: { style?: CSSProperties }) {
  const { t } = useT();
  return (
    <div role="note" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', marginBottom: 24, borderRadius: 'var(--radius)',
      border: '1px dashed var(--outline-variant)', fontSize: 13, color: 'var(--on-surface-variant)', ...style,
    }}>
      <Icon name="science" size={18} style={{ color: 'var(--primary)', flex: 'none' }} />
      <span><strong style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{t('Koncept')}</strong> · {t('Ukážková verzia portálu. Dáta slúžia len na demonštráciu nápadu.')}</span>
    </div>
  );
}
