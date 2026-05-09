export const BUSINESS_INFO = {
  name: 'PC Gamer CDMX',
  phoneDisplay: '+52 55 1234 5678',
  phoneHref: 'tel:+525512345678',
  whatsappNumber: '525512345678',
  whatsappUrl: 'https://wa.me/525512345678',
  email: 'contacto@pcgamercdmx.com',
  addressShort: 'Ciudad de México, CDMX',
  addressLong: 'Ciudad de México, CDMX',
  businessHours: [
    { day: 'Lunes - Viernes', hours: '10:00 - 20:00' },
    { day: 'Sábado', hours: '10:00 - 18:00' },
    { day: 'Domingo', hours: 'Cerrado' },
  ],
  social: {
    facebook: 'https://facebook.com/pcgamercdmx',
    instagram: 'https://instagram.com/pcgamercdmx',
    tiktok: 'https://tiktok.com/@pcgamercdmx',
    youtube: 'https://youtube.com/@pcgamercdmx',
    discord: 'https://discord.gg/pcgamercdmx',
    facebookGroup: 'https://facebook.com/groups/pcgamercdmx',
  },
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `${BUSINESS_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
