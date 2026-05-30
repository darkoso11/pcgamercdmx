export const BUSINESS_INFO = {
  name: 'PC Gamer CDMX',
  phoneDisplay: '55 5512 7560',
  phoneHref: 'tel:+525555127560',
  phoneNote: 'Unicamente para llamadas',
  whatsappNumber: '525513941449',
  whatsappUrl: 'https://wa.me/525513941449',
  email: 'contacto@pcgamercdmx.com',
  emailHref: 'mailto:contacto@pcgamercdmx.com',
  addressShort: 'Insurgentes Sur 300 local 5, Roma',
  addressLong: 'Insurgentes Sur 300 local 5, Colonia Roma, Ciudad de Mexico',
  mapDirectionsUrl: 'https://www.google.com/maps/search/?api=1&query=Insurgentes%20Sur%20300%20local%205%2C%20Colonia%20Roma%2C%20Ciudad%20de%20Mexico',
  mapEmbedUrl: 'https://www.google.com/maps?q=Insurgentes%20Sur%20300%20local%205%2C%20Colonia%20Roma%2C%20Ciudad%20de%20Mexico&output=embed',
  businessHours: [
    { day: 'Lunes - Viernes', hours: '10:30 - 19:00' },
    { day: 'Sabado', hours: '11:00 - 17:00' },
    { day: 'Domingo', hours: 'Cerrado' },
  ],
  salesAdvisors: [
    {
      name: 'Hugo Lopez',
      phoneDisplay: '55 1394 1449',
      phoneHref: 'tel:+525513941449',
      whatsappNumber: '525513941449',
      whatsappUrl: 'https://wa.me/525513941449',
      email: 'ventas.hugo@pcgamercdmx.mx',
    },
    {
      name: 'Omar Pc Gamer',
      phoneDisplay: '55 7205 2726',
      phoneHref: 'tel:+525572052726',
      whatsappNumber: '525572052726',
      whatsappUrl: 'https://wa.me/525572052726',
      email: 'ventas.omar@pcgamercdmx.mx',
    },
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
