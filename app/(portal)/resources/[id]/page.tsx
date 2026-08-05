'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Chip, Serif, Eyebrow } from '@/components/ui';
import { useToastCtx } from '../../layout';

export default function ResourceDetailPage() {
  const params = useParams();
  const [resource, setResource] = useState<any>(null);
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch(`/api/resources/${params.id}`).then(r => r.json()).then(setResource);
  }, [params.id]);

  if (!resource) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Video: { bg: 'var(--secondary-fixed)', c: 'var(--secondary)' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Audio: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--on-surface-variant)' }}>
        <Link href="/resources" style={{ color: 'var(--primary)', fontWeight: 600 }}>Zdroje</Link>
        <Icon name="chevron_right" size={16} />
        <span>{resource.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: typeColor[resource.type]?.bg || 'var(--primary-fixed)', color: typeColor[resource.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={resource.icon} size={36} />
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Chip tone="subject">{resource.type}</Chip>
                {resource.badge && <Chip tone="trend">{resource.badge}</Chip>}
                {resource.name_sk && <Chip tone="neutral">{resource.name_sk}</Chip>}
              </div>
              <Serif size={36} weight={700} style={{ display: 'block', marginBottom: 8 }}>{resource.title}</Serif>
              <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>{resource.description}</div>
            </div>
          </div>

          <Card pad={32} radius={12}>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
              <p style={{ marginBottom: 16 }}>Tento zdroj poskytuje kvalitné materiály pre prípravu na maturitnú skúšku. Obsah bol preverený a odporučený pedagógmi.</p>
              <p style={{ marginBottom: 16 }}>Pre prístup k celému obsahu klikni na tlačidlo <strong style={{ color: 'var(--primary)' }}>Otvoriť zdroj</strong> nižšie.</p>
              {resource.type === 'PDF' && <p>Po kliknutí sa súbor stiahne do tvojho zariadenia a môžeš ho otvoriť v ľubovoľnej PDF čítačke.</p>}
              {resource.type === 'Video' && <p>Video sa otvorí v novej záložke. Odporúčame sledovanie vo full-screen móde pre lepší zážitok.</p>}
              {resource.type === 'Web' && <p>Webová stránka sa otvorí v novej záložke. Obsah je externý a spravovaný tretími stranami.</p>}
              {resource.type === 'Audio' && <p>Audiozáznam si môžeš stiahnuť alebo prehrať priamo v prehliadači.</p>}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Akcie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button full icon="open_in_new" onClick={() => { flash('Otvára sa externý zdroj…'); if (resource.url && resource.url.startsWith('http')) window.open(resource.url, '_blank'); }}>
                Otvoriť {resource.type === 'PDF' ? 'PDF' : resource.type === 'Video' ? 'video' : resource.type === 'Audio' ? 'audio' : 'stránku'}
              </Button>
              <Button variant="secondary" full icon="bookmark" onClick={() => flash('Zdroj uložený do záložiek')}>Uložiť</Button>
              <Button variant="secondary" full icon="share" onClick={() => flash('Skopírovaný odkaz')}>Zdieľať</Button>
            </div>
          </Card>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Informácie</div>
            {[['Typ', resource.type], ['Predmet', resource.name_sk || 'Všeobecné'], ['Pridané', new Date(resource.created_at).toLocaleDateString('sk-SK')]].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 14 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
