export interface CommunityCollaborator {
  id: string;
  slug: string;
  name: string;
  image: string;
  role: string;
  bio: string;
  instagram?: string;
  twitch?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export interface CommunityPageSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  detailCtaLabel: string;
  detailCtaUrl: string;
}

export const DEFAULT_COMMUNITY_SETTINGS: CommunityPageSettings = {
  eyebrow: 'Comunidad PC Gamer CDMX',
  title: 'Colaboradores e influencers',
  subtitle:
    'Creadores, cosplayers y miembros de la comunidad que han formado parte de la historia de PC Gamer CDMX.',
  detailCtaLabel: 'Cotiza tu setup',
  detailCtaUrl: '/cotiza-tu-pc',
};

const assetBase = 'assets/img/colaboradores';

export const DEFAULT_COLLABORATORS: CommunityCollaborator[] = [
  ['legnaherandez1', 'legnaherandez1', '01-legnaherandez1.jpg'],
  ['rabbit', 'rabbit', '02-rabbit.jpg'],
  ['monywtf', 'monywtf', '03-monywtf.jpg'],
  ['mrgraso', 'mrgraso', '04-mrgraso.jpg'],
  ['kokoayuki', 'kokoayuki', '05-kokoayuki.jpg'],
  ['andreeederegil', 'andreeederegil', '06-andreeederegil.jpg'],
  ['vladk.ruso', 'vladk.ruso', '07-vladk.ruso.jpg'],
  ['twiincosplay', 'twiincosplay', '08-twiincosplay.jpg'],
  ['soymirrey', 'soymirrey', '09-soymirrey.jpg'],
  ['solibolita', 'solibolita', '10-solibolita.jpg'],
  ['snapy6065', 'snapy6065', '11-snapy6065.jpg'],
  ['kenjigeek', 'kenjigeek', '12-kenjigeek.jpg'],
  ['rocketramy', 'rocketramy', '13-rocketramy.jpg'],
  ['monica.marquet', 'monica.marquet', '14-monica.marquet.jpg'],
  ['mamyouu_star', 'mamyouu_star', '15-mamyouu_star.jpg'],
  ['karin_usagi', 'karin_usagi', '16-karin_usagi.jpg'],
  ['elvicruiz', 'elvicruiz', '17-elvicruiz.jpg'],
  ['historiaparatontos', 'historiaparatontos', '18-historiaparatontos.jpg'],
  ['HaruSadbunny', 'harusadbunny', '19-harusadbunny.jpg'],
  ['geekstarstips', 'geekstarstips', '20-geekstarstips.jpg'],
  ['ferxiita', 'ferxiita', '22-ferxiita.jpg'],
  ['sanchanclaudia', 'sanchanclaudia', '23-sanchanclaudia.jpg'],
  ['jiots', 'jiots', '24-jiots.jpg'],
  ['dana paola', 'dana-paola', '25-dana-paola.png'],
  ['cutemika_', 'cutemika', '26-cutemika_.jpg'],
  ['hi.cosmic.waifu', 'hi.cosmic.waifu', '27-hi.cosmic.waifu.jpg'],
  ['Chai Latte Cosplay', 'chai-latte-cosplay', '28-chai-latte-cosplay.jpg'],
  ['cedmejia', 'cedmejia', '29-cedmejia.jpg'],
  ['CAELi', 'caeli', '30-caeli.jpg'],
  ['bastiandelfin', 'bastiandelfin', '31-bastiandelfin.jpg'],
  ['AryVilchis', 'aryvilchis', '32-aryvilchis.jpg'],
  ['abailarconmaga', 'abailarconmaga', '33-abailarconmaga.jpg'],
  ['Paozikiz', 'paozikiz', '35-paozikiz.jpg'],
  ['alex destreza', 'alex-destreza', '36-alex-destreza.png'],
  ['akiza misa', 'akiza-misa', '37-akiza-misa.jpg'],
].map(([name, slug, file], index) => ({
  id: slug,
  slug,
  name,
  image: `${assetBase}/${file}`,
  role: 'Colaborador / Influencer',
  bio: `${name} forma parte de la comunidad de PC Gamer CDMX y de las colaboraciones que conectan gaming, creacion de contenido y cultura geek.`,
  featured: index < 8,
  published: true,
  sortOrder: index + 1,
}));
