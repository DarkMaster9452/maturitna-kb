'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Chip, Serif, Eyebrow, Skeleton } from '@/components/ui';
import { useToastCtx } from '../../layout';

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, margin: '0 0 24px', color: 'var(--on-surface)' }}>{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: '32px 0 12px', color: 'var(--on-surface)' }}>{line.slice(3)}</h2>;
    if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, margin: '12px 0 4px', color: 'var(--on-surface)' }}>{line.replace(/\*\*/g, '')}</div>;
    if (line.startsWith('- ')) return <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0', paddingLeft: 8 }}><Icon name="check_circle" size={16} fill={1} style={{ color: 'var(--primary)', marginTop: 2, flex: 'none' }} />{line.slice(2)}</div>;
    if (line === '') return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ margin: '4px 0', color: 'var(--on-surface-variant)' }}>{line.replace(/\*\*/g, '')}</p>;
  });
}

export default function MaterialDetailPage() {
  const params = useParams();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch(`/api/materials/${params.id}`)
      .then(r => r.json())
      .then(d => { if (d?.error || !d?.id) setError(true); else setMaterial(d); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 760 }}>
        <Skeleton width={220} height={14} style={{ marginBottom: 24 }} />
        <Skeleton width={48} height={48} radius={14} style={{ marginBottom: 16 }} />
        <Skeleton width="60%" height={32} style={{ marginBottom: 24 }} />
        <Skeleton height={300} radius={12} />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>
        <Icon name="error_outline" size={48} style={{ opacity: .4, display: 'block', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Materiál sa nenašiel</div>
        <Link href="/materials" style={{ color: 'var(--primary)', fontWeight: 600 }}>Späť na materiály</Link>
      </div>
    );
  }

  const content: string = typeof material.content === 'string' ? material.content.trim() : '';
  const shareLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); flash('Skopírovaný odkaz'); }
    catch { flash('Nepodarilo sa skopírovať odkaz'); }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
        <Link href="/materials" style={{ color: 'var(--primary)', fontWeight: 600 }}>Materiály</Link>
        <Icon name="chevron_right" size={16} />
        <Link href={`/subjects/${material.subject_slug}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{material.name_sk}</Link>
        <Icon name="chevron_right" size={16} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{material.title}</span>
      </div>

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        {/* Content */}
        <div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <IconChip name={material.icon} size={56} radius={14} />
            <div>
              <Eyebrow>{material.name_sk}</Eyebrow>
              <Serif size={36} weight={700} style={{ display: 'block', margin: '8px 0 4px' }}>{material.title}</Serif>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip tone="subject">{material.type}</Chip>
                {material.is_new && <Chip tone="trend">Nové</Chip>}
                {material.meta && (
                  <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="schedule" size={14} />{material.meta}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Card pad={32} radius={12}>
            {content ? (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--on-surface)' }}>
                {renderMarkdown(content)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
                <Icon name="description" size={44} style={{ opacity: .4, display: 'block', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>Tento materiál zatiaľ nemá obsah</div>
                <div style={{ fontSize: 14, marginBottom: 16 }}>Súbory a okruhy k tomuto predmetu nájdeš na jeho stránke.</div>
                <Link href={`/subjects/${material.subject_slug}`}>
                  <Button variant="secondary" iconAfter="arrow_forward">Otvoriť predmet</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Akcie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="secondary" full icon="bookmark" onClick={() => flash('Materiál uložený do záložiek')}>Uložiť</Button>
              <Button variant="secondary" full icon="share" onClick={shareLink}>Zdieľať</Button>
            </div>
          </Card>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Informácie</div>
            {[['Typ', material.type], ['Predmet', material.name_sk], ['Rozsah', material.meta || '—'], ['Aktualizované', new Date(material.updated_at || material.created_at).toLocaleDateString('sk-SK')]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 14, gap: 12 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card pad={20} radius={12} style={{ background: 'var(--primary)', border: 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Otestuj sa!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginBottom: 16 }}>Precvič si práve prebraté témy.</div>
            <Link href={`/subjects/${material.subject_slug}`}>
              <Button variant="white" full icon="quiz">Zobraziť testy</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
