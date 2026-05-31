'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Chip, Serif, Eyebrow } from '@/components/ui';
import { useToastCtx } from '../../layout';

export default function MaterialDetailPage() {
  const params = useParams();
  const [material, setMaterial] = useState<any>(null);
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch(`/api/materials/${params.id}`).then(r => r.json()).then(setMaterial);
  }, [params.id]);

  if (!material) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const sampleContent = `# ${material.title}\n\nTento materiál pokrýva kľúčové témy pre maturitnú skúšku z predmetu **${material.name_sk}**.\n\n## Úvod\n\nV tejto kapitole sa zoznámime so základnými pojmami a ich aplikáciami. Každá téma je vysvetlená s príkladmi, aby ste si látku ľahšie zapamätali.\n\n## Hlavné koncepty\n\n**1. Definícia a základy**\nZákladné koncepty sú kľúčom k pochopeniu pokročilejších tém. Uistite sa, že ovládate definície pred pokračovaním.\n\n**2. Praktické aplikácie**\nTeória nadobúda zmysel, keď ju aplikujeme v praxi. Nižšie nájdete niekoľko typových úloh.\n\n**3. Typické maturitné otázky**\nNa základe analýzy predchádzajúcich maturitných tém sme zostavili zoznam najčastejšie sa vyskytujúcich okruhov.\n\n## Príklady\n\nPríklad 1: Základná úloha\nRiešenie: krok za krokom s vysvetlením každého kroku.\n\nPríklad 2: Pokročilejšia úloha\nRiešenie: aplikácia viacerých konceptov naraz.\n\n## Záver a opakovanie\n\nPo preštudovaní tohto materiálu by ste mali vedieť:\n- Definovať kľúčové pojmy\n- Riešiť typické príklady\n- Aplikovať vedomosti na nové situácie`;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--on-surface-variant)' }}>
        <Link href="/materials" style={{ color: 'var(--primary)', fontWeight: 600 }}>Materiály</Link>
        <Icon name="chevron_right" size={16} />
        <Link href={`/subjects/${material.subject_slug}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{material.name_sk}</Link>
        <Icon name="chevron_right" size={16} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{material.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        {/* Content */}
        <div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <IconChip name={material.icon} size={56} radius={14} />
            <div>
              <Eyebrow>{material.name_sk}</Eyebrow>
              <Serif size={36} weight={700} style={{ display: 'block', margin: '8px 0 4px' }}>{material.title}</Serif>
              <div style={{ display: 'flex', gap: 8 }}>
                <Chip tone="subject">{material.type}</Chip>
                {material.is_new && <Chip tone="trend">Nové</Chip>}
                <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="schedule" size={14} />{material.meta}
                </span>
              </div>
            </div>
          </div>

          <Card pad={32} radius={12}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--on-surface)' }}>
              {sampleContent.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, margin: '0 0 24px', color: 'var(--on-surface)' }}>{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: '32px 0 12px', color: 'var(--on-surface)' }}>{line.slice(3)}</h2>;
                if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, margin: '12px 0 4px', color: 'var(--on-surface)' }}>{line.replace(/\*\*/g, '')}</div>;
                if (line.startsWith('- ')) return <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0', paddingLeft: 8 }}><Icon name="check_circle" size={16} fill={1} style={{ color: 'var(--primary)', marginTop: 2, flex: 'none' }} />{line.slice(2)}</div>;
                if (line === '') return <div key={i} style={{ height: 8 }} />;
                return <p key={i} style={{ margin: '4px 0', color: line.includes('**') ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{line.replace(/\*\*/g, '')}</p>;
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Akcie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button full icon="download" onClick={() => flash('Sťahujem PDF…')}>Stiahnuť PDF</Button>
              <Button variant="secondary" full icon="bookmark" onClick={() => flash('Materiál uložený do záložiek')}>Uložiť</Button>
              <Button variant="secondary" full icon="share" onClick={() => flash('Skopírovaný odkaz')}>Zdieľať</Button>
            </div>
          </Card>
          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Informácie</div>
            {[['Typ', material.type], ['Predmet', material.name_sk], ['Rozsah', material.meta || '—'], ['Aktualizované', new Date(material.updated_at || material.created_at).toLocaleDateString('sk-SK')]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 14 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
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
