/** Pul formati: 36 400 (raqam guruhlari probel bilan; server va brauzerda bir xil). */
export const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** "+998996180300" → "+998 99 618 03 00". */
export function phoneText(e164: string) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}

export const telHref = (e164: string) => `tel:${e164}`;
export const telegramHref = (handle: string) => `https://t.me/${handle.replace(/^@/, "")}`;
export const instagramHref = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
